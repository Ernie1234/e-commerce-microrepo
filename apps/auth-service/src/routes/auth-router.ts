import express, { Router } from 'express';
import {
  loginUser,
  resetUserPassword,
  userForgotPassword,
  userRegistration,
  verifyUser,
  verifyUserForgotPassword,
} from '../controllers/auth-controller';

const router: Router = express.Router();

// User Routes
router.post('/user-registration', userRegistration);
router.post('/verify-user', verifyUser);
router.post('/login-user', loginUser);
router.post('/user-forgot-password', userForgotPassword);
router.post('/user-reset-password', resetUserPassword);
router.post('/user-verify-forgot-password', verifyUserForgotPassword);

export default router;
