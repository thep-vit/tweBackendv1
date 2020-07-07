// Mongo Databse Connection
const mongoose = require("mongoose")

mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(()=> {
    console.log("MONGO DB CONNECTED!")
}).catch((e)=>console.log("Cannot Connect to Mongo",e))