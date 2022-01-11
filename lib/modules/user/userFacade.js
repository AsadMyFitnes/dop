

const userService = require('./userService');
const resHandlr = require('../../handlers/responseHandler');
const constants = require('../../constants');
const userMsg = require('./userConstants');


function signIn(req) {
    return userService.signIn(req).then((data) => {
        if (data == 1) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.userNotFound, {});
        } else if (data == 2) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.passwordMismatch, {});
        } else {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.signInSuccess, data)
        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })
}

function signUp(req) {
    return userService.signUp(req).then((data) => {
        if (data == 1) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.userAlreadyExist, {});
        } else {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.OTPSendedSuccess, data);

        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })
}


function signout(req) {
    return userService.signout(req).then((result) => {
        if (result == 1) {
            return resHandlr.requestResponse(constants.http_code.dataNotFound, constants.MESSAGES.statusFalse, constants.MESSAGES.dataNotFound, {})
        } else {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, constants.MESSAGES.logoutSuccessfully, {})
        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })
}

function create(req) {
    return userService.create(req).then((data) => {
        if (data == 1) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.userAlreadyExist, {});
        }else  if (data == 2) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.onlySalescanCreate, {});
        } else  if (data == 3) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.issuewithMSGSend, {});
        }else {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.createCustomerSuccess, data);

        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })
}

// 

function list(req) {
    return userService.list(req).then((data) => {
        if (data && data != null) {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.customerListSuccess, data);
        } else {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.issueWithlist,[]);
        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })
}



function getDetailById(req) {
    return userService.getDetailById(req).then((data) => {
        if (data == 1) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, userMsg.MESSAGES.custoNotFound, {});
        } else {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.getCustorByIdSuccess, data)
        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })

}

function deleteById(req) {
    return userService.deleteById(req).then((data) => {
        if (data == 1) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, userMsg.MESSAGES.custoNotFound, {});
        } else {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.deleteCustorByIdSuccess, data)
        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })

}


function edit(req){
    return userService.edit(req).then((data) => {
        if (data == 1) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, userMsg.MESSAGES.custoNotFound, {});
        } else if(data == 2) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.userAlreadyExist, {});
        }else{
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.updateCustorByIdSuccess, data);
        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })
}


function uploadData(req) {
    return userService.uploadData(req).then((data) => {
        if (data == 3) {
            return resHandlr.requestResponse(constants.http_code.dataNotFound, constants.MESSAGES.statusFalse, userMsg.MESSAGES.fileNotFound, {})
        } else if (data === 2) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, userMsg.MESSAGES.inValidType, {})
        } else if (data === 1) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, userMsg.MESSAGES.uploadErr, {})
        } else {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.uploadSuccess, data)
        }
    }).catch((er) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, userMsg.MESSAGES.uploadErr, {})
    })
}




function dashboardDetail(req) {
    return userService.dashboardDetail(req).then((data) => {
        if (data) {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.dashboardGetSuccess, data)
        } else {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, userMsg.MESSAGES.dashboardissue, {});
        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })

}


function forgotPassword(req) {
    return userService.forgotPassword(req).then((data) => {
        if (data == 1) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.userNotFound, {});
        }else  if (data == 2) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.issuewithMSGSend, {});
        }  else {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.forgotPassSuccess, data);

        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })

}
// 



function stateList(req) {
    return userService.stateList(req).then((data) => {
        if (data && data != null) {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.stateListSuccess, data);
        } else {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.issueWithlist,[]);
        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, [])
    })
}

// 

function saleCreate(req) {
    return userService.saleCreate(req).then((data) => {
        if (data == 1) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.userAlreadyPhoneExist, {});
        }else  if (data == 2) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.onlyAdmincanCreate, {});
        } else  if (data == 3) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.issuewithMSGSend, {});
        } else {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.createSalesSuccess, data);

        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })
}

function salesEdit(req){
    return userService.salesEdit(req).then((data) => {
        if (data == 1) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, userMsg.MESSAGES.salesNotFound, {});
        } else if(data == 2) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.userAlreadyPhoneExist, {});
        }else{
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.updateSalesByIdSuccess, data);
        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })
}




function getSalesDetailById(req) {
    return userService.getSalesDetailById(req).then((data) => {
        if (data == 1) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, userMsg.MESSAGES.salesNotFound, {});
        } else {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.getSalesByIdSuccess, data)
        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })

}

function deleteSalesById(req) {
    return userService.deleteSalesById(req).then((data) => {
        if (data == 1) {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, userMsg.MESSAGES.salesNotFound, {});
        } else {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.deleteSalesByIdSuccess, data)
        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })

}




function salesList(req) {
    return userService.salesList(req).then((data) => {
        if (data && data != null) {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.salesListSuccess, data);
        } else {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.issueWithlist,[]);
        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })
}




function salesDashboardDetail(req) {
    return userService.salesDashboardDetail(req).then((data) => {
        if (data) {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.dashboardGetSuccess, data)
        } else {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, userMsg.MESSAGES.dashboardissue, {});
        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })

}

// 
function userDashboardDetail(req) {
    return userService.userDashboardDetail(req).then((data) => {
        if (data) {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.dashboardGetSuccess, data)
        } else {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, userMsg.MESSAGES.dashboardissue, {});
        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })

}

function reportsDetail(req) {
    return userService.reportsDetail(req).then((data) => {
        if (data) {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.reportsGetSuccess, data)
        } else {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, userMsg.MESSAGES.reportsissue, {});
        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })

}
function estimateReports(req) {
    return userService.estimateReports(req).then((data) => {
        if (data) {
            return resHandlr.requestResponse(constants.http_code.ok, constants.MESSAGES.statusTrue, userMsg.MESSAGES.reportsGetSuccess, data)
        } else {
            return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, userMsg.MESSAGES.reportsissue, {});
        }
    }).catch((error) => {
        return resHandlr.requestResponse(constants.http_code.badRequest, constants.MESSAGES.statusFalse, constants.MESSAGES.InternalServerError, {})
    })

}

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
