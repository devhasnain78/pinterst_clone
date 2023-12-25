var express = require('express');
var router = express.Router();
var mongoose = require('mongoose')
/* GET users listing. */
const plm = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/goludb')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }],
  dp: {
    type: String,
  },
  fullname: {
    type: String,
    required: true,
  },
  board: {
    type: Array,
    default: [],
  },
  contact: {
    type: Number,
  },
  profileImage: {
    type: String,
  },
});


userSchema.plugin(plm)
const User = mongoose.model('User', userSchema)
module.exports = User;