const User = require('../models/User');

exports.getAllUsers = async (req, res) => {
    const allUsers = await User.find();

    if(allUsers){
        res.status(200).send(allUsers);
    }else{
        res.status(404).send({"errorMessage": "No users found!"});
    }
}

exports.userAccess = async (req, res) => {
    try {
        const { _id, val } = req.params;
        

        const foundUser = await User.findOne({ _id: _id });
        foundUser.isDisabled = val;

        await foundUser.save();
        res.status(200).send({"successMessage": `User ${foundUser.name} has been disabled successfully!`, foundUser: foundUser});
    } catch (error) {
        res.status(404).send(error);
    }
}

exports.generateNewGuest = async (req, res) => {
    try {
        res.status(404).send({"errorMessage": "This feature is still under construction!"});
    } catch (error) {
        res.status(500).send(error);
    }
}
