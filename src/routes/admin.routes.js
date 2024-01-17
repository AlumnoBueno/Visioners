import { Router } from "express";
import pool from "../database.js";
import {join, dirname} from 'path'
import { fileURLToPath } from 'url';
import bcrypt from  'bcrypt';
import multer from "multer";
import path from "path";
import  jwt  from "jsonwebtoken";
import { isLoggedIn } from "../controllers/authController.js";
import { promisify } from "util";

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = Router();

router.use((req, res, next) => {
    res.locals.layout = null; 
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
    const email = result[0].email;
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES
    });
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
        ),
        secure: false,
        httpOnly: true
    }
    res.cookie('userAdmin', token, cookieOptions);  
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


router.get("/edit/:id",isLoggedIn, async (req, res) => {
  try {
    if(req.user){
      const parts = req.headers.cookie.split("=");
    const lastPart = parts[parts.length - 1];
      const decoded = await promisify(jwt.verify)(
        lastPart,
        process.env.JWT_SECRET
      );

        console.log(decoded.email)
      if (decoded.email != "ka0@gmail.com") {
        res.render("admin/admin_index.hbs")
      }else{
     
    const { id } = req.params;
    console.log(id)
    const [pelicula] = await pool.query(
      "SELECT * FROM peliculas where id = ?",
      [id]
    );
    const mostrarPelicula = pelicula[0];
    res.render("admin/edit.hbs", { pelicula: mostrarPelicula });
      }
    }else{
      res.render("admin/admin_index.hbs")
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/upload', upload.single('caratula1'), async(req, res) => {
 
 
  const [peliculas] = await pool.query('SELECT * FROM peliculas');


    res.render("admin/gestion.hbs", {peliculas:peliculas})
});


router.post("/edit/:id", isLoggedIn, async (req, res) => {
  try {

    if (req.user){
    const { titulo,direccion,sinopsis,trailer,caratula } = req.body;
    const editarPelicula = { titulo,direccion,sinopsis,trailer,caratula }
    const {id} = req.params
    await pool.query('UPDATE peliculas set ? where id = ?',[editarPelicula,id])
    const [peliculas] = await pool.query('SELECT * FROM peliculas');


      res.render("admin/gestion.hbs", {peliculas:peliculas})
    }else{
      res.render("admin/admin_index.hbs")
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;