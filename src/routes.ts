import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ msg: 'API funcionando 🚀' });
});

export default router;
