
const mongoose = require("mongoose");
const constants = require('../../constants');
const itemModel = require('./itemModel')
const itemMaster = mongoose.model(constants.DB_MODEL_REF_NEW.ITEMS, itemModel.ItemSchema);
const axios = require('axios')
const qs = require('qs')

let dao = require('../../dao/BaseDao');
const itemDao = new dao(itemMaster);

const masterSettingsModel = require('./masterSettingsModel')
const settingMaster = mongoose.model(constants.DB_MODEL_REF_NEW.MASTERs, masterSettingsModel.masterSettingsSchema);

const settingDao = new dao(settingMaster);
const sendNotification = require('../../utils/sendNotification');

async function itemCreate(req) {

  let { items } = req.body;

  if (items && items.length > 0) {
    if (req._usr_role == constants.ACCOUNT_TYPE.ADMIN) {

      let idArray = items.map((x) => {
        return x.itm_id;
      });

      let alreadExist = await itemDao.find({ itm_id: { $in: idArray },itm_is_deleted:false });

      if (alreadExist && alreadExist.length) {
        return 3;
      } else {
        let itemsInserted = await itemInsert(items);
        return await itemsInserted;
      }
    } else {
      return 2;
    }
  } else {
    return 1;

  }
}

async function itemInsert(req) {
  return new Promise((resolve, reject) => {
    let tempAry = [];
    req.map(async (x, j) => {
      let inserted = await itemDao.save(x);
      if (inserted) {
        tempAry.push(inserted);
      }
      if (tempAry.length == req.length) {
        resolve(tempAry);
      }
    })
  })

}

async function itemEdit(req) {
  let findQuery = {
    _id: mongoose.Types.ObjectId(req.params.id),
    itm_is_deleted: false,
  };

  return await itemDao.findOne(findQuery).then(async (data) => {
    if (data && data != null) {
      let updateObj = {};

      if (req.body.itm_name && req.body.itm_name != null && req.body.itm_name != '') {
        updateObj.itm_name = req.body.itm_name;
      }



      if (req.body.itm_image_name && req.body.itm_image_name != null && req.body.itm_image_name != '') {
        updateObj.itm_image_name = req.body.itm_image_name;
      }
      if (req.body.itm_price && req.body.itm_price != null && req.body.itm_price != '') {
        updateObj.itm_price = req.body.itm_price;
      }
      // 
      if (req.body.itm_id && req.body.itm_id != null && req.body.itm_id != '') {
        updateObj.itm_id = req.body.itm_id;
      }
      if (req.body.itm_no_of_pack && req.body.itm_no_of_pack != null && req.body.itm_no_of_pack != '') {
        updateObj.itm_no_of_pack = req.body.itm_no_of_pack;
      }
      if (req._usr_role == constants.ACCOUNT_TYPE.ADMIN) {


        let idUniqueQuery = {
          $or: [
            { itm_id: req.body.itm_id }],
          _id: { $ne: mongoose.Types.ObjectId(req.params.id) }
        };

        let checkNameSymbol = await itemDao.findOne(idUniqueQuery);

        if (checkNameSymbol && checkNameSymbol != null) {
          return 3;
        }

        return await itemDao.findOneAndUpdate(findQuery, { $set: updateObj }, { new: true }).then(async (data) => {
          if (data) {
            return data;
          }
        });

      } else {
        return 2
      }



    } else {
      return 1;
    }
  });
}

async function itemDeleteById(req) {
  let findQuery = {
    _id: mongoose.Types.ObjectId(req.params.id),
    itm_is_deleted: false,
  };

  return await itemDao.findOne(findQuery).then(async (data) => {
    if (data && data != null) {

      let updateObj = {
        itm_is_deleted: true
      }
      return await itemDao.findOneAndUpdate(findQuery, { $set: updateObj });

    } else {
      return 1;
    }
  });
}


async function getItemDetailById(req) {
  let findQuery = {
    _id: mongoose.Types.ObjectId(req.params.id),
    itm_is_deleted: false,
  };

  return await itemDao.findOne(findQuery).then(async (data) => {
    if (data && data != null) {
      return data
    } else {
      return 1;
    }
  });
}

async function itemServerList(req) {

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
    itm_is_deleted: false
  };

  if (req.body.itm_name && req.body.itm_name != '') {
    query['$and'] = [
      {
        'itm_name': {
          $regex: req.body.itm_name,
          $options: 'i'
        }
      }
    ];
  }

  let custoQuery = [{
    $match: query
  }, {
    $skip: option['skip']
  }, {
    $limit: option['limit']
  }, {
    $sort: {
      itm_created_at: -1
    }
  }];


  return await itemDao.aggregate(custoQuery).then(async (data) => {
    if (data) {
      return data;
    }
  });
}

async function itemList(req) {
  let setting = await settingDao.find({});
  if (setting && setting.length) {
    setting = setting[0];

    if (setting && setting.refresh_token != undefined) {
      if (setting && setting.access_token != undefined) {
        let itemsData = await getItemsListThird(setting, setting.access_token);
        if (itemsData && itemsData.error && itemsData.error == 'invalid_code') {

          let findQuery = {
            _id: mongoose.Types.ObjectId(setting._id),
          };
          let updateObj = {
            access_token: 1
          };
          await settingDao.findOneAndUpdate(findQuery, { $unset: updateObj });
          return await itemList('---');
        } else {
          return itemsData['items'];
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

          return await itemList('---');
        } else {
          let findQuery = {
            _id: mongoose.Types.ObjectId(setting._id),
          };
          let updateObj = {
            access_token: accessData['access_token']
          };
          await settingDao.findOneAndUpdate(findQuery, { $set: updateObj });

          return await itemList('---');
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

        return await itemList('---');

      }



    }
  }
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
async function getItemsListThird(setting, access_token) {

  return await axios({
    method: 'get',
    url: process.env.URL_ITEM_LIST + setting.organization_id,
    headers: { 'Authorization': 'Zoho-oauthtoken ' + access_token },
  }).then(async(data)=>{
    if(data && data!= undefined){
    return await data['data'];
  }else{
    return {error : 'invalid_code'};
  }
  }).catch((er)=>{
    if(er){
      return {error : 'invalid_code'};
    }
  });



}


async function settings(req) {
  let setting = await settingDao.find({});

  if (setting && setting.length) {
    setting = setting[0];
    // code 
    // client_id
    // client_secret
    // organization_id

    let findQuery = {
      _id: mongoose.Types.ObjectId(setting._id),
    };

    let updateObj = req.body;

    return await settingDao.findOneAndUpdate(findQuery, { $set: updateObj });

  }
}


async function getSettings(req) {
  let setting = await settingDao.find({});

  if (setting && setting.length) {
   return setting[0];
  }else{
    return {};
  }
}

// 
module.exports = {
  itemCreate,
  itemEdit,
  itemDeleteById,
  getItemDetailById,
  itemServerList,
  itemList,
  settings,
  getSettings

}