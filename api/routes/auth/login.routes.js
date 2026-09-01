import express from 'express';
import { loginUser } from '../../controllers/auth/login.controller.js';
import { registerUser } from '../../controllers/auth/register.controller.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', registerUser);

export default router;
