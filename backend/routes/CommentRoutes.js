var express = require('express');
var router = express.Router();
var CommentController = require('../controllers/CommentController.js');

router.post('/', CommentController.add);

router.delete('/:id', CommentController.remove);

module.exports = router;
