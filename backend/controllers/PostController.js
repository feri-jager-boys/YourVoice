const mongoose = require("mongoose");
const CommentModel = require('../models/CommentModel');
const CommentVoteModel = require('../models/CommentVoteModel');
const CommentVoteTypes = require("../models/CommentVoteTypes");
const PostModel = require('../models/PostModel');
const TagPostModel = require('../models/TagPostModel');
const axios = require('axios');

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
      .lean()
        .exec(async function (err, posts) {
          if (err) {
            return res.status(500).json({
              message: 'Error when getting Post.',
              error: err,
            });
          }

          await Promise.all(posts.map((post) => setTagsOnPost(post)));

          return res.json(posts);
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
        .populate('userId', 'username')
        .lean()
        .exec();

      await Promise.all(posts.map((post) => setTagsOnPost(post)));

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
    const id = req.params.id;
    const userId = req.query.userId;

    PostModel.findOne({ _id: id })
      .populate('userId', 'username')
      .populate('forumId', 'title')
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

        await setTagsOnPost(post);
        await setRepliesOnPost(post, userId);

        return res.json(post);
      });
  },

  create: async function (req, res) {
    var newPost = new PostModel({
      title: req.body.title,
      content: req.body.content,
      userId: req.body.userId,
      forumId: req.body.forumId,
    });

    var isFlagged = await module.exports.moderateContent(newPost.content);

    if (isFlagged.flagged){
      console.log("post inappropriate");
      return res.status(200).json({message: "comment flagged inappropriate", code: 1});
    }

    newPost.save(async function (err, post) {
      if (err) {
        return res.status(500).json({
          message: 'Error when creating Post',
          error: err,
        });
      }

      await Promise.all(
          req.body.tags.map(async (tagName) => {
            await TagPostModel.create({tagId: tagName, postId: post._id})
          }));

      return res.status(201).json(post);
    });
  },

  update: function (req, res) {
    const id = req.params.id;

    PostModel.findOne({ _id: id }, async function (err, post) {
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
      await updateTagsOnPost(req.body.tags, id);

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

      // TODO: remove comments, votes, tags

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
      //throw new Error("Content moderation failed.");
    }
  },
};

const setRepliesOnPost = async (post, userId) => {
  const postComments = await CommentModel
    .find({ postId: mongoose.Types.ObjectId(post._id) })
    .populate('userId', 'username')
    .lean()
    .exec()

  const topComments = postComments.filter(x => x.parentId == null);

  await Promise.all(
    topComments.map(async (topComment) => {
      await setRepliesAndVotesOnComment(postComments, topComment, userId);
    }));

  post.comments = topComments;
}

const setRepliesAndVotesOnComment = async (postComments, topComment, userId) => {
  topComment.replies = postComments.filter(y => y.parentId && y.parentId.equals(topComment._id));
  await Promise.all(
    topComment.replies.map(async (reply) => {
      await setRepliesAndVotesOnComment(postComments, reply, userId);
      await setVotesOnComment(reply, userId);
    }));
  await setVotesOnComment(topComment, userId);
};

const setVotesOnComment = async (comment, userId) => {
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

const setTagsOnPost = async (post) => {
  const tags = await TagPostModel
    .find({postId: mongoose.Types.ObjectId(post._id)})
    .populate('tagId', 'name')
    .lean()
    .exec();

  post.tags = tags.map(tag => ({_id: tag.tagId._id, name: tag.tagId.name}));
};

const updateTagsOnPost = async (newTags, postId) => {
  const currentTagPosts = await TagPostModel
    .find({postId: mongoose.Types.ObjectId(postId)})
    .lean()
    .exec();

  const tagsToAdd = newTags.filter((tag) => !currentTagPosts.some((tagPost) => tagPost.tagId.equals(tag._id)));

  for (const tag of tagsToAdd) {
    const newPostTag = new TagPostModel({
      tagId: tag._id,
      postId: postId,
    });

    await newPostTag.save(function (err, Tag) {});
  }

  const tagsToDelete = currentTagPosts.filter((tagPost) => !newTags.some((tag) => tagPost.tagId.equals(tag._id)));

  for (const tagPost of tagsToDelete) {
    await TagPostModel.deleteOne({ _id: tagPost._id }).exec();
  }
};
