var express = require('express');
var router = express.Router();
const userModel = require('./users');
const postModel = require('./post');
const passport = require('passport');
const upload = require('./multer')
const localStrategy = require('passport-local');
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function (req, res) {
  res.render('login', { error: req.flash('error') });
})
router.get('/feed', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({username: req.session.passport.user})
  const post = await postModel.find()
  .populate('user')
  res.render('feed', {user, post});
})


router.get('/home', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
    .populate("posts")
  res.render("profile", { user })
});
router.get('/add', isLoggedIn, async function (req, res) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  res.render("add", { user })
});

// router.post('/register', function (req, res) {
//   const { username, email, fullname, password } = req.body

//   const data = new userModel({
//     username,
//     email,
//     fullname,
//   })
//   userModel.create(data, password, function (req, res) {
//     if (err) {
//       console.error('error')
//       return res.redirect('/register')
//     }
//     passport.authenticate('local')(req, res, function () {
//       res.redirect('/home')
//     })

//   })


// });

router.post('/register', async function (req, res) {
  try {
    const { username, email, fullname, password } = req.body;
    const user = new userModel({
      username,
      email,
      fullname,
      password
    })
    await userModel.register(user, password)

    req.login(user, (err)=>{
      if(err){
        console.log(err)
        res.redirect('/register')
      }
      res.redirect('/home')
    })
  } catch (error) {
    console.error(error)
    res.redirect('/register')
  }
})




router.post('/login', passport.authenticate("local", {
  successRedirect: "/home",
  failureRedirect: "/login",
  failureFlash: true,
}));

router.post('/fileupload',isLoggedIn, upload.single('image'), async function (req, res) {
  try {
    const user  = await userModel.findOne({username: req.session.passport.user})
    user.profileImage = req.file.filename
    user.save()
    res.redirect('/home')
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

router.post('/upload', isLoggedIn, upload.single('file'), async function (req, res) {
  try {
    if (!req.file) {
      return res.status(404).send("No files were uploaded");
    }

    const user = await userModel.findOne({ username: req.session.passport.user });

    if (!user) {
      return res.status(404).send("User not found");
    }

    const post = await postModel.create({
      image: req.file.filename,
      imageText: req.body.filecaption,
      user: user._id,
    });

    user.posts.push(post._id);
    await user.save();

    res.redirect('/home')
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


router.post('/createpost', isLoggedIn, upload.single('postimage'), async function (req, res) {
  try {
    const user = await userModel.findOne({ username: req.session.passport.user });
    const post = await postModel.create({
      user: user._id,
      title: req.body.title,
      description: req.body.description,
      image: req.file.filename
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect('/home');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
router.get('/show/pins', isLoggedIn, async function(req, res) {
  try {
    const user = await userModel
      .findOne({ username: req.session.passport.user })
      .populate("posts");
    res.render('pins', { user });
  } catch (error) {
    console.error(error);
    res.render('/home');
  }
});



router.get('/logout', function (req, res) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/login')
  })
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

module.exports = router;
