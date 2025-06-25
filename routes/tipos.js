//Imports
import express from 'express';
import {authenticateToken} from '../middlewares/auth.js';

//Router
const router = express.Router();

router.get('/get-tipo', authenticateToken, (req, res) => {
  res.json({
    tipo: req.user.tipo,
  });
});

export default router;