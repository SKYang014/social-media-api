//We could import the entire mongoose library, but we only need to worry 
//about the Schema constructor and model function, so we'll just import them
const { Schema, model, Types } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const ReactionSchema = new Schema(
    {
        // set custom id to avoid confusion with parent comment _id
        //Here we'll need a unique identifier instead of the default _id 
        //field that is created, so we'll add a custom replyId field. 
        reactionId: {
            type: Schema.Types.ObjectId,
            default: () => new Types.ObjectId()
        },
        reactionBody: {
            type: String,
            required: true,
            maxLength: 280
        },
        username: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            // a getter is typically a special type of function that 
            //takes the stored data you are looking to retrieve and 
            //modifies or formats it upon return.
            //With this get option in place, every time we retrieve 
            //a pizza, the value in the createdAt field will be 
            //formatted by the dateFormat() function and used instead 
            //of the default timestamp value. This way, we can use the 
            //timestamp value for storage, but use a prettier version 
            //of it for display.
            get: (createdAtVal) => dateFormat(createdAtVal)
        },
    },
    {
        toJSON: {
            getters: true
        }
    }
);

//we don't have to use special imported data types for the type definitions
//we simply instruct the schema that this data will adhere to the built-in 
//JavaScript data types, including strings, Booleans, numbers, and so on
const ThoughtSchema = new Schema({
    thoughtText: {
        type: String,
        required: "You need to provide a name for your pizza!",
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    username: {
        type: String,
        required: true
    },
    reactions: [ReactionSchema]
},
    {
        toJSON: {
            virtuals: true,
        },
        id: false
    }
);
// get total count of reactions and replies on retrieval
//Virtuals allow you to add virtual properties to a document that aren't stored 
//in the database. They're normally computed values that get evaluated when 
//you try to access their properties
ThoughtSchema.virtual('reactionCount').get(function () {
    //Here we're using the .reduce() method to tally up the total of every 
    //reaction with its replies. In its basic form, .reduce() takes two parameters, 
    //an accumulator and a currentValue. Here, the accumulator is total, and 
    //the currentValue is reaction. As .reduce() walks through the array, it 
    //passes the accumulating total and the current value of reaction into the 
    //function, with the return of the function revising the total for the 
    //next iteration through the array.
    return this.reactions.length;
});
// create the Pizza model using the ThoughtSchema
const Thoughts = model('Thought', ThoughtSchema);

// export the Thoughts model
module.exports = Thoughts;