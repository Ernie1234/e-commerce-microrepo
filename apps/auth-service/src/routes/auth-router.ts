import express, { Router } from 'express';
import {
  getLoggedInUser,
  loginUser,
  refreshToken,
  resetUserPassword,
  userForgotPassword,
  userRegistration,
  verifyUser,
  verifyUserForgotPassword,
} from '../controllers/auth-controller';
import isAuthenticated from '@packages/middlewares/isAuthenticated';

const router: Router = express.Router();

// User Routes
router.post('/user-registration', userRegistration);
router.post('/verify-user', verifyUser);
router.post('/login-user', loginUser);
router.get('/logged-in-user', isAuthenticated, getLoggedInUser);
router.post('/refresh-token-user', refreshToken);
router.post('/user-forgot-password', userForgotPassword);
router.post('/user-reset-password', resetUserPassword);
router.post('/user-verify-forgot-password', verifyUserForgotPassword);

export default router;
