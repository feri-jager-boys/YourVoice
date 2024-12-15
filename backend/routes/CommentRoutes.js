var express = require('express');
var router = express.Router();
var CommentController = require('../controllers/CommentController.js');

router.post('/', CommentController.add);

router.delete('/:id', CommentController.remove);

router.put('/upvote/:id', CommentController.upvote);
router.put('/downvote/:id', CommentController.downvote);

module.exports = router;
