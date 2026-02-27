"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Picture_1 = require("../models/Picture");
const validateToken_1 = require("../middlewares/validateToken");
const pictureRouter = (0, express_1.Router)();
// This file contains the routes for profile pictures (all routes are protected with JWT token)
// POST Upload a picture
pictureRouter.post("/upload", validateToken_1.validateToken, async (req, res) => {
    try {
        const newPicture = await Picture_1.Picture.create({
            url: req.body.url,
            ownerId: req.user._id
        });
        console.log("New picture created by user with ID:", newPicture.ownerId);
        return res.status(200).json({ message: "Picture uploaded successfully.", newPicture });
    }
    catch (error) {
        console.error("Upload error:", error);
        return res.status(500).json({ error: 'Error uploading picture' });
    }
});
// GET profile picture for the authenticated user
pictureRouter.get("/", validateToken_1.validateToken, async (req, res) => {
    try {
        const pictures = await Picture_1.Picture.find({ ownerId: req.user._id });
        console.log(`Fetched pictures for user with ID: ${req.user._id}`);
        return res.status(200).json({ pictures });
    }
    catch (error) {
        return res.status(500).json({ error: 'Error fetching pictures' });
        0;
    }
});
// PUT Update profile picture for the authenticated user 
pictureRouter.put("/update", validateToken_1.validateToken, async (req, res) => {
    try {
        const updatedPicture = await Picture_1.Picture.findOneAndUpdate({ ownerId: req.user._id }, { url: req.body.url }, { new: true });
        return res.status(200).json({ message: "Picture updated successfully.", updatedPicture });
    }
    catch (error) {
        return res.status(500).json({ error: 'Error updating picture' });
    }
});
// DELETE profile picture for the authenticated user
pictureRouter.delete("/delete", validateToken_1.validateToken, async (req, res) => {
    try {
        await Picture_1.Picture.findOneAndDelete({ ownerId: req.user._id });
        console.log("Profile picture deleted for user with ID:", req.user._id);
        return res.status(200).json({ message: "Picture deleted successfully." });
    }
    catch (error) {
        return res.status(500).json({ error: 'Error deleting picture' });
    }
});
exports.default = pictureRouter;
