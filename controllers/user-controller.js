const { User } = require('../models');

const userController = {
    // the functions will go in here as methods
    // get all pizzas
    //We just created a method for finding all pizza data and another for 
    //finding a specific pizza by its _id value. The first method, 
    //getAllPizza(), will serve as the callback function for the 
    //GET /api/pizzas route. It uses the Mongoose .find() method, much like 
    //the Sequelize .findAll() method.
    getAllUser(req, res) {
        User.find({})
            //To populate a field, just chain the .populate() method onto your 
            //query, passing in an object with the key (the field from the prop's schema) path plus the value of 
            //the field you want populated.
            .populate({
                path: 'thoughts',
                //Note that we also used the select option inside of populate(), 
                //so that we can tell Mongoose that we don't care about the __v 
                //field on comments either. The minus sign - in front of the 
                //field indicates that we don't want it to be returned. If we 
                //didn't have it, it would mean that it would return only 
                //the __v field.
                select: '-__v'
            })
            //Since we're doing that for our populated comments, let's update 
            //the query to not include the pizza's __v field either, as 
            //it just adds more noise to our returning data.
            .select('-__v')
            //Mongoose has a .sort() method to help with this. After the 
            //.select() method, use .sort({ _id: -1 }) to sort in DESC order 
            //by the _id value. This gets the newest pizza because a timestamp 
            //value is hidden somewhere inside the MongoDB ObjectId.
            .sort({ _id: -1 })
            .then(dbUserData => res.json(dbUserData))
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },

    // get one pizza by id
    //The second method, .getPizzaById(), uses the Mongoose .findOne() method 
    //to find a single pizza by its _id. Instead of accessing the entire req, 
    //we've destructured params out of it, because that's the only data we 
    //need for this request to be fulfilled. If we can't find a pizza with 
    //that _id, we can check whether the returning value is empty and send 
    //a 404 status back to alert users that it doesn't exist.
    getUserById({ params }, res) {
        User.findOne({ _id: params.id })
            .populate({
                path: 'thoughts',
                select: '-__v'
            })
            .select('-__v')
            .then(dbUserData => {
                // If no User is found, send 404
                if (!dbUserData) {
                    res.status(404).json({ message: 'No User found with this id!' });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => {
                console.log(err);
                res.status(400).json(err);
            });
    },
    // createPizza
    //With this .createPizza() method, we destructure the body out of the 
    //Express.js req object because we don't need to interface with any of 
    //the other data it provides. Again, just like with Sequelize, in Mongoose 
    //we use the method .create() to create data. We send a 400 error back 
    //if something goes wrong, as we likely sent the wrong type of data for 
    //one of the fields.
    createUser({ body }, res) {
        User.create(body)
            .then(dbUserData => res.json(dbUserData))
            .catch(err => res.status(400).json(err));
    },

    // // update pizza by id
    // //With this .findOneAndUpdate() method, Mongoose finds a single document 
    // //we want to update, then updates it and returns the updated document. 
    // //If we don't set that third parameter, { new: true }, it will return 
    // //the original document. By setting the parameter to true, we're 
    // //instructing Mongoose to return the new version of the document.

    // //There are also Mongoose and MongoDB methods called .updateOne() 
    // //and .updateMany(), which update documents without returning them.
    // //Mongoose only executes the validators automatically when we actually 
    // //create new data. This means that a user can create a pizza, but then update
    // // that pizza with totally different data and not have it validated. 
    // //Let's go ahead and fix that with a simple option setting.
    updateUser({ params, body }, res) {
        //Notice the new option in place, runValidators: true? We need to
        // include this explicit setting when updating data so that it knows 
        //to validate any new information.
        User.findOneAndUpdate({ _id: params.id }, body, { new: true, runValidators: true })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No User found with this id!' });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.status(400).json(err));
    },
    // // delete pizza
    // //we use the Mongoose .findOneAndDelete() method, which will find the 
    // //document to be returned and also delete it from the database. Like 
    // //ith updating, we could alternatively use .deleteOne() or 
    // //.deleteMany(), but we're using the .findOneAndDelete() method because 
    // //it provides a little more data in case the client wants it.
    deleteUser({ params }, res) {
        User.findOneAndDelete({ _id: params.id })
            .then(dbUserData => {
                if (!dbUserData) {
                    res.status(404).json({ message: 'No User found with this id!' });
                    return;
                }
                res.json(dbUserData);
            })
            .catch(err => res.status(400).json(err));
    }
}

module.exports = userController;