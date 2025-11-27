import express from 'express';
import authRouter from './auth/auth.route';
import adminRouter from './admin/admin.route';

const router = express.Router();

router.use('/auth', authRouter);
router.use('/admin', adminRouter);

export default router;