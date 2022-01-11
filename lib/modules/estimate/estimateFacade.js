

const estimateService = require('./estimateService');
const resHandlr = require('../../handlers/responseHandler');
const constants = require('../../constants');
const estimateMsg = require('./estimateConstants');


function estimateCreate(req) {
  return estimateService.estimateCreate(req).then((data) => {
    if (data == 1) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.issueWithZohoCode, {});
    } else {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, estimateMsg.MESSAGES.createEstimateSuccess, data);

    }
  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}


function estimateEdit(req) {
  return estimateService.estimateEdit(req).then((data) => {
    if (data == 1) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.estimateNotFound, {});
    }else if (data == 2){
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.issueWithZohoCode, {});

    } else {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, estimateMsg.MESSAGES.estimateEditSuccess, data);
    }
  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}

function estimateStatusUpdate(req) {
  return estimateService.estimateStatusUpdate(req).then((data) => {
    if (data == 1) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.estimateNotFound, {});
    } else if (data == 2) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.onlySalescanCreate, {});
    } 
    else {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, estimateMsg.MESSAGES.estimateStatusUpdateSuccess, data);
    }
  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}
function estimateUrlUpdate(req) {
  return estimateService.estimateUrlUpdate(req).then((data) => {
    if (data == 1) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.estimateNotFound, {});
    }
    else {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, estimateMsg.MESSAGES.estimateUrlUpdateSuccess, data);
    }
  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}


function estimateDeleteById(req) {
  return estimateService.estimateDeleteById(req).then((data) => {
    if (data == 1) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.estimateNotFound, {});
    } else {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, estimateMsg.MESSAGES.estimateDeleteSuccess, data)
    }
  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}


function getEstimateDetailById(req) {
  return estimateService.getEstimateDetailById(req).then((data) => {
    if (data == 1) {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.estimateNotFound, {});
    } else {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, estimateMsg.MESSAGES.estimateGetSuccess, data)
    }

  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}


function estimateList(req) {
  return estimateService.estimateList(req).then((data) => {
    if (data && data != null) {

      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, estimateMsg.MESSAGES.estimateListSuccess, data);

    } else {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.issueWithlist, []);
    }

  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, [])
  })
}




function getInvoiceListById(req) {
  return estimateService.getInvoiceListById(req).then((data) => {
    if (data && data != undefined ) {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, estimateMsg.MESSAGES.invoiceGetSuccess, data)
    } else {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, estimateMsg.MESSAGES.invoiceNotFound, {});
    }

  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}


function getInvoiceListByCustomerId(req) {
  return estimateService.getInvoiceListByCustomerId(req).then((data) => {
    if (data && data != undefined ) {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, estimateMsg.MESSAGES.invoiceListByCustomerSuccess, data)
    } else {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, estimateMsg.MESSAGES.invoiceListNotFound, {});
    }

  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}

function listEstimatesPendingCount(req) {
  return estimateService.listEstimatesPendingCount(req).then((data) => {
    if (data && data != undefined ) {
      return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, estimateMsg.MESSAGES.countGetSuccess, {count:data})
    } else {
      return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, estimateMsg.MESSAGES.countGeterr, {});
    }

  }).catch((error) => {
    return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
  })
}


module.exports = {
  estimateCreate,
  estimateStatusUpdate,
  estimateDeleteById,
  getEstimateDetailById,
  estimateList,
  estimateUrlUpdate,
  getInvoiceListById,
  getInvoiceListByCustomerId,
  estimateEdit,
  listEstimatesPendingCount
}
