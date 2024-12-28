var express = require('express');
var router = express.Router();
var ForumController = require('../controllers/ForumsController.js');

function requiresLogin(req, res, next){
    if(req.session && req.session.userId){
        return next();
    } else{
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        return next(err);
    }
}

router.get('/', ForumController.list);

router.get('/tags/:id', ForumController.getTagsByForum);

router.get('/:id', ForumController.show);

router.post('/', ForumController.create);

router.put('/:id', ForumController.update);

router.delete('/:id', ForumController.remove);

module.exports = router;
