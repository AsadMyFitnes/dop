const usrRouter = require('../modules/user/userRoute');
//========================== Load Modules End ==============================================

const itemRouter = require('../modules/item/itemRoute');
const slabRouter = require('../modules/slab/slabRoute');
const estimateRouter= require('../modules/estimate/estimateRoute');

module.exports = function (app) {
    app.get('/', (req, res) => {
        res.sendStatus(200);
    })
    app.use('/api/user', usrRouter);  
    app.use('/api/item', itemRouter);  
    app.use('/api/slab', slabRouter);  
    app.use('/api/estimate', estimateRouter);  

}  
