var mongoose = require('mongoose');

var PollOptionSchema = new mongoose.Schema({
    text: {type: String, required: true},
    votes: {type: Number, default: 0},
});

var PollSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [PollOptionSchema],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: false },
    votedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Poll', PollSchema);