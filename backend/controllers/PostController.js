const mongoose = require("mongoose");
const CommentModel = require('../models/CommentModel');
const CommentVoteModel = require('../models/CommentVoteModel');
const CommentVoteTypes = require("../models/CommentVoteTypes");
var PostModel = require('../models/PostModel');
var axios = require('axios');

/**
 * PostController.js
 *
 *
 * @description :: Server-side logic for managing Posts.
 */

const PERSPECTIVE_API_KEY = "AIzaSyCvBkmGS6i3-OuhHxTb1Vwc1qOBTOiTiSA";

module.exports = {
  list: function (req, res) {
    PostModel.find()
      .populate('userId', 'username') // Dodano za pridobitev username polja iz User modela
      .populate('forumId', 'title')
        .exec(function (err, Posts) {
        if (err) {
          return res.status(500).json({
            message: 'Error when getting Post.',
            error: err,
          });
        }
        return res.json(Posts);
      });
  },

  byForum: async function (req, res) {
    try {
      const forumId = req.params.id;

      if (!forumId) {
        return res.status(400).json({
          message: 'Forum ID is required.',
        });
      }

      const posts = await PostModel.find({ forumId })
          .populate('userId', 'username') // Only fetch 'username' field from userId
          .exec();

      return res.json(posts);
    } catch (err) {
      return res.status(500).json({
        message: 'An error occurred while retrieving posts.',
        error: err.message,
      });
    }
  },


  // Posodobljena metoda za prikaz posamezne objave
  show: function (req, res) {
    var id = req.params.id;
    var userId = req.query.userId;

    PostModel.findOne({ _id: id })
      .populate('userId', 'username')
      .lean()
      .exec(async function (err, post) {
        if (err) {
          return res.status(500).json({
            message: 'Error when getting Post.',
            error: err,
          });
        }

        if (!post) {
          return res.status(404).json({
            message: 'No such Post',
          });
        }

        await CommentModel
          .find({ postId: mongoose.Types.ObjectId(id) })
          .populate('userId', 'username')
          .lean()
          .exec(async function (err, comments) {

            const topComments = comments.filter(x => x.parentId == null);

            const fetchVotes = async (comment) => {
              const votes = await CommentVoteModel.find({ commentId: comment._id });
              const upvotes = votes.filter(x => x.type === CommentVoteTypes.UPVOTE).length;
              const downvotes = votes.filter(x => x.type === CommentVoteTypes.DOWNVOTE).length;

              comment.userVote = 0;
              if (userId) {
                const userVote = votes.find(vote => vote.userId.equals(userId));
                comment.userVote = userVote ? userVote.type : 0
              }

              comment.votes = upvotes - downvotes;
            };

            const fetchRepliesAndVotes = async (comment) => {
              comment.replies = comments.filter(y => y.parentId && y.parentId.equals(comment._id));
              await Promise.all(
                comment.replies.map(async (reply) => {
                  await fetchRepliesAndVotes(reply);
                  await fetchVotes(reply);
                }));
              await fetchVotes(comment);
            };

            await Promise.all(
                topComments.map(async (topComment) => {
                  await fetchRepliesAndVotes(topComment);
                }));

            post.comments = topComments;

            return res.json(post);
          });
      });
  },

  create: async function (req, res) {
    var newPost = new PostModel({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      userId: req.body.userId,
      forumId: req.body.forumId,
    });

    var isFlagged = await module.exports.moderateContent(newPost.content);

    if(isFlagged){
      console.log("post inappropriate");
      return res.status(200).json({message: "comment flagged inappropriate", code: 1});
    }

    newPost.save(function (err, Post) {
      if (err) {
        return res.status(500).json({
          message: 'Error when creating Post',
          error: err,
        });
      }
      return res.status(201).json(Post);
    });
  },

  update: function (req, res) {
    var id = req.params.id;

    PostModel.findOne({ _id: id }, function (err, post) {
      if (err) {
        return res.status(500).json({
          message: 'Error when getting post',
          error: err,
        });
      }

      if (!post) {
        return res.status(404).json({
          message: 'No such post',
        });
      }

      post.title = req.body.title ? req.body.title : post.title;
      post.content = req.body.content ? req.body.content : post.content;
      post.category = req.body.category ? req.body.category : post.category;

      post.save(function (err, post) {
        if (err) {
          return res.status(500).json({
            message: 'Error when updating post.',
            error: err,
          });
        }

        return res.json(post);
      });
    });
  },

  remove: function (req, res) {
    var id = req.params.id;

    PostModel.findByIdAndRemove(id, function (err, Post) {
      if (err) {
        return res.status(500).json({
          message: 'Error when deleting the Post.',
          error: err,
        });
      }

      return res.status(204).json();
    });
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
        (attribute) => attribute.summaryScore.value > 0.7
      );
  
      return { flagged, scores };
    } catch (error) {
      console.error("Error in moderateContent function:", error);
      throw new Error("Content moderation failed.");
    }
  },
};

