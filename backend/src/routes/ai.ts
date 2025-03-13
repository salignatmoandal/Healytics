// --- AI routes --- //

import { Hono } from 'hono';
import { AIService } from '../services/ai';

const aiRoutes = new Hono();

aiRoutes.post('/analyze', async (c) => {
  const { symptoms } = await c.req.json();
  const result = await AIService.analyzeSymptoms(symptoms);
  return c.json(result);
});

export default aiRoutes;