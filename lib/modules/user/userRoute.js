const usrRoutr = require("express").Router();
const validators = require('./userValidator');
const usrFacade = require('./userFacade');
const resHndlr = require("../../handlers/responseHandler");
const jwtHandler = require('../../handlers/jwtHandler');


//@params
// usr_phone_number
// usr_password

usrRoutr.route('/signIn')
  .post([validators.validateSignInData], (req, res) => {
    usrFacade.signIn(req, res).then((result) => {
      resHndlr.sendSuccess(res, result)
    }).catch((err) => {
      resHndlr.sendError(res, err)
    })
  })
  

  //@params
// token in header

usrRoutr.route('/signout')
.get([jwtHandler.verifyUsrToken], (req, res) => {
  usrFacade.signout(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})

//@params
// usr_name
// usr_business_name
// usr_phone_number
// usr_customer_id

usrRoutr.route('/customerCreate')
  .post([jwtHandler.verifyUsrToken,validators.validateCreateData], (req, res) => {
    usrFacade.create(req, res).then((result) => {
      resHndlr.sendSuccess(res, result)
    }).catch((err) => {
      resHndlr.sendError(res, err)
    })
  })



usrRoutr.route('/customerList')
.post([jwtHandler.verifyUsrToken], (req, res) => {
  usrFacade.list(req, res).then((result) => {
    resHndlr.sendSuccess(res, result)
  }).catch((err) => {
    resHndlr.sendError(res, err)
  })
})


usrRoutr.route('/customerDetail/:id').get([jwtHandler.verifyUsrToken,validators.validateId], (req, res) => {

  usrFacade.getDetailById(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})


usrRoutr.route('/customerDelete/:id').delete([jwtHandler.verifyUsrToken,validators.validateId], (req, res) => {

  usrFacade.deleteById(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})



usrRoutr.route('/customerEdit/:id')
.post([jwtHandler.verifyUsrToken,validators.validateId,validators.validateEditData], (req, res) => {
  usrFacade.edit(req, res).then((result) => {
    resHndlr.sendSuccess(res, result)
  }).catch((err) => {
    resHndlr.sendError(res, err)
  })
})


usrRoutr.route('/uploadData')
  .post([], (req, res) => {
    usrFacade.uploadData(req, res).then((result) => {
      resHndlr.sendSuccess(res, result)
    }).catch((err) => {
      resHndlr.sendError(res, err)
    })
  })
  
  // 
usrRoutr.route('/dashboard')
.get([jwtHandler.verifyUsrToken], (req, res) => {
  usrFacade.dashboardDetail(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})

usrRoutr.route('/forgotPassword')
.post([validators.validateForgotData], (req, res) => {
  usrFacade.forgotPassword(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})

usrRoutr.route('/stateList')
.get([], (req, res) => {
  usrFacade.stateList(req, res).then((result) => {
    resHndlr.sendSuccess(res, result)
  }).catch((err) => {
    resHndlr.sendError(res, err)
  })
})

usrRoutr.route('/saleCreate')
.post([jwtHandler.verifyUsrToken,validators.validateCreateSalesData], (req, res) => {
  usrFacade.saleCreate(req, res).then((result) => {
    resHndlr.sendSuccess(res, result)
  }).catch((err) => {
    resHndlr.sendError(res, err)
  })
})
usrRoutr.route('/salesEdit/:id')
.post([jwtHandler.verifyUsrToken,validators.validateId], (req, res) => {
  usrFacade.salesEdit(req, res).then((result) => {
    resHndlr.sendSuccess(res, result)
  }).catch((err) => {
    resHndlr.sendError(res, err)
  })
})

usrRoutr.route('/salesDetail/:id').get([jwtHandler.verifyUsrToken,validators.validateId], (req, res) => {

  usrFacade.getSalesDetailById(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})

usrRoutr.route('/salesDelete/:id').delete([jwtHandler.verifyUsrToken,validators.validateId], (req, res) => {

  usrFacade.deleteSalesById(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})


usrRoutr.route('/salesList')
.post([jwtHandler.verifyUsrToken], (req, res) => {
  usrFacade.salesList(req, res).then((result) => {
    resHndlr.sendSuccess(res, result)
  }).catch((err) => {
    resHndlr.sendError(res, err)
  })
})

usrRoutr.route('/salesDashboard')
.get([jwtHandler.verifyUsrToken], (req, res) => {
  usrFacade.salesDashboardDetail(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})
usrRoutr.route('/userDashboard')
.get([jwtHandler.verifyUsrToken], (req, res) => {
  usrFacade.userDashboardDetail(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})
usrRoutr.route('/reports')
.post([jwtHandler.verifyUsrToken], (req, res) => {
  usrFacade.reportsDetail(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})



usrRoutr.route('/estimateReports')
.post([jwtHandler.verifyUsrToken], (req, res) => {
  usrFacade.estimateReports(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})

  module.exports = usrRoutr