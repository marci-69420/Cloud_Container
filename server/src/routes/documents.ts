import { Request, Response, Router } from 'express';
import { DocumentModel } from '../models/Document';
import { validateToken } from '../middlewares/validateToken';

const documentRouter: Router = Router();

//Router for the documents with protected routes with JWT token

// POST to create a new document
documentRouter.post("/", validateToken, async (req: any, res: Response) => {
    try {
        const newDocument = await DocumentModel.create({
            title: req.body.title,
            content: req.body.content,
            ownerId: req.user._id,    // Set as owner
            sharedWith: [],           // Empty array initially
            isEditing: false          // Default to not editing

        })

        return res.status(201).json("New document created successfully.")
    } catch (error: any) {
        return res.status(500).json({ error: 'Error creating document' })
    }
})

//GET all documents for the authenticated user (owned or shared)
documentRouter.get("/", validateToken, async (req: any, res: Response) => {
    try {
        const documents = await DocumentModel.find({
            $or: [
                { ownerId: req.user._id },
                { sharedWith: req.user._id }
            ]
            
        });
        return res.status(200).json(documents)
    } catch (error: any) {
        return res.status(500).json({ error: 'Error fetching documents' });  
    }
})

//GET a single document for non-authenticated user
documentRouter.get("/public/:id", async (req: Request, res: Response) => {
    try {
        const document = await DocumentModel.findOne({ _id: req.params.id });
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        return res.status(200).json(document);
    } catch (error: any) {
        return res.status(500).json({ error: 'Error fetching document' });  
    }
});

//GET a single document by ID for the authenticated user
documentRouter.get("/:id", validateToken, async (req: any, res: Response) => {
    try {
        // If the document exists and is currently locked, block access
        const existingDoc = await DocumentModel.findById(req.params.id);
        if (existingDoc && existingDoc.isEditing) {
            console.log("Document is currently being edited by someone else. Access denied.")
            return res.status(403).json({ message: 'Document is currently being edited by someone else' });
        }
        const document = await DocumentModel.findOneAndUpdate(
            {
                _id: req.params.id,
                $or: [
                    { ownerId: req.user._id },
                    { sharedWith: req.user._id }
                ]
            },
            { $set: { isEditing: true } }, // Set the document as being edited
            { returnDocument: 'after' }
        );
        
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        

        console.log("document being edited:", document)
        return res.status(200).json(document);
    } catch (error: any) {
        return res.status(500).json({ error: 'Error fetching document' });  
    }
});

//PUT to update a document by ID for the authenticated user
documentRouter.put("/:id", validateToken, async (req: any, res: Response) => {
    try {
        const updatedDocument = await DocumentModel.findOneAndUpdate(
            { 
                _id: req.params.id, 
                $or: [
                    { ownerId: req.user._id },
                    { sharedWith: req.user._id }
                ]
            },
            { 
                $set: {
                    title: req.body.title, 
                    content: req.body.content,
                    isEditing: false 
                }
            },
            { returnDocument: 'after' } 
        )
        
        if (!updatedDocument) {
            return res.status(404).json({ message: "Document not found or unauthorized" })
        }
        console.log("Document updated:", updatedDocument)
        return res.status(200).json(updatedDocument)

    } catch (error: any) {
        return res.status(500).json({ error: 'Error updating document' });
    }
})

//PATCH to unlock a document when component unmounts
documentRouter.patch("/:id/unlock", validateToken, async (req: any, res: Response) => {
    try {
        const document = await DocumentModel.findOneAndUpdate(
            { 
                _id: req.params.id,
                $or: [
                    { ownerId: req.user._id },
                    { sharedWith: req.user._id }
                ]
            },
            { $set: { isEditing: false } },
            { returnDocument: 'after' }
        );
        
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        console.log("Document unlocked:", document._id);
        return res.status(200).json({ message: 'Document unlocked successfully' });
    } catch (error: any) {
        return res.status(500).json({ error: 'Error unlocking document' });
    }
});

//DELETE a document by ID for the authenticated user (only owner can delete, shared users can only remove access)
documentRouter.delete("/:id", validateToken, async (req: any, res: Response) => {
    try {
        const document = await DocumentModel.findOne({ _id: req.params.id });
        
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        // Check if user is the owner
        if (document.ownerId.toString() === req.user._id.toString()) {
            // Owner: DELETE from database
            await DocumentModel.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Document deleted permanently' });
        } else {
            // Shared user: Remove from sharedWith array
            await DocumentModel.findByIdAndUpdate(
                req.params.id,
                { $pull: { sharedWith: req.user._id } }
            );
            console.log("Access revoked for user ID:", req.user._id, "or the document is deleted if the user is the owner")
            return res.status(200).json({ message: 'Access revoked' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Error deleting document' });
    }
});


// POST to share a document with another user (only owner can share)
documentRouter.post("/:id/share", validateToken, async (req: any, res: Response) => {
    try {
        const { userIdToShare } = req.body; // User to share with
        const document = await DocumentModel.findOne({
            _id: req.params.id,
            ownerId: req.user._id 
        });
        
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        // Add user to sharedWith array (if not already there)
        if (!document.sharedWith.includes(userIdToShare)) {
            document.sharedWith.push(userIdToShare);
            await document.save();
        }
        console.log("Document shared with user ID:", userIdToShare)
        return res.status(200).json({ message: 'Document shared successfully' });

    } catch (error: any) {
        return res.status(500).json({ error: 'Error sharing document' });
    }
})

export default documentRouter 