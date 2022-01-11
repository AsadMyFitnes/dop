const constants = require('./../../constants');
const moduleMsg = require('./itemConstants');
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
            items: joi.array().items(joi.object({
                itm_name: joi.string().required().empty()
                    .messages({
                        'string.empty': moduleMsg.MESSAGES.nameRequired,
                        'any.required': moduleMsg.MESSAGES.nameRequired
                    }),

                itm_id: joi.string().required().empty()
                    .messages({
                        'string.empty': moduleMsg.MESSAGES.idRequired,
                        'any.required': moduleMsg.MESSAGES.idRequired
                    }),

                itm_no_of_pack: joi.string().required().empty()
                    .messages({
                        'string.empty': moduleMsg.MESSAGES.itemPackRequired,
                        'any.required': moduleMsg.MESSAGES.itemPackRequired
                    }),
                itm_price: joi.string().required().empty()
                    .messages({
                        'string.empty': moduleMsg.MESSAGES.itemPriceRequired,
                        'any.required': moduleMsg.MESSAGES.itemPriceRequired
                    }),
            })),

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

module.exports = {
    validateCreateData,
    validateId,
    validateEditData
}