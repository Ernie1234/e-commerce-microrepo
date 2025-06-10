import { waitForPortOpen } from '@nx/node/utils';
import * as path from 'path'; // Import path module
import * as dotenv from 'dotenv'; // Import dotenv

/* eslint-disable */
var __TEARDOWN_MESSAGE__: string;

module.exports = async function () {
  console.log('\nE2E Global Setup: Starting...\n');

  // Load the environment variables specific to the auth-service project.
  // This ensures that the E2E tests pick up the correct PORT where the auth-service runs.
  // Adjust the path if your .env file for auth-service is located elsewhere.
  dotenv.config({
    path: path.resolve(process.cwd(), 'apps', 'auth-service', '.env'),
  });

  const authServicePort = process.env.PORT ? Number(process.env.PORT) : 6001;
  const authServiceHost = process.env.HOST ?? 'localhost';

  console.log(
    `E2E Global Setup: Waiting for auth-service on ${authServiceHost}:${authServicePort} to be open...`
  );

  try {
    // Wait for the auth-service port to become available.
    // Added a timeout for better error handling if the server doesn't start.
    await waitForPortOpen(authServicePort, {
      host: authServiceHost,
    }); // 2 minutes timeout
    console.log(
      `✅ E2E Global Setup: Auth service on ${authServiceHost}:${authServicePort} is open.`
    );
  } catch (error) {
    console.error(
      `❌ E2E Global Setup: Failed to wait for auth-service on ${authServiceHost}:${authServicePort}!`,
      error
    );
    // Re-throw the error to ensure the Jest global setup fails clearly.
    throw error;
  }

  // Set a global variable for the base URL of the auth service.
  // This will be used by jest-setup.ts for configuring axios.
  globalThis.__E2E_AUTH_SERVICE_BASE_URL__ = `http://${authServiceHost}:${authServicePort}`;
  console.log(
    `E2E Global Setup: Axios base URL set to ${globalThis.__E2E_AUTH_SERVICE_BASE_URL__}`
  );

  // Set the teardown message for globalTeardown.
  globalThis.__TEARDOWN_MESSAGE__ = '\nTearing down E2E services...\n';
  console.log('E2E Global Setup: Completed successfully.');
};
