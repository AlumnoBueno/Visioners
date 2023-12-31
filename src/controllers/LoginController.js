import { Router } from "express";
import pool from "../database.js";
import bcrypt from  'bcrypt';
import exphbs from 'express-handlebars'
import Handlebars from 'handlebars'

const router = Router();

export const login = async (req,res) => {
    try{
        const data = req.body;
        const email = req.body.email
         const [comprobar] = await pool.query('SELECT * FROM usuarios WHERE email = ?',[data.email])
             if(comprobar.length> 0){
                const error = "ya esiten datos"
                res.json(comprobar)
                // const [result] = await pool.query('SELECT * FROM peliculas');
                
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
}
