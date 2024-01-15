import pool from "../database.js";
import bcrypt from  'bcrypt';
import  jwt  from "jsonwebtoken";

export const signin =  async (req,res) =>{
    try {
        
        const password = req.body.password;
         const email = req.body.email;
      
         const [result] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        console.log(result)
             if (result.length == 0 ) {
                res.status(201).json({ success: false, message: 'Revise los datos' });
             }
             else if(!await bcrypt.compare(password, result[0].password)){
                res.status(201).json({ success: false, message: 'Conraseña incorrecta' });
             }
             else{
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
                 res.cookie('userSave', token, cookieOptions);  
                  res.status(200).redirect("/");
             }
         }
        catch (err) {
         console.log(err);
    }
}
