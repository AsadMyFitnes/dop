const constants = require('./../../constants');
const moduleMsg = require('./userConstants');
const regExValidator = require('../../utils/regularExpression');
const joi = require('joi');
// Validate User Request
const resHndlr = require("../../handlers/responseHandler");



/**for validation error handler */
function validationErrorHandler(res, error) {
    console.log('User Module ErrorLog : ', error); // Dont remove this line of console.
    resHndlr.sendError(res, resHndlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, error.details ? error.details[0].message : 'There is some issue in validation.', {}));
}

async function validateSignInData(req, res, next) {
    try {
        // create schema for email validation
        let obj = {
            usr_phone_number: joi.string().required().empty().min(10).max(12)
                .messages({
                    'string.empty': moduleMsg.MESSAGES.phoneNumberRequired,
                    'any.required': moduleMsg.MESSAGES.phoneNumberRequired
                }),
            // .pattern(regExValidator.passwordAppRegEx)
            usr_password: joi.string().required().empty()
                .messages({
                    'string.empty': constants.MESSAGES.passCantEmpty,
                    'any.required': constants.MESSAGES.passCantEmpty,
                    'string.pattern.base': constants.MESSAGES.invalidPassword,
                }),
            usr_device_token: joi.string().required().empty()
                .messages({
                    'string.empty': constants.MESSAGES.tokenCantEmpty,
                    'any.required': constants.MESSAGES.tokenCantEmpty,
                })
        }


        const schema = joi.object(obj);
        await schema.validateAsync(req.body, { allowUnknown: true });
        next();

    } catch (error) {
        validationErrorHandler(res, error);
    }
}


async function validateCreateData(req, res, next) {
    try {
        // create schema for email validation
        let obj = {
            usr_name: joi.string().required().empty()
                .messages({
                    'string.empty': moduleMsg.MESSAGES.nameRequired,
                    'any.required': moduleMsg.MESSAGES.nameRequired
                }),
            usr_business_name: joi.string().required().empty()
                .messages({
                    'string.empty': moduleMsg.MESSAGES.businessnameRequired,
                    'any.required': moduleMsg.MESSAGES.businessnameRequired
                }),
            usr_phone_number: joi.string().required().empty().min(10).max(12)
                .messages({
                    'string.empty': moduleMsg.MESSAGES.mobileNumberRequired,
                    'any.required': moduleMsg.MESSAGES.mobileNumberRequired
                }),
            usr_customer_id: joi.string().required().empty()
                .messages({
                    'string.empty': moduleMsg.MESSAGES.customerZohoidRequired,
                    'any.required': moduleMsg.MESSAGES.customerZohoidRequired
                }),
            usr_state_id: joi.string().required().empty().length(24)
                .messages({
                    'string.empty': constants.MESSAGES.stateEmpty,
                    'any.required': constants.MESSAGES.stateEmpty,
                }),
        }

        const schema = joi.object(obj);
        await schema.validateAsync(req.body, { allowUnknown: true });
        next();

    } catch (error) {
        validationErrorHandler(res, error);
    }
}



/** check mongoose ObjectId is valid */
async function validateId(req, res, next) {
    try {
        // create schema for id parameter
        const schema = joi.object({
            id: joi.string().length(24).required()
                .messages({
                    'string.length': constants.MESSAGES.invalidId,
                    'string.empty': constants.MESSAGES.emptyId,
                    'any.required': constants.MESSAGES.emptyId
                })
        });
        await schema.validateAsync(req.params, { allowUnknown: true })
        next();
    } catch (error) {
        validationErrorHandler(res, error);
    }
}





async function validateEditData(req, res, next) {
    try {
        // create schema for email validation

        if (req._usr_role == constants.ACCOUNT_TYPE.SALES) {

            let obj = {
                usr_phone_number: joi.string().required().empty().min(10).max(12)
                    .messages({
                        'string.empty': moduleMsg.MESSAGES.mobileNumberRequired,
                        'any.required': moduleMsg.MESSAGES.mobileNumberRequired
                    }),
                usr_customer_id: joi.string().required().empty()
                    .messages({
                        'string.empty': moduleMsg.MESSAGES.customerZohoidRequired,
                        'any.required': moduleMsg.MESSAGES.customerZohoidRequired
                    }),

            }

            const schema = joi.object(obj);
            await schema.validateAsync(req.body, { allowUnknown: true });
        }

        next();

    } catch (error) {
        validationErrorHandler(res, error);
    }
}


async function validateCreateSalesData(req, res, next) {
    try {
        // create schema for email validation
        let obj = {
            usr_name: joi.string().required().empty()
                .messages({
                    'string.empty': moduleMsg.MESSAGES.nameRequired,
                    'any.required': moduleMsg.MESSAGES.nameRequired
                }),
            usr_phone_number: joi.string().required().empty().min(10).max(12)
                .messages({
                    'string.empty': moduleMsg.MESSAGES.mobileNumberRequired,
                    'any.required': moduleMsg.MESSAGES.mobileNumberRequired
                }),
            usr_state_id: joi.array().items(joi.string().length(24)).required().messages({
                'any.required': constants.MESSAGES.stateEmpty,
                'string.length': constants.MESSAGES.stateEmpty,
            }),

            // joi.string().required().empty().length(24)
            //     .messages({
            //         'string.empty': constants.MESSAGES.stateEmpty,
            //         'any.required': constants.MESSAGES.stateEmpty,
            //     }),
            usr_email: joi.string().required().pattern(regExValidator.emailRegEx).empty()
                .messages({
                    'string.empty': moduleMsg.MESSAGES.emailRequired,
                    'any.required': moduleMsg.MESSAGES.emailRequired
                }),

        }

        const schema = joi.object(obj);
        await schema.validateAsync(req.body, { allowUnknown: true });
        next();

    } catch (error) {
        validationErrorHandler(res, error);
    }
}




async function validateForgotData(req, res, next) {
    try {
        // create schema for email validation
        let obj = {
            usr_phone_number: joi.string().required().empty().min(10).max(12)
                .messages({
                    'string.empty': moduleMsg.MESSAGES.mobileNumberRequired,
                    'any.required': moduleMsg.MESSAGES.mobileNumberRequired
                })
        }

        const schema = joi.object(obj);
        await schema.validateAsync(req.body, { allowUnknown: true });
        next();

    } catch (error) {
        validationErrorHandler(res, error);
    }
}


module.exports = {
    validateSignInData,
    validateCreateData,
    validateId,
    validateEditData,
    validateCreateSalesData,
    validateForgotData,

}