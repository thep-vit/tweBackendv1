const express = require("express")
// const expressLayouts = require('express-ejs-layouts');
const cookieParser = require("cookie-parser")
const session = require("express-session")
require("./db/mongo")
const path = require("path")

const userRouter = require("./routes/users")
const articleRouter = require("./routes/articles")
const indexRouter = require("./routes/index")

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())

// Login Page Static
app.use(express.static("public"))

// Cookies
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// Express Session Initialise
app.use(session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave:false
}))

const viewsPath = path.join(__dirname,"./views")
// Set View Engine

app.set('view engine', 'ejs');
app.set("views",viewsPath)


// Set Routers
app.use("/",indexRouter)
app.use("/users",userRouter)
app.use("/articles",articleRouter)

app.listen(port,()=>{
    console.log("Server Up on port"+port)
})