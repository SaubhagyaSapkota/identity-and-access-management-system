import express from 'express';
import authRouter from './auth/auth.route';
import adminRouter from './admin/admin.route';
import userRouter from './user/user.route';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/admin', adminRouter);
router.use('/user', userRouter);

export default router;