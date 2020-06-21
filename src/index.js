require("./db/mongo")
const userRouter = require("./routes/users")
const articleRouter = require("./routes/articles")
const indexRouter = require("./routes/index")
const resetRouter = require("./routes/reset");
const apiRouter = require("./api/api")


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

//Flash messages
app.use(flash());
app.use(session({
	secret: process.env.SESSION_SECRET,
	saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 60000 }
}));

app.use(function(req, res, next){
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    next();
});


// Set Routers
app.use("/",indexRouter)
app.use("/users",userRouter)
app.use("/articles",articleRouter)
app.use("/reset",resetRouter)
app.use("/api",apiRouter)

app.listen(port,()=>{
    console.log("Server Up on port"+port)
})