
const userModel = require('../Models/userModel');
const jwt = require('jsonwebtoken')

const { isValid, isValidPassword, isValidRequestBody, isValidMobileNumber, isValidEmail, isValidProfile, isValidGender, isValidObjectId } = require('../Validations/validation');
const postModel = require('../Models/postModel');

const createUser = async function (req, res) {

    try {

        let data = req.body
        const { name, user_name, password, email, gender, mobile, profile } = data

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please Provide Input Data for Creating User" });
        }

        if (!isValid(name)) {
            return res.status(400).send({ status: false, message: "name is required..." })
        }

        if (!isValid(user_name)) {
            return res.status(400).send({ status: false, message: "user_name is required..." })
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "email is required..." })
        }

        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Password must required one capital letter one small letter number and one special character with minimum 8 character" })
        }

        if (!isValidGender(gender)) {
            return res.status(400).send({ status: false, message: "Select from male, female and other only" })
        }

        if (!isValidMobileNumber(mobile)) {
            return res.status(400).send({ status: false, message: "Valid Mobile No is Required with country code" })
        }

        if (profile && !isValidProfile(profile)) {
            return res.status(400).send({ status: false, message: "Valid profile is required, either public or private" })
        }

        const checkUserNameIsExist = await userModel.findOne({ user_name })

        if (checkUserNameIsExist) {
            return res.status(400).send({ status: false, message: `${user_name} is already register please try diffrent user_name ` })
        }

        const checkPhoneIsExist = await userModel.findOne({ mobile });

        if (checkPhoneIsExist) {
            return res.status(400).send({ status: false, message: `${mobile} is already register please try diffrent phone Number` })
        }

        const checkEmailIsExist = await userModel.findOne({ email });

        if (checkEmailIsExist) {
            return res.status(400).send({ status: false, message: `${email} is already register please try diffrent email id ` })
        }


        const user = await userModel.create(data);

        res.status(201).send({ status: true, message: "Success", data: user })



    }
    catch (error) {
        res.status(500).send({ status: false, error: error.message });
    }
};





///////////////////////////////////////////////////////////////////////////////////////////////

const loginUser = async function (req, res) {

    try {
        let requestBody = req.body;

        const { email, password } = requestBody;

        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, msg: "Please enter login credentials" });
        }


        if (!isValidEmail(email)) {
            return res.status(400).send({ status: false, message: `Email should be a valid email address` });
        }

        if (!isValidPassword(password)) {
            res.status(400).send({ status: false, msg: "enter a password" });
            return;
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).send({ status: false, message: `Invalid login credentials, email id doesn't exist` });
        }

        if (password != user.password) {
            return res.status(401).send({ status: false, message: `Invalid login credentials, Password is not matching` });
        }

        const token = jwt.sign({
            userId: user._id,
            exp: Math.floor(Date.now() / 1000) + 72 * 60 * 60
        }, 'IronMan')

        res.status(200).send({ status: true, messsge: "User Login Successful", data: { userId: user.user_id, token: token } });
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, error: error.message });
    }
}



const follow_unfollow = async function (req, res) {

    try {

        const user_id = req.params.userId;

        const other_user_id = req.params.other_userId;

        if (!isValidObjectId(user_id)) {
            return res.status(400).send({ status: false, message: `Please Provide valid user_id` });
        }

        if (!isValidObjectId(other_user_id)) {
            return res.status(400).send({ status: false, message: `Please Provide valid other_user_id` });
        }

        const userIsExist = await userModel.findOne({ _id: user_id })

        if (!userIsExist) {
            return res.status(404).send({ status: false, message: `User does not exist` });

        }
        const other_userIsExist = await userModel.findOne({ _id: other_user_id })

        if (!other_userIsExist) {
            return res.status(404).send({ status: false, message: `other_user_id does not exist` });

        }

        if (user_id == other_user_id) {
            return res.status(400).send({ status: false, message: `User Cant follow himself` });
        }

        const { following } = userIsExist;

        for (let i = 0; i < following.length; i++) {

            if (following[i].userId.toString() == other_user_id) {

                const unfollow = await userModel.findByIdAndUpdate({ _id: user_id }, {
                    $pull: { following: { userId: other_user_id } },
                    $inc: { following_count: -1 }
                },
                    { new: true });

                const removing_from_other_user_follower = await userModel.findByIdAndUpdate(
                    { _id: other_user_id },
                    {
                        $pull: { followers: { userId: user_id } },
                        $inc: { followers_count: -1 }
                    },
                    { new: true }
                )
                return res.status(200).send({ status: true, message: 'sucessfully Unfollow', data: unfollow })
            }
        }

        const follow = await userModel.findByIdAndUpdate(
            { _id: user_id },
            {
                $push: { following: { userId: other_user_id } },
                $inc: { following_count: 1 }
            },
            { new: true });

        const add_followers_to_other_user = await userModel.findByIdAndUpdate(
            { _id: other_user_id },
            {
                $push: { followers: { userId: user_id } },
                $inc: { followers_count: 1 }
            }
        )
        return res.status(200).send({ status: true, message: 'sucessfully follow', data: follow })


    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, error: error.message });
    }
};

//////////////////////////////////////////////////////////////////////////////

const getProfile = async function (req, res) {

    try {

        const user_id = req.params.userId;

        if (!isValidObjectId(user_id)) {
            return res.status(400).send({ status: false, message: `Please Provide valid user_id` });
        }

        const userDetails = await userModel.findById({ _id: user_id })

        const data = {
            name: userDetails.name,
            user_name: userDetails.user_name,
            email: userDetails.email,
            follower_count: userDetails.followers_count,
            following_count: userDetails.following_count,
            post_count: userDetails.post_count,

        }



        return res.status(200).send({ status: true, data: data })

    }

    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, error: error.message });
    }


}

///////////////////////////////////////////////////////////////////////////////////////////////////

const getUserWhoLikeMyPost = async function(req,res){
    try{

        const user_id = req.params.userId;

        const findUser = await postModel.aggregate(
            [
                {$match : {userId : user_id}},
                {$group : {_id : "$userId", "users" : {$addToSet : "$like"}}}
            ]
        )

        return res.status(200).send({ status: true, data: findUser })

    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, error: error.message });
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////


const updateProfile = async function (req, res) {
    try {

        const user_id = req.params.userId;
        const { name, user_name, gender, email, mobile, profile, password } = req.body;
        const data = req.body;

        if (!isValidRequestBody(data)) {
            return res.status(400).send({ status: false, message: "Please Provide Input Data for Updating User" });
        }

        if (data.hasOwnProperty(name) && !isValid(name)) {
            return res.status(400).send({ status: false, message: "name is required..." })
        }

        if (data.hasOwnProperty(user_name) && !isValid(user_name)) {
            return res.status(400).send({ status: false, message: "user_name is required..." })
        }

        if (data.hasOwnProperty(email) && !isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Valid email is required..." })
        }

        if (data.hasOwnProperty(password) && !isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Password must required one capital letter one small letter number and one special character with minimum 8 character" })
        }

        if (data.hasOwnProperty(gender) && !isValidGender(gender)) {
            return res.status(400).send({ status: false, message: "Valid gender is required..." })
        }

        if (data.hasOwnProperty(mobile)) {

            if (!isValid(mobile)) {
                return res.status(400).send({ status: false, message: "Mobile number is required..." })
            }
            if (!isValidMobileNumber(mobile)) {
                return res.status(400).send({ status: false, message: "Mobile Number must contain country code" })
            }

        }

        if (profile) {
            if (!isValid(profile)) {
                return res.status(400).send({ status: false, message: "Valid profile is required..." })
            }
            if (!isValidProfile(profile)) {
                return res.status(400).send({ status: false, message: "Valid profile is required..." })
            }
        }

        if (user_name) {
            const checkUserNameIsExist = await userModel.findOne({ user_name })

            if (checkUserNameIsExist) {
                return res.status(400).send({ status: false, message: `${user_name} is already register please try diffrent user_name ` })
            }
        }

        if (mobile) {

            const checkPhoneIsExist = await userModel.findOne({ mobile });

            if (checkPhoneIsExist) {
                return res.status(400).send({ status: false, message: `${mobile} is already register please try diffrent phone Number` })
            }
        }

        if (email) {
            const checkEmailIsExist = await userModel.findOne({ email });

            if (checkEmailIsExist) {
                return res.status(400).send({ status: false, message: `${email} is already register please try diffrent email id ` })
            }

        }

        const update_profile = await userModel.findByIdAndUpdate(
            { _id: user_id },
            {
                $set: { name: name, user_name: user_name, gender: gender, email: email, profile: profile, password: password }
            },
            { new: true }
        )

        return res.status(200).send({ status: true, data: update_profile })

    }

    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, error: error.message });
    }

}



module.exports = { createUser, loginUser, follow_unfollow, getProfile, updateProfile, getUserWhoLikeMyPost }