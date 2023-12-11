import pool from "../database.js";
import bcrypt from  'bcrypt';
import  jwt  from "jsonwebtoken";
import { promisify } from "util";


export const isLoggedIn = async (req, res, next) =>{
     
        try {
            const parts = req.headers.cookie.split('=');

           
            const lastPart = parts[parts.length - 1];

            console.log(lastPart)
            // 1. Verify the token
            const decoded = await promisify(jwt.verify)(lastPart,
                process.env.JWT_SECRET
            );
            console.log(decoded.email);

            // 2. Check if the user still exist
            const [results] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [decoded.email]);
                 if (!results) {
                     return next();
                 }
                 req.user = results[0];
                 return next();
        } catch (err) {
            console.log("nononoon")
            console.log(err)
            return next();
        }
    
    
}

