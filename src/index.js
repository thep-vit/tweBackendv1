const express = require("express")
const expressLayouts = require('express-ejs-layouts');
require("./db/mongo")
const userRouter = require("./routes/users")

const app = express()

const port = process.env.PORT || 3000

app.use(express.json())

// Login Page Static
app.use(express.static("public"))

// Set View Engine
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Set Routers
app.use("/users",userRouter)

app.listen(port,()=>{
    console.log("Server Up on port"+port)
})