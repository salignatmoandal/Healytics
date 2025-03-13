

// --- Global error handling middleware --- //
import type { Context } from 'hono';
import type { ErrorHandler } from 'hono';

// Middleware standard pour les routes
export const errorMiddleware = async (c: Context, next: () => Promise<void>) => {
  try {
    await next();
  } catch (error) {
    console.error('Error in middleware:', error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
};

// Gestionnaire d'erreur pour app.onError
export const errorHandler: ErrorHandler = (err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
};
