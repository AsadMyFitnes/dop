// load all dependencies
const Promise = require("bluebird");
const jwt = Promise.promisifyAll(require("jsonwebtoken"));
const constants = require('../constants');
var resHndlr = require('../handlers/responseHandler')
const mongoose = require("mongoose");

const TOKEN_EXPIRATION_SEC = constants.TOKEN_EXPIRATION_TIME * 60;

const userModel = require('../modules/user/userModel')
const userMaster = mongoose.model(constants.DB_MODEL_REF_NEW.USERS, userModel.UserSchema);

let dao = require('../dao/BaseDao');
const userDao = new dao(userMaster);

const genUsrToken = function (user) {
    const options = { expiresIn: TOKEN_EXPIRATION_SEC };
    return jwt.signAsync(user, process.env.user_secret, options)
        .then(function (jwtToken) {

            return jwtToken;
        })
        .catch(function (err) {
            throw new exceptions.tokenGenException();
        });
};

// /**for verify User Token */
var verifyUsrToken = function (req, res, next) {
    let token = req.headers['authorization']

    if (!token) {
        return resHndlr.sendSuccess(res, resHndlr.requestResponse(constants.http_code.unAuthorized, constants.MESSAGES.statusFalse, constants.MESSAGES.invalidToken, {}))
    }

    return jwt.verifyAsync(token, process.env.user_secret)
        .then((jwtToken) => {

            req._usr_phone_number = jwtToken._usr_phone_number;
            req._id = jwtToken._id;
            req._usr_role = jwtToken._usr_role;
            req._usr_customer_id = jwtToken._usr_customer_id && jwtToken._usr_customer_id != undefined ? jwtToken._usr_customer_id : '';
            req._usr_name = jwtToken._usr_name;
            req._usr_state_id = jwtToken._usr_state_id && jwtToken._usr_state_id.length ? jwtToken._usr_state_id : [];
            return userDao.findOne({ _id: mongoose.Types.ObjectId(jwtToken._id), usr_is_deleted: false, }).then((result) => {
                if (!result || (result && result == null)) {
                    return resHndlr.sendSuccess(res, resHndlr.requestResponse(constants.http_code.unAuthorized, constants.MESSAGES.statusFalse, constants.MESSAGES.unAuthAccess, {}))
                }

                next();
            })
        }).catch(function (err) {
            return resHndlr.sendSuccess(res, resHndlr.requestResponse(constants.http_code.unAuthorized, constants.MESSAGES.statusFalse, constants.MESSAGES.unAuthAccess, {}))
        });
}

module.exports = {
    genUsrToken,

    verifyUsrToken,
};
