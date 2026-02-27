import { body } from "express-validator";

// This file contains the inputvalidation for user registration and login using express-validator.
// It is implemented from the lecture example.

const registerValidation = [
   body("email")
        .trim()
        .isEmail().withMessage("Must be a valid email address")
        .escape()
        .normalizeEmail(),

    body("username")
        .trim()
        .isLength({ min: 3, max: 25 }).withMessage("Username must be between 3 and 25 characters")
        .escape(),

    body("password")
        .isStrongPassword({
            minLength: 8,
            minUppercase: 1,
            minLowercase: 1,
            minNumbers: 1,
            minSymbols: 1
        }).withMessage("Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol")
        .escape()
];

const loginValidation = [
    body("email")
        .trim()
        .isEmail().withMessage("Must be a valid email address")
        .escape()
        .normalizeEmail(),

        body("password")
        .notEmpty().withMessage("Password cannot be empty")
        .escape()
]

export { registerValidation, loginValidation };