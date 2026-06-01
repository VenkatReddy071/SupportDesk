const errorMiddleware = (error, req, res, next) => {

    let statusCode = error.statusCode || 500;
    let message = error.message || "Internal Server Error";

    if (error.name === "ValidationError") {
        const messages = Object.values(error.errors)
            .map(val => val.message);

        message = messages.join(", ");
        statusCode = 400;
    }

    if (error.name === "JsonWebTokenError") {
        message = "Invalid token";
        statusCode = 401;
    }

    if (error.name === "TokenExpiredError") {
        message = "Token expired";
        statusCode = 401;
    }

    return res.status(statusCode).json({
        success: false,
        message,
        stack:
            process.env.NODE_ENV === "development"
                ? error.stack
                : undefined
    });
};

export default errorMiddleware;