import { Hono } from 'hono';
import { SymptomController } from '../controllers/symptomController';
import { authMiddleware } from '../middlewares/authMiddleware';

const symptomRoutes = new Hono();

symptomRoutes.post('/', authMiddleware, SymptomController.create);
symptomRoutes.get('/verify', authMiddleware, SymptomController.getAll);

export default symptomRoutes;