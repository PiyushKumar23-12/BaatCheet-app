import { SignUp,Login,UpdateProfile } from "../services/auth.service.js";
import { generateToken } from "../lib/utils.js";

export const signup = async (req, res) => {
  const signupStatus=await SignUp({
    fullName:req.body.fullName,
    email:req.body.email,
    password:req.body.password
  });
  generateToken(signupStatus._id, res);

    res.status(201).json({
        _id: signupStatus._id,
        fullName: signupStatus.fullName,
        email: signupStatus.email,
        profilePic: signupStatus.profilePic
    });
};

export const login = async (req, res) => {
  const loginStatus=await Login({
    email:req.body.email,
    password:req.body.password
  });
  generateToken(loginStatus._id, res);
  res.status(200).json({
        _id: loginStatus._id,
        fullName: loginStatus.fullName,
        email: loginStatus.email,
        profilePic: loginStatus.profilePic
    });
};

export const logout = (req, res) => {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
};

export const updateProfile = async (req, res) => {
  const updatedUser=await UpdateProfile({
    profilePic:req.body.profilePic,
    userId:req.user._id
  });
    res.status(200).json(updatedUser);
};

export const checkAuth = (req, res) => {
    res.status(200).json(req.user);
};