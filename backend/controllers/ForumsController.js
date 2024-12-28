const ForumsModel = require('../models/ForumsModel');
const TagModel = require('../models/TagModel');
const TagPostModel = require('../models/TagPostModel');
const mongoose = require("mongoose");

module.exports = {
    list: function (req, res) {
        ForumsModel.find()
            .populate('adminId', 'username') // Dodano za pridobitev username polja iz User modela
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

    show: function (req, res) {
        var id = req.params.id;

        ForumsModel.findOne({ _id: id })
            .populate('userId', 'username') // Populacija za prikaz avtorja
            .exec(function (err, forum) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting Forum.',
                        error: err,
                    });
                }

                if (!forum) {
                    return res.status(404).json({
                        message: 'No such Forum',
                    });
                }

                return res.json(forum);
            });
    },

    create: function (req, res) {
        var newForum = new ForumsModel({
            title: req.body.title,
            adminId: req.body.admin,
        });

        newForum.save(async function (err, forum) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating forum',
                    error: err,
                });
            }

            await Promise.all(
                req.body.tags.map(async (tagName) => {
                    await TagModel.create({name: tagName, forumId: forum._id});
                }));

            return res.status(201).json(forum);
        });
    },

    update: function (req, res) {
        var id = req.params.id;

        ForumsModel.findOne({ _id: id }, async function (err, forum) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting forum',
                    error: err,
                });
            }

            if (!forum) {
                return res.status(404).json({
                    message: 'No such forum',
                });
            }

            forum.title = req.body.title ? req.body.title : forum.title;
            await updateTagsOnForum(req.body.tags, id);

            forum.save(function (err, post) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating forum.',
                        error: err,
                    });
                }

                return res.json(forum);
            });
        });
    },

    remove: function (req, res) {
        var id = req.params.id;

        ForumsModel.findByIdAndRemove(id, function (err, Post) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the forum.',
                    error: err,
                });
            }

            return res.status(204).json();
        });
    },

    getTagsByForum: async function (req, res) {
        try {
            const forumId = req.params.id;

            if (!forumId) {
                return res.status(400).json({
                    message: 'Forum ID is required.',
                });
            }

            const tags = await TagModel.find({ forumId: forumId }).exec();

            return res.json(tags);
        } catch (err) {
            return res.status(500).json({
                message: 'An error occurred while retrieving tags for forum.',
                error: err.message,
            });
        }
    },
};

const updateTagsOnForum = async (newTags, forumId) => {
    const currentTags = await TagModel
      .find({forumId: mongoose.Types.ObjectId(forumId)})
      .lean()
      .exec();

    const tagsToAdd = newTags.filter((tag) => !currentTags.some((tagModel) => tagModel._id.equals(tag._id)));

    for (const tag of tagsToAdd) {
        await TagModel.create({name: tag.name, forumId: forumId});
    }

    const tagsToDelete = currentTags.filter((tagModel) => !newTags.some((tag) => tagModel._id.equals(tag._id)));

    for (const tagModel of tagsToDelete) {
        await TagModel.deleteOne({ _id: tagModel._id }).exec();
        await TagPostModel.deleteMany({ tagId: tagModel._id }).exec();
    }
};
