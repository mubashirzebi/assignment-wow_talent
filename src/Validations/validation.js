
const mongoose = require('mongoose')



const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value !== 'string' || value.trim().length === 0 || value=="") return false
    return true;
}

const isValidRequestBody = function (request) {
    return (Object.keys(request).length > 0)
}

const isValidPassword = function (password) {
    const passwordRegex = /^[A-Z](?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{7,14}$/ // first capital
    return passwordRegex.test(password)
}
//  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/
const isValidMobileNumber = function(mobile){
    const mobile_no_with_country_code_regex_ = /^\+?([0-9]{2})\)?[-]?([0-9]{3})?[-]?([0-9]{3})?[-]?([0-9]{4})$/;
    return mobile_no_with_country_code_regex_.test(mobile)
}

const isValidEmail = function (email) {
    const emailRegex = /^([A-Za-z0-9._]{3,}@[A-Za-z]{3,}[.]{1}[A-Za-z.]{2,6})+$/
    return emailRegex.test(email)
}

const isValidProfile = function(profile){
    if(profile == 'public' || profile == 'private'){
        return true
    }
    return false;
}

const isValidGender = function(gender){
    if(gender == 'male' || gender == 'female' || gender == 'other'){
        return true
    }
    return false;
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


module.exports = {isValid, isValidPassword, isValidRequestBody, isValidMobileNumber, isValidEmail, isValidProfile, isValidGender, isValidObjectId}