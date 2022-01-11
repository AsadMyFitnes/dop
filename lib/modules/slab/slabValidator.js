const constants = require('./../../constants');
const moduleMsg = require('./slabConstants');
const joi = require('joi');
// Validate item Request
const resHndlr = require("../../handlers/responseHandler");



/**for validation error handler */
function validationErrorHandler(res, error) {
    console.log('User Module ErrorLog : ', error); // Dont remove this line of console.
    resHndlr.sendError(res, resHndlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, error.details ? error.details[0].message : 'There is some issue in validation.', {}));
}


async function validateCreateData(req, res, next) {
    try {
        // create schema for email validation
        let obj = {
            slb_min: joi.string().required().empty()
                .messages({
                    'string.empty': moduleMsg.MESSAGES.minRequired,
                    'any.required': moduleMsg.MESSAGES.minRequired
                }),

            slb_max: joi.string().required().empty()
                .messages({
                    'string.empty': moduleMsg.MESSAGES.maxRequired,
                    'any.required': moduleMsg.MESSAGES.maxRequired
                }),
            slb_percentage: joi.string().required().empty()
                .messages({
                    'string.empty': moduleMsg.MESSAGES.percentageRequired,
                    'any.required': moduleMsg.MESSAGES.percentageRequired
                })

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


module.exports = {
    validateCreateData,
    validateId
}