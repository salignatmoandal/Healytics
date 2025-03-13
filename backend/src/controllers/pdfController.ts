import { type Context } from "hono";
import { generateSymptomPdf } from "../services/pdfService";

export class PDFController {
  static async generate(c: Context) {
    try {
      const user = c.get("user");
      const report = await generateSymptomPdf(user.userId);
      return c.json({ report });
    } catch (error: any) {
      return c.json({ error: error.message }, 400);
    }
  }
}