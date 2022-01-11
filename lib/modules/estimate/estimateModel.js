// Importing mongoose
var mongoose = require("mongoose");
const constants = require("../../constants");
require("dotenv").config;
var Schema = mongoose.Schema;
var mongoosePaginate = require("mongoose-paginate-v2");


var EstimateSchema = new Schema({
    
    est_id : { type: String },
    est_number: { type: String },
    est_date: { type: String },
    customer_id: { type: String },
    est_url: { type: String },
    est_total:{ type: String },
    est_is_deleted: { type: Boolean, default: false },
    est_awb_number:{ type: String },
    est_proof_url:{ type: String },
    est_invoice_id:{ type: String },
    est_proof_status: { type: String, enum: [constants.PRFSTATUS.APPROVE, constants.PRFSTATUS.DISPATCH, constants.PRFSTATUS.PENDING, constants.PRFSTATUS.REJECT], default: constants.PRFSTATUS.PENDING },
    est_reject_reason:{ type: String },
 }, {
    timestamps: { createdAt: 'est_created_at', updatedAt: "est_updated_at" },
    versionKey: false
});

EstimateSchema.plugin(mongoosePaginate);

// Export Item module
let SLAB = module.exports = mongoose.model(constants.DB_MODEL_REF_NEW.ESTIMATE, EstimateSchema);

