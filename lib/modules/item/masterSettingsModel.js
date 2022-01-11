// Importing mongoose
var mongoose = require("mongoose");
const constants = require("../../constants");
const bcrypt = require("bcryptjs");
require("dotenv").config;
var Schema = mongoose.Schema;
var mongoosePaginate = require("mongoose-paginate-v2");


var masterSettingsSchema = new Schema({
    code : { type: String },
    client_id: { type: String },
    client_secret: { type: String },
    organization_id: { type: String },
    refresh_token:{ type: String },
    access_token:{ type: String },

 }, {
    timestamps: { createdAt: 'master_created_at', updatedAt: "master_updated_at" },
    versionKey: false
});

masterSettingsSchema.plugin(mongoosePaginate);

// Export masterSetting module
let MasterSetting = module.exports = mongoose.model(constants.DB_MODEL_REF_NEW.MASTERs, masterSettingsSchema);

createMaster();

async function createMaster() {
    /* for create mongoose connections */
    MasterSetting.find({}).then(async (result) => {
        if (!result[0]) {
            let obj = {
                code :process.env.code,
                client_id: process.env.client_id,
                client_secret:process.env.client_secret,
                organization_id:process.env.organization_id,
            };

            let masterSetting = new MasterSetting(obj);
            masterSetting.save(function (err, result) {
                err ? console.log(err) : console.log("Mastersetting created successfully.");
            });
        }
    });
}
