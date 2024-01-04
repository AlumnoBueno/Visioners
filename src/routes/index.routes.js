import { Router } from "express";
import pool from "../database.js";
import { isLoggedIn } from "../controllers/authController.js";
import { logout } from "../controllers/logoutController.js";
import { login } from "../controllers/LoginController.js";
import { signin } from "../controllers/signinController.js";
import { createSession } from "../controllers/payment.controller.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import {join, dirname} from 'path'
import { fileURLToPath } from 'url';
import path from 'path';
import { buildPDF } from "../controllers/pdf-service.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = Router();

router.get("/", isLoggedIn, async (req, res) => {
  try {
    if (req.user) {
      const [result] = await pool.query("SELECT * FROM peliculas");
      console.log(req.user);
      console.log("dentro");
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
    console.log(sala);
    console.log(reserva);

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

router.get("/buscarPorFecha/:fecha/:id", async (req, res) => {
  const fecha = req.params.fecha;
  const id = req.params.id;

  const [comprobar] = await pool.query(
    "SELECT * FROM cartelera WHERE id_pelicula=? and fecha = ?",
    [id, fecha]
  );

  res.json(comprobar);
});

//LOGIN

router.post("/", login);

//AUTH

router.post("/signin", signin);

//LOGOUT
router.get("/logout", logout);

//GENEROS
router.get("/filtrar", async (req, res) => {
  const generoSeleccionado = req.query.genero;

  const [comprobar] = await pool.query(
    "SELECT * FROM peliculas WHERE genero=?",
    [generoSeleccionado]
  );
  res.json(comprobar);
});

router.get("/comprobar", async (req, res) => {
  const email = req.query.email;
  const [comprobar2] = await pool.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email]
  );
  console.log(comprobar2.length);
  if (comprobar2.length == 1) {
    res.json({ error: true });
  } else {
    res.json({ error: true });
  }
});

//butacas

router.post("/bloquear-butacas", async (req, res) => {
  const { butacaIds } = req.body;

  try {
    const { butacaIds } = req.body;
    console.log(butacaIds);
    //    for (const butacaId of butacaIds) {
    //       await pool.execute('UPDATE butacas SET disponible = FALSE WHERE butaca_id = ?', [butacaId]);
    //     }
    res.status(200).send("Butacas bloqueadas correctamente.");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al bloquear las butacas.");
  }
});


router.post("/procesar-checkboxes",isLoggedIn, (req, res) => {
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

router.get("/compra", isLoggedIn, async (req, res) => {
  const opciones = req.query.opciones.split(",");
  console.log(opciones);
  let compra;
  const resultados = [];
  for (const butacaId of opciones) {
    const [result] = await pool.query(
      "SELECT s.nombre_sala,p.caratula,b.numero,b.butaca_id,p.titulo,p.duracion,p.genero,c.hora,b.numero,c.fecha from butacas b,cartelera c,peliculas p,salas s where s.id = b.sala_id and b.sala_id = c.id_sala and c.id_pelicula = p.id and b.butaca_id=?",
      [butacaId]
    );

    if (result.length > 0) {
      compra = result; // Asignar el resultado a comprobar si hay resultados
    }
    for (let i = 0; i < compra.length; i++) {
      resultados.push(compra[i]);
    }
  }
    console.log(resultados)
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
  
  
});


router.post("/create-checkout-session",createSession);
router.get("/resumen",async (req, res) => {
  var butacas =req.query.butacas;
  var titulo = req.query.titulo;
  var hora = req.query.hora;
  var sala = req.query.sala;
  console.log(sala)
  var fecha = req.query.fecha;

  const meses = {
    enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
    julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
  };

  const partes = fecha.split(' de ');
  const dia = partes[0].padStart(2, '0'); 
  const mes = meses[partes[1].toLowerCase()];
  const anio = partes[2];

  const fechaFinal = `${anio}-${mes}-${dia}`;

  console.log(titulo,hora,fechaFinal)
  const butacasArray = butacas.split(',').map(butaca => parseInt(butaca.trim(), 10));
  let ultimoValorEliminado = butacasArray.pop();

  console.log(butacasArray);

      butacasArray.forEach(butaca => {
        
         pool.query(`update butacas set disponible = false where numero = ${butaca} and sala_id in( select id from salas where nombre_sala = '${sala}' and fecha = '${fechaFinal}' and hora = '${hora}');`)

      });

      await pool.query(`INSERT INTO reservas (titulo_pelicula, fecha, hora, butacas)  SELECT * FROM (SELECT '${titulo}', '${fechaFinal}', '${hora}', '${butacasArray}') AS tmp
      WHERE NOT EXISTS (
        SELECT * FROM reservas 
        WHERE titulo_pelicula = '${titulo}' 
        AND fecha = '${fechaFinal}'
        AND hora = '${hora}'
        AND butacas = '${butacasArray}'
      )
      LIMIT 1`);

  
  res.render(`resumen.hbs`);
});


router.get('/invoice', (req, res, next) => {
  const stream = res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment;filename=entrada.pdf`,
  });
  buildPDF(
    (chunk) => stream.write(chunk),
    () => stream.end()
  );
});






export default router;
