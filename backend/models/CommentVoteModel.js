var mongoose = require('mongoose');
const CommentVoteTypes = require("./CommentVoteTypes");
var Schema = mongoose.Schema;

var CommentVoteSchema = new Schema({
    commentId: {
        type: Schema.Types.ObjectId,
        ref: 'comments',
        required: true },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true },
    type: {
        type: Number,
        enum: Object.values(CommentVoteTypes),
        required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('comment-votes', CommentVoteSchema);
