const User = require('../models/userSchema');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_REFRESH_SECRET = "MY_SECRET_KEY";
const JWT_ACCESS_TOKEN_SECRET = "LFSLDJK";
const ACESS_TOKEN_EXPIRY_TIME = 3000;
const REFRESH_TOKEN_EXPIRY_TIME = 888640000;

const refreshTokens = [];
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: "User does not exist" });
    }
    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Invalid credentials" });
    }
    const _user = {
      id: user._id,
      name: user.name,
      email: user.email,
    };
    // Create acess and refresh token and push refresh token to array
    const token = generateAccessToken(_user);
    const refreshToken = generateRefreshToken(_user);
    refreshTokens.push(refreshToken);

    // Send token
    res.status(200).send({
      refreshToken,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};
function generateAccessToken(user) {
  return jwt.sign(user, JWT_ACCESS_TOKEN_SECRET, {
    expiresIn: ACESS_TOKEN_EXPIRY_TIME,
  });
}

// generate refresh token
function generateRefreshToken(user) {
  return jwt.sign(user, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY_TIME,
  });
}

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Check if user exists
    console.log(name, email, password);
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).send({ message: "User already exists" });
    }
    // Create new user
    const newUser = new User({
      name,
      email,
      password,
    });
    // Hash password
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    await newUser.save();

    const _user = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
    };
    const token = generateAccessToken(_user);
    const refreshToken = generateRefreshToken(_user);
    // Send token
    res.status(200).send({
      token,
      refreshToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.log(err)
    throw new Error(err);
    // res.status(500).json({ message: err.message });
  }
}


const getToken = async (req, res) => {
  try {
    console.log(req.body);
    // const refreshToken = req.body.refreshToken;
    // if(!refreshToken) return res.sendStatus(401);
    // if(!refreshTokens.includes(refreshToken)){
    //     return res.status(401).message({message: 'invalid refresh token'});
    // }
    const userData = req.user;
    const JWT_TOKEN = generateAccessToken({
      id: userData.id,
      name: userData.name,
      email: userData.email,
    });
    res.status(200).send({ token: JWT_TOKEN });
  } catch (err) {
    console;
    res.status(500).send({ message: err.message });
  }
}

module.exports= {
  loginUser,
  getToken,
  registerUser,
}