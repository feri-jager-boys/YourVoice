var ForumsModel = require('../models/ForumsModel');

module.exports = {
    list: function (req, res) {
        ForumsModel.find()
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
            adminId: req.body.userId,
        });

        newForum.save(function (err, forum) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating forum',
                    error: err,
                });
            }
            return res.status(201).json(forum);
        });
    },

    update: function (req, res) {
        var id = req.params.id;

        ForumsModel.findOne({ _id: id }, function (err, forum) {
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
};
