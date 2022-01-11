

const itemService = require('./itemService');
const resHandlr = require('../../handlers/responseHandler');
const constants = require('../../constants');
const itemMsg = require('./itemConstants');


function itemCreate(req) {
  return itemService.itemCreate(req).then((data) => {
    if (data == 1) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, itemMsg.MESSAGES.enterAtleastOneItem, []);
    } else if (data == 2) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.onlyAdmincanCreate, []);
    } else if (data == 3) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, itemMsg.MESSAGES.idAlreadyExist, []);
    } else {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, itemMsg.MESSAGES.createItemSuccess, data);

    }
  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, [])
  })
}


function itemEdit(req) {
  return itemService.itemEdit(req).then((data) => {
    if (data == 1) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.itemNotFound, {});
    } else if (data == 2) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.onlyAdmincanCreate, {});
    } else if (data == 3) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, itemMsg.MESSAGES.idAlreadyExist, {});
    } else {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, itemMsg.MESSAGES.itemEditSuccess, data);
    }
  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}


function itemDeleteById(req) {
  return itemService.itemDeleteById(req).then((data) => {
    if (data == 1) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.itemNotFound, {});
    } else {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, itemMsg.MESSAGES.itemDeleteSuccess, data)
    }
  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}


function getItemDetailById(req) {
  return itemService.getItemDetailById(req).then((data) => {
    if (data == 1) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.itemNotFound, {});
    } else {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, itemMsg.MESSAGES.itemGetSuccess, data)
    }

  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}

function itemServerList(req) {
  return itemService.itemServerList(req).then((data) => {

    if (data && data != null) {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, itemMsg.MESSAGES.itemListSuccess, data);
    } else {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.issueWithlist, []);
    }

  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError,[])
  })
}

function itemList(req) {
  return itemService.itemList(req).then((data) => {
    if (data && data != null) {
      if (data && data == 1) {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.issueWithZohoCode,[]);
      } else {
        return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, itemMsg.MESSAGES.itemListSuccess, data);
      }
    } else {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.issueWithlist,[]);
    }

  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError,[])
  })
}



function settings(req) {
  return itemService.settings(req).then((data) => {
    if (data && data != null) {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, itemMsg.MESSAGES.settingsChangeSuccess, data);
    } else {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, itemMsg.MESSAGES.issueWithSettingChange, {});
    }

  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}



function getSettings(req) {
  return itemService.getSettings(req).then((data) => {
    if (data && data != null) {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, itemMsg.MESSAGES.settingsGetSuccess, data);
    } else {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, itemMsg.MESSAGES.issueWithSettingGet, {});
    }

  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}
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