const mongoose = require('mongoose')

const postSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: {
        type: String,
        require: true,
    },
    description: {
        type: String,
    },
    image: {
        type: String
    },


})

const Post = mongoose.model('Post', postSchema)
module.exports = Post