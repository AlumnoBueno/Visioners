import { Router } from "express";
import pool from "../database.js";
import { isLoggedIn } from "../controllers/authController.js";
import { logout } from "../controllers/logoutController.js";
import { register } from "../controllers/registerController.js";
import { signin } from "../controllers/signinController.js";
import { createSession } from "../controllers/payment.controller.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import {join, dirname} from 'path'
import { fileURLToPath } from 'url';
import path from 'path';
import { buildPDF } from "../controllers/pdf-service.js";
import nodemailer from 'nodemailer';



const __dirname = dirname(fileURLToPath(import.meta.url));

const router = Router();



//LOGIN

router.post("/login", register);

//AUTH

router.post("/signin", signin);

//LOGOUT
router.get("/logout", logout);


//INDEX

router.get("/", isLoggedIn, async (req, res) => {
  try {
    if (req.user) {
      const [result] = await pool.query("SELECT * FROM peliculas");
      const [generos] = await pool.query(
        "SELECT DISTINCT genero FROM peliculas"
      );
      res.render("index.hbs", {
        peliculas: result,
        generos: generos,
        status: "DENTRO",
        user: req.user,
      });
    } else {
      const [result] = await pool.query("SELECT * FROM peliculas");
      console.log("fuera");
      const [generos] = await pool.query(
        "SELECT DISTINCT genero FROM peliculas"
      );
      res.render("index.hbs", {
        peliculas: result,
        generos: generos,
        user: "no",
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



//Filtro de generos
router.get("/filtrar", async (req, res) => {
  const generoSeleccionado = req.query.genero;
  console.log(generoSeleccionado)

  try{
    if(generoSeleccionado == "Todos"){
      var [comprobar] = await pool.query(
        "SELECT * FROM peliculas",
      );
    }else{
  var [comprobar] = await pool.query(
    "SELECT * FROM peliculas WHERE genero=?",
    [generoSeleccionado]
  );
    }
 
  res.json(comprobar);
} catch (err) {
  res.status(500).json({ message: err.message });
}
});




//FILM

router.get("/film/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    const [pelicula] = await pool.query(
      "SELECT * FROM peliculas where id = ?",
      [id]
    );
    const mostrarPelicula = pelicula[0];

    if (req.user) {
      res.render("film.hbs", {
        pelicula: mostrarPelicula,
        status: "DENTRO",
        user: req.user,
      });
    } else {
      res.render("film.hbs", { pelicula: mostrarPelicula });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/buscarPorFecha/:fecha/:id", async (req, res) => {
  const fecha = req.params.fecha;
  const id = req.params.id;

  const [comprobar] = await pool.query(
    "SELECT * FROM cartelera WHERE id_pelicula=? and fecha = ? AND ((fecha > CURRENT_DATE) OR (fecha = CURRENT_DATE AND hora > (CURRENT_TIME + INTERVAL 1 HOUR)));",
    [id, fecha]
  );

  res.json(comprobar);
});




//ENTRADAS

router.get("/entradas/:id", isLoggedIn, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    const [result] = await pool.query(
      "SELECT * from butacas where sala_id = ?",
      [id]
    );
    const [result2] = await pool.query(
      "SELECT b.disponible,s.nombre_sala,p.titulo,p.duracion,p.genero,p.caratula,c.hora,c.fecha from butacas b,cartelera c,peliculas p,salas s where b.sala_id = c.id_sala and s.id = b.sala_id and c.id_pelicula = p.id and b.sala_id = ? LIMIT 1;",
      [id]
    );
    const sala = result;
    const reserva = result2;
    if (req.user) {
        res.render("entradas.hbs", {
            salas: sala,
        reserva: reserva,
          status: "DENTRO",
          user: req.user,
        });
      } else {
        res.render("entradas.hbs", { salas: sala, reserva: reserva });
      }

  
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/procesar-checkboxes", (req, res) => {
  const opcionesSeleccionadas = req.body.opciones;
  var opciones = 0;
  if (opcionesSeleccionadas >= 10 || opcionesSeleccionadas <= 10) {
    opciones = 1;
  }
  if (opciones == 1) {
    res.redirect(`/compra?opciones=${opcionesSeleccionadas}`);
  } else {
    res.redirect(`/compra?opciones=${opcionesSeleccionadas.join(",")}`);
  }
});



//COMPRA

router.get("/compra",isLoggedIn, async (req, res) => {
  const opciones = req.query.opciones.split(",");
  let compra;
  const resultados = [];
  try{
  for (const butacaId of opciones) {
    const [result] = await pool.query(
      "SELECT s.nombre_sala,p.caratula,b.numero,b.butaca_id,p.titulo,p.duracion,p.genero,c.hora,b.numero,c.fecha from butacas b,cartelera c,peliculas p,salas s where s.id = b.sala_id and b.sala_id = c.id_sala and c.id_pelicula = p.id and b.butaca_id=?",
      [butacaId]
    );
    if (result.length > 0) {
      compra = result; 
    }
    for (let i = 0; i < compra.length; i++) {
      resultados.push(compra[i]);
    }
  }
  if (req.user) {
    res.render("compra.hbs", {
        resultados: resultados, 
        compra: compra,
      status: "DENTRO",
      user: req.user,
    });
  } else {
    res.render(`compra.hbs`, { resultados: resultados, compra: compra });
  }
} catch (err) {
  res.status(500).json({ message: err.message });
}
});




//PAGO
router.post("/create-checkout-session",createSession);





//FINAL
router.get("/resumen",isLoggedIn,async (req, res) => {

  var correo = null;
  
  var butacas =req.query.butacas;
  var correo_no_registrado = req.query.correo;
  var titulo = req.query.titulo;
  var hora = req.query.hora;
  var sala = req.query.sala;
  var fecha = req.query.fecha;
 var precio = parseInt(req.query.precio);

  if(req.user){
    var correo = req.user.email;
  }else{
    var correo = null;
  }

  const meses = {
    enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
    julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
  };

  const partes = fecha.split(' de ');
  const dia = partes[0].padStart(2, '0'); 
  const mes = meses[partes[1].toLowerCase()];
  const anio = partes[2];

  const fechaFinal = `${anio}-${mes}-${dia}`;

 
  const butacasArray = butacas.split(',').map(butaca => parseInt(butaca.trim(), 10));
  butacasArray.pop();
  try{
      butacasArray.forEach(async butaca => {
        
         await pool.query(`update butacas set disponible = false where numero = ${butaca} and sala_id in( select id from salas where nombre_sala = '${sala}' and fecha = '${fechaFinal}' and hora = '${hora}');`)
       
      });

        

        if (correo){
      await pool.query(`INSERT INTO reservas (titulo_pelicula, fecha, hora, butacas,email_usuario,email_usuario_no_registrado,precio,sala)  SELECT * FROM (SELECT '${titulo}', '${fechaFinal}', '${hora}', '${butacasArray}','${correo}',null,${precio},'${sala}') AS tmp
      WHERE NOT EXISTS (
        SELECT * FROM reservas 
        WHERE titulo_pelicula = '${titulo}' 
        AND fecha = '${fechaFinal}'
        AND hora = '${hora}'
        AND butacas = '${butacasArray}'
      )
      LIMIT 1`);
        }else{
          await pool.query(`INSERT INTO reservas (titulo_pelicula, fecha, hora, butacas,email_usuario,email_usuario_no_registrado,precio,sala)  SELECT * FROM (SELECT '${titulo}', '${fechaFinal}', '${hora}', '${butacasArray}',null,'${correo_no_registrado}',${precio},'${sala}') AS tmp
      WHERE NOT EXISTS (
        SELECT * FROM reservas 
        WHERE titulo_pelicula = '${titulo}' 
        AND fecha = '${fechaFinal}'
        AND hora = '${hora}'
        AND butacas = '${butacasArray}'
      )
      LIMIT 1`);
        }

        if (req.user) {
          res.render("resumen.hbs", {status: "DENTRO",user: req.user,
          });
        } else {
          res.render("resumen.hbs");
        }} catch (err) {
          res.status(500).json({ message: err.message });
        }
});


//HISTORIAL


router.get("/historial/:email", isLoggedIn,async (req, res) => {
 
  try{
    const {email} = req.params;
   
    const [comprobar] = await pool.query(
      `SELECT r.id,r.titulo_pelicula,DATE_FORMAT(r.fecha, '%d/%m/%Y') as fecha,r.hora,r.butacas,r.precio,r.sala,p.titulo,p.caratula FROM reservas r,peliculas p where r.titulo_pelicula = p.titulo and (r.email_usuario= ? or r.email_usuario_no_registrado= ?) order by r.id desc`,
      [email,email]
    );

    const mostrarPeliculasReservadas = comprobar;
   
    if(req.user){
    res.render("historial.hbs", { peliculas: mostrarPeliculasReservadas, status: "DENTRO",
    user: req.user, });
    }else{
      res.render("historial.hbs", { peliculas: mostrarPeliculasReservadas})
    }
} catch (err) {
  res.status(500).json({ message: err.message });
}
});


//ENTRADA FINAL

router.get('/entrada_final/:id', isLoggedIn,async (req, res) => {

  const {id} = req.params;

  const [comprobar] = await pool.query(
    `SELECT r.id,r.titulo_pelicula,DATE_FORMAT(r.fecha, '%d/%m/%Y') as fecha,r.hora,r.butacas,r.precio,r.sala,p.titulo,p.caratula FROM reservas r,peliculas p where r.titulo_pelicula = p.titulo and r.id = ?`,
    [id]
  );

  const mostrarPeliculaReservada = comprobar;

  if (req.user) {
    res.render("entrada_final.hbs", {reserva: mostrarPeliculaReservada, status: "DENTRO",user: req.user,
    });
  } else {
    res.render("entrada_final.hbs",{reserva: mostrarPeliculaReservada});
  }
});

//ENVIO DE ARCHIVO Y CORREO

router.get('/invoice', isLoggedIn, (req, res, next) => {
  const stream = res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment;filename=entrada.pdf`,
  });
  buildPDF(
    (chunk) => stream.write(chunk),
    () => stream.end()
  );
});



//ATENCION AL CLIENTE

router.get('/atencion_cliente', isLoggedIn, (req, res) => {
  if (req.user) {
    res.render("atencion_cliente.hbs", {status: "DENTRO",user: req.user,
    });
  } else {
  
    res.render("atencion_cliente.hbs");
  }
});


router.post('/atencion_cliente', isLoggedIn, (req, res) => {
  console.log("aqui")
const data = req.body
  console.log(data);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "visioners2024@gmail.com",
      pass: "neje qocc aapj iqdo",
    },
  });

  const mailOptions = {
    from: "visioners2024@gmail.com",
    to: `visioners2024@gmail.com`,
    subject: "MENSAJE DE ATENCIÓN AL CLIENTE:",
    text: `MENSAJE DE ATENCIÓN AL CLIENTE:

    Nombre: ${data.valor_nombre}
    Apellido: ${data.valor_usuario}
    Correo: ${data.valor_correo}
    Telefono: ${data.valor_telefono}
    Mensaje:
     ${data.valor_texto}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error al enviar el correo:", error);
    } else {
      console.log("Correo electrónico enviado:", info.response);
    }
  });
  });




//AVISO LEGAL

router.get('/aviso_legal', isLoggedIn, (req, res) => {
  if (req.user) {
    res.render("aviso_legal.hbs", {status: "DENTRO",user: req.user,
    });
  } else {
  
    res.render("aviso_legal.hbs");
  }
});


//ACCESIBILIDAD

router.get('/accesibilidad', isLoggedIn, (req, res) => {
  if (req.user) {
    res.render("accesibilidad.hbs", {status: "DENTRO",user: req.user,
    });
  } else {
  
    res.render("accesibilidad.hbs");
  }
});





export default router;
