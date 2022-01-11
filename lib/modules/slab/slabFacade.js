

const slabService = require('./slabService');
const resHandlr = require('../../handlers/responseHandler');
const constants = require('../../constants');
const slabMsg = require('./slabConstants');


function slabCreate(req) {
  return slabService.slabCreate(req).then((data) => {
    if (data == 1) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.onlyAdmincanCreate, {});
    } else {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, slabMsg.MESSAGES.createSlabSuccess, data);

    }
  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}


function slabEdit(req) {
  return slabService.slabEdit(req).then((data) => {
    if (data == 1) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.slabNotFound, {});
    } else if (data == 2) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.onlyAdmincanCreate, {});
    } else {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, slabMsg.MESSAGES.slabEditSuccess, data);
    }
  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}


function slabDeleteById(req) {
  return slabService.slabDeleteById(req).then((data) => {
    if (data == 1) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.slabNotFound, {});
    } else {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, slabMsg.MESSAGES.slabDeleteSuccess, data)
    }
  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}


function getSlabDetailById(req) {
  return slabService.getSlabDetailById(req).then((data) => {
    if (data == 1) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.slabNotFound, {});
    } else {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, slabMsg.MESSAGES.slabGetSuccess, data)
    }

  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}


function slabList(req) {
  return slabService.slabList(req).then((data) => {
    if (data && data != null) {

      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, slabMsg.MESSAGES.slabListSuccess, data);

    } else {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.issueWithlist, {});
    }

  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}


module.exports = {
  slabCreate,
  slabEdit,
  slabDeleteById,
  getSlabDetailById,
  slabList
}