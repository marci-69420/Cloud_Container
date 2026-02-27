import { Request, Response, Router } from 'express'
import { Result, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import { User, IUser } from '../models/User'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { registerValidation, loginValidation } from '../validators/inputValidation'
import { validateToken } from '../middlewares/validateToken'

const userRouter: Router = Router()

// This file contains the routes for user registration, login, and profile management. All routes are protected with JWT token except for registration and login.

// POST Register a user with hashed password
userRouter.post("/register/", 
    registerValidation,
    async (req: Request, res: Response) => {
        const errors: Result = validationResult(req)

        if(!errors.isEmpty()) {
            console.log(errors);
            return res.status(400).json({errors: errors.array()})
            
        }
    try {
        const existingUser: IUser | null = await User.findOne({email: req.body.email})
        console.log(existingUser)
        if (existingUser) {
            return res.status(403).json({email: "email already in use"})
        }

        const salt: string = bcrypt.genSaltSync(10)
        const hash: string = bcrypt.hashSync(req.body.password, salt)

        const newUser = await User.create({
            email: req.body.email,
            password: hash,
            username: req.body.username,
        
            
        })

        return res.status(200).json(newUser)

    } catch (error: any) {
        console.error(`Error during registration: ${error}`)
        return res.status(500).json({error: "Internal Server Error"})
    }

    }
)

// POST Login a user
userRouter.post("/login",
    loginValidation,
    async (req: Request, res: Response) => {
        try {
            const user: IUser | null = await User.findOne({email: req.body.email})

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

            if (!user) {
                return res.status(404).json({message: "User does not found with that email"})
            }

            if (bcrypt.compareSync(req.body.password, user.password as string)) {
                const jwtPayload = {
                    _id: user._id,
                    username: user.username
                }
                const token: string = jwt.sign(jwtPayload, process.env.SECRET as string, { expiresIn: "1h"})

                console.log("Login successful, token generated:", token)
                return res.status(200).json({success: true, token})
            }
            return res.status(401).json({message: "Wrong password"})



        } catch(error: any) {
            console.error(`Error during user login: ${error}`)
            return res.status(500).json({ error: 'Internal Server Error' })
        }
    }
)

//GET user
userRouter.get("/profile", validateToken, async (req: any, res: Response) => {
        try {
            const user: IUser | null = await User.findById(req.user._id).select('-password')
            if (!user) {
                return res.status(404).json({message: "User not found"})
            }
            console.log("User found:", user)
            return res.status(200).json(user)
        } catch(error: any) {
            console.error(`Error fetching profile: ${error}`)
            return res.status(500).json({ error: 'Internal Server Error' })
        }
    }
)

//GET all users the name for all users for sharing documents (admin only route)
userRouter.get("/list", validateToken, async (req: any, res: Response) => {
    try {
        const users = await User.find(
            { _id: { $ne: req.user._id } }  // Exclude current user
        ).select('_id username');     // Only return necessary fields

        // Fetch profile pictures for all users
        const { Picture } = await import('../models/Picture');
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

        return res.status(200).json(usersWithPictures)
    } catch (error: any) {
        return res.status(500).json({ error: 'Internal Server Error' })
    }
})


export default userRouter