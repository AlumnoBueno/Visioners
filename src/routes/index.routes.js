import { Router } from "express";
import pool from "../database.js";
import bcrypt from  'bcrypt';
 import {isLoggedIn} from "../controllers/auth.js"
 import {logout} from "../controllers/logout.js"
import  jwt  from "jsonwebtoken";
import { promisify } from "util";

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

router.get('/logout',logout);

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








//LOGIN

router.post('/signup',async(req,res)=>{
    try{
        const data = req.body;

         const [comprobar] = await pool.query('SELECT * FROM usuarios WHERE email = ?',[data.email])
             if(comprobar.length> 0){
                console.log(comprobar)
                console.log(comprobar.length)
                const [result] = await pool.query('SELECT * FROM peliculas');
                    res.render('index.hbs',{peliculas:result})
                    console.log("q ase tonto")
             }else{
                bcrypt.hash(data.password,12).then(async hash => {
                    data.password =hash;
                    const [usuario] = await pool.query('INSERT INTO usuarios SET ?',[data])
                    const [result] = await pool.query('SELECT * FROM peliculas');
                    res.render('index.hbs',{peliculas:result})
                })
             }
      

    }catch(err){
        res.status(500).json({message:err.message})
    }
})



//AUTH

router.post('/signin',async(req,res)=>{
    
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).render( "index.hbs", {
                message: "Please Provide an email and password"
            })
        }
        const [result] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email])
             if (!result || !await bcrypt.compare(password, result[0].password)) {
                 res.status(401).render( 'index.hbs', {
                     message: 'Email or Password is incorrect'
                 })
             } else {
                 const email = result[0].email;
                

                 const token = jwt.sign({ email }, process.env.JWT_SECRET, {
                     expiresIn: process.env.JWT_EXPIRES
                 });

                 console.log("the token is " + token);

                 const cookieOptions = {
                     expires: new Date(
                         Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
                     ),
                     secure: false,
                     httpOnly: true
                 }
                 res.cookie('userSave', token, cookieOptions);
                 
                 console.log(res.cookies)
                  res.status(200).redirect("/");

               
             }
         }
        catch (err) {
         console.log(err);
    }
}
)





router.get('/buscarPorFecha/:fecha/:id', async(req, res) => {
     const fecha = req.params.fecha;
     const id = req.params.id;
   

     const [comprobar] = await pool.query('SELECT * FROM cartelera WHERE id_pelicula=? and fecha = ?',[id,fecha])
    
    
     res.json(comprobar)

})



















// router.post('/signin',async(req,res)=>{
//     try{
//         const data = req.body;
//         const [comprobar] = await pool.query('SELECT * FROM usuarios WHERE email = ?',[data.email])
//         if(comprobar.length> 0){

//             bcrypt.compare(data.password,comprobar[0].password,(err,isMatch) =>{

//                 if(!isMatch){
//                     console.log("q ase tonto")
//                 } else{

//                     if (!req.session) {
//                         req.session = {};
//                       }
//                     req.session.loggedin = true;
//                     req.session.name = data.nombre;

//                     res.redirect("/");
//                 }

//             })
           
//         }else{
           
//             const [result] = await pool.query('SELECT * FROM peliculas');
//                 res.render('index.hbs',{peliculas:result})
//                 console.log("q ase tonto")
//         }
         
//     }catch(err){
     
//     }
// })


// router.post("/",LoginController.storeUser);


export default router;