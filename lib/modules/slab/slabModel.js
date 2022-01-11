// Importing mongoose
var mongoose = require("mongoose");
const constants = require("../../constants");
require("dotenv").config;
var Schema = mongoose.Schema;
var mongoosePaginate = require("mongoose-paginate-v2");


var SlabSchema = new Schema({
    
    slb_min : { type: String },
    slb_max: { type: String },
    slb_percentage: { type: String },
    slb_is_deleted: { type: Boolean, default: false },

 }, {
    timestamps: { createdAt: 'slb_created_at', updatedAt: "slb_updated_at" },
    versionKey: false
});

SlabSchema.plugin(mongoosePaginate);

// Export Item module
let SLAB = module.exports = mongoose.model(constants.DB_MODEL_REF_NEW.SLAB, SlabSchema);

