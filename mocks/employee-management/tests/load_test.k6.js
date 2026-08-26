import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const KEYCLOAK_URL = __ENV.KEYCLOAK_URL || 'http://localhost:8081';
const CLIENT_ID = __ENV.CLIENT_ID || 'employee-api';
const CLIENT_SECRET = __ENV.CLIENT_SECRET || 'employee-api-secret-change-in-prod';

const errorRate = new Rate('errors');
const employeeCreateDuration = new Trend('employee_create_duration');
const listEmployeesDuration = new Trend('list_employees_duration');
const authFailures = new Counter('auth_failures');

export const options = {
  scenarios: {
    // Warm-up: low traffic to establish connections
    warmup: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 5 },
      ],
      gracefulRampDown: '10s',
      exec: 'readOnlyScenario',
      startTime: '0s',
    },
    // Peak HR hours: mixed read/write
    peak_hours: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 20 },
        { duration: '3m', target: 50 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
      ],
      gracefulRampDown: '15s',
      exec: 'mixedScenario',
      startTime: '1m30s',
    },
    // Spike: end-of-quarter bulk lookups
    spike: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 30,
      maxVUs: 100,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '15s', target: 100 },
        { duration: '30s', target: 10 },
      ],
      exec: 'readOnlyScenario',
      startTime: '7m',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<1500'],
    errors: ['rate<0.05'],
    employee_create_duration: ['p(95)<1200'],
    list_employees_duration: ['p(95)<500'],
  },
};

function getAdminToken() {
  const payload = {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'password',
    username: 'hr.admin',
    password: 'HrAdmin123!',
  };
  const res = http.post(
    `${KEYCLOAK_URL}/realms/EmployeeManagement/protocol/openid-connect/token`,
    payload,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, tags: { name: 'auth' } }
  );
  if (res.status !== 200) {
    authFailures.add(1);
    return null;
  }
  return JSON.parse(res.body).access_token;
}

function authHeaders(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}

export function setup() {
  const token = getAdminToken();
  if (!token) throw new Error('Failed to obtain admin token during setup');
  return { token };
}

export function readOnlyScenario(data) {
  group('Read Operations', () => {
    const listStart = Date.now();
    const listRes = http.get(
      `${BASE_URL}/api/v1/employees?status=active&limit=25`,
      authHeaders(data.token)
    );
    listEmployeesDuration.add(Date.now() - listStart);
    check(listRes, {
      'list status 200': (r) => r.status === 200,
      'list has employees key': (r) => {
        try { return 'employees' in JSON.parse(r.body); } catch { return false; }
      },
    }) || errorRate.add(1);

    const deptRes = http.get(`${BASE_URL}/api/v1/departments`, authHeaders(data.token));
    check(deptRes, { 'departments status 200': (r) => r.status === 200 }) || errorRate.add(1);

    const healthRes = http.get(`${BASE_URL}/api/v1/statuschecks/healthcheck`);
    check(healthRes, { 'health status 200': (r) => r.status === 200 }) || errorRate.add(1);
  });
  sleep(Math.random() * 2 + 0.5);
}

export function mixedScenario(data) {
  readOnlyScenario(data);

  group('Write Operations', () => {
    const uniqueEmail = `loadtest.${Date.now()}.${__VU}@acmecorp.example`;
    const createStart = Date.now();
    const createRes = http.post(
      `${BASE_URL}/api/v1/employees`,
      JSON.stringify({
        first_name: 'Load',
        last_name: `Test${__VU}`,
        email: uniqueEmail,
        department_id: '550e8400-e29b-41d4-a716-446655440001',
        hire_date: '2025-01-15',
        job_title: 'Load Test Engineer',
      }),
      authHeaders(data.token)
    );
    employeeCreateDuration.add(Date.now() - createStart);
    const created = check(createRes, {
      'create status 201': (r) => r.status === 201,
    });
    if (!created) {
      errorRate.add(1);
      return;
    }

    const emp = JSON.parse(createRes.body);
    const updateRes = http.put(
      `${BASE_URL}/api/v1/employees/${emp.id}`,
      JSON.stringify({ job_title: 'Senior Load Test Engineer' }),
      authHeaders(data.token)
    );
    check(updateRes, { 'update status 200': (r) => r.status === 200 }) || errorRate.add(1);
  });
  sleep(Math.random() * 3 + 1);
}

export default mixedScenario;
