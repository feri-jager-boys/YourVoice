const express = require('express');
const PollControler = require('../controllers/PollControler');

const router = express.Router();

router.post('/', PollControler.add);
router.get('/list/:postId', PollControler.list);
router.put('/:pollId/vote', PollControler.vote);


module.exports = router;