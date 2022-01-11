const estimateRoutr = require("express").Router();
const validators = require('./estimateValidator');
const estimateFacade = require('./estimateFacade');
const resHndlr = require("../../handlers/responseHandler");
const jwtHandler = require('../../handlers/jwtHandler');


//@params

estimateRoutr.route('/create')
  .post([jwtHandler.verifyUsrToken, validators.validateCreateData], (req, res) => {
    estimateFacade.estimateCreate(req, res).then((result) => {
      resHndlr.sendSuccess(res, result)
    }).catch((err) => {
      resHndlr.sendError(res, err)
    })
  })
estimateRoutr.route('/edit/:id')
  .put([jwtHandler.verifyUsrToken], (req, res) => {
    estimateFacade.estimateEdit(req, res).then((result) => {
      resHndlr.sendSuccess(res, result)
    }).catch((err) => {
      resHndlr.sendError(res, err)
    })
  })
estimateRoutr.route('/list')
  .post([jwtHandler.verifyUsrToken], (req, res) => {
    estimateFacade.estimateList(req, res).then((result) => {
      resHndlr.sendSuccess(res, result)
    }).catch((err) => {
      resHndlr.sendError(res, err)
    })
  })

estimateRoutr.route('/detail/:id').get([jwtHandler.verifyUsrToken, validators.validateId], (req, res) => {

  estimateFacade.getEstimateDetailById(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})


estimateRoutr.route('/delete/:id').delete([jwtHandler.verifyUsrToken, validators.validateId], (req, res) => {

  estimateFacade.estimateDeleteById(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})



estimateRoutr.route('/updateStatus/:id')
  .post([jwtHandler.verifyUsrToken, validators.validateId, validators.validateUpdateData], (req, res) => {
    estimateFacade.estimateStatusUpdate(req, res).then((result) => {
      resHndlr.sendSuccess(res, result)
    }).catch((err) => {
      resHndlr.sendError(res, err)
    })
  })

estimateRoutr.route('/updateUrl/:id')
  .post([jwtHandler.verifyUsrToken, validators.validateId, validators.validateUpdateURLData], (req, res) => {
    estimateFacade.estimateUrlUpdate(req, res).then((result) => {
      resHndlr.sendSuccess(res, result)
    }).catch((err) => {
      resHndlr.sendError(res, err)
    })
  })


estimateRoutr.route('/listInvoice/:id').get([jwtHandler.verifyUsrToken], (req, res) => {

  estimateFacade.getInvoiceListById(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})
// jwtHandler.verifyUsrToken
estimateRoutr.route('/listInvoiceCustomer/:id').get([], (req, res) => {

  estimateFacade.getInvoiceListByCustomerId(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})


estimateRoutr.route('/listEstimatesPendingCount').get([jwtHandler.verifyUsrToken], (req, res) => {

  estimateFacade.listEstimatesPendingCount(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})

module.exports = estimateRoutr


