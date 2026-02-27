import {Request, Response, NextFunction} from "express"
import jwt, {JwtPayload} from "jsonwebtoken"
import dotenv from "dotenv"

// This file contains middleware functions for validating JWT tokens and checking for admin privileges. 
// It is implemented from the lecture example.

dotenv.config()

interface TokenPayload extends JwtPayload {
    _id?: string
    username?: string
    isAdmin?: boolean
}

interface CustomRequest extends Request {
    user?: TokenPayload
}

// Middleware for authenticated users
export const validateToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.header('authorization')
    const token: string | undefined = authHeader?.split(" ")[1]

    if (!token) return res.status(401).json({message: "Token not found."})

    try {
        const verified = jwt.verify(token, process.env.SECRET as string) as TokenPayload
        req.user = verified
        next()
    } catch (error: any) {
        return res.status(401).json({message: "Invalid token."})
    }
}

// Middleware for admin-only routes
export const validateAdmin = (req: CustomRequest, res: Response, next: NextFunction) => {
    const authHeader = req.header('authorization')
    const token: string | undefined = authHeader?.split(" ")[1]

    if (!token) return res.status(401).json({message: "Token not found."})

    try {
        const verified = jwt.verify(token, process.env.SECRET as string) as TokenPayload
        if (!verified.isAdmin) return res.status(403).json({message: "Access denied."})
        req.user = verified
        next()
    } catch (error: any) {
        return res.status(401).json({message: "Invalid token."})
    }
}