const slabRoutr = require("express").Router();
const validators = require('./slabValidator');
const slabFacade = require('./slabFacade');
const resHndlr = require("../../handlers/responseHandler");
const jwtHandler = require('../../handlers/jwtHandler');


//@params

slabRoutr.route('/create')
  .post([jwtHandler.verifyUsrToken,validators.validateCreateData], (req, res) => {
    slabFacade.slabCreate(req, res).then((result) => {
      resHndlr.sendSuccess(res, result)
    }).catch((err) => {
      resHndlr.sendError(res, err)
    })
  })

slabRoutr.route('/list')
.post([jwtHandler.verifyUsrToken], (req, res) => {
  slabFacade.slabList(req, res).then((result) => {
    resHndlr.sendSuccess(res, result)
  }).catch((err) => {
    resHndlr.sendError(res, err)
  })
})

slabRoutr.route('/detail/:id').get([jwtHandler.verifyUsrToken,validators.validateId], (req, res) => {

  slabFacade.getSlabDetailById(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})


slabRoutr.route('/delete/:id').delete([jwtHandler.verifyUsrToken,validators.validateId], (req, res) => {

  slabFacade.slabDeleteById(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})



slabRoutr.route('/edit/:id')
.post([jwtHandler.verifyUsrToken,validators.validateId], (req, res) => {
  slabFacade.slabEdit(req, res).then((result) => {
    resHndlr.sendSuccess(res, result)
  }).catch((err) => {
    resHndlr.sendError(res, err)
  })
})


  module.exports = slabRoutr


