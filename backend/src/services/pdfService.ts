import PDFDocument from 'pdfkit';
import * as Prisma from '@prisma/client'; 



// Extend the type to add an optional "result" field
export type SymptomWithResult = Prisma.Symptom & { result?: string };

export const generateSymptomPdf = async (check: SymptomWithResult | null): Promise<Buffer> => {
  const doc = new PDFDocument({ bufferPages: true });
  const buffers: Buffer[] = [];

  // Retrieve the PDF data in an array of Buffer
  doc.on('data', (chunk: Buffer) => buffers.push(chunk));
  
  // PDF title
  doc.fontSize(20).text('AI Symptom Checker Report', { underline: true });
  doc.moveDown();

  if (check) {
    doc.fontSize(14)
      .text(`Symptom Record ID: ${check.id}`, { continued: true });
    doc.moveDown();
    // Display the symptoms (the "details" field defined in the model)
    doc.text(`Symptoms: ${check.details}`);
    doc.moveDown();
    // Display the analysis result (if provided)
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