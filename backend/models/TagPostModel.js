const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TagPostSchema = new Schema({
  tagId: {
    type: Schema.Types.ObjectId,
    ref: 'tags',
    required: true },
  postId: {
    type: Schema.Types.ObjectId,
    ref: 'posts',
    required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('tag-post', TagPostSchema);
