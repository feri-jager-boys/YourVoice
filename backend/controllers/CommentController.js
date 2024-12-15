var CommentModel = require('../models/CommentModel');
var CommentVoteModel = require('../models/CommentVoteModel');
const CommentVoteTypes = require("../models/CommentVoteTypes");

/**
 * CommentController.js
 *
 *
 * @description :: Server-side logic for managing Comments.
 */

module.exports = {
    add: async function (req, res) {
        if (!req.body.content || !req.body.userId || !req.body.postId) {
            return res.status(400).json({
                message: 'Content, userId, postId are required',
            });
        }

        try {
            const newComment = new CommentModel({
                content: req.body.content,
                userId: req.body.userId,
                postId: req.body.postId,
                parentId: req.body.parentId,
            });

            const comment = await newComment.save();
            console.log('Saved Comment:', comment);

            return res.status(201).json({});
        } catch (err) {
            console.log('Error:', err.message || err);
            return res.status(500).json({
                message: 'Error when creating a new comment',
                error: err.message || err,
            });
        }
    },

    remove: async function (req, res) {
        const commentId = req.params.id;

        try {
            const comment = await CommentModel.findByIdAndRemove(commentId);

            if (!comment) {
                return res.status(404).json({
                    message: 'No such comment',
                });
            }

            return res.status(204).json({});
        } catch (err) {
            console.log('Error:', err.message || err);
            return res.status(500).json({
                message: 'Error when deleting a comment',
                error: err.message || err,
            });
        }
    },

    upvote: async function (req, res) {
        const commentId = req.params.id;
        const userId = req.body.userId;

        try {
            const existingVote = await CommentVoteModel.findOne({userId: userId, commentId: commentId});

            if (existingVote) {
                if (existingVote.type === CommentVoteTypes.UPVOTE) {
                    return res.status(404).json({
                        message: 'Already voted',
                    });
                }

                await CommentVoteModel.findByIdAndUpdate(
                    existingVote._id,
                    { type: CommentVoteTypes.UPVOTE });

                return res.status(204).json({});
            }

            await CommentVoteModel.create({
                commentId: commentId,
                userId: userId,
                type: CommentVoteTypes.UPVOTE,
            });

            return res.status(204).json({});
        } catch (err) {
            console.log('Error:', err.message || err);
            return res.status(500).json({
                message: 'Error when upvoting a comment',
                error: err.message || err,
            });
        }
    },

    downvote: async function (req, res) {
        const commentId = req.params.id;
        const userId = req.body.userId;

        try {
            const existingVote = await CommentVoteModel.findOne({userId: userId, commentId: commentId});

            if (existingVote) {
                if (existingVote.type === CommentVoteTypes.DOWNVOTE) {
                    return res.status(404).json({
                        message: 'Already voted',
                    });
                }

                await CommentVoteModel.findByIdAndUpdate(
                    existingVote._id,
                    { type: CommentVoteTypes.DOWNVOTE });

                return res.status(204).json({});
            }

            await CommentVoteModel.create({
                commentId: commentId,
                userId: userId,
                type: CommentVoteTypes.DOWNVOTE,
            });

            return res.status(204).json({});
        } catch (err) {
            console.log('Error:', err.message || err);
            return res.status(500).json({
                message: 'Error when downvoting a comment',
                error: err.message || err,
            });
        }
    },
};
