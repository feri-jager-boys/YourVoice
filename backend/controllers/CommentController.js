var CommentModel = require('../models/CommentModel');
var CommentVoteModel = require('../models/CommentVoteModel');
const CommentVoteTypes = require("../models/CommentVoteTypes");
const axios = require('axios');
const mongoose = require("mongoose");

/**
 * CommentController.js
 *
 *
 * @description :: Server-side logic for managing Comments.
 */

const PERSPECTIVE_API_KEY = "AIzaSyCvBkmGS6i3-OuhHxTb1Vwc1qOBTOiTiSA";
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
            var isFlagged = await module.exports.moderateContent(req.body.content);

            if (isFlagged.flagged){
              return res.status(200).json({message: "comment flagged inappropriate", code: 1});
            }

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
            await CommentModel.findByIdAndUpdate(
                commentId,
                { content: "[DELETED]", userId: mongoose.Types.ObjectId("000000000000000000000000") });

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
      moderateContent: async function (content) {
        try {
          const PERSPECTIVE_API_URL = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${PERSPECTIVE_API_KEY}`;
      
          const requestBody = {
            comment: { text: content },
            languages: ["en"], // Replace with "sl" for Slovenian (if applicable)
            requestedAttributes: {
              TOXICITY: {},
              INSULT: {},
              PROFANITY: {},
              THREAT: {},
            },
          };
      
          // Send a request to the Google Perspective API
          const response = await axios.post(PERSPECTIVE_API_URL, requestBody);
      
          // Parse the response to check for flagged content
          const scores = response.data.attributeScores;
          const flagged = Object.values(scores).some(
            (attribute) => attribute.summaryScore.value > 0.4
          );
      
          return { flagged, scores };
        } catch (error) {
          console.error("Error in moderateContent function:", error);
          throw new Error("Content moderation failed.");
        }
      }
};
