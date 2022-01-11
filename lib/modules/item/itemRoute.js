const itemRoutr = require("express").Router();
const validators = require('./itemValidator');
const itemFacade = require('./itemFacade');
const resHndlr = require("../../handlers/responseHandler");
const jwtHandler = require('../../handlers/jwtHandler');


//@params

itemRoutr.route('/create')
  .post([jwtHandler.verifyUsrToken,validators.validateCreateData], (req, res) => {
    itemFacade.itemCreate(req, res).then((result) => {
      resHndlr.sendSuccess(res, result)
    }).catch((err) => {
      resHndlr.sendError(res, err)
    })
  })

itemRoutr.route('/listServer')
.post([jwtHandler.verifyUsrToken], (req, res) => {
  itemFacade.itemServerList(req, res).then((result) => {
    resHndlr.sendSuccess(res, result)
  }).catch((err) => {
    resHndlr.sendError(res, err)
  })
})

itemRoutr.route('/detail/:id').get([jwtHandler.verifyUsrToken,validators.validateId], (req, res) => {

  itemFacade.getItemDetailById(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})


itemRoutr.route('/delete/:id').delete([jwtHandler.verifyUsrToken,validators.validateId], (req, res) => {

  itemFacade.itemDeleteById(req, res).then(result => {
    resHndlr.sendSuccess(res, result)
  }).catch(err => {
    resHndlr.sendError(res, err)
  })
})



itemRoutr.route('/edit/:id')
.post([jwtHandler.verifyUsrToken,validators.validateId], (req, res) => {
  itemFacade.itemEdit(req, res).then((result) => {
    resHndlr.sendSuccess(res, result)
  }).catch((err) => {
    resHndlr.sendError(res, err)
  })
})



// Third Party
itemRoutr.route('/list')
.post([jwtHandler.verifyUsrToken], (req, res) => {
  itemFacade.itemList(req, res).then((result) => {
    resHndlr.sendSuccess(res, result)
  }).catch((err) => {
    resHndlr.sendError(res, err)
  })
})


// Third Party
itemRoutr.route('/settings')
.post([jwtHandler.verifyUsrToken], (req, res) => {
  itemFacade.settings(req, res).then((result) => {
    resHndlr.sendSuccess(res, result)
  }).catch((err) => {
    resHndlr.sendError(res, err)
  })
})
// Third Party
itemRoutr.route('/settings')
.get([jwtHandler.verifyUsrToken], (req, res) => {
  itemFacade.getSettings(req, res).then((result) => {
    resHndlr.sendSuccess(res, result)
  }).catch((err) => {
    resHndlr.sendError(res, err)
  })
})

  module.exports = itemRoutr


