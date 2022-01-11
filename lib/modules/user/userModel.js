// Importing mongoose
var mongoose = require("mongoose");
const constants = require("../../constants");
const bcrypt = require("bcryptjs");
require("dotenv").config;
var Schema = mongoose.Schema;
var mongoosePaginate = require("mongoose-paginate-v2");


var UserSchema = new Schema({
    usr_name : { type: String },
    usr_business_name: { type: String },
    usr_password: { type: String },
    usr_phone_number: { type: String },
    usr_role: { type: String, enum: [constants.ACCOUNT_TYPE.SALES, constants.ACCOUNT_TYPE.CUSTOMER, constants.ACCOUNT_TYPE.ADMIN], default: constants.ACCOUNT_TYPE.CUSTOMER },
    usr_customer_id: { type: String },
    usr_email: { type: String },
    usr_state_id: [{ type:  mongoose.Types.ObjectId }],
    usr_device_token: { type: String },
    usr_status: { type: String, enum: [constants.STATUS.ACTIVE, constants.STATUS.INACTIVE], default: constants.STATUS.ACTIVE },
    usr_jwt: { type: String },
    usr_is_deleted: { type: Boolean, default: false },
 }, {
    timestamps: { createdAt: 'usr_created_at', updatedAt: "usr_updated_at" },
    versionKey: false
});

UserSchema.plugin(mongoosePaginate);

// Export user module
let User = module.exports = mongoose.model(constants.DB_MODEL_REF_NEW.USERS, UserSchema);

createAdmin();

async function createAdmin() {
    /* for create mongoose connections */
    User.find({}).then(async (result) => {
        if (!result[0]) {
            // let obj = {
            //     usr_name :process.env.admin_name,
            //     usr_business_name: process.env.admin_name,
            //     usr_password:process.env.admin_password,
            //     usr_phone_number:process.env.admin_phoneNumber,
            //     usr_role:constants.ACCOUNT_TYPE.SALES,
            //     // usr_customer_id: process.env.admin_id,
            //     usr_status: constants.STATUS.ACTIVE,
            //     usr_is_deleted: false,
            // };
            // let updatedPass = await bcrypt.hashSync(obj.usr_password, 11);
            // obj.usr_password = updatedPass;
            // let user = new User(obj);
            // user.save(function (err, result) {
            //     err ? console.log(err) : console.log("Sales created successfully.");
            //     // newConnection.connection.close();
            // });


            let obj1 = {
                usr_name :'NNNN',
                usr_business_name: 'NNNN',
                usr_password:process.env.admin_password,
                usr_phone_number:'9714331436',
                usr_role:constants.ACCOUNT_TYPE.ADMIN,
                usr_status: constants.STATUS.ACTIVE,
                usr_is_deleted: false,
                usr_state_id:[]
            };
            let updatedPass1 = await bcrypt.hashSync(obj1.usr_password, 11);
            obj1.usr_password = updatedPass1;
            let user1 = new User(obj1);
            user1.save(function (err, result) {
                err ? console.log(err) : console.log("ADMIN created successfully.");
                // newConnection.connection.close();
            });

        }
    });
}

// TODO customer city add
