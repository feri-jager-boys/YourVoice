const mongoose = require('mongoose');
const PollModel = require('../models/PollModel');

module.exports = {
    add: async function(req, res){
        try{
            console.log(req.body);
            const {question, options, userId, postId} = req.body;
            if(!question||!options||options.length <2){
                return res.status(400).json({error: 'something does not add up'});
            }
            console.log(req);
            const poll = new PollModel({
                question,
                options: options.map(option=>({text: option.text})),
                userId,
                postId,
            });

            await poll.save();
            res.status(200).json({message: "poll created sucessfully"});
        }
        catch(err){
            console.error(err);
            res.status(500).json({error: "server error while creating poll", err});
        }
    },
    list: async function(req, res){
        try{
            const {postId} = req.params;
            const polls = await PollModel.find({postId}).populate('userId', 'username');
            console.log(polls);
            res.status(200).json(polls); 
        }
        catch(err){
            console.error(err);
            res.status(500).json({error: "server error while fetching polls", err});
        }
    },
    vote: async function(req, res){
        try{
            const {pollId} = req.params;
            const {optionId, userId} = req.body;
            const poll = await PollModel.findById(pollId);
            if(!poll){
                return res.status(404).json({error: "poll not found"});
            }
            if(poll.votedBy.includes(userId)){
                return res.status(400).json({error: "user already voted"});
            }

            const option = poll.options.id(optionId);
            if(!option){
                return res.status(404).json({error: "no such option"});
            }

            option.votes += 1;
            poll.votedBy.push(userId);
            await poll.save();
            res.status(200).json({message: "vote sucessfull"});
        }
        catch(err){
            console.error(err);
            res.status(500).json({error: "server error while voting", err});
        }
    }
}