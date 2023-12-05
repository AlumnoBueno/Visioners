import express from 'express'
import morgan from 'morgan'
import { engine } from 'express-handlebars';
import {join, dirname} from 'path'
import { fileURLToPath } from 'url';
import indexRoutes from './routes/index.routes.js';
import cookieParser from 'cookie-parser';



import myconnection from 'express-myconnection';
import session from 'express-session';
import bodyParser from 'body-parser';




//Initalization
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));



//Settings
app.set('port',process.env.PORT || 3000);
app.set('views',join(__dirname,'views'));
app.engine('.hbs',engine({
    defaultLayout:'main',
    layoutsDir: join(app.get('views'),'layouts'),
    partialsDir: join(app.get('views'),'partials'),
    extname:'.hbs'
}));
app.set('view engine','hbs');


//Middlewares
app.use(morgan('dev'));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(indexRoutes);
app.use(bodyParser.urlencoded({
     extended: true
 }));
 app.use(bodyParser.json())
// app.use(session({
//     secret: 'secret',
//     resave: true,
//     saveUninitialized: true
// }))
app.use(cookieParser())



//Routes
app.get('/',(req,res)=>{
    res.render("index.hbs")
})



//Public files
app.use(express.static(join(__dirname,'public')));


//Run Server
app.listen(app.get('port'), ()=>{
    console.log('Server en el puerto',app.get('port'))
})