import PDFDocument from 'pdfkit';
import pool from "../database.js";

export async function buildPDF(dataCallback, endCallback) {

 const [results]= await pool.query("SELECT * FROM reservas WHERE id = (SELECT MAX(id) FROM reservas)");
 console.log(results)

  const doc = new PDFDocument({ bufferPages: true, font: 'Courier' });

  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  doc.fontSize(20).text(`A heading`);

  if (results.length > 0) {
    // Iterar sobre cada fila del resultado y escribir en el PDF
    results.forEach((rowData) => {
      for (const key in rowData) {
        if (Object.prototype.hasOwnProperty.call(rowData, key)) {
          doc.fontSize(12).text(`${key}: ${rowData[key]}`);
        }
      }
      doc.addPage(); // Agregar una nueva página para cada fila (opcional)
    });
  } else {
    doc.fontSize(12).text('No se encontraron registros.');
  }
  doc.end();
}
