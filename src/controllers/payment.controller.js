import Stripe from "stripe"
import pool from "../database.js";

const stripe = new Stripe('sk_test_51OU5tZDO1ysp3HwltZC8sjVI3DcklCZyQVkocDPbLlYVNKvkjxOaMrvUdUnE98ORpWc8Rg8TXWVtajtikXeXqoMh00xW9uCCTF')

export const createSession = async (req,res) => {
try{

  
  
    const {nombre,apellidos,correo,telefono,titulo,fecha,butacas, hora,sala,precio } = req.body;
    var precioFinal = precio * 100;
    const butacasArray = butacas.split(',').map(butaca => parseInt(butaca.trim(), 10));
    
    const objetoDatos = {
      nombre:nombre,
      apellidos:apellidos,
      correo:correo,
      telefono:telefono,
      titulo:titulo,
      fecha:fecha,
      butacas: butacasArray,
      hora:hora,
      sala:sala,
      precio:precio
    };
    const queryString = new URLSearchParams(objetoDatos).toString();
    
   const session= await stripe.checkout.sessions.create({
    line_items: [
        {
          price_data: {
            product_data: {
              name: titulo,
              description:`Fecha: ${fecha}   -------------------------------------
                           ${hora}------------------------------------------------
                           ${titulo}------------------------------------------
                           ${sala}------------------------------------------------
                           ${butacas}`
             
            },
            currency: "eur",
            unit_amount: precioFinal
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://visioners.onrender.com//resumen?"+queryString,
      cancel_url: "http://localhost:3000/cancel",
    });

   
    return res.json({ url: session.url});
     
}catch(err){
    res.status(500).json({message:err.message})
}
}