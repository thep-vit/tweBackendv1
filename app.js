require('dotenv').config()
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const mongoose = require("mongoose")

const userRouter = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors())
app.use(express.json())

//cookies
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

app.use(session({
	secret: process.env.SESSION_SECRET,
	saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 60000 }
}))

//Mongo Connection
// Mongo Databse Connection
mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(()=> {
    console.log("MONGO DB CONNECTED!")
}).catch((e)=>console.log("Cannot Connect to Mongo",e))

app.use('/users', userRouter);

app.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}.`);
})