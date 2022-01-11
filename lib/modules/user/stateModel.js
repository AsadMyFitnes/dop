// Importing mongoose
var mongoose = require("mongoose");
const constants = require("../../constants");
require("dotenv").config;
var Schema = mongoose.Schema;
var mongoosePaginate = require("mongoose-paginate-v2");


var stateSchema = new Schema({
    st_name : { type: String },
    st_is_deleted: { type: Boolean, default: false },

 }, {
    timestamps: { createdAt: 'st_created_at', updatedAt: "st_updated_at" },
    versionKey: false
});

stateSchema.plugin(mongoosePaginate);

// Export Item module
let STATE = module.exports = mongoose.model(constants.DB_MODEL_REF_NEW.STATE, stateSchema);

createState();

async function createState() {
    /* for create mongoose connections */
    STATE.find({}).then(async (result) => {
        if (!result[0]) {
            let obj = {
                st_name :'MP',
                st_is_deleted: false,
            };
       
            let state = new STATE(obj);
            state.save(function (err, result) {
                err ? console.log(err) : console.log("State created successfully.");
                // newConnection.connection.close();
            });
            let obj1 = {
                st_name :'UP',
                st_is_deleted: false,
            };
       
            let state1 = new STATE(obj1);
            state1.save(function (err, result) {
                err ? console.log(err) : console.log("State created successfully.");
                // newConnection.connection.close();
            });
        }
    });
}