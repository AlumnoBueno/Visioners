import { Router } from "express";
import pool from "../database.js";
import {isLoggedIn} from "../controllers/authController.js"
import {logout} from "../controllers/logoutController.js"
import {login} from "../controllers/LoginController.js"
import {signin} from "../controllers/signinController.js"

const router = Router();


 router.get('/',isLoggedIn, async(req,res)=>{
     try{
        if(req.user){
         const [result] = await pool.query('SELECT * FROM peliculas');
         console.log(req.user)
         console.log("dentro")
         res.render('index.hbs',{peliculas:result,status:"DENTRO",user:req.user})
         
        }else{
            const [result] = await pool.query('SELECT * FROM peliculas');
            console.log("fuera")
            res.render('index.hbs',{peliculas:result,user:"no"})
        }
     }catch(err){
         res.status(500).json({message:err.message})
     }
 })



router.get('/film/:id',isLoggedIn,async(req,res)=>{
    try{
       const {id} = req.params;
       const [pelicula] = await pool.query('SELECT * FROM peliculas where id = ?',[id]);
       const mostrarPelicula = pelicula[0];
      
        if(req.user){
       res.render('film.hbs',{pelicula: mostrarPelicula,status:"DENTRO",user:req.user})
        }else{
            res.render('film.hbs',{pelicula: mostrarPelicula})
        }
    }catch(err){
        res.status(500).json({message:err.message})
    }
})


router.get('/entradas/:id/:hora/:fecha/:sala',async(req,res)=>{
    try{
       
    
    //    const fecha = new Date(req.params.fecha);
    //    const year = fecha.getFullYear();
    //    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    //    const day = String(fecha.getDate()).padStart(2, '0');
     
    //    const fechaFinal =  `${year}-${month}-${day}`;
       console.log(req.params)

       const [result] = await pool.query('SELECT * from cartelera where id_pelicula = ? and id_sala = ? and hora = ? and fecha = ?',
       [req.params.id,req.params.sala,req.params.hora,req.params.fecha]);

       const carte = result[0];
       
       res.render("entradas.hbs",{cartelera:carte});




    }catch(err){
        res.status(500).json({message:err.message})
    }
})



router.get('/buscarPorFecha/:fecha/:id', async(req, res) => {
    const fecha = req.params.fecha;
    const id = req.params.id;
  

    const [comprobar] = await pool.query('SELECT * FROM cartelera WHERE id_pelicula=? and fecha = ?',[id,fecha])
   
   
    res.json(comprobar)

})




//LOGIN

router.post('/signup',login)


//AUTH

router.post('/signin',signin)
    

//LOGOUT
router.get('/logout',logout);



export default router;