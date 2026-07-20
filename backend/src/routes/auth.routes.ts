import { Router } from 'express';
import { AuthController, registerSchema, loginSchema, refreshTokenSchema } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/register', validateBody(registerSchema), AuthController.register);
router.post('/login', validateBody(loginSchema), AuthController.login);
router.post('/refresh-token', validateBody(refreshTokenSchema), AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.get('/me', authenticateJWT, AuthController.getMe);

export default router;
