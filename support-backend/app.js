import express from "express";
import cors from "cors";
import session from "express-session";
import connectMongo from "connect-mongo";
import helmet from "helmet";
import morgan from "morgan";
import errorMiddleware from "./middlerwares/centralErrorMiddleware.js";

const MongoStore = connectMongo.create;
console.log("log");
const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: [
        "GET",
        "POST",
        "PUT",
        "PATCH",
        "DELETE"
    ]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());
app.use(morgan("dev"));
app.use(errorMiddleware)
app.use(session({
    secret: process.env.SECRET_KEY,
    rolling: true,
    resave: false,
    saveUninitialized: false,

    store: MongoStore({
        mongoUrl: process.env.CONNECTION_URL,
        collectionName: "sessions"
    }),

    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    }
}));

export default app;