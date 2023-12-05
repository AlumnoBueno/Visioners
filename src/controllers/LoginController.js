import { Router } from "express";
import pool from "../database.js";
import bcrypt from  'bcrypt';

const router = Router();

function storeUser(req,res) {
    const data = req.body;
    bcrypt.hash(data.password,12).then(hash => {
       
        data.password =hash;
         req.getConnection((err,conn) => {
             conn.query('INSERT INTO users SET ?',[data], (err,rows) => {
                 res.redirect("index.hbs")
             })
         })
     
      })
}

export default{
    storeUser
}