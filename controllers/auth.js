import User from "../models/User.js";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const saltRounds = process.env.SALT_ROUNDS;

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, password } = req.body;
    const { id } = req.user;
    const user = await User.find({ _id: id });

    if (user.length < 1)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "user does not exist" });

    const salt = await bcrypt.genSalt(saltRounds);
    const isPassword = await bcrypt.compare(oldPassword, user[0].password);

    if (!isPassword)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Incorrect password!" });

    const hashedPassword = await bcrypt.hash(password, salt);

    if (isPassword) {
      User.findByIdAndUpdate(id, { password: hashedPassword })
        .then(() =>
          res
            .status(StatusCodes.OK)
            .json({ message: `password updated successfully!` })
        )
        .catch((error) =>
          res.status(StatusCodes.BAD_REQUEST).json({
            error: error.message,
            message: `unable to change password`,
          })
        );
    }
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: `Unable to authenticate user! ${error.message}` });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const jwtExpiration = process.env.JWT_EXPIRATION;
    const jwtSecret = process.env.JWT_SECRET;

    const users = await User.find({
      email: { $regex: `^${email}$`, $options: "i" },
    });
    const user = users[0];
    if (users.length < 1) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: `user with email:${email} does not exist!` });
    }
    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "incorrect password!" });

    const token = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: Number(jwtExpiration),
    });

    return res.status(StatusCodes.OK).json({
      message: `login successful!`,
      userData: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        token: token,
      },
    });
  } catch (error) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: `Unable to authenticate user! ${error.message}` });
  }
};

export const signup = async (req, res) => {
  try {
    const user = req.body;
    const { password } = req.body;
    const { email } = req.body;
    const { phoneNumber } = req.body;

    const isUser = await User.find({
      email: { $regex: `^${email}$`, $options: "i" },
    });

    const isPhone = await User.find({
      phoneNumber: phoneNumber,
    });

    if (isUser.length >= 1) {
      res
        .status(StatusCodes.CONFLICT)
        .json({ message: "oops! looks like that email is already in use." });
    } else if (isPhone.length >= 1) {
      res.status(StatusCodes.CONFLICT).json({
        message: "oops! looks like that phone number is already in use.",
      });
    } else {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = new User({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: hashedPassword,
        country: user.country,
        state: user.state,
        city: user.city,
        phoneNumber: user.phoneNumber,
        role: user.role,
      });
      await newUser.save();
      res.status(StatusCodes.CREATED).json({
        message: `user created successfully!`,
        userData: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          role: user.role,
        },
      });
    }
  } catch (error) {
    console.log(`unable to add user ${error.message}`);
    res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: `Unable to create user ${error.message}` });
  }
};
