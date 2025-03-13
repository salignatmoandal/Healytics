// src/controllers/aiController.ts
import { type Context } from 'hono';
import { AIService } from '../services/aiService';

export class AIController {
  static async analyze(c: Context) {
    try {
      const { symptoms } = await c.req.json();
      const analysis = await AIService.analyzeSymptoms(symptoms);
      return c.json({ analysis });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  }
}