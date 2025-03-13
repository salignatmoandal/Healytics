import { Hono } from 'hono';

const pdfRoutes = new Hono();

pdfRoutes.get('/', async (c) => {
  return c.json({ message: "PDF generated successfully" });
});

export default pdfRoutes;