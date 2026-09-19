import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

import ConflictError from "../errors/ConflictError.js";
import UnauthorizedError from "../errors/UnauthorizedError.js";


export const SignUp = async ({
    fullName,
    email,
    password
}) => {

    const user = await User.findOne({ email });

    if (user) {
        throw new ConflictError("Email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
        fullName,
        email,
        password: hashedPassword
    });

    await newUser.save();

    return newUser;
};


export const Login = async ({ email, password }) => {

    const user = await User.findOne({ email });

    if (!user) {
        throw new UnauthorizedError("Invalid credentials");
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordCorrect) {
        throw new UnauthorizedError("Invalid credentials");
    }

    return user;
};


export const UpdateProfile = async ({
    profilePic,
    userId
}) => {

    const uploadResponse =
        await cloudinary.uploader.upload(profilePic);

    const updatedUser =
        await User.findByIdAndUpdate(
            userId,
            {
                profilePic: uploadResponse.secure_url
            },
            {
                new: true
            }
        );

    return updatedUser;
};