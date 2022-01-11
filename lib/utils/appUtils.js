'use strict';

var bcrypt = require('bcryptjs');
require("dotenv").config;


function verifyPassword(user, isExist) {
    return bcrypt.compare(user, isExist.usr_password);
}


function generateSaltAndHashForPassword(password) {
    return bcrypt.hash(password, 10);
}

function isValidPhone(phone, verifyCountryCode) {
    var reExp = verifyCountryCode ? /^\+\d{6,16}$/ : /^\d{6,16}$/;
    return reExp.test(phone);
}


function generateOtp() {
    //Generate Random Number
    return Math.floor(100000 + Math.random() * 900000);
}


// ========================= Export Module Start ===========================

module.exports = {
    verifyPassword,
    isValidPhone,
    generateSaltAndHashForPassword,
    generateOtp,
   
};
