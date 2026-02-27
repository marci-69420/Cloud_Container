import { Request, Response, Router } from 'express';
import { Picture } from '../models/Picture';
import { validateToken } from '../middlewares/validateToken';

const pictureRouter: Router = Router();

// This file contains the routes for profile pictures (all routes are protected with JWT token)

// POST Upload a picture
pictureRouter.post("/upload", validateToken, async (req: any, res: Response) => {
    try {
        const newPicture = await Picture.create({
            url: req.body.url,
            ownerId: req.user._id 
        });
        
        console.log("New picture created by user with ID:", newPicture.ownerId);
        return res.status(200).json({ message: "Picture uploaded successfully.", newPicture });
    } catch (error: any) {
        console.error("Upload error:", error); 
        return res.status(500).json({ error: 'Error uploading picture' });
    }
});

// GET profile picture for the authenticated user
pictureRouter.get("/", validateToken, async (req: any, res: Response) => {
    try {
        const pictures = await Picture.find({ ownerId: req.user._id });
        
        console.log(`Fetched pictures for user with ID: ${req.user._id}`);
        return res.status(200).json({ pictures });
    } catch (error: any) {
        return res.status(500).json({ error: 'Error fetching pictures' });0
    }
});

// PUT Update profile picture for the authenticated user 
pictureRouter.put("/update", validateToken, async (req: any, res: Response) => {
    try {
        const updatedPicture = await Picture.findOneAndUpdate(
            { ownerId: req.user._id },
            { url: req.body.url },
            { new: true }
        );
        return res.status(200).json({ message: "Picture updated successfully.", updatedPicture });
    } catch (error: any) {
        return res.status(500).json({ error: 'Error updating picture' });
    }
});

// DELETE profile picture for the authenticated user
pictureRouter.delete("/delete", validateToken, async (req: any, res: Response) => {
    try {
        await Picture.findOneAndDelete({ ownerId: req.user._id });
        console.log("Profile picture deleted for user with ID:", req.user._id);
        return res.status(200).json({ message: "Picture deleted successfully." });
    } catch (error: any) {
        return res.status(500).json({ error: 'Error deleting picture' });
    }
});

export default pictureRouter;