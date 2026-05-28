import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ ok: true, message: 'Analytics endpoint is available.' });
});

export default router;
