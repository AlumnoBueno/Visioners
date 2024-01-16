import { Router } from "express";
import pool from "../database.js";
import {join, dirname} from 'path'
import { fileURLToPath } from 'url';
import bcrypt from  'bcrypt';
import multer from "multer";
import path from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = Router();

router.use((req, res, next) => {
    res.locals.layout = null; // Otra opción podría ser 'adminLayout' si tienes un diseño específico para admin
    next();
  });

  const directorioPadre = path.join(__dirname, '..');

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, directorioPadre+"/public/img/caratulas"); // La carpeta donde se almacenarán las imágenes
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname);
    console.log(file.originalname)
    }
  });
  
  const upload = multer({ storage: storage });


router.get("/admin", async (req, res) => {
    console.log(__dirname)
    res.render("admin/admin_index.hbs")
})

router.post("/login-adm", async (req, res) => {
    try {
    const {correo, password} = req.body;

    if(correo == "ka0@gmail.com")
    {
    const [result] = await pool.query('SELECT * FROM usuarios WHERE email = ?',[correo]);

    if(!await bcrypt.compare(password, result[0].password)){
      res.status(201).json({ success: false, message: 'Conraseña incorrecta' });
   }else{

    const [peliculas] = await pool.query('SELECT * FROM peliculas');


      res.render("admin/gestion.hbs", {peliculas:peliculas})
   }
    }


    }
catch (error) {
    console.error("Error en la autenticación:", error);
    res.status(500).send("Error interno del servidor");
  }
})


router.get("/edit/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id)
    const [pelicula] = await pool.query(
      "SELECT * FROM peliculas where id = ?",
      [id]
    );
    const mostrarPelicula = pelicula[0];
    res.render("admin/edit.hbs", { pelicula: mostrarPelicula });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/upload', upload.single('caratula1'), async(req, res) => {
 
 
  const [peliculas] = await pool.query('SELECT * FROM peliculas');


    res.render("admin/gestion.hbs", {peliculas:peliculas})
});


router.post("/edit/:id", async (req, res) => {
  try {
    const { titulo,direccion,sinopsis,trailer,caratula } = req.body;
    const editarPelicula = { titulo,direccion,sinopsis,trailer,caratula }
    const {id} = req.params
    await pool.query('UPDATE peliculas set ? where id = ?',[editarPelicula,id])
    const [peliculas] = await pool.query('SELECT * FROM peliculas');


      res.render("admin/gestion.hbs", {peliculas:peliculas})
   
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;