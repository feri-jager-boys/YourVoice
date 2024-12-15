var PostModel = require('../models/PostModel');
var CommentModel = require('../models/CommentModel');
const mongoose = require("mongoose");

/**
 * PostController.js
 *
 *
 * @description :: Server-side logic for managing Posts.
 */

module.exports = {
  list: function (req, res) {
    PostModel.find()
      .populate('userId', 'username') // Dodano za pridobitev username polja iz User modela
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

            const fetchReplies = (comment) => {
              comment.replies = comments.filter(y => y.parentId && y.parentId.equals(comment._id));
              comment.replies.forEach(fetchReplies);
            };

            topComments.forEach(fetchReplies);

            post.comments = topComments;

            return res.json(post);
          });
      });
  },

  create: function (req, res) {
    var newPost = new PostModel({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      userId: req.body.userId,
      forumId: req.body.forumId,
    });

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
};
