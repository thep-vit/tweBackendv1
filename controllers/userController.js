const User = require('../models/User');

exports.userSignup = async (req, res) => {
    const newUser = new User(req.body);

    try{
        await newUser.save();
        const token = await newUser.generateToken();
        res.status(201).send({ newUser, token });
    }catch(e){
        console.log(e);
        res.status(200).send(e);
    }
}

exports.userLogin = async (req, res) => {
    try {
        const userFound = await User.findByCredentials(req.body.email, req.body.password);
        const token = await User.generateToken();

        re.send({ userFound, token });
    } catch (error) {
        console.log(error);

        res.status(400).send({ "errorMessage": "Invalid user credentials!" });
    }
}

exports.getDetails = async (req, res) => {
    try {
        if(!req.user){
            throw new Error();
        }

        res.send(req.user);
    } catch (error) {
        res.status(404).send({ "errorMessage": "No valid user found!" });
    }
}

exports.updateData = async (req, res) => {
    const updateFieldsReq = Object.keys(req.body);

    const validFields = ["name", "email", "age", "assword", "department"];
    const isValidateFields = updateFieldsReq.every( field => validFields.includes(field));

    if(!isValidateFields){
        return res.status(400).send({ "error" : "Invalid Update Requested!"})
    }

    try {
        updateFieldsReq.forEach((updateField) => req.user[updateField] = req.body[updateField])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        send.status(400).send(e)
    }
}

exports.logout = async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => {
            return token.token !== req.token
        })
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

exports.logoutAll = async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send(req.user);
    } catch (error) {
        console.log(error);

        res.status(500).send(error);
    }
}

exports.getName = async (req, res) => {
    try {
        const userName = await (await User.findById(req.params.id)).isSelected("name");

        if(!userName) {
            return res.status(404).send({ "errorMessage": `No user with id ${req.params.id} found!` });
        }

        res.send(userName.name);
    } catch (error) {
        res.status(500).send({ "errorMessage": `User with id ${req.params.id} does not exist!` });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        await req.user.remove();

        res.send();
    } catch (error) {
        console.log(error);

        res.status(500).send(error);
    }
}

exports.addSecurityQuestion = async (req, res) => {
    const { securityQuestion, securityAnswer } = req.body;
    const userID = req.user._id;

    try {
        const foundUser = await User.findOne({ _id: userID });

        if(!foundUser) {
            res.status(404).send({"message":`Oops! User with ID ${userID} not found.`})
        }

        foundUser.securityQuestion = securityQuestion;
        foundUser.securityAnswer = securityAnswer;

        res.status(200).send({ "message": `Security question ${securityQuestion} for user ${foundUser.name} was successfully created. You can use it to reset your password.` });

    } catch (error) {
        res.send(500).send({error});
    }
}

exports.verifySecurityQuestion = async (req, res) => {
    const foundUser = await User.findOne({ email: req.body.email });
    const { securityAnswer } = req.body;

    if(!foundUser){
        res.status(404).send({ "errorMessage": "User not found!"});
    }

    const isCorrect = await bcrypt.compare(securityAnswer, foundUser.securityAnswer);

    if(isCorrect){
        foundUser.generatePasswordReset();
        await foundUser.save();

        resetLink = "http://" + req.headers.host + "/api/users/recover/" + foundUser.resetPasswordToken;

        res.status(200).send({"resetLink": `${resetLink}`});
    }else{
        res.status(500).send({"message":`Security answer for the user ${foundUser.name} is not correct. Please try again.`})
    }
}



exports.requestSecurityQuestion = async (req, res) => {
    const foundUser = await User.findOne({ email: req.body.email });

    res.status(200).send({"securityQuestion": `${foundUser.securityQuestion}`});
}

exports.getContribution = async (req, res) => {
    try {
        const contriList = await User.find({}).select("contributions name");
        res.send(contriList);
    } catch (error) {
        console.log(error);
        res.status(404).send({"errorMessage": "No contributions found!"});
    }
}