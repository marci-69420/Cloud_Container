"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const users_1 = __importDefault(require("./src/routes/users"));
const cors_1 = __importDefault(require("cors"));
const documents_1 = __importDefault(require("./src/routes/documents"));
const pictures_1 = __importDefault(require("./src/routes/pictures"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
// Enable CORS for frontend
if (process.env.NODE_ENV === 'development') {
    const corsOptions = {
        origin: 'http://localhost:3500',
        optionsSuccessStatus: 200,
        credentials: true
    };
    app.use((0, cors_1.default)(corsOptions));
}
else if (process.env.NODE_ENV === 'production') {
    // Serve static files from the client build folder
    app.use(express_1.default.static(path_1.default.resolve(__dirname, '..', '..', 'client', 'build')));
}
// Set up mongodb connection
mongoose_1.default.set('strictQuery', false);
const mongoDB = "mongodb://localhost:27017/CloudContainerdb";
mongoose_1.default.set('strictQuery', false);
mongoose_1.default.connect(mongoDB);
mongoose_1.default.Promise = Promise;
const db = mongoose_1.default.connection;
db.on("error", console.error.bind(console, "MongoDB connection error"));
// The maximum request body size to 10MB to accept profile pictures
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
app.use((0, morgan_1.default)("dev"));
// Set up routes
app.use("/user", users_1.default);
app.use("/documents", documents_1.default);
app.use("/pictures", pictures_1.default);
// SPA fallback for production - serve index.html for all other routes (implemented with copilot)
if (process.env.NODE_ENV === 'production') {
    app.use((req, res) => {
        res.sendFile(path_1.default.resolve(__dirname, '..', '..', 'client', 'build', 'index.html'));
    });
}
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
    console.log(`Press CTRL+C to stop server`);
});
