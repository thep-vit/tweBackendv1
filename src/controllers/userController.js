const User = require("../models/users")

exports.getAllUsers = async (req, res) => {
    try {
        const foundUsers = await User.find();

        if(foundUsers){
            res.status(200).send(foundUsers);
        }else{
            res.status(404).send({msg :"No users found!"});
        }
    } catch (error) {
        res.status(500).json({msg: error});
    }
}

exports.getUserProfile =  async (req, res) => {
    try {
        const userID = req.params.id
        const foundUser = await User.findOne({ _id: userID});
    
        if(foundUser){
            if(!foundUser.profile){
                res.status(408).send({"message" : `No profile found for user with email ${foundUser.email}!`});
            }else{
                res.status(200).send(foundUser.profile);
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500);
    }
};

exports.modifyUserProfile = async (req, res) => {
    try {
        const userID = req.params.id;
        const foundUser = await User.findOne({ _id: userID});
        const { name, bio } = req.body;

        foundUser.profile = {
            bio
        }

        await foundUser.save();

        console.log(foundUser);


        res.status(200).send(foundUser);


    } catch (error) {
        console.log(error);
        res.status(500);
    }
};

exports.modifyUserAvatar = async (req, res) => {
    try {
        const userID = req.params.id;
        const foundUser = await User.findOne({ _id: userID});
        
        if(req.files === null){
            return res.status(400).json({msg: 'No user image uploaded!'});
        }

        const file = req.files.file;

        console.log(file);

        foundUser.profile.avatar = file;

        await foundUser.save();

        res.status(200).send(foundUser);


    } catch (error) {
        console.log(error);
        res.status(500);
    }
};