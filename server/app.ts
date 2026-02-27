import express,{Express, NextFunction, Request, Response} from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import mongoose, { Connection } from 'mongoose'
import userRouter from './src/routes/users'
import cors, { CorsOptions } from 'cors';
import documentRouter from './src/routes/documents'
import pictureRouter from './src/routes/pictures'
import path from 'path'

dotenv.config()
const app: Express = express()
const port: number = 3000

// Enable CORS for frontend
if (process.env.NODE_ENV === 'development') {
    const corsOptions: CorsOptions = {
        origin: 'http://localhost:3500',
        optionsSuccessStatus: 200,
        credentials: true
    };

    app.use(cors(corsOptions));

} else if (process.env.NODE_ENV === 'production') {
    // Serve static files from the client build folder
    app.use(express.static(path.resolve(__dirname, '..', '..', 'client', 'build')));
}

// Set up mongodb connection
mongoose.set('strictQuery', false)
const mongoDB: string = "mongodb://localhost:27017/CloudContainerdb"
mongoose.set('strictQuery', false)
mongoose.connect(mongoDB)
mongoose.Promise = Promise
const db: Connection = mongoose.connection
db.on("error", console.error.bind(console, "MongoDB connection error"))

// The maximum request body size to 10MB to accept profile pictures
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(morgan("dev"))

// Set up routes
app.use("/user", userRouter)
app.use("/documents", documentRouter)
app.use("/pictures", pictureRouter)

// SPA fallback for production - serve index.html for all other routes (implemented with copilot)
if (process.env.NODE_ENV === 'production') {
    app.use((req: Request, res: Response) => {
        res.sendFile(path.resolve(__dirname, '..', '..', 'client', 'build', 'index.html'));
    });
}

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`)
    console.log(`Press CTRL+C to stop server`)
})