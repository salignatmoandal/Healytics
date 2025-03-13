import PDFDocument from 'pdfkit';
import * as Prisma from '@prisma/client'; 
type Symptom = Prisma.Symptom; // Extraction du type Symptom

// On étend le type pour ajouter un champ optionnel "result"
export type SymptomWithResult = Symptom & { result?: string };

export const generateSymptomPdf = async (check: SymptomWithResult | null): Promise<Buffer> => {
  const doc = new PDFDocument({ bufferPages: true });
  const buffers: Buffer[] = [];

  // Récupère les données du PDF dans un tableau de Buffer
  doc.on('data', (chunk: Buffer) => buffers.push(chunk));
  
  // Titre du PDF
  doc.fontSize(20).text('AI Symptom Checker Report', { underline: true });
  doc.moveDown();

  if (check) {
    doc.fontSize(14)
      .text(`Symptom Record ID: ${check.id}`, { continued: true });
    doc.moveDown();
    // Affiche les symptômes (le champ "details" défini dans le modèle)
    doc.text(`Symptoms: ${check.details}`);
    doc.moveDown();
    // Affiche le résultat de l'analyse (si fourni)
    if (check.result) {
      doc.text(`Possible Conditions: ${check.result}`);
    } else {
      doc.text(`Possible Conditions: Not available`);
    }
    doc.moveDown();
    doc.text(`Created At: ${check.createdAt.toISOString()}`);
  } else {
    doc.text('No Symptom Check data found.');
  }

  doc.end();

  return new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', (err) => {
      reject(err);
    });
  });
};