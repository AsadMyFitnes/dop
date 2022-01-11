const constants = require('./../../constants');
const moduleMsg = require('./estimateConstants.js');
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
            discount: joi.string().required().empty()
                .messages({
                    'string.empty': moduleMsg.MESSAGES.discountRequired,
                    'any.required': moduleMsg.MESSAGES.discountRequired
                }),
            line_items: joi.array().items(joi.object({
                item_id: joi.string().required().empty()
                    .messages({
                        'string.empty': moduleMsg.MESSAGES.itemIdRequired,
                        'any.required': moduleMsg.MESSAGES.itemIdRequired
                    }),
                quantity: joi.any().required().empty()
                    .messages({
                        'string.empty': moduleMsg.MESSAGES.quantityRequired,
                        'any.required': moduleMsg.MESSAGES.quantityRequired
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

async function validateUpdateData(req, res, next) {
    try {
        // create schema for email validation
        let obj = {
            est_proof_status: joi.string().required().empty().valid(
                constants.PRFSTATUS.APPROVE,
                constants.PRFSTATUS.DISPATCH,
                constants.PRFSTATUS.REJECT
            ).messages({
                    'string.empty': moduleMsg.MESSAGES.statusRequired,
                    'any.required': moduleMsg.MESSAGES.statusRequired
                }),


        };
        if (req.body.est_proof_status == constants.PRFSTATUS.DISPATCH) {
            obj.est_awb_number = joi.string().required().empty()
                .messages({
                    'string.empty': moduleMsg.MESSAGES.awbRequired,
                    'any.required': moduleMsg.MESSAGES.awbRequired
                })
        }
        if (req.body.est_proof_status == constants.PRFSTATUS.REJECT) {
            obj.est_reject_reason = joi.string().required().empty()
                .messages({
                    'string.empty': moduleMsg.MESSAGES.reasonRequired,
                    'any.required': moduleMsg.MESSAGES.reasonRequired
                })
        }

        // est_reject_reason: ,
        const schema = joi.object(obj);
        await schema.validateAsync(req.body, { allowUnknown: true });
        next();

    } catch (error) {
        validationErrorHandler(res, error);
    }
}

async function validateUpdateURLData(req, res, next) {
    try {
        // create schema for email validation
        let obj = {
            est_proof_url: joi.string().required().empty()
            .messages({
                'string.empty': moduleMsg.MESSAGES.proofUrlRequired,
                'any.required': moduleMsg.MESSAGES.proofUrlRequired
            })
        };
     
        const schema = joi.object(obj);
        await schema.validateAsync(req.body, { allowUnknown: true });
        next();

    } catch (error) {
        validationErrorHandler(res, error);
    }
}



module.exports = {
    validateCreateData,
    validateId,
    validateUpdateData,
    validateUpdateURLData,
}