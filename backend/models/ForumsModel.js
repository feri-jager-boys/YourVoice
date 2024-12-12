var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ForumSchema = new Schema({
    title: { type: String, required: true },
    adminId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('forums', ForumSchema);
