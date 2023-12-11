import pool from "../database.js";
import bcrypt from  'bcrypt';
import  jwt  from "jsonwebtoken";
import { promisify } from "util";

export const signin =  async (req,res) =>{
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
