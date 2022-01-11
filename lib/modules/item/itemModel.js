// Importing mongoose
var mongoose = require("mongoose");
const constants = require("../../constants");
require("dotenv").config;
var Schema = mongoose.Schema;
var mongoosePaginate = require("mongoose-paginate-v2");


var ItemSchema = new Schema({
    
    itm_name : { type: String },
    itm_id: { type: String },
    itm_no_of_pack: { type: String },

    itm_image_name: { type: String },
    itm_price: { type: String },
    itm_is_deleted: { type: Boolean, default: false },

 }, {
    timestamps: { createdAt: 'itm_created_at', updatedAt: "itm_updated_at" },
    versionKey: false
});

ItemSchema.plugin(mongoosePaginate);

// Export Item module
let Item = module.exports = mongoose.model(constants.DB_MODEL_REF_NEW.ITEMS, ItemSchema);



//    SLAB      discount CRUD

//  minimum   maximum   percentage