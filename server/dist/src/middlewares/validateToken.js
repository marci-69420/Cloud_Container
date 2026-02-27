"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateAdmin = exports.validateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
// This file contains middleware functions for validating JWT tokens and checking for admin privileges. 
// It is implemented from the lecture example.
dotenv_1.default.config();
// Middleware for authenticated users
const validateToken = (req, res, next) => {
    const authHeader = req.header('authorization');
    const token = authHeader?.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "Token not found." });
    try {
        const verified = jsonwebtoken_1.default.verify(token, process.env.SECRET);
        req.user = verified;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid token." });
    }
};
exports.validateToken = validateToken;
// Middleware for admin-only routes
const validateAdmin = (req, res, next) => {
    const authHeader = req.header('authorization');
    const token = authHeader?.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "Token not found." });
    try {
        const verified = jsonwebtoken_1.default.verify(token, process.env.SECRET);
        if (!verified.isAdmin)
            return res.status(403).json({ message: "Access denied." });
        req.user = verified;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: "Invalid token." });
    }
};
exports.validateAdmin = validateAdmin;
