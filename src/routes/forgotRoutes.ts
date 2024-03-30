import { Router } from 'express';
import { errorHandler } from '../erroHandler';
import { changePassword, forgotReset,OTPSend,verifyOTPController,resendOTPController } from '../controllers/passwordController';

const forgotRoute: Router = Router();
forgotRoute.post('/forgot', errorHandler(forgotReset));
forgotRoute.post('/reset', errorHandler(changePassword));
forgotRoute.post('/otp-send',errorHandler(OTPSend));
forgotRoute.post('/otp-verify',errorHandler(verifyOTPController));
forgotRoute.post('/resend-otp',errorHandler(resendOTPController));
export default forgotRoute;