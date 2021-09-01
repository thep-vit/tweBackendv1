require("./db/mongo")
const userRouter = require("./routes/users")
const indexRouter = require("./routes/index")
const apiRouter = require("./api/api")
const onboardRouter = require("./api/onboarding")
require('dotenv').config()


const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const path = require("path")
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())



const viewsPath = path.join(__dirname,"./views")
const partialsPath = path.join(__dirname,"./views/partials")

// Set View Engine
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views",viewsPath);


// Static assests are served from public directory - css, js etc
app.use(express.static("public"))

// Cookies
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())


app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PATCH, DELETE, OPTIONS');
    next();
});

//Flash messages
app.use(flash())
app.use(session({
	secret: process.env.SESSION_SECRET,
	saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 60000 }
}))

app.use(function(req, res, next){
    res.locals.success_messages = req.flash('success_messages')
    res.locals.error_messages = req.flash('error_messages')
    next()
})


// Set Routers
app.use("/",indexRouter)
app.use("/api",apiRouter)
app.use("/user",userRouter)
app.use("/api/onboard", onboardRouter)

app.listen(port,()=>{
    console.log("Server Up on port "+port)
})