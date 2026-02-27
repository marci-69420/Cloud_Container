"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const inputValidation_1 = require("../validators/inputValidation");
const validateToken_1 = require("../middlewares/validateToken");
const userRouter = (0, express_1.Router)();
// This file contains the routes for user registration, login, and profile management. All routes are protected with JWT token except for registration and login.
// POST Register a user with hashed password
userRouter.post("/register/", inputValidation_1.registerValidation, async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        console.log(errors);
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const existingUser = await User_1.User.findOne({ email: req.body.email });
        console.log(existingUser);
        if (existingUser) {
            return res.status(403).json({ email: "email already in use" });
        }
        const salt = bcryptjs_1.default.genSaltSync(10);
        const hash = bcryptjs_1.default.hashSync(req.body.password, salt);
        const newUser = await User_1.User.create({
            email: req.body.email,
            password: hash,
            username: req.body.username,
        });
        return res.status(200).json(newUser);
    }
    catch (error) {
        console.error(`Error during registration: ${error}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});
// POST Login a user
userRouter.post("/login", inputValidation_1.loginValidation, async (req, res) => {
    try {
        const user = await User_1.User.findOne({ email: req.body.email });
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (!user) {
            return res.status(404).json({ message: "User does not found with that email" });
        }
        if (bcryptjs_1.default.compareSync(req.body.password, user.password)) {
            const jwtPayload = {
                _id: user._id,
                username: user.username
            };
            const token = jsonwebtoken_1.default.sign(jwtPayload, process.env.SECRET, { expiresIn: "1h" });
            console.log("Login successful, token generated:", token);
            return res.status(200).json({ success: true, token });
        }
        return res.status(401).json({ message: "Wrong password" });
    }
    catch (error) {
        console.error(`Error during user login: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
//GET user
userRouter.get("/profile", validateToken_1.validateToken, async (req, res) => {
    try {
        const user = await User_1.User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User found:", user);
        return res.status(200).json(user);
    }
    catch (error) {
        console.error(`Error fetching profile: ${error}`);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
//GET all users the name for all users for sharing documents (admin only route)
userRouter.get("/list", validateToken_1.validateToken, async (req, res) => {
    try {
        const users = await User_1.User.find({ _id: { $ne: req.user._id } } // Exclude current user
        ).select('_id username'); // Only return necessary fields
        // Fetch profile pictures for all users
        const { Picture } = await Promise.resolve().then(() => __importStar(require('../models/Picture')));
        const userIds = users.map(user => user._id);
        const pictures = await Picture.find({ ownerId: { $in: userIds } });
        // Create a map of userId -> profilePictureUrl
        const pictureMap = new Map();
        pictures.forEach(pic => {
            pictureMap.set(pic.ownerId.toString(), pic.url);
        });
        // Add profilePictureUrl to each user
        const usersWithPictures = users.map(user => ({
            _id: user._id,
            username: user.username,
            profilePictureUrl: pictureMap.get(user._id.toString()) || null
        }));
        return res.status(200).json(usersWithPictures);
    }
    catch (error) {
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});
exports.default = userRouter;
