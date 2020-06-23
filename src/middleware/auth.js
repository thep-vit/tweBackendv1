const jwt = require("jsonwebtoken")
const User = require("../models/users")


// The following function acts to authenticate a request from the client. The client will send the requesting user's login token (web token) as the 'authorization' header.
// This header has in it the token to be authorized. This authorization is done with jwt verify() and if it is verified, then the request is granted

const auth = async function (req,res,next) {

    try{
        const token = req.header("Authorization").replace("Bearer ","") // Uncomment this line during development for testing with postman - store tokem in header with some js
        // const token = req.cookies['auth_token']

        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        const user = await User.findOne( { _id: decoded._id,isAdmin:decoded.isAdmin, "tokens.token":token })
        if(!user) {
            throw new Error()
        }

        req.token = token
        req.user = user
        next()
    } catch (e) {
        console.log(e)
        res.status(401).send("Please authenticate")
    }
}

const adminAuth = function (req,res,next){
    try{
        const token = req.header("Authorization").replace("Bearer ","")
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        console.log("from Admin Auth: isAdmin: ",decoded.isAdmin)
        if(decoded.isAdmin ==="false"){
            throw new Error()
        }

        next()
        
    } catch(e){
        res.status(401).send("You are not karan bhowmick.")
    }
}
module.exports = {
    auth,
    adminAuth
}