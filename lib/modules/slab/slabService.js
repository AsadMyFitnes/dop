
const mongoose = require("mongoose");
const constants = require('../../constants');
const slabModel = require('./slabModel')
const slabMaster = mongoose.model(constants.DB_MODEL_REF_NEW.SLAB, slabModel.SlabSchema);

let dao = require('../../dao/BaseDao');
const slabDao = new dao(slabMaster);


async function slabCreate(req) {
    if (req._usr_role == constants.ACCOUNT_TYPE.ADMIN) {
        return await slabDao.save(req.body);
    } else {
        return 1;
    }
}


async function slabEdit(req) {
    let findQuery = {
        _id: mongoose.Types.ObjectId(req.params.id),
        slb_is_deleted: false,
    };

    return await slabDao.findOne(findQuery).then(async (data) => {
        if (data && data != null) {
            if (req._usr_role == constants.ACCOUNT_TYPE.ADMIN) {

                return await slabDao.findOneAndUpdate(findQuery, { $set: req.body }, { new: true }).then(async (data) => {
                    if (data) {
                        return data;
                    }
                });

            } else {
                return 2;
            }

        } else {
            return 1;
        }
    });
}

async function slabDeleteById(req) {
    let findQuery = {
        _id: mongoose.Types.ObjectId(req.params.id),
        slb_is_deleted: false,
    };

    return await slabDao.findOne(findQuery).then(async (data) => {
        if (data && data != null) {

            let updateObj = {
                slb_is_deleted: true
            }
            return await slabDao.findOneAndUpdate(findQuery, { $set: updateObj });

        } else {
            return 1;
        }
    });
}


async function getSlabDetailById(req) {
    let findQuery = {
        _id: mongoose.Types.ObjectId(req.params.id),
        slb_is_deleted: false,
    };

    return await slabDao.findOne(findQuery).then(async (data) => {
        if (data && data != null) {
            return data
        } else {
            return 1;
        }
    });
}

async function slabList(req) {

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
        slb_is_deleted: false
    };

    let custoQuery = [{
        $match: query
    }, {
        $skip: option['skip']
    }, {
        $limit: option['limit']
    }, {
        $sort: {
            slb_created_at: -1
        }
    }];


    return await slabDao.aggregate(custoQuery).then(async (data) => {
        if (data) {
            return data;
        }
    });
}



module.exports = {
    slabCreate,
    slabEdit,
    slabDeleteById,
    getSlabDetailById,
    slabList
}
