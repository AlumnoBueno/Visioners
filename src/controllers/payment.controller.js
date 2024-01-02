import Stripe from "stripe"

const stripe = new Stripe('sk_test_51OU5tZDO1ysp3HwltZC8sjVI3DcklCZyQVkocDPbLlYVNKvkjxOaMrvUdUnE98ORpWc8Rg8TXWVtajtikXeXqoMh00xW9uCCTF')

export const createSession = async (req,res) => {
try{

    const {nombre,apellidos,correo,telefono,titulo,fecha,butacas, hora,sala,precio } = req.body;
    var precioFinal = precio * 100;
    console.log(butacas);
    
   
    
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
      success_url: "https://visioners.onrender.com/resumen",
      cancel_url: "http://localhost:3000/cancel",
    });

    console.log(session);
    return res.json({ url: session.url });
     
}catch(err){
    res.status(500).json({message:err.message})
}
}