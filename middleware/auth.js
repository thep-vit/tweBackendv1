const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async function(req, res, next) {
    try{
        const token = req.header("Authorization").replace("Bearer ", "");

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id, isAdmin: decoded.isAdmin, "tokens.token": token})

        if(!user){
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next()
    }catch(e){
        console.log(e);
        res.status(401).send("Please authenticate!");
    }
}

const adminAuth = function (req, res, next){
    try {
    const token = req.header("Authorization").replace("Bearer", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if(decoded.isAdmin === "false"){
        throw new Error()
    }

    next();

    } catch (e) {
        res.status(401).send("You are not the administrator!");
    }
}

module.exports = {
    auth,
    adminAuth
}