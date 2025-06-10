import { killPort } from '@nx/node/utils';
import * as path from 'path'; // Import path module
import * as dotenv from 'dotenv'; // Import dotenv

/* eslint-disable */

module.exports = async function () {
  console.log(globalThis.__TEARDOWN_MESSAGE__);

  // Load the environment variables to ensure we get the correct port for teardown
  dotenv.config({
    path: path.resolve(process.cwd(), 'apps', 'auth-service', '.env'),
  });

  const authServicePort = process.env.PORT ? Number(process.env.PORT) : 6001;
  const authServiceHost = process.env.HOST ?? 'localhost';

  console.log(
    `E2E Global Teardown: Attempting to kill port ${authServicePort}...`
  );
  try {
    await killPort(authServicePort);
    console.log(
      `✅ E2E Global Teardown: Port ${authServicePort} killed successfully.`
    );
  } catch (error) {
    console.error(
      `❌ E2E Global Teardown: Failed to kill port ${authServicePort}:`,
      error
    );
    // Don't re-throw, as teardown should ideally complete even if port killing fails for some reason
  }
};
