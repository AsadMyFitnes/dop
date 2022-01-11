"use strict";

//========================== Load Modules Start ===========================
// Load exceptions
var constants = require("../constants");
// const { fileContentAppend } = require("../utils/notificationHelper");

//========================== Load Internal Module =========================

//========================== Load Modules End =============================

function hndlError(err, req, res, next) {
    // unhandled error
    sendError(res, err);
}

function sendError(res, err) {
    // if error doesn't has sc than it is an unhandled error,
    // log error, and throw intrnl server error
    // fileContentAppend(`\n\n${new Date()}\n` + res.req.originalUrl + "\n" + JSON.stringify({
    //     code: err.responseCode,
    //     status: err.responseStatus,
    //     message: err.responseMessage
    // }))

    if (!err.responseCode) {
        return res.status('500').json({
            code: 500,
            status: false,
            message: constants.MESSAGES.InternalServerError,
            data: {}
        })
    }
    return res.status(err.responseCode).json({
        code: err.responseCode,
        status: err.responseStatus,
        message: err.responseMessage,
        data: err.responseData

    })
}

function sendSuccess(res, rslt) {
    // fileContentAppend(`\n\n${new Date()}\n` + res.req.originalUrl + "\n" + JSON.stringify({
    //     code: rslt.responseCode,
    //     status: rslt.responseStatus,
    //     message: rslt.responseMessage
    // }))

    return res.status(rslt.responseCode).json({
        code: rslt.responseCode,
        status: rslt.responseStatus,
        message: rslt.responseMessage,
        data: rslt.responseData
    })
}


/** Request Response 
 * 
 * @param {string} message response message
 *  @param {object} data response Data
 */
function requestResponse(code, status, message, data) {
    var responseObj = {
        "responseCode": code,
        "responseStatus": status,
        "responseMessage": message,
        "responseData": data
    }
    return responseObj;
}

//========================== Exposed Action Start ==========================

module.exports = {
    hndlError, sendError, sendSuccess, requestResponse
};

//========================== Exposed Action End ==========================

function _sendResponse(res, rslt) {
    return res.send(rslt);
}
