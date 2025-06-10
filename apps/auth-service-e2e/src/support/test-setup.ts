/* eslint-disable */
import axios from 'axios';

module.exports = async function () {
  // Configure axios for tests to use the base URL determined in global-setup.
  // It's crucial that globalThis.__E2E_AUTH_SERVICE_BASE_URL__ is set by global-setup.ts.
  axios.defaults.baseURL =
    globalThis.__E2E_AUTH_SERVICE_BASE_URL__ || 'http://localhost:6001'; // Fallback for safety
  console.log(
    `Jest Setup: Axios defaults.baseURL set to ${axios.defaults.baseURL}`
  );
};
