const { Thought, User } = require('../models');

const thoughtController = {
    // add comment to pizza
    // Remember that when we create a comment, it’s not a standalone
    //comment; it belongs to a pizza. We need to know exactly 
    //hich pizza we’re working with.
    addThought({ params, body }, res) {
        console.log(body);
        Thought.create(body)
            .then(({ _id }) => {
                //Now that we've got an _id, we can use this to 
                //add the comment to a pizza
                return User.findOneAndUpdate(
                    { _id: body.userId },
                    //Note here that we're using the $push method to add 
                    //the comment's _id to the specific pizza we want to 
                    //update. The $push method works just the same way 
                    //that it works in JavaScript—it adds data to an 
                    //array. All of the MongoDB-based functions like $push 
                    //start with a dollar sign ($), making it easier to 
                    //look at functionality and know what is built-in to 
                    //MongoDB and what is a custom noun the developer is using.
                    { $push: { thoughts: _id } },
                    //We're also returning the pizza Promise here so that we 
                    //can do something with the results of the Mongoose operation. 
                    //Again, because we passed the option of new: true, we're 
                    //receiving back the updated pizza (the pizza with 
                    //the new comment included).
                    { new: true }
                );
            })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No User found with this id!' });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.json(err));
    },

    //As we did with addComment() and removeComment(), we're passing params here 
    //as a parameter, so we'll need to make sure we pass it to addReply() when we 
    //implement it later in the route.
    addReaction({ params, body }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $push: { reactions: body } },
            { new: true, runValidators: true }
        )
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No User found with this id!' });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => {
                console.log(err)
                res.json(err)
            });
    },

    // remove reply
    //Here, we're using the MongoDB $pull operator to remove the specific 
    //reply from the replies array where the replyId matches the value of 
    //params.replyId passed in from the route.
    removeReaction({ params }, res) {
        Thought.findOneAndUpdate(
            { _id: params.thoughtId },
            { $pull: { reactions: { reactionId: params.reactionId } } },
            { new: true }
        )
            .then(dbUserData => res.json(dbUserData))
            .catch(err => res.json(err));
    },

    // remove Thought
    // we need to delete the Thought, but we also need to remove 
    //it from the pizza it’s associated with.
    removeThought({ params }, res) {
        //The first method used here, .findOneAndDelete(), works a lot like 
        //.findOneAndUpdate(), as it deletes the document while also returning 
        //its data. We then take that data and use it to identify and remove 
        //it from the associated pizza using the Mongo $pull operation. Lastly, 
        //we return the updated pizza data, now without the _id of the comment 
        //in the comments array, and return it to the user.
        Thought.findOneAndDelete({ _id: params.thoughtId })
            .then(deletedThought => {
                if (!deletedThought) {
                    return res.status(404).json({ message: 'No Thought with this id!' });
                }
                return User.findOneAndUpdate(
                    { _id: params.userId },
                    { $pull: { thoughts: params.thoughtId } },
                    { new: true }
                );
            })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No User found with this id!' });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.json(err));
    }

};

module.exports = thoughtController;