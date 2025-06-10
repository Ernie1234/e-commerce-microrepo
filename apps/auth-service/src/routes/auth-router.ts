import express, { Router } from 'express';
import {
  loginUser,
  userForgotPassword,
  userRegistration,
  verifyUser,
} from '../controllers/auth-controller';

const router: Router = express.Router();

router.post('/user-registration', userRegistration);
router.post('/verify-user', verifyUser);
router.post('/login-user', loginUser);
router.post('-user-forgot-password', userForgotPassword);

export default router;
