// backend/src/routes/pdf.ts
import { Hono } from 'hono';
import { PDFController } from '../controllers/pdfController';
import { authMiddleware } from '../middlewares/authMiddleware';

const pdfRoutes = new Hono();

// Générer un PDF à partir d'une analyse
pdfRoutes.post('/generate', authMiddleware, PDFController.generateReport);

// Récupérer un PDF
pdfRoutes.get('/:fileName', authMiddleware, PDFController.getPdf);

export default pdfRoutes;