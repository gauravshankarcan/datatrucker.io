/*
* Copyright 2021 Datatrucker.io Inc , Ontario , Canada
* 
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
* 
*     http://www.apache.org/licenses/LICENSE-2.0
* 
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/ 

const fp = require('fastify-plugin');
const crypto = require('crypto');
const cryptoconfig = require('../config/crypto.config.json');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Hashing for passwords stored in database
const ENCRYPTION_TYPE = cryptoconfig.passwordHash.Algorithm;
const SALT_LENGTH = cryptoconfig.passwordHash.SaltLength;

// Nodejs encryption with CTR
const encryptionalgorithm = cryptoconfig.CredentailEncryption.Algorithm;
const encryptionkey = cryptoconfig.CredentailEncryption.Key;
const encryptioniv = cryptoconfig.CredentailEncryption.IV;


module.exports = fp((f, opts, done) => {
      const genRandomString = function genRandomString(length) {
            return crypto
                  .randomBytes(Math.ceil(length / 2))
                  .toString('hex') /** convert to hexadecimal format */
                  .slice(0, length); /** return required number of characters */
      };
      
      // password crpyto
      const gethash = function gethash(userpassword, salt) {
            const hash = crypto.createHmac(ENCRYPTION_TYPE, salt); /** Hashing algorithm sha512 */
            hash.update(userpassword);
            const value = hash.digest('hex');
            return {
                  salt,
                  passwordHash: value
            };
      };
      
      // salt with random generation password
      const saltHashPassword = function saltHashPassword(userpassword) {
            const salt = genRandomString(SALT_LENGTH); /** Gives us salt of length 16 */
            return gethash(userpassword, salt);
      };
      
      // Used to for JOBs,
      // credentials used for job cannot be hashed but needs to be encrypted,
      // because when the creds are used, they need to be reversable
      // Passwords are stored in DB ,  the key is stored in filesystem
      // two systems need to be connected to decrypt the password
      // Ensure people who have access to the DB have no access to the filesystem of core server
      function encrypt(text) {
            const cipher = crypto.createCipheriv(encryptionalgorithm, Buffer.from(encryptionkey), encryptioniv);
            let encrypted = cipher.update(text);
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            return encrypted.toString('hex');
            // return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
      }
      
      function decrypt(text) {
            const encryptedText = Buffer.from(text, 'hex');
            const decipher = crypto.createDecipheriv(encryptionalgorithm, Buffer.from(encryptionkey), encryptioniv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
      }

      var keycloakVerifier = "";
      if(f.serverconfig.keycloak) {
            keycloakVerifier = fs.readFileSync(`${process.cwd()}/config/${cryptoconfig.keycloak.jwt_publickey_verifier}`);
      }
      
      async function keycloak(user, password) {
            var details = {
                  username: user,
                  password: password,
                  grant_type: 'password',
                  client_id: cryptoconfig.keycloak.client_id,
                  client_secret: cryptoconfig.keycloak.client_secret
              };

            
            var formBody = [];
            for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
            }
            formBody = formBody.join("&");
            
            const URL =
                  cryptoconfig.keycloak.url+
                  '/auth/realms/'+
                  cryptoconfig.keycloak.realm+
                  '/protocol/openid-connect/token'

            var groups= []      

            const response = await fetch(URL
                  , {
                  method: 'POST',
                  headers: {
                  'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
                  },
                  body: formBody
            })
            const data = await response.json();
            
            
            var groups= []      
            if(data.access_token) {
                  f.log.debug("Verifying Authority")
                  const jwtdecoded =  jwt.verify(data.access_token, keycloakVerifier);
                  f.log.debug("Authority Verified")
                  f.log.trace(jwtdecoded)
                  groups=jwtdecoded.realm_access.roles
            }
            
            
            f.log.trace("user realm count: "+groups.length)

            return groups
  
      }


      f.decorate('genRandomString', genRandomString);
      f.decorate('saltHashPassword', saltHashPassword);
      f.decorate('gethash', gethash);
      f.decorate('encrypt', encrypt);
      f.decorate('decrypt', decrypt);
      f.decorate('keycloak', keycloak);
      done();
});
