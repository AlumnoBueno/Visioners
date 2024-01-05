import PDFDocument from "pdfkit";
import pool from "../database.js";
import path from "path";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";
import fs from "fs";
import nodemailer from "nodemailer";

export async function buildPDF(dataCallback, endCallback) {


  //revisar VARIABLES
  const url = "https://www.tu_pagina_web.com";
  const qrImageFile = "temp_qr.png";

  const __dirname = dirname(fileURLToPath(import.meta.url));

  const [results] = await pool.query(
    "SELECT * FROM reservas WHERE id = (SELECT MAX(id) FROM reservas)"
  );

  const doc = new PDFDocument({ bufferPages: true, font: "Courier" });

  doc.on("data", dataCallback);
  doc.on("end", endCallback);

  const imagePath = path.join(__dirname, "../public/img/logo.png");
  const pdfPath = path.join(__dirname, "entrada.pdf"); // Ruta temporal donde se guardará el PDF
  doc.pipe(fs.createWriteStream(pdfPath));
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Ancho y alto de la imagen en el PDF
  const imageWidth = 300; // Ancho deseado de la imagen
  const imageHeight = 100; // Alto deseado de la imagen

  // Calcular la posición para alinear la imagen en la parte superior y en el centro
  const xPosition = (pageWidth - imageWidth) / 2;
  const yPosition = 0; // Empezar desde el borde superior

  // Insertar la imagen en la posición calculada
  doc.image(imagePath, xPosition, yPosition, {
    width: imageWidth,
    height: imageHeight,
  });

  // ... Tu código existente para generar el PDF y agregar contenido ...

  const buffer = await QRCode.toBuffer(url, { errorCorrectionLevel: "H" });
  // Agregar el código QR al PDF
  doc.image(buffer, xPosition + 80, yPosition + 360, { fit: [100, 100] }); // Ajusta la posición y el tamaño según tus necesidades

  let textYPosition = yPosition + imageHeight + 20; // Ajustar la distancia del texto desde la imagen
  if (results.length > 0) {
    // Iterar sobre cada fila del resultado y escribir en el PDF
    results.forEach((rowData) => {
      for (const key in rowData) {
        if (Object.prototype.hasOwnProperty.call(rowData, key)) {
          doc
            .fontSize(12)
            .text(`${key}: ${rowData[key]}`, xPosition, textYPosition, {
              align: "left", // Alineación del texto a la izquierda
            });
          textYPosition += 20; // Ajustar el espacio vertical entre líneas
        }
      }
    });



    //ENVIO DE CORREO

    if (results[0].email_usuario) {
      var correo_destino = results[0].email_usuario;
    } else {
      var correo_destino = results[0].email_usuario_no_registrado;
    }
   
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "visioners2024@gmail.com",
        pass: "fsbv mmby barw utva",
      },
    });

    const mailOptions = {
      from: "visioners2024@gmail.com",
      to: `${correo_destino}`,
      subject: "Documento adjunto",
      text: "Se adjunta el documento generado.",
      attachments: [
        {
          filename: "entrada.pdf",
          path: pdfPath, // Adjunta el PDF generado directamente
        },
      ],
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error al enviar el correo:", error);
      } else {
        console.log("Correo electrónico enviado:", info.response);
      }
    });

    


  } else {
    doc.fontSize(12).text("No se encontraron registros.");
  }
  doc.end();
}
