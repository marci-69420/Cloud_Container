"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = exports.registerValidation = void 0;
const express_validator_1 = require("express-validator");
// This file contains the inputvalidation for user registration and login using express-validator.
// It is implemented from the lecture example.
const registerValidation = [
    (0, express_validator_1.body)("email")
        .trim()
        .isEmail().withMessage("Must be a valid email address")
        .escape()
        .normalizeEmail(),
    (0, express_validator_1.body)("username")
        .trim()
        .isLength({ min: 3, max: 25 }).withMessage("Username must be between 3 and 25 characters")
        .escape(),
    (0, express_validator_1.body)("password")
        .isStrongPassword({
        minLength: 8,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }).withMessage("Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol")
        .escape()
];
exports.registerValidation = registerValidation;
const loginValidation = [
    (0, express_validator_1.body)("email")
        .trim()
        .isEmail().withMessage("Must be a valid email address")
        .escape()
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .notEmpty().withMessage("Password cannot be empty")
        .escape()
];
exports.loginValidation = loginValidation;
