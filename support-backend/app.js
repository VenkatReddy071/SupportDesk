import express from "express";
import cors from "cors";
import session from "express-session";
import connectMongo from "connect-mongo";
import helmet from "helmet";
import morgan from "morgan";
import errorMiddleware from "./middlerwares/centralErrorMiddleware.js";
import companyRouter from "./routes/Company/Company.routes.js";
import roleRouter from "./routes/Users/roles.js";
import { createCompanySchema } from "./schemaValidators/company/company.js";
import RoleSchema from "./models/users/roles.js";
import validateRequest from "./middlerwares/ValidateRequest.js";
import { authMiddleware } from "./security/middlewares/AuthMiddleware.js";
import { roleBasedRoutes } from "./security/middlewares/roleBasedRoutes.js";
import authRouter from "./routes/Users/auth.js";
const MongoStore = connectMongo.create;

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

app.use("/company", validateRequest(createCompanySchema), companyRouter);
app.use("/role", authMiddleware,roleBasedRoutes("ADMIN"), validateRequest(RoleSchema), roleRouter);
app.use("/user", authMiddleware, roleBasedRoutes("ADMIN"), validateRequest(RoleSchema), roleRouter);
app.use("/auth", authRouter);
app.use(errorMiddleware)
export default app;