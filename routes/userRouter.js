const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = require('express').Router();

const User = require('../models/userModel');
const auth = require('../middleware/auth');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    let { email, password, passwordCheck, displayName } = req.body;

    // VALIDATE

    // check required fields
    if (!email || !password || !passwordCheck) {
      return res.status(400).json({ msg: 'Not all fields have been entered.' });
    }

    // check password length
    if (password.length < 5) {
      return res
        .status(400)
        .json({ msg: 'The password needs to be at least 5 characters long.' });
    }

    // check the confirmed password
    if (password !== passwordCheck) {
      return res.status(400).json({ msg: 'Passwords do not match' });
    }

    // check existing User
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ msg: 'An account with this email already exists.' });
    }

    // handle displayName -> avoid displayName = undefined
    if (!displayName) displayName = email;

    // encrypt password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Save new user
    const newUser = new User({
      email,
      password: passwordHash,
      displayName,
    });

    const savedUser = await newUser.save();
    // console.log(savedUser);
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // VALIDATE

    // check the required fields
    if (!email || !password) {
      return res.status(400).json({ msg: 'Not all fields have been entered.' });
    }

    // verify user
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ msg: 'No account with this email has been registed.' });
    }

    // verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials.' });
    }

    // sign JWT -> get Token
    const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    // console.log(token);
    res.status(200).json({
      token,
      user: {
        id: user._id,
        displayName: user.displayName,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// delete Route -> need Permission
router.delete('/delete', auth, async (req, res) => {
  try {
    // get ID from auth middleware -> req.user
    const deletedUser = await User.findByIdAndDelete(req.user);
    res.json(deletedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// route to check if token is valid
router.post('/tokenIsValid', async (req, res) => {
  try {
    // check if token exists
    const token = req.header('x-auth-token');
    if (!token) {
      return res.json(false);
    }

    // check if valid token = jwt
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return res.json(false);
    }

    // check if user exist = that token
    const user = await User.findById(verified.id);
    if (!user) {
      return res.json(false);
    }

    return res.json(true);
  } catch (err) {
    res.json({ error: err.message });
  }
});

module.exports = router;
