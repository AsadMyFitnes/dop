
const mongoose = require("mongoose");

let dao = require('../../dao/BaseDao');

const constants = require('../../constants');
const estimateModel = require('./estimateModel')
const estimateMaster = mongoose.model(constants.DB_MODEL_REF_NEW.ESTIMATE, estimateModel.EstimateSchema);
const estimateDao = new dao(estimateMaster);

const masterSettingsModel = require('../item/masterSettingsModel')
const settingMaster = mongoose.model(constants.DB_MODEL_REF_NEW.MASTERs, masterSettingsModel.masterSettingsSchema);
const axios = require('axios')
const qs = require('qs')
const settingDao = new dao(settingMaster);
const queryString = require('query-string');
const sendNotification = require('../../utils/sendNotification');

const userModel = require('../user/userModel');
const userMaster = mongoose.model(constants.DB_MODEL_REF_NEW.USERS, userModel.UserSchema);
const userDao = new dao(userMaster);



function formatDate() {
    let date = new Date();
    const day = date.toLocaleString('default', { day: '2-digit' });
    const month = date.toLocaleString('default', { month: '2-digit' });
    const year = date.toLocaleString('default', { year: 'numeric' });
    return year + '-' + month + '-' + day;
    // "2021-07-01"
}
function getQueryString(data = {}) {
    return Object.entries(data)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
}
async function estimateCreate(req) {
    // if (req._usr_role == constants.ACCOUNT_TYPE.SALES) {

    let setting = await settingDao.find({});
    if (setting && setting.length) {
        setting = setting[0];

        let CREATEDATA = {
            "is_inclusive_tax": true,
            "discount": req.body.discount,
            "is_discount_before_tax": true,
            "customer_id": req._usr_customer_id,
            "date": formatDate(), //"2021-07-01",
            "line_items": req.body.line_items,
            "discount_type": "entity_level",
            "terms": "100% Advance"
        };

        if (setting && setting.refresh_token != undefined && setting.refresh_token != null) {

            if (setting && setting.access_token != undefined && setting.access_token != null) {
                console.log('-------------------------3',)
                let estimateData = await createEstimateThird(setting, CREATEDATA, setting.access_token);
                if (estimateData && estimateData.error && estimateData.error == 'invalid_code') {

                    let findQuery = {
                        _id: mongoose.Types.ObjectId(setting._id),
                    };
                    let updateObj = {
                        access_token: 1
                    };
                    await settingDao.findOneAndUpdate(findQuery, { $unset: updateObj });
                    return await estimateCreate(req);
                } else {
                    if (estimateData['estimate'] && estimateData['estimate'] != undefined) {
                        let est = estimateData['estimate'];
                        let obj = {
                            est_id: est.estimate_id,
                            est_number: est.estimate_number,
                            est_date: est.date,
                            customer_id: req._usr_customer_id,
                            est_url: est.estimate_url ? est.estimate_url : '---',
                            est_total: est.total ? est.total.toString() : '0',
                        };
                        await estimateDao.save(obj);

                        let stData = await sentStatusEstimateThird(estimateData['estimate'], setting.access_token);
                        let arrr = [];
                        arrr = req._usr_state_id && req._usr_state_id.length ? req._usr_state_id : [];
                        arrr = arrr.map(s => mongoose.Types.ObjectId(s));

                        let query = [{
                            $match: {
                                'usr_role': 'SALES',
                                'usr_state_id': { $in: arrr }
                            }
                        },
                        {
                            $group: {
                                _id: '_id',
                                tokens: {
                                    $push: '$usr_device_token'
                                }
                            }
                        }];
                        let userTokens = await userDao.aggregate(query);

                        if (userTokens && userTokens.length) {
                            let msg = `${req._usr_name} has created new estimate.`;
                            await sendNotification.sendNotification(userTokens[0].tokens || [], msg, process.env.appName, est);
                        }
                        return await stData;
                    }
                }
            } else {
                let accessData = await getAccessToken(setting, setting.refresh_token);
                if (accessData && accessData.error && (accessData.error == 'invalid_code' || accessData.error == 'access_denied')) {
                    let findQuery = {
                        _id: mongoose.Types.ObjectId(setting._id),
                    };
                    let updateObj = {
                        refresh_token: 1
                    };
                    await settingDao.findOneAndUpdate(findQuery, { $unset: updateObj });

                    return await estimateCreate(req);

                } else {
                    let findQuery = {
                        _id: mongoose.Types.ObjectId(setting._id),
                    };
                    let updateObj = {
                        access_token: accessData['access_token']
                    };
                    await settingDao.findOneAndUpdate(findQuery, { $set: updateObj });

                    return await estimateCreate(req);

                }
            }

        } else {
            let refreshData = await getRefreshToken(setting);

            if (refreshData && refreshData.error && refreshData.error == 'invalid_code') {
                return 1;
            } else {
                let findQuery = {
                    _id: mongoose.Types.ObjectId(setting._id),
                };
                let updateObj = {
                    refresh_token: refreshData['refresh_token']
                };
                await settingDao.findOneAndUpdate(findQuery, { $set: updateObj });

                return await estimateCreate(req);

            }



        }


    }
    // return await estimateDao.save(req.body);
    // } else {
    //     return 1;
    // }
}

async function estimateEdit(req) {

    let findQueryEST = {
        est_id: req.params.id
    };
    return await estimateDao.findOne(findQueryEST).then(async (data) => {
        if (data && data != null) {


            let setting = await settingDao.find({});
            if (setting && setting.length) {
                setting = setting[0];

                let EDITDATA = {
                    "is_inclusive_tax": true,
                    "discount": req.body.discount,
                    "is_discount_before_tax": true,
                    "customer_id": req._usr_customer_id,
                    "date": formatDate(), //"2021-07-01",
                    "line_items": req.body.line_items,
                    "discount_type": "entity_level",
                    "terms": "100% Advance"
                };


                if (setting && setting.refresh_token != undefined && setting.refresh_token != null) {

                    if (setting && setting.access_token != undefined && setting.access_token != null) {

                        let estimateData = await editEstimateThird(setting, EDITDATA, setting.access_token, req.params.id);
                        if (estimateData && estimateData.error && estimateData.error == 'invalid_code') {

                            let findQuery = {
                                _id: mongoose.Types.ObjectId(setting._id),
                            };
                            let updateObj = {
                                access_token: 1
                            };
                            await settingDao.findOneAndUpdate(findQuery, { $unset: updateObj });
                            return await estimateEdit(req);
                        } else {
                            // TODO EDIT ESTIMATE
                            if (estimateData['estimate'] && estimateData['estimate'] != undefined) {
                                let est = estimateData['estimate'];
                                let obj = {
                                    est_id: est.estimate_id,
                                    est_number: est.estimate_number,
                                    est_date: est.date,
                                    customer_id: req._usr_customer_id,
                                    est_url: est.estimate_url ? est.estimate_url : '---',
                                    est_total: est.total ? est.total.toString() : '0',
                                    est_proof_status: constants.PRFSTATUS.PENDING
                                };
                                await estimateDao.findOneAndUpdate(findQueryEST, obj);

                                let arrr = [];
                                arrr = req._usr_state_id && req._usr_state_id.length ? req._usr_state_id : [];
                                arrr = arrr.map(s => mongoose.Types.ObjectId(s));

                                let query = [{
                                    $match: {
                                        'usr_role': 'SALES',
                                        'usr_state_id': { $in: arrr }
                                    }
                                },
                                {
                                    $group: {
                                        _id: '_id',
                                        tokens: {
                                            $push: '$usr_device_token'
                                        }
                                    }
                                }];
                                let userTokens = await userDao.aggregate(query);

                                if (userTokens && userTokens.length) {
                                    let msg = `${req._usr_name} has edited estimate.`;
                                    await sendNotification.sendNotification(userTokens[0].tokens || [], msg, process.env.appName, est);
                                }
                                return await estimateData['estimate'];
                            }
                        }

                    } else {
                        let accessData = await getAccessToken(setting, setting.refresh_token);
                        if (accessData && accessData.error && (accessData.error == 'invalid_code' || accessData.error == 'access_denied')) {
                            let findQuery = {
                                _id: mongoose.Types.ObjectId(setting._id),
                            };
                            let updateObj = {
                                refresh_token: 1
                            };
                            await settingDao.findOneAndUpdate(findQuery, { $unset: updateObj });

                            return await estimateEdit(req);

                        } else {
                            let findQuery = {
                                _id: mongoose.Types.ObjectId(setting._id),
                            };
                            let updateObj = {
                                access_token: accessData['access_token']
                            };
                            await settingDao.findOneAndUpdate(findQuery, { $set: updateObj });

                            return await estimateEdit(req);

                        }
                    }

                } else {
                    let refreshData = await getRefreshToken(setting);

                    if (refreshData && refreshData.error && refreshData.error == 'invalid_code') {
                        return 2;
                    } else {
                        let findQuery = {
                            _id: mongoose.Types.ObjectId(setting._id),
                        };
                        let updateObj = {
                            refresh_token: refreshData['refresh_token']
                        };
                        await settingDao.findOneAndUpdate(findQuery, { $set: updateObj });

                        return await estimateEdit(req);

                    }



                }


            }

        } else {
            return 1;
        }
    });

}

async function estimateStatusUpdate(req) {
    let findQuery = {
        _id: mongoose.Types.ObjectId(req.params.id),
        est_is_deleted: false,
    };

    return await estimateDao.findOne(findQuery).then(async (data) => {
        if (data && data != null) {
            if (req._usr_role == constants.ACCOUNT_TYPE.SALES) {

                let updateObj = {
                    est_proof_status: req.body.est_proof_status
                };

                if (req.body.est_proof_status == constants.PRFSTATUS.REJECT) {
                    updateObj.est_reject_reason = req.body.est_reject_reason;
                }
                if (req.body.est_proof_status == constants.PRFSTATUS.DISPATCH) {
                    updateObj.est_awb_number = 'http://www.safexpress.com/Portal/faces/TrackShipment.jspx?waybl_no_ht=' + req.body.est_awb_number;
                    updateObj.est_invoice_id = req.body.est_invoice_id;
                }

                return await estimateDao.findOneAndUpdate(findQuery, { $set: updateObj }, { new: true }).then(async (updateData) => {
                    if (updateData) {


                        let query = [{
                            $match: {
                                usr_customer_id: data.customer_id,
                            }
                        },
                        {
                            $group: {
                                _id: '_id',
                                tokens: {
                                    $push: '$usr_device_token'
                                }
                            }
                        }];
                        let userTokens = await userDao.aggregate(query);
                        if (userTokens && userTokens.length) {
                            let msg = '';

                            if (req.body.est_proof_status == constants.PRFSTATUS.APPROVE) {
                                msg = 'Your estimate status changed to Accepted';
                            }
                            if (req.body.est_proof_status == constants.PRFSTATUS.DISPATCH) {
                                msg = 'You order has been dispatched';
                            }
                            if (req.body.est_proof_status == constants.PRFSTATUS.REJECT) {
                                msg = 'You order has been rejected.';
                            }
                            await sendNotification.sendNotification(userTokens[0].tokens || [], msg, process.env.appName, data);
                        }

                        return await updateData;
                    }
                }).catch((er) => {
                    console.log('-----------er---------', er)

                });

            } else {
                return 2;
            }

        } else {
            return 1;
        }
    });
}

async function estimateDeleteById(req) {
    let findQuery = {
        _id: mongoose.Types.ObjectId(req.params.id),
        est_is_deleted: false,
    };

    return await estimateDao.findOne(findQuery).then(async (data) => {
        if (data && data != null) {

            let updateObj = {
                est_is_deleted: true
            }
            return await estimateDao.findOneAndUpdate(findQuery, { $set: updateObj });

        } else {
            return 1;
        }
    });
}


async function getEstimateDetailById(req) {
    let findQuery = {
        _id: mongoose.Types.ObjectId(req.params.id),
        est_is_deleted: false,
    };

    return await estimateDao.findOne(findQuery).then(async (databaseEstimate) => {
        if (databaseEstimate && databaseEstimate != null) {
            // return data


            let setting = await settingDao.find({});
            if (setting && setting.length) {
                setting = setting[0];
                if (setting && setting.refresh_token != undefined && setting.refresh_token != null) {
                    if (setting && setting.access_token != undefined && setting.access_token != null) {

                        console.log('-------------------------3',)
                        let estimateData = await getEstimateThird(setting, databaseEstimate, setting.access_token);
                        if (estimateData && estimateData.error && estimateData.error == 'invalid_code') {

                            let findQuery = {
                                _id: mongoose.Types.ObjectId(setting._id),
                            };
                            let updateObj = {
                                access_token: 1
                            };
                            await settingDao.findOneAndUpdate(findQuery, { $unset: updateObj });
                            return await getEstimateDetailById(req);
                        } else {
                            if (estimateData['estimate'] && estimateData['estimate'] != undefined) {

                                return await estimateData['estimate'];
                            }
                        }



                    } else {

                        let accessData = await getAccessToken(setting, setting.refresh_token);
                        if (accessData && accessData.error && (accessData.error == 'invalid_code' || accessData.error == 'access_denied')) {
                            let findQuery = {
                                _id: mongoose.Types.ObjectId(setting._id),
                            };
                            let updateObj = {
                                refresh_token: 1
                            };
                            await settingDao.findOneAndUpdate(findQuery, { $unset: updateObj });

                            return await getEstimateDetailById(req);

                        } else {
                            let findQuery = {
                                _id: mongoose.Types.ObjectId(setting._id),
                            };
                            let updateObj = {
                                access_token: accessData['access_token']
                            };
                            await settingDao.findOneAndUpdate(findQuery, { $set: updateObj });

                            return await getEstimateDetailById(req);

                        }
                    }

                } else {
                    let refreshData = await getRefreshToken(setting);

                    if (refreshData && refreshData.error && refreshData.error == 'invalid_code') {
                        return 1;
                    } else {
                        let findQuery = {
                            _id: mongoose.Types.ObjectId(setting._id),
                        };
                        let updateObj = {
                            refresh_token: refreshData['refresh_token']
                        };
                        await settingDao.findOneAndUpdate(findQuery, { $set: updateObj });

                        return await getEstimateDetailById(req);

                    }



                }


            }

        } else {
            return 1;
        }
    });
}

async function estimateList(req) {

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
        est_is_deleted: false
    };

    if (req.body.est_proof_status) {
        query.est_proof_status = req.body.est_proof_status;
    }
    let arrr = [];

    if (req.body.usr_customer_id && req.body.usr_customer_id != undefined) {
        let userD = await userDao.findOne({ usr_customer_id: req.body.usr_customer_id });

        arrr = userD.usr_state_id && userD.usr_state_id.length ? userD.usr_state_id : [];
        arrr = arrr.map(s => mongoose.Types.ObjectId(s));

    } else {
        arrr = req._usr_state_id && req._usr_state_id.length ? req._usr_state_id : [];
        arrr = arrr.map(s => mongoose.Types.ObjectId(s));

    }


    let custoQuery = [{
        $match: query
    }, {
        $lookup: {
            from: constants.LOOKUP_REF_NEW.USERS,
            foreignField: 'usr_customer_id',
            localField: 'customer_id',
            as: 'userDetails'
        }
    }, {
        $unwind: {
            path: '$userDetails',
            preserveNullAndEmptyArrays: true
        }
    }, {
        $sort: {
            est_created_at: -1
        }
    }, {
        $skip: option['skip']
    }, {
        $limit: option['limit']
    }, {
        $sort: {
            est_created_at: -1
        }
    }, {
        $project: {
            est_id: 1,
            est_number: 1,
            est_date: 1,
            customer_id: 1,
            est_url: 1,
            est_total: 1,
            est_is_deleted: 1,
            est_awb_number: 1,
            est_proof_url: 1,
            est_invoice_id: 1,
            est_proof_status: 1,
            est_reject_reason: 1,
            usr_name: '$userDetails.usr_name',
            usr_state_id: '$userDetails.usr_state_id'
        }
    }, {
        $match: {
            usr_state_id: {
                $in: arrr
            }
        }
    }];

    return await estimateDao.aggregate(custoQuery).then(async (data) => {
        if (data) {
            return data;
        }
    });
}


//THIRD PARTY
async function getRefreshToken(setting) {
    let REFDATA = {
        code: setting.code,
        redirect_url: 'mfyfitness.co.in',
        client_id: setting.client_id,
        "client_secret": setting.client_secret,
        "grant_type": "authorization_code",
    }

    let result1 = await axios({
        method: 'post',
        url: process.env.URL_STEP2,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify(REFDATA)
    })

    return result1['data'];
}

//THIRD PARTY
async function getAccessToken(setting, refreshToken) {
    let ACCDATA = {
        'refresh_token': refreshToken,
        client_id: setting.client_id,
        client_secret: setting.client_secret,
        grant_type: 'refresh_token'
    };
    let result1 = await axios({
        method: 'post',
        url: process.env.URL_STEP3,
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify(ACCDATA)
    })

    return result1['data'];

}

//THIRD PARTY
async function createEstimateThird(setting, CREATEDATA, access_token) {

    return await axios({
        method: 'post',
        url: process.env.CREATE_ESTIMATE + setting.organization_id,
        headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Authorization': 'Zoho-oauthtoken ' + access_token
        },
        data: queryString.stringify({ JSONString: JSON.stringify(CREATEDATA) })
    }).then(async (data) => {
        if (data && data != undefined) {
            return await data['data'];
        } else {
            return { error: 'invalid_code' };
        }
    }).catch((er) => {
        if (er) {
            return { error: 'invalid_code' };
        }
    });

}

//THIRD PARTY
async function editEstimateThird(setting, EDITDATA, access_token, est_id) {

    return await axios({
        method: 'put',
        url: process.env.ESTIMATE_STATUS_SENT + est_id + '?organization_id=' + setting.organization_id,
        headers: {
            'content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'Authorization': 'Zoho-oauthtoken ' + access_token
        },
        data: queryString.stringify({ JSONString: JSON.stringify(EDITDATA) })
    }).then(async (data) => {
        if (data && data != undefined) {
            return await data['data'];
        } else {
            return { error: 'invalid_code' };
        }
    }).catch((er) => {
        if (er) {
            return { error: 'invalid_code' };
        }
    });

}
//THIRD PARTY
async function sentStatusEstimateThird(ESTIMATE, access_token) {

    return await axios({
        method: 'post',
        url: process.env.ESTIMATE_STATUS_SENT + ESTIMATE['estimate_id'] + '/status/sent',
        headers: { 'Authorization': 'Zoho-oauthtoken ' + access_token },

    }).then(async (data) => {
        console.log('-------------------------4', data['data'])

        if (data && data != undefined) {
            return await data['data'];
        } else {
            return { error: 'invalid_code' };
        }
    }).catch((er) => {
        if (er) {
            return { error: 'invalid_code' };
        }
    });



}

//THIRD PARTY
async function getEstimateThird(setting, databaseEstimate, access_token) {

    return await axios({
        method: 'get',
        url: process.env.ESTIMATE_STATUS_SENT + databaseEstimate.est_id,
        headers: {
            'Authorization': 'Zoho-oauthtoken ' + access_token
        },
    }).then(async (data) => {
        if (data && data != undefined) {
            return await data['data'];
        } else {
            return { error: 'invalid_code' };
        }
    }).catch((er) => {
        if (er) {
            return { error: 'invalid_code' };
        }
    });

}

async function estimateUrlUpdate(req) {
    let findQuery = {
        _id: mongoose.Types.ObjectId(req.params.id),
        est_is_deleted: false,
    };

    return await estimateDao.findOne(findQuery).then(async (data) => {
        if (data && data != null) {

            let updateObj = {
                est_proof_url: req.body.est_proof_url
            };

            if (data && data.est_proof_status == constants.PRFSTATUS.REJECT) {
                updateObj.est_proof_status = constants.PRFSTATUS.PENDING;
            }
            return await estimateDao.findOneAndUpdate(findQuery, { $set: updateObj }, { new: true }).then(async (updateData) => {
                if (updateData) {

                    let arrr = [];
                    arrr = req._usr_state_id && req._usr_state_id.length ? req._usr_state_id : [];
                    arrr = arrr.map(s => mongoose.Types.ObjectId(s));

                    let query = [{
                        $match: {
                            'usr_role': 'SALES',
                            'usr_state_id': { $in: arrr }
                        }
                    },
                    {
                        $group: {
                            _id: '_id',
                            tokens: {
                                $push: '$usr_device_token'
                            }
                        }
                    }];
                    let userTokens = await userDao.aggregate(query);

                    if (userTokens && userTokens.length) {

                        let msg = `${req._usr_name} has uploaded payment proof.`;
                        await sendNotification.sendNotification(userTokens[0].tokens || [], msg, process.env.appName, data);
                    }
                    return updateData;
                }
            }).catch((er) => {
                console.log('-----------er---------', er)

            });

        } else {
            return 1;
        }
    });
}



async function getInvoiceListById(req) {
    let setting = await settingDao.find({});
    if (setting && setting.length) {
        setting = setting[0];

        if (setting && setting.refresh_token != undefined) {
            if (setting && setting.access_token != undefined) {

                let invoicesData = await getInvoiceDetailOneThird(setting, setting.access_token, req.params.id);
                if (invoicesData && invoicesData.error && invoicesData.error == 'invalid_code') {

                    let findQuery = {
                        _id: mongoose.Types.ObjectId(setting._id),
                    };
                    let updateObj = {
                        access_token: 1
                    };
                    await settingDao.findOneAndUpdate(findQuery, { $unset: updateObj });
                    return await getInvoiceListByCustomerId(req);
                } else {
                    return invoicesData['invoice'];
                }


            } else {
                let accessData = await getAccessToken(setting, setting.refresh_token);
                console.log('-------------accessData--------', accessData);
                if (accessData && accessData.error && (accessData.error == 'invalid_code' || accessData.error == 'access_denied')) {
                    let findQuery = {
                        _id: mongoose.Types.ObjectId(setting._id),
                    };
                    let updateObj = {
                        refresh_token: 1
                    };
                    await settingDao.findOneAndUpdate(findQuery, { $unset: updateObj });

                    return await getInvoiceListByCustomerId(req);
                } else {
                    let findQuery = {
                        _id: mongoose.Types.ObjectId(setting._id),
                    };
                    let updateObj = {
                        access_token: accessData['access_token']
                    };
                    await settingDao.findOneAndUpdate(findQuery, { $set: updateObj });

                    return await getInvoiceListByCustomerId(req);
                }
            }
        } else {
            let refreshData = await getRefreshToken(setting);

            if (refreshData && refreshData.error && refreshData.error == 'invalid_code') {
                return 1;
            } else {
                let findQuery = {
                    _id: mongoose.Types.ObjectId(setting._id),
                };
                let updateObj = {
                    refresh_token: refreshData['refresh_token']
                };
                await settingDao.findOneAndUpdate(findQuery, { $set: updateObj });

                return await getInvoiceListByCustomerId(req);

            }



        }
    }
}


async function getInvoiceListByCustomerId(req) {

    let setting = await settingDao.find({});
    if (setting && setting.length) {
        setting = setting[0];

        if (setting && setting.refresh_token != undefined) {
            if (setting && setting.access_token != undefined) {

                let invoicesData = await getInvoicesListThird(setting, setting.access_token, req.params.id);
                if (invoicesData && invoicesData.error && invoicesData.error == 'invalid_code') {

                    let findQuery = {
                        _id: mongoose.Types.ObjectId(setting._id)
                    };
                    let updateObj = {
                        access_token: 1
                    };
                    await settingDao.findOneAndUpdate(findQuery, { $unset: updateObj });
                    return await getInvoiceListByCustomerId(req);
                } else {
                    return invoicesData['invoices'];
                }


            } else {
                let accessData = await getAccessToken(setting, setting.refresh_token);
                console.log('-------------accessData--------', accessData);
                if (accessData && accessData.error && (accessData.error == 'invalid_code' || accessData.error == 'access_denied')) {
                    let findQuery = {
                        _id: mongoose.Types.ObjectId(setting._id),
                    };
                    let updateObj = {
                        refresh_token: 1
                    };
                    await settingDao.findOneAndUpdate(findQuery, { $unset: updateObj });

                    return await getInvoiceListByCustomerId(req);
                } else {
                    let findQuery = {
                        _id: mongoose.Types.ObjectId(setting._id),
                    };
                    let updateObj = {
                        access_token: accessData['access_token']
                    };
                    await settingDao.findOneAndUpdate(findQuery, { $set: updateObj });

                    return await getInvoiceListByCustomerId(req);
                }
            }
        } else {
            let refreshData = await getRefreshToken(setting);

            if (refreshData && refreshData.error && refreshData.error == 'invalid_code') {
                return 1;
            } else {
                let findQuery = {
                    _id: mongoose.Types.ObjectId(setting._id),
                };
                let updateObj = {
                    refresh_token: refreshData['refresh_token']
                };
                await settingDao.findOneAndUpdate(findQuery, { $set: updateObj });

                return await getInvoiceListByCustomerId(req);

            }



        }
    }
}

//THIRD PARTY
async function getInvoicesListThird(setting, access_token, CUSTOMER_ID) {

    return await axios({
        method: 'get',
        url: process.env.INVOICE_LIST_BY_CUSTOMER + setting.organization_id + '&customer_id=' + CUSTOMER_ID,
        headers: { 'Authorization': 'Zoho-oauthtoken ' + access_token },
    }).then(async (data) => {
        if (data && data != undefined) {

            let resData = await data['data'];
            if (resData && resData['invoices'] && resData['invoices'] != undefined) {
                return resData;
            } else {
                return { error: 'invalid_code' };
            }
            // return ;
        } else {
            return { error: 'invalid_code' };
        }
    }).catch((er) => {
        if (er) {
            return { error: 'invalid_code' };
        }
    });



}


//THIRD PARTY
async function getInvoiceDetailOneThird(setting, access_token, INVOICE_ID) {

    return await axios({
        method: 'get',
        url: process.env.INVOICE_BY_ID + INVOICE_ID + '?organization_id=' + setting.organization_id,
        headers: { 'Authorization': 'Zoho-oauthtoken ' + access_token },
    }).then(async (data) => {
        if (data && data != undefined) {

            let resData = await data['data'];
            if (resData && resData['invoice'] && resData['invoice'] != undefined) {
                return resData;
            } else {
                return { error: 'invalid_code' };
            }
            // return ;
        } else {
            return { error: 'invalid_code' };
        }
    }).catch((er) => {
        if (er) {
            return { error: 'invalid_code' };
        }
    });



}

async function listEstimatesPendingCount(req) {

    let que = {};
    if (req._id && req._id != undefined && req._id != null && req._id != '') {

      let  states = await userDao.findOne({ _id: mongoose.Types.ObjectId(req._id) });

        states = await states.usr_state_id && states.usr_state_id != undefined && states.usr_state_id.length ? states.usr_state_id : [];

        states = await states.map(s => mongoose.Types.ObjectId(s));

        que['userDetail.usr_state_id'] = { $in: states };
    }

    let agQuery = [{$match:{ est_proof_status: constants.PRFSTATUS.PENDING }},{
        $lookup: {
            from: 'test_users',
            localField: 'customer_id',
            foreignField: 'usr_customer_id',
            as: 'userDetail'
        }
    }, { $unwind: '$userDetail' }, {
        $match: que
    }];

    let a = await estimateDao.aggregate(agQuery);

    if (a.length) {
        return a.length;
    } else {
        return 0;
    }

}


module.exports = {
    estimateCreate,
    estimateDeleteById,
    getEstimateDetailById,
    estimateList,
    estimateStatusUpdate,
    estimateUrlUpdate,
    getInvoiceListById,
    getInvoiceListByCustomerId,
    estimateEdit,
    listEstimatesPendingCount,
}
