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
         const [generos] = await pool.query('SELECT DISTINCT genero FROM peliculas');
         res.render('index.hbs',{peliculas:result,generos:generos,status:"DENTRO",user:req.user})
         
        }else{
            const [result] = await pool.query('SELECT * FROM peliculas');
            console.log("fuera")
            const [generos] = await pool.query('SELECT DISTINCT genero FROM peliculas');
            res.render('index.hbs',{peliculas:result,generos:generos,user:"no"})
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


router.get('/entradas/:id',async(req,res)=>{
    try{
       
       const {id} = req.params
       console.log(id)

       const [result] = await pool.query('SELECT * from butacas where sala_id = ?',[id]);
       const [result2] = await pool.query('SELECT s.nombre_sala,p.titulo,p.duracion,p.genero,p.caratula,c.hora,c.fecha from butacas b,cartelera c,peliculas p,salas s where b.sala_id = c.id_sala and s.id = b.sala_id and c.id_pelicula = p.id and b.sala_id = ? LIMIT 1;',[id]);
       const sala = result;
       const reserva = result2;
       console.log(sala)
       console.log(reserva)
      
       res.render("entradas.hbs",{salas:sala,reserva:reserva});


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

router.post('/',login)


//AUTH

router.post('/signin',signin)
    

//LOGOUT
router.get('/logout',logout);


//GENEROS
router.get('/filtrar', async(req, res) => {
    const generoSeleccionado = req.query.genero;
    
    const [comprobar] = await pool.query('SELECT * FROM peliculas WHERE genero=?',[generoSeleccionado])
    res.json(comprobar)
})

router.get('/comprobar',async(req,res) => {
    const email = req.query.email;
    const [comprobar2] = await pool.query('SELECT * FROM usuarios WHERE email = ?',[email])
console.log(comprobar2.length)
    if(comprobar2.length == 1){
    res.json({error:true})
    }else{
        res.json({error:true})
    }
    
})


//butacas

router.post('/bloquear-butacas', async (req, res) => {
    const { butacaIds } = req.body;
  
    try {
      
        const { butacaIds } = req.body;
        console.log(butacaIds)
    //    for (const butacaId of butacaIds) {
    //       await pool.execute('UPDATE butacas SET disponible = FALSE WHERE butaca_id = ?', [butacaId]);
    //     }
       res.status(200).send('Butacas bloqueadas correctamente.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error al bloquear las butacas.');
    }
  });


  router.post('/procesar-checkboxes', (req, res) => {
    const opcionesSeleccionadas = req.body.opciones;
    var opciones = 0;
    if(opcionesSeleccionadas >= 10 || opcionesSeleccionadas <= 10){
        opciones = 1;
    }
    if(opciones == 1){
        res.redirect(`/compra?opciones=${opcionesSeleccionadas}`);
    }else{
        res.redirect(`/compra?opciones=${opcionesSeleccionadas.join(',')}`);
    }



    // // opcionesSeleccionadas es un array con los valores de los checkboxes seleccionados
    // if (opcionesSeleccionadas.length > 1) {
    //     // Redirige a otra página y pasa los valores seleccionados como parámetros en la URL
    //     res.redirect(`/compra?opciones=${opcionesSeleccionadas.join(',')}`);
    // } else if(opcionesSeleccionadas.length == 1){
    //     res.redirect(`/compra?opciones=${opcionesSeleccionadas}`);
    // }
    // else if(!opcionesSeleccionadas) {
    //     res.send('No se seleccionó ningún checkbox.');
    // }
});
  

router.get('/compra', async (req, res) => {
   
    const opciones = req.query.opciones.split(',');
    let compra;

    for (const butacaId of opciones) {
         const [result] = await pool.query('SELECT p.titulo,p.duracion,p.genero,c.hora,b.numero,c.fecha from butacas b,cartelera c,peliculas p where b.sala_id = c.id_sala and c.id_pelicula = p.id and b.numero=?',[butacaId])
         console.log(result)
         if (result.length > 0) {
            compra = result; // Asignar el resultado a comprobar si hay resultados
        }
    }
    

    // Aquí puedes utilizar los valores de las opciones seleccionadas para realizar consultas SQL u otras operaciones en la base de datos

    res.render(`compra.hbs`,{compra:compra,opciones:opciones});
});
 
  




export default router;