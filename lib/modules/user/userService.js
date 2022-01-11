const mongoose = require("mongoose");
const constants = require('../../constants');
const userModel = require('./userModel')
const userMaster = mongoose.model(constants.DB_MODEL_REF_NEW.USERS, userModel.UserSchema);
const bcrypt = require("bcryptjs");
const appUtils = require('../../utils/appUtils');

const imageUpload = require("../../utils/imageUpload");
let dao = require('../../dao/BaseDao');
const userDao = new dao(userMaster);
const jwtHandler = require('../../handlers/jwtHandler');
const generator = require('generate-password');
const sendNotification = require('../../utils/sendNotification');



const estimateModel = require('../estimate/estimateModel')
const estimateMaster = mongoose.model(constants.DB_MODEL_REF_NEW.ESTIMATE, estimateModel.EstimateSchema);
const estimateDao = new dao(estimateMaster);

const stateModel = require('./stateModel');
const { default: axios } = require("axios");
const stateMaster = mongoose.model(constants.DB_MODEL_REF_NEW.STATE, stateModel.stateSchema);
const stateDao = new dao(stateMaster);

async function signIn(req) {

    let query = {
        usr_phone_number: req.body.usr_phone_number,
        usr_is_deleted: false,
    };

    return userDao.findOne(query).then(async (userDetails) => {
        if (userDetails && userDetails != null) {

            let isValidPassword = await appUtils.verifyPassword(req.body.usr_password, userDetails)

            if (!isValidPassword) {
                return 2;
            } else {
                let updateData = {};
                updateData.usr_jwt = await generateToken(userDetails);

                updateData.usr_device_token = req.body.usr_device_token;

                return await userDao.findOneAndUpdate(query, { $set: updateData }, { new: true });

            }
        } else {
            return 1;
        }
    });
}


async function generateToken(data) {

    let obj = {
        _usr_phone_number: data.usr_phone_number,
        _id: data._id,
        _usr_role: data.usr_role && data.usr_role != null ? data.usr_role : '',
        _usr_customer_id: data.usr_customer_id && data.usr_customer_id != null && data.usr_customer_id != undefined ? data.usr_customer_id : '',
        _usr_name: data.usr_name && data.usr_name != null ? data.usr_name : '',
        _usr_state_id: data.usr_state_id && data.usr_state_id.length ? data.usr_state_id : [],
    };
    return await jwtHandler.genUsrToken(obj).then(async (jwt) => {
        return await jwt;
    });

}


async function signout(req) {

    let findUserQuery = {
        _id: mongoose.Types.ObjectId(req._id),
        usr_is_deleted: false,
    };

    let updateData = {
        $unset: {
            'usr_jwt': 1
        }
    };
    return await userDao.findOne(findUserQuery).then(async (data) => {
        if (data && data != null) {
            return await userDao.findByIdAndUpdate(findUserQuery, updateData).then(result => {
                if (result && result != null) {
                    return {};
                }
            })
        } else {
            return 1;
        }
    });
}


async function create(req) {

    let custoIdQuery = {
        usr_customer_id: req.body.usr_customer_id,
        usr_is_deleted: false,
    };

    let mobilelQuery = {
        usr_phone_number: req.body.usr_phone_number,
        usr_is_deleted: false,
    };

    const [cusIdData, mobileData] = await Promise.all([
        userDao.findOne(custoIdQuery),
        userDao.findOne(mobilelQuery),
    ]);
    //only sales can create

    if (req._usr_role == constants.ACCOUNT_TYPE.SALES) {

        // already exist check`
        if (cusIdData && cusIdData != null || mobileData && mobileData != null) {
            return 1;
        } else {

            let generatePassword = await generator.generate({
                length: 8,
                numbers: true,
                lowercase: true,
                uppercase: true,
            });

            console.log('---------generatePassword----------', generatePassword);


            let pwdMSG = 'Your password for login MyFitness Distributor App is ' + generatePassword + ' You can login with your mobile number and password.';
            let URL = 'https://ui.netsms.co.in/API/SendSMS.aspx?APIkey=yoF0y7c3GGrW2yy0quGQ3eyL7H&SenderID=MYFTNS&SMSType=2&Mobile=' + req.body.usr_phone_number + '&MsgText=' + pwdMSG + '&EntityID=1701159055612047808&TemplateID=1207162625347334579';

            let resp = await axios.get(URL, {});
            console.log('---------resp----------', resp['status']);
            if (resp && resp['status'] == 200) {

                req.body.usr_password = await bcrypt.hashSync(generatePassword, 10);
                req.body.usr_state_id = [mongoose.Types.ObjectId(req.body.usr_state_id)];
                return await userDao.save(req.body);
            } else {
                return 3;
            }
        }
    } else {
        return 2;
    }

}


async function list(req) {

    let page = 1;
    let skip = 0;

    if (req.body.page) {
        page = parseInt(req.body.page);
    }

    if (page == 1) {
        skip = 0;
    } else {
        skip = (page - 1) * 10;
    }

    let option = {
        skip: skip,
        limit: 10
    };

    let query = {
        usr_is_deleted: false,
        usr_role: constants.ACCOUNT_TYPE.CUSTOMER
    };

    if (req.body.usr_name && req.body.usr_name != '') {
        query['$and'] = [
            {
                'usr_name': {
                    $regex: req.body.usr_name,
                    $options: 'i'
                }
            }
        ];
    }

    let custoQuery = [{
        $match: query
    }, {
        $lookup: {
            from: constants.LOOKUP_REF_NEW.STATE,
            localField: 'usr_state_id',
            foreignField: '_id',
            as: 'stateDetail'
        }
    }, {
        $skip: option['skip']
    }, {
        $limit: option['limit']
    }, {
        $sort: {
            usr_created_at: -1
        }
    }];


    return await userDao.aggregate(custoQuery).then(async (data) => {
        if (data) {
            return data;
        }
    });
}


async function getDetailById(req) {
    let findQuery = {
        _id: mongoose.Types.ObjectId(req.params.id),
        usr_is_deleted: false,
    };

    return await userDao.findOne(findQuery).then(async (data) => {
        if (data && data != null) {
            return data
        } else {
            return 1;
        }
    });
}

async function deleteById(req) {
    let findQuery = {
        _id: mongoose.Types.ObjectId(req.params.id),
        usr_is_deleted: false,
    };

    return await userDao.findOne(findQuery).then(async (data) => {
        if (data && data != null) {

            let updateObj = {
                usr_is_deleted: true
            }
            return await userDao.findOneAndUpdate(findQuery, { $set: updateObj });

        } else {
            return 1;
        }
    });
}

async function edit(req) {
    let findQuery = {
        _id: mongoose.Types.ObjectId(req.params.id),
        usr_is_deleted: false,
    };

    return await userDao.findOne(findQuery).then(async (data) => {
        if (data && data != null) {
            let updateObj = {};

            if (req.body.usr_name && req.body.usr_name != null && req.body.usr_name != '') {
                updateObj.usr_name = req.body.usr_name;
            }

            if (req.body.usr_business_name && req.body.usr_business_name != null && req.body.usr_business_name != '') {
                updateObj.usr_business_name = req.body.usr_business_name;
            }

            if (req.body.usr_password && req.body.usr_password != null && req.body.usr_password != '') {
                updateObj.usr_password = await bcrypt.hashSync(req.body.usr_password, 10);
            }
            // usr_state_id
            if (req.body.usr_state_id && req.body.usr_state_id != null && req.body.usr_state_id != '') {
                updateObj.usr_state_id = [mongoose.Types.ObjectId(req.body.usr_state_id)];
            }
            if (req._usr_role == constants.ACCOUNT_TYPE.SALES) {


                let nameUniqueQuery = {
                    $or: [
                        { usr_phone_number: req.body.usr_phone_number },
                        { usr_customer_id: req.body.usr_customer_id }
                    ],
                    _id: { $ne: mongoose.Types.ObjectId(req.params.id) }
                };

                let checkNameSymbol = await userDao.findOne(nameUniqueQuery);

                if (checkNameSymbol && checkNameSymbol != null) {
                    return 2;
                }

                updateObj.usr_customer_id = req.body.usr_customer_id;
                updateObj.usr_phone_number = req.body.usr_phone_number;

                return await userDao.findOneAndUpdate(findQuery, { $set: updateObj }, { new: true }).then(async (data) => {
                    if (data) {
                        return data;
                    }
                });


            } else {

                return await userDao.findOneAndUpdate(findQuery, { $set: updateObj });
            }


        } else {
            return 1;
        }
    });
}


async function uploadData(req) {
    if (req.files == null) {
        return 3;
    } else {
        let updType = req.body.updType;
        if (req.files) {
            if (updType == 'image') {
                let reponseImg = await imageUpload.imageStoreOne(req.files.updDocs);
                return reponseImg;
            }
            // else if (updType == constants.UPLOAD_TYPE.VIDEO) {
            //     let reponseImg = await imageUpload.uploadVideo(req.files.updDocs);
            //     let obj = {
            //         'url': reponseImg.Location,
            //         'publicid': reponseImg.key,
            //     }
            //     return obj;
            // }
            else {
                return 2;
            }
        } else {
            return 1;
        }
    }
}

async function dashboardDetail(req) {
    let resOBJ = {
        totalEstimate: 0,
        totalEstimatePrice: 0,
        totalPending: 0,

        totalMonthly: 0,
        graphData: []
        // {
        //     value: [],
        //     dates: [],

        // }
    };

    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1;
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();

    console.log('-------month--------------month-----------', day, month, year);

    let totalPendingQuery = [{
        $match: {
            est_proof_status: constants.PRFSTATUS.PENDING,
        }
    }, {
        $project: {
            year: { $year: "$est_created_at" },
            month: { $month: "$est_created_at" },
            day: { $dayOfMonth: "$est_created_at" }
        }
    }, {
        $match: {
            year: year,
            month: month,
            day: day,

        }
    }, {
        $group: {
            _id: null,
            total: { $sum: 1 }
        }
    }
    ];

    let totalEstimateQuery = [{
        $project: {
            year: { $year: "$est_created_at" },
            month: { $month: "$est_created_at" },
            day: { $dayOfMonth: "$est_created_at" }
        }
    }, {
        $match: {
            year: year,
            month: month,
            day: day,

        }
    }, {
        $group: {
            _id: null,
            total: { $sum: 1 }
        }
    }
    ];

    let totalEstimatePriceQuery = [{
        $project: {
            year: { $year: "$est_created_at" },
            month: { $month: "$est_created_at" },
            day: { $dayOfMonth: "$est_created_at" },
            est_total: { $toDecimal: "$est_total" },
        }
    }, {
        $match: {
            year: year,
            month: month,
            day: day
        }
    }, {
        $group: {
            _id: null,
            total: { $sum: '$est_total' }
        }
    }, {
        $project: {
            total: { $toString: '$total' }
        }
    }
    ];

    let totalMonthQuery = [{
        $project: {
            year: { $year: "$est_created_at" },
            month: { $month: "$est_created_at" },
            day: { $dayOfMonth: "$est_created_at" },
            est_total: { $toDecimal: "$est_total" },
        }
    }, {
        $match: {
            year: year,
            month: month
        }
    }, {
        $group: {
            _id: null,
            total: { $sum: '$est_total' }
        }
    }, {
        $project: {
            total: { $toString: '$total' }
        }
    }
    ]

    let totalPend = await estimateDao.aggregate(totalPendingQuery);

    resOBJ.totalPending = totalPend && totalPend.length && totalPend[0].total ? totalPend[0].total : 0;


    let totalEstimate = await estimateDao.aggregate(totalEstimateQuery);

    resOBJ.totalEstimate = totalEstimate && totalEstimate.length && totalEstimate[0].total ? totalEstimate[0].total : 0;


    let totalEstimatePrice = await estimateDao.aggregate(totalEstimatePriceQuery);

    resOBJ.totalEstimatePrice = totalEstimatePrice && totalEstimatePrice.length && totalEstimatePrice[0].total ? totalEstimatePrice[0].total : 0;

    let totalMonthly = await estimateDao.aggregate(totalMonthQuery);

    resOBJ.totalMonthly = totalMonthly && totalMonthly.length && totalMonthly[0].total ? totalMonthly[0].total : 0;

    let graphDataQuery = [{
        $project: {
            year: { $year: "$est_created_at" },
            month: { $month: "$est_created_at" },
            day: { $dayOfMonth: "$est_created_at" },
            est_total: { $toDecimal: "$est_total" },
            est_created_at: 1
        }
    }, {
        $match: {
            year: year,
            month: month
        }
    }, {
        $group: {
            _id: '$day',
            date: { $first: { $concat: [{ $toString: "$day" }, "-", { $toString: "$month" }, '-', { $toString: "$year" }] }, },
            total: { $sum: '$est_total' },
            est_created_at: { $first: '$est_created_at' }
        }
    }, {
        $project: {
            date: 1,
            total: { $toString: "$total" },
            est_created_at: 1
        }
    }, {
        $sort: {
            est_created_at: 1
        }
    }
    ];

    let graphData = await estimateDao.aggregate(graphDataQuery);

    resOBJ.graphData = graphData && graphData.length ? graphData : [];

    return await resOBJ;
}

async function forgotPassword(req) {

    let findQuery = {
        usr_phone_number: req.body.usr_phone_number,
        usr_is_deleted: false,
    };

    return await userDao.findOne(findQuery).then(async (data) => {
        if (data && data != null) {

            let generatePassword = await generator.generate({
                length: 8,
                numbers: true,
                lowercase: true,
                uppercase: true,
            });

            let pwdMSG = 'Your password for login MyFitness Distributor App is ' + generatePassword + ' You can login with your mobile number and password.';
            let URL = 'https://ui.netsms.co.in/API/SendSMS.aspx?APIkey=yoF0y7c3GGrW2yy0quGQ3eyL7H&SenderID=MYFTNS&SMSType=2&Mobile=' + req.body.usr_phone_number + '&MsgText=' + pwdMSG + '&EntityID=1701159055612047808&TemplateID=1207162625347334579';

            let resp = await axios.get(URL, {});
            console.log('---------resp----------', resp['status']);
            if (resp && resp['status'] == 200) {

                let updateObj = { usr_password: await bcrypt.hashSync(generatePassword, 10) };
                return await userDao.findOneAndUpdate(findQuery, { $set: updateObj }, { new: true })
            } else {
                return 2;
            }

        } else {
            return 1;
        }
    });
}


async function stateList(req) {
    let findQuery = {
        st_is_deleted: false,
    };

    return await stateDao.find(findQuery).then(async (data) => {
        if (data && data != null) {
            return data
        } else {
            return 1;
        }
    });
}


async function saleCreate(req) {

    let mobilelQuery = {
        usr_phone_number: req.body.usr_phone_number,
        usr_is_deleted: false,
    };

    const [mobileData] = await Promise.all([
        userDao.findOne(mobilelQuery),
    ]);
    //only sales can create

    if (req._usr_role == constants.ACCOUNT_TYPE.ADMIN) {

        // already exist check`
        if (mobileData && mobileData != null) {
            return 1;
        } else {

            let generatePassword = await generator.generate({
                length: 8,
                numbers: true,
                lowercase: true,
                uppercase: true,
            });

            console.log('---------generatePassword----------', generatePassword);

            let pwdMSG = 'Your password for login MyFitness Distributor App is ' + generatePassword + ' You can login with your mobile number and password.';
            let URL = 'https://ui.netsms.co.in/API/SendSMS.aspx?APIkey=yoF0y7c3GGrW2yy0quGQ3eyL7H&SenderID=MYFTNS&SMSType=2&Mobile=' + req.body.usr_phone_number + '&MsgText=' + pwdMSG + '&EntityID=1701159055612047808&TemplateID=1207162625347334579';

            let resp = await axios.get(URL, {});
            console.log('---------resp----------', resp['status']);
            if (resp && resp['status'] == 200) {

                req.body.usr_state_id = req.body.usr_state_id.map(s => mongoose.Types.ObjectId(s));

                req.body.usr_password = await bcrypt.hashSync(generatePassword, 10);
                req.body.usr_role = constants.ACCOUNT_TYPE.SALES
                return await userDao.save(req.body);
            } else {
                return 3;
            }
        }
    } else {
        return 2;
    }

}


async function salesEdit(req) {
    let findQuery = {
        _id: mongoose.Types.ObjectId(req.params.id),
        usr_is_deleted: false,
    };

    return await userDao.findOne(findQuery).then(async (data) => {
        if (data && data != null) {
            let updateObj = {};

            if (req.body.usr_name && req.body.usr_name != null && req.body.usr_name != '') {
                updateObj.usr_name = req.body.usr_name;
            }

            if (req.body.usr_password && req.body.usr_password != null && req.body.usr_password != '') {
                updateObj.usr_password = await bcrypt.hashSync(req.body.usr_password, 10);
            }

            if (req.body.usr_state_id && req.body.usr_state_id.length) {
                updateObj.usr_state_id = req.body.usr_state_id.map(s => mongoose.Types.ObjectId(s));

            }

            if (req.body.usr_email && req.body.usr_email != null && req.body.usr_email != '') {
                updateObj.usr_email = req.body.usr_email;
            }
            let nameUniqueQuery = {
                $or: [
                    { usr_phone_number: req.body.usr_phone_number }
                ],
                _id: { $ne: mongoose.Types.ObjectId(req.params.id) }
            };

            let checkNameSymbol = await userDao.findOne(nameUniqueQuery);

            if (checkNameSymbol && checkNameSymbol != null) {
                return 2;
            }

            updateObj.usr_phone_number = req.body.usr_phone_number;

            return await userDao.findOneAndUpdate(findQuery, { $set: updateObj }, { new: true }).then(async (data) => {
                if (data) {
                    return data;
                }
            });


        } else {
            return 1;
        }
    });
}


async function getSalesDetailById(req) {
    let findQuery = {
        _id: mongoose.Types.ObjectId(req.params.id),
        usr_is_deleted: false,
    };

    return await userDao.findOne(findQuery).then(async (data) => {
        if (data && data != null) {
            return data
        } else {
            return 1;
        }
    });
}

async function deleteSalesById(req) {
    let findQuery = {
        _id: mongoose.Types.ObjectId(req.params.id),
        usr_is_deleted: false,
    };

    return await userDao.findOne(findQuery).then(async (data) => {
        if (data && data != null) {

            let updateObj = {
                usr_is_deleted: true
            }
            return await userDao.findOneAndUpdate(findQuery, { $set: updateObj });

        } else {
            return 1;
        }
    });
}

async function salesList(req) {

    let page = 1;
    let skip = 0;

    if (req.body.page) {
        page = parseInt(req.body.page);
    }

    if (page == 1) {
        skip = 0;
    } else {
        skip = (page - 1) * 10;
    }

    let option = {
        skip: skip,
        limit: 10
    };

    let query = {
        usr_is_deleted: false,
        usr_role: constants.ACCOUNT_TYPE.SALES
    };

    if (req.body.usr_name && req.body.usr_name != '') {
        query['$and'] = [
            {
                'usr_name': {
                    $regex: req.body.usr_name,
                    $options: 'i'
                }
            }
        ];
    }
    if (req.body.usr_state_id && req.body.usr_state_id != '') {
        query['$and'] = [
            {
                'usr_state_id': mongoose.Types.ObjectId(req.body.usr_state_id),
            }
        ];
    }
    let salesQuery = [{
        $match: query
    }, {
        $lookup: {
            from: constants.LOOKUP_REF_NEW.STATE,
            localField: 'usr_state_id',
            foreignField: '_id',
            as: 'stateDetail'
        }
    }, {
        $skip: option['skip']
    }, {
        $limit: option['limit']
    }, {
        $sort: {
            usr_created_at: -1
        }
    }];


    return await userDao.aggregate(salesQuery).then(async (data) => {
        if (data) {
            return data;
        }
    });
}

async function salesDashboardDetail(req) {

    let states = await userDao.findOne({ _id: mongoose.Types.ObjectId(req._id) });

    states = await states.usr_state_id && states.usr_state_id != undefined && states.usr_state_id.length ? states.usr_state_id : [];

    states = await states.map(s => mongoose.Types.ObjectId(s));

    let resOBJ = {
        totalEstimate: 0,
        totalEstimatePrice: 0,
        totalPending: 0,

        totalMonthly: 0,
        graphData: []
    };

    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1;
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();

    console.log('-------month--------------month-----------', day, month, year);

    let totalPendingQuery = [
        {
            $lookup: {
                from: 'test_users',
                localField: 'customer_id',
                foreignField: 'usr_customer_id',
                as: 'userDetail'
            }
        }, { $unwind: '$userDetail' }, {
            $match: {
                'userDetail.usr_state_id': { $in: states }
            }
        },
        {
            $match: {
                est_proof_status: constants.PRFSTATUS.PENDING,
            }
        }, {
            $project: {
                year: { $year: "$est_created_at" },
                month: { $month: "$est_created_at" },
                day: { $dayOfMonth: "$est_created_at" }
            }
        }, {
            $match: {
                year: year,
                month: month,
                day: day,

            }
        }, {
            $group: {
                _id: null,
                total: { $sum: 1 }
            }
        }
    ];

    let totalEstimateQuery = [{
        $lookup: {
            from: 'test_users',
            localField: 'customer_id',
            foreignField: 'usr_customer_id',
            as: 'userDetail'
        }
    }, { $unwind: '$userDetail' }, {
        $match: {
            'userDetail.usr_state_id': { $in: states }
        }
    }, {
        $project: {
            year: { $year: "$est_created_at" },
            month: { $month: "$est_created_at" },
            day: { $dayOfMonth: "$est_created_at" }
        }
    }, {
        $match: {
            year: year,
            month: month,
            day: day,
        }
    }, {
        $group: {
            _id: null,
            total: { $sum: 1 }
        }
    }
    ];

    let totalEstimatePriceQuery = [{
        $lookup: {
            from: 'test_users',
            localField: 'customer_id',
            foreignField: 'usr_customer_id',
            as: 'userDetail'
        }
    }, { $unwind: '$userDetail' }, {
        $match: {
            'userDetail.usr_state_id': { $in: states }
        }
    }, {
        $project: {
            year: { $year: "$est_created_at" },
            month: { $month: "$est_created_at" },
            day: { $dayOfMonth: "$est_created_at" },
            est_total: { $toDecimal: "$est_total" },
        }
    }, {
        $match: {
            year: year,
            month: month,
            day: day
        }
    }, {
        $group: {
            _id: null,
            total: { $sum: '$est_total' }
        }
    }, {
        $project: {
            total: { $toString: '$total' }
        }
    }
    ];

    let totalMonthQuery = [{
        $lookup: {
            from: 'test_users',
            localField: 'customer_id',
            foreignField: 'usr_customer_id',
            as: 'userDetail'
        }
    }, { $unwind: '$userDetail' }, {
        $match: {
            'userDetail.usr_state_id': { $in: states }
        }
    }, {
        $project: {
            year: { $year: "$est_created_at" },
            month: { $month: "$est_created_at" },
            day: { $dayOfMonth: "$est_created_at" },
            est_total: { $toDecimal: "$est_total" },
        }
    }, {
        $match: {
            year: year,
            month: month
        }
    }, {
        $group: {
            _id: null,
            total: { $sum: '$est_total' }
        }
    }, {
        $project: {
            total: { $toString: '$total' }
        }
    }
    ]

    let totalPend = await estimateDao.aggregate(totalPendingQuery);

    resOBJ.totalPending = totalPend && totalPend.length && totalPend[0].total ? totalPend[0].total : 0;


    let totalEstimate = await estimateDao.aggregate(totalEstimateQuery);

    resOBJ.totalEstimate = totalEstimate && totalEstimate.length && totalEstimate[0].total ? totalEstimate[0].total : 0;


    let totalEstimatePrice = await estimateDao.aggregate(totalEstimatePriceQuery);

    resOBJ.totalEstimatePrice = totalEstimatePrice && totalEstimatePrice.length && totalEstimatePrice[0].total ? totalEstimatePrice[0].total : 0;

    let totalMonthly = await estimateDao.aggregate(totalMonthQuery);

    resOBJ.totalMonthly = totalMonthly && totalMonthly.length && totalMonthly[0].total ? totalMonthly[0].total : 0;

    let graphDataQuery = [{
        $lookup: {
            from: 'test_users',
            localField: 'customer_id',
            foreignField: 'usr_customer_id',
            as: 'userDetail'
        }
    }, { $unwind: '$userDetail' }, {
        $match: {
            'userDetail.usr_state_id': { $in: states }
        }
    }, {
        $project: {
            year: { $year: "$est_created_at" },
            month: { $month: "$est_created_at" },
            day: { $dayOfMonth: "$est_created_at" },
            est_total: { $toDecimal: "$est_total" },
            est_created_at: 1
        }
    }, {
        $match: {
            year: year,
            month: month
        }
    }, {
        $group: {
            _id: '$day',
            date: { $first: { $concat: [{ $toString: "$day" }, "-", { $toString: "$month" }, '-', { $toString: "$year" }] }, },
            total: { $sum: '$est_total' },
            est_created_at: { $first: '$est_created_at' }

        }
    }, {
        $project: {
            date: 1,
            total: { $toString: "$total" },
            est_created_at: 1
        }
    },
    {
        $sort: {
            est_created_at: 1
        }
    },
    ];


    let graphData = await estimateDao.aggregate(graphDataQuery);

    resOBJ.graphData = graphData && graphData.length ? graphData : [];

    return await resOBJ;
}



async function userDashboardDetail(req) {
    // 
   
    let resOBJ = {
        totalEstimate: 0,
        totalEstimatePrice: 0,
        totalPending: 0,

        totalMonthly: 0,
        graphData: []
    };

    var dateObj = new Date();
    var month = dateObj.getUTCMonth() + 1;
    var day = dateObj.getUTCDate();
    var year = dateObj.getUTCFullYear();

    console.log('-------month--------------month-----------', day, month, year);

    let totalPendingQuery = [
         {
            $match: {
                est_proof_status: constants.PRFSTATUS.PENDING,
                'customer_id': req._usr_customer_id
            }
        }, {
            $project: {
                year: { $year: "$est_created_at" },
                month: { $month: "$est_created_at" },
                day: { $dayOfMonth: "$est_created_at" }
            }
        }, {
            $match: {
                year: year,
                month: month,
                day: day,

            }
        }, {
            $group: {
                _id: null,
                total: { $sum: 1 }
            }
        }
    ];

    let totalEstimateQuery = [ {
        $match: {
            'customer_id': req._usr_customer_id
        }
    },{
        $project: {
            year: { $year: "$est_created_at" },
            month: { $month: "$est_created_at" },
            day: { $dayOfMonth: "$est_created_at" }
        }
    }, {
        $match: {
            year: year,
            month: month,
            day: day,
        }
    }, {
        $group: {
            _id: null,
            total: { $sum: 1 }
        }
    }
    ];

    let totalEstimatePriceQuery = [{
        $match: {
            'customer_id': req._usr_customer_id
        }
    }, {
        $project: {
            year: { $year: "$est_created_at" },
            month: { $month: "$est_created_at" },
            day: { $dayOfMonth: "$est_created_at" },
            est_total: { $toDecimal: "$est_total" },
        }
    }, {
        $match: {
            year: year,
            month: month,
            day: day
        }
    }, {
        $group: {
            _id: null,
            total: { $sum: '$est_total' }
        }
    }, {
        $project: {
            total: { $toString: '$total' }
        }
    }
    ];

    let totalMonthQuery = [{
        $match: {
            'customer_id': req._usr_customer_id
        }
    }, {
        $project: {
            year: { $year: "$est_created_at" },
            month: { $month: "$est_created_at" },
            day: { $dayOfMonth: "$est_created_at" },
            est_total: { $toDecimal: "$est_total" },
        }
    }, {
        $match: {
            year: year,
            month: month
        }
    }, {
        $group: {
            _id: null,
            total: { $sum: '$est_total' }
        }
    }, {
        $project: {
            total: { $toString: '$total' }
        }
    }
    ]

    let totalPend = await estimateDao.aggregate(totalPendingQuery);

    resOBJ.totalPending = totalPend && totalPend.length && totalPend[0].total ? totalPend[0].total : 0;


    let totalEstimate = await estimateDao.aggregate(totalEstimateQuery);

    resOBJ.totalEstimate = totalEstimate && totalEstimate.length && totalEstimate[0].total ? totalEstimate[0].total : 0;


    let totalEstimatePrice = await estimateDao.aggregate(totalEstimatePriceQuery);

    resOBJ.totalEstimatePrice = totalEstimatePrice && totalEstimatePrice.length && totalEstimatePrice[0].total ? totalEstimatePrice[0].total : 0;

    let totalMonthly = await estimateDao.aggregate(totalMonthQuery);

    resOBJ.totalMonthly = totalMonthly && totalMonthly.length && totalMonthly[0].total ? totalMonthly[0].total : 0;

    let graphDataQuery = [{
        $match: {
            'customer_id': req._usr_customer_id
        }
    }, {
        $project: {
            year: { $year: "$est_created_at" },
            month: { $month: "$est_created_at" },
            day: { $dayOfMonth: "$est_created_at" },
            est_total: { $toDecimal: "$est_total" },
            est_created_at: 1
        }
    }, {
        $match: {
            year: year,
            month: month
        }
    }, {
        $group: {
            _id: '$day',
            date: { $first: { $concat: [{ $toString: "$day" }, "-", { $toString: "$month" }, '-', { $toString: "$year" }] }, },
            total: { $sum: '$est_total' },
            est_created_at: { $first: '$est_created_at' }

        }
    }, {
        $project: {
            date: 1,
            total: { $toString: "$total" },
            est_created_at: 1
        }
    },
    {
        $sort: {
            est_created_at: 1
        }
    },
    ];


    let graphData = await estimateDao.aggregate(graphDataQuery);

    resOBJ.graphData = graphData && graphData.length ? graphData : [];

    return await resOBJ;
}

async function reportsDetail(req) {

    let { start_date, end_date, sales_id } = req.body;


    start_date = new Date(start_date);
    // end_date = new Date(end_date);


    end_date = end_date.split('-');
    console.log('---start_date--------', end_date[1])
    end_date[1] = (end_date[1]) - 1;
    end_date = new Date(end_date[0], end_date[1], end_date[2], 23, 58, 58);

    console.log('---start_date--------', start_date)
    console.log('---end_date--------', end_date)

    // let startDate = {
    //     year: parseInt(start_date[0]),
    //     month: parseInt(start_date[1]),
    //     date: parseInt(start_date[2]),
    // };

    // let endDate = {
    //     year: parseInt(end_date[0]),
    //     month: parseInt(end_date[1]),
    //     date: parseInt(end_date[2]),
    // };
    // '2020-03-13'


    let states = {};
    let que = {
        est_created_at: { $gte: start_date, $lte: end_date }
    };
    if (sales_id && sales_id != undefined && sales_id != null && sales_id != '') {

        states = await userDao.findOne({ _id: mongoose.Types.ObjectId(sales_id) });

        states = await states.usr_state_id && states.usr_state_id != undefined && states.usr_state_id.length ? states.usr_state_id : [];

        states = await states.map(s => mongoose.Types.ObjectId(s));

        que['userDetail.usr_state_id'] = { $in: states };
    }


    let reportQuery = [{
        $lookup: {
            from: 'test_users',
            localField: 'customer_id',
            foreignField: 'usr_customer_id',
            as: 'userDetail'
        }
    }, { $unwind: '$userDetail' }, {
        $match: que
    }, {
        $project: {
            year: { $year: "$est_created_at" },
            month: { $month: "$est_created_at" },
            day: { $dayOfMonth: "$est_created_at" },
            est_total: { $toDecimal: "$est_total" },
            est_proof_status: 1,
            date: { $dateToString: { format: "%d-%m-%Y", date: "$est_created_at" } },
            est_created_at:1,
        }
    },
    {
        $sort: {
            day: -1,
            month: -1,
            // year:-1,
        }
    },
    // {
    //     $match: {
    //         $and: [
    //             { month: { $gte: startDate['month'], $lte: endDate['month'] } },
    //             { day: { $gte: startDate['date'], $lte: endDate['date'] } },

    //             { year: { $gte: startDate['year'], $lte: endDate['year'] } }

    //         ],
    //     }
    // },
    {
        $group: {
            _id: '$date',
            est_total: { $sum: '$est_total' },
            est_received: { $sum: 1 },
            est_proof_status: { $push: '$est_proof_status' },
            est_created_at:{$first:'$est_created_at'},
        }
    }, {
        $project: {
            date: '$_id',
            est_total: '$est_total',
            est_received: '$est_received',
            est_proof_status: {
                $filter: {
                    input: "$est_proof_status",
                    as: "est_proof_status",
                    cond: {
                        $eq: ["$$est_proof_status", 'Pending']
                    }
                }
            },
            est_created_at:1,
        }
    }, {
        $project: {

            date: '$_id',
            est_total: { $toString: "$est_total" },
            est_received: '$est_received',
            pending: {
                $size: '$est_proof_status'
            },
            est_created_at:1,

        }
    },{$sort:{
        est_created_at:1
    }}];
    return await estimateDao.aggregate(reportQuery);
}


async function estimateReports(req) {

    let { date, sales_id } = req.body;

    // '2020-03-13'
    date = date.split('-');
    let states = {};
    let que = {
        year: parseInt(date[2]),
        month: parseInt(date[1]),
        day: parseInt(date[0]),
    };
    if (sales_id && sales_id != undefined && sales_id != null && sales_id != '') {

        states = await userDao.findOne({ _id: mongoose.Types.ObjectId(sales_id) });

        states = await states.usr_state_id && states.usr_state_id != undefined && states.usr_state_id.length ? states.usr_state_id : [];

        states = await states.map(s => mongoose.Types.ObjectId(s));

        que['userDetail.usr_state_id'] = { $in: states };
    }


    let reportQuery = [{
        $lookup: {
            from: 'test_users',
            localField: 'customer_id',
            foreignField: 'usr_customer_id',
            as: 'userDetail'
        }
    }, { $unwind: '$userDetail' }, {
        $sort: {
            est_created_at: -1
        }
    }, {
        $project: {
            userDetail: 1,
            est_id: 1,
            est_number: 1,
            est_date: 1,
            customer_id: 1,
            est_url: 1,
            est_total: 1,
            est_is_deleted: 1,
            est_awb_number: 1,
            est_proof_url: 1,
            est_updated_at: 1,
            est_invoice_id: 1,
            est_proof_status: 1,
            est_reject_reason: 1,
            est_created_at: 1,
            year: { $year: "$est_created_at" },
            month: { $month: "$est_created_at" },
            day: { $dayOfMonth: "$est_created_at" },
        }
    }, {
        $match: que
    }];

    return await estimateDao.aggregate(reportQuery);
}


// async function reportsDetail(req) {

//     let { start_date, end_date, sales_id } = req.body;



//     // [

//     //     {
//     //         $project:
//     //         {
//     //             year: { $year: "$createdOn" },
//     //             month: { $month: "$createdOn" },
//     //             day: { $dayOfMonth: "$createdOn" },
//     //             amount: 1,
//     //             token_name: 1,
//     //             sender_id: 1
//     //         }
//     //     }, {
//     //         $match: {
//     //             $or: [
//     //                 { $and: [{ month: preMonth }, { day: { $gte: date } }] },
//     //                 { $and: [{ month: month }, { day: { $lte: date } }] }
//     //             ],
//     //             month: { $in: [month, preMonth] },
//     //             year: { $in: [year, year] }
//     //         }
//     //     }
//     // ]
//     let startDate = {
//         year: 0,
//         month: 0,
//         date: 0,
//     };

//     let endDate = {
//         year: 0,
//         month: 0,
//         date: 0,
//     };
//     // '2020-03-13'
//     start_date = new Date(start_date);

//     end_date = end_date.split('-');
//     end_date = new Date(end_date[0], end_date[1], end_date[2], 23, 58, 58);

//     let states = {};
//     let que = {
//         $and: [{ est_created_at: { $gte: start_date } }, { 'est_created_at': { $lte: end_date } }]
//     };
//     if (sales_id && sales_id != undefined && sales_id != null && sales_id != '') {

//         states = await userDao.findOne({ _id: mongoose.Types.ObjectId(sales_id) });

//         states = await states.usr_state_id && states.usr_state_id != undefined && states.usr_state_id.length ? states.usr_state_id : [];

//         states = await states.map(s => mongoose.Types.ObjectId(s));

//         que['userDetail.usr_state_id'] = { $in: states };
//     }


//     let reportQuery = [{
//         $lookup: {
//             from: 'test_users',
//             localField: 'customer_id',
//             foreignField: 'usr_customer_id',
//             as: 'userDetail'
//         }
//     }, { $unwind: '$userDetail' }, {
//         $sort: {
//             est_created_at: -1
//         }
//     }, {
//         $match: que
//     }, {
//         $project: {
//             year: { $year: "$est_created_at" },
//             month: { $month: "$est_created_at" },
//             day: { $dayOfMonth: "$est_created_at" },
//             est_total: { $toDecimal: "$est_total" },
//             est_proof_status: 1,
//             date: { $dateToString: { format: "%d-%m-%Y", date: "$est_created_at" } },

//         }
//     }, {
//         $group: {
//             _id: '$date',
//             est_total: { $sum: '$est_total' },
//             est_received: { $sum: 1 },
//             est_proof_status: { $push: '$est_proof_status' }
//         }
//     }, {
//         $project: {
//             date: '$_id',
//             est_total: '$est_total',
//             est_received: '$est_received',
//             est_proof_status: {
//                 $filter: {
//                     input: "$est_proof_status",
//                     as: "est_proof_status",
//                     cond: {
//                         $eq: ["$$est_proof_status", 'Pending']
//                     }
//                 }
//             }
//         }
//     }, {
//         $project: {

//             date: '$_id',
//             est_total: { $toString: "$est_total" },
//             est_received: '$est_received',
//             pending: {
//                 $size: '$est_proof_status'
//             }
//         }
//     }];
//     return await estimateDao.aggregate(reportQuery);
// }


// async function estimateReports(req) {

//     let { date, sales_id } = req.body;

//     // '2020-03-13'
//     date = date.split('-');
//     let states = {};
//     let que = {
//         year: parseInt(date[0]),
//         month: parseInt(date[1]),
//         day: parseInt(date[2]),
//     };
//     if (sales_id && sales_id != undefined && sales_id != null && sales_id != '') {

//         states = await userDao.findOne({ _id: mongoose.Types.ObjectId(sales_id) });

//         states = await states.usr_state_id && states.usr_state_id != undefined && states.usr_state_id.length ? states.usr_state_id : [];

//         states = await states.map(s => mongoose.Types.ObjectId(s));

//         que['userDetail.usr_state_id'] = { $in: states };
//     }


//     let reportQuery = [{
//         $lookup: {
//             from: 'test_users',
//             localField: 'customer_id',
//             foreignField: 'usr_customer_id',
//             as: 'userDetail'
//         }
//     }, { $unwind: '$userDetail' }, {
//         $sort: {
//             est_created_at: -1
//         }
//     }, {
//         $project: {
//             userDetail: 1,
//             est_id: 1,
//             est_number: 1,
//             est_date: 1,
//             customer_id: 1,
//             est_url: 1,
//             est_total: 1,
//             est_is_deleted: 1,
//             est_awb_number: 1,
//             est_proof_url: 1,
//             est_updated_at: 1,
//             est_invoice_id: 1,
//             est_proof_status: 1,
//             est_reject_reason: 1,
//             est_created_at: 1,
//             year: { $year: "$est_created_at" },
//             month: { $month: "$est_created_at" },
//             day: { $dayOfMonth: "$est_created_at" },
//         }
//     }, {
//         $match: que
//     }];

//     return await estimateDao.aggregate(reportQuery);
// }


module.exports = {
    signIn,
    signout,
    create,
    list,
    getDetailById,
    deleteById,
    edit,
    uploadData,
    dashboardDetail,
    forgotPassword,
    stateList,
    saleCreate,
    salesEdit,
    getSalesDetailById,
    deleteSalesById,
    salesList,
    salesDashboardDetail,
    reportsDetail,
    estimateReports,
    userDashboardDetail
}

