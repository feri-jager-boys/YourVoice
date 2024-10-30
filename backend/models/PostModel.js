var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PostSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    author: { 
        type: Schema.Types.ObjectId, 
        ref: 'user', 
        required: false },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    numComments: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('posts', PostSchema);