import Profile from "../models/profile.js";
import Tweet from "../models/tweet.js";
import bcrypt from "bcrypt";
import generateToken from "../utils/generateToken.js";

const cookieOptions = {
  httpOnly: true,
  secure: true, // Required for HTTPS
  sameSite: "None", // Needed for cross-origin cookies
};

// SIGN UP
export const signUp = async (req, res) => {
  const { username, email } = req.body;
  const user = await Profile.findOne({ $or: [{ email }, { username }] });

  if (user) {
    return res.status(401).json({ errors: [{ msg: "This user already exists" }] });
  }

  const profile = await Profile.create(req.body);
  const token = generateToken(profile._id);

  return res
    .cookie("access_token", token, cookieOptions)
    .status(200)
    .json(profile);
};

// SIGN IN
export const signIn = async (req, res) => {
  const { username, password } = req.body;

  const profile = await Profile.findOne({ $or: [{ username }, { email: username }] });
  const isPasswordValid = profile && (await bcrypt.compare(password, profile.password));

  if (isPasswordValid && profile) {
    const token = generateToken(profile._id);
    await profile.signIn();

    return res
      .cookie("access_token", token, cookieOptions)
      .status(200)
      .json(profile);
  } else {
    return res.status(401).json({ errors: [{ msg: "Invalid credentials" }] });
  }
};

// SIGN OUT
export const signOut = async (req, res) => {
  const profile = req.user;
  await profile.signOut();

  return res
    .cookie("access_token", "", { ...cookieOptions, maxAge: 0 }) // Clear the cookie
    .status(200)
    .json({ msg: "Successfully signed out." });
};

// FOLLOW PROFILE
export const follow = async (req, res) => {
  const { username } = req.query;
  const user = req.user;

  const profile = await Profile.findOne({ username });
  await user.follow(profile);
  res.send(profile);
};

// UNFOLLOW PROFILE
export const unfollow = async (req, res) => {
  const { username } = req.query;
  const user = req.user;

  const profile = await Profile.findOne({ username });
  await user.unfollow(profile);

  return res.json(profile);
};

// GET PROFILE BY USERNAME OR ALL
export const getProfile = async (req, res) => {
  const { username } = req.query;
  if (username) {
    const profile = await Profile.findOne({ username }, { password: 0 });
    return res.send(profile);
  } else {
    const profiles = await Profile.find({}, { password: 0 });
    return res.send(profiles);
  }
};

export const getCurrentProfile = (req, res) => {
  res.send(req.user);
};

// BOOKMARKS
export const addBookmark = async (req, res) => {
  const { id } = req.query;
  const profile = req.user;
  const tweet = await Tweet.findOne({ _id: id });

  await profile.addBookmark(tweet);
  res.send(profile);
};

export const getBookmarks = async (req, res) => {
  const { user } = req;

  const bookmarks = await Tweet.find({
    _id: { $in: user.bookmarks },
    $or: [{ type: "tweet" }, { type: "retweet" }],
  }).sort("-createdAt");

  res.send(bookmarks);
};

export const removeBookmark = async (req, res) => {
  const { id } = req.query;
  const profile = req.user;
  const tweet = await Tweet.findOne({ _id: id });

  await profile.removeBookmark(tweet);
  res.send(profile);
};

// EDIT PROFILE
export const uploadAvatar = async (req, res) => {
  const { user, avatar } = req;
  await user.changeAvatar(avatar);
  res.send(user);
};

export const editProfile = async (req, res) => {
  const { user } = req;
  const body = req.body;
  await user.updateProfile(body);
  res.send(user);
};
