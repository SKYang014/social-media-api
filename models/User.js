const { Schema, model, Types } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const FriendSchema = new Schema(
    {
        // set custom id to avoid confusion with parent comment _id
        //Here we'll need a unique identifier instead of the default _id 
        //field that is created, so we'll add a custom replyId field. 
        friendId: {
            type: Schema.Types.ObjectId,
            default: () => new Types.ObjectId()
        },
    },
    {
        toJSON: {
            getters: true
        }
    }
);

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: "Must enter username",
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: "Must enter valid, unique email"
    },
    //associate thuoghts with user
    // the userchema to have the replies field populated with 
    //an array of data that adheres to the thoughtschema definition
    thoughts: [ThoughtSchema],
    friends: [FriendSchema]
},
    {
        toJSON: {
            virtuals: true,
            getters: true
        },
        id: false
    }
);

//a virtual for UserSchema to get the total reply count
UserSchema.virtual('friendCount').get(function () {
    return this.friends.length;
});

const User = model('User', UserSchema);

module.exports = User;