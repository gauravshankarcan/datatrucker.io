import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const HOST = __ENV.HOST || 'http://localhost:8080';
const TOKEN = __ENV.ACCESS_TOKEN || '';

const ingestDuration = new Trend('telemetry_ingest_duration', true);
const anomalyDuration = new Trend('anomaly_detect_duration', true);
const ingestErrors = new Counter('telemetry_ingest_errors');
const anomalyRate = new Rate('anomaly_detect_success');

export const options = {
  scenarios: {
    steady_telemetry: {
      executor: 'constant-arrival-rate',
      rate: 50,
      timeUnit: '1s',
      duration: '2m',
      preAllocatedVUs: 20,
      maxVUs: 100,
      exec: 'ingestTelemetry',
    },
    burst_anomalies: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '1m', target: 30 },
        { duration: '30s', target: 0 },
      ],
      exec: 'detectAnomaly',
      startTime: '30s',
    },
    health_probe: {
      executor: 'constant-vus',
      vus: 2,
      duration: '3m',
      exec: 'healthCheck',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<2000'],
    telemetry_ingest_duration: ['p(99)<1500'],
    anomaly_detect_success: ['rate>0.90'],
    telemetry_ingest_errors: ['count<100'],
  },
};

const headers = {
  'Content-Type': 'application/json',
  Authorization: TOKEN ? `Bearer ${TOKEN}` : '',
};

const devices = [
  'sensor-warehouse-a-0042',
  'sensor-warehouse-b-0018',
  'sensor-coldchain-0091',
  'sensor-factory-line-0033',
];

function randomMetricValue(metric) {
  const baselines = {
    temperature_c: { mean: 23, spread: 5 },
    humidity_pct: { mean: 55, spread: 10 },
    vibration_hz: { mean: 12, spread: 3 },
  };
  const b = baselines[metric] || { mean: 50, spread: 10 };
  return b.mean + (Math.random() - 0.5) * 2 * b.spread;
}

export function ingestTelemetry() {
  const deviceId = devices[randomIntBetween(0, devices.length - 1)];
  const payload = JSON.stringify({
    deviceId,
    timestamp: new Date().toISOString(),
    metrics: {
      temperature_c: randomMetricValue('temperature_c'),
      humidity_pct: randomMetricValue('humidity_pct'),
      vibration_hz: randomMetricValue('vibration_hz'),
    },
    location: { lat: 43.65 + Math.random() * 0.1, lon: -79.38 + Math.random() * 0.1 },
  });

  const res = http.post(`${HOST}/api/v1/jobs/telemetry-ingest`, payload, { headers });
  ingestDuration.add(res.timings.duration);

  const ok = check(res, {
    'ingest status 200': (r) => r.status === 200,
    'ingest completed': (r) => {
      try { return r.json('reqCompleted') === true; } catch { return false; }
    },
  });

  if (!ok) ingestErrors.add(1);
  sleep(0.05);
}

export function detectAnomaly() {
  const deviceId = devices[randomIntBetween(0, devices.length - 1)];
  const isSpike = Math.random() < 0.15;
  const value = isSpike ? 89.7 : randomMetricValue('temperature_c');

  const payload = JSON.stringify({
    deviceId,
    metric: 'temperature_c',
    value,
    baseline: { mean: 23.1, stddev: 1.8 },
    thresholdSigma: 3,
  });

  const res = http.post(`${HOST}/api/v1/jobs/anomaly-detect`, payload, { headers });
  anomalyDuration.add(res.timings.duration);
  anomalyRate.add(res.status === 200);
  sleep(0.2);
}

export function healthCheck() {
  const res = http.get(`${HOST}/api/v1/statuschecks/healthcheck`);
  check(res, {
    'health status 200': (r) => r.status === 200,
    'health db ok': (r) => {
      try { return r.json('data.db') === true; } catch { return false; }
    },
  });
  sleep(5);
}
