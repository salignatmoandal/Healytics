import type { Context } from "hono";
import PDFDocument from "pdfkit";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

export const PDFController = {
  async generateReport(c: Context) {
    try {
      // Récupérer le corps de la requête sous forme de texte
      const reqText = await c.req.text();
      if (!reqText) {
        return c.json({ error: "Le corps de la requête est vide" }, 400);
      }
      const { analysisId } = JSON.parse(reqText);

      // Récupérer l'analyse depuis la base de données
      const analysis = await prisma.report.findUnique({
        where: { id: analysisId },
        include: { user: true }
      });

      if (!analysis) {
        return c.json({ error: "Analyse non trouvée" }, 404);
      }

      // Créer un dossier pour les PDF si nécessaire
      const pdfDir = path.join(process.cwd(), "pdfs");
      if (!fs.existsSync(pdfDir)) {
        fs.mkdirSync(pdfDir);
      }

      // Nom du fichier PDF
      const fileName = `report_${analysisId}_${Date.now()}.pdf`;
      const filePath = path.join(pdfDir, fileName);

      // Créer le PDF
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // En-tête du PDF
      doc.fontSize(25).text("Rapport Médical", { align: "center" });
      doc.moveDown();
      doc.fontSize(14).text(`Date: ${new Date().toLocaleDateString()}`, { align: "right" });
      doc.moveDown();

      // Informations du patient
      doc.fontSize(16).text("Informations du patient");
      doc.fontSize(12).text(`Email: ${analysis.user.email}`);
      doc.moveDown();

      // Symptômes
      doc.fontSize(16).text("Symptômes rapportés");
      // Utilisation de "as any" pour accéder aux propriétés non reconnues par TypeScript
      doc.fontSize(12).text((analysis as any).symptoms);
      doc.moveDown();

      // Analyse
      doc.fontSize(16).text("Analyse des symptômes");
      const analysisResults = JSON.parse((analysis as any).analysis);
      if (Array.isArray(analysisResults)) {
        analysisResults.forEach((result: { name: string; probability: number; description: string; }, index: number) => {
          doc.fontSize(12).text(`${index + 1}. ${result.name} (${Math.round(result.probability * 100)}%)`);
          if (result.description) {
            doc.fontSize(10).text(`   ${result.description}`);
          }
          doc.moveDown(0.5);
        });
      } else {
        doc.fontSize(12).text((analysis as any).analysis);
      }

      doc.moveDown();

      // Résumé
      doc.fontSize(16).text("Résumé");
      doc.fontSize(12).text(`Le patient présente les symptômes suivants : ${(analysis as any).symptoms}. `);
      if (Array.isArray(analysisResults) && analysisResults.length > 0) {
        doc.fontSize(12).text(`L'analyse suggère principalement ${analysisResults[0].name} avec une probabilité de ${Math.round(analysisResults[0].probability * 100)}%.`);
      }
      doc.moveDown();

      // Disclaimer (sans l'option "italics")
      doc.fontSize(10).text(
        "Avertissement: Ce rapport est généré automatiquement et ne remplace pas l'avis d'un professionnel de santé. Veuillez consulter un médecin pour un diagnostic précis.",
        { align: "center" }
      );

      // Finaliser le PDF
      doc.end();

      // Attendre que le fichier soit écrit
      await new Promise<void>((resolve) => {
        stream.on("finish", resolve);
      });

      // Enregistrer le lien du PDF dans la base de données
      await prisma.report.update({
        where: { id: analysisId },
        data: { pdfUrl: `/pdfs/${fileName}` }
      });

      // Renvoyer le lien vers le PDF
      return c.json({
        success: true,
        pdfUrl: `/pdfs/${fileName}`,
        message: "Rapport PDF généré avec succès"
      });
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      return c.json({ error: "Erreur lors de la génération du PDF" }, 500);
    }
  },

  async getPdf(c: Context) {
    try {
      const fileName = c.req.param("fileName");
      const filePath = path.join(process.cwd(), "pdfs", fileName);

      if (!fs.existsSync(filePath)) {
        return c.json({ error: "PDF non trouvé" }, 404);
      }

      // Lire le fichier et le renvoyer
      const fileBuffer = fs.readFileSync(filePath);
      return new Response(fileBuffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}"`
        }
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du PDF:", error);
      return c.json({ error: "Erreur lors de la récupération du PDF" }, 500);
    }
  }
};