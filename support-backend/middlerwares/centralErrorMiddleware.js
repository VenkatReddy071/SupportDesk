const errorMiddleware = (error, req, res, next) => {
    const statusCode = error?.statusCode || 500;

    error.message = error?.message || "Internal Serve error";


    if (error?.name === 'ValidationError') {
        const messages = Object.values(
            err.errors
        ).map((val) => val.message);

        err.message = messages.join(", ");

        err.statusCode = 400;
    }
    if (err.name === "JsonWebTokenError") {

        err.message = "Invalid token";

        err.statusCode = 401;
    }

    if (err.name === "TokenExpiredError") {

        err.message = "Token expired";

        err.statusCode = 401;
    }
    return res.status(statusCode).json({
        success: false,
        message: error?.message || "Interval Server error",
        stack: process.env.NODE_ENV === "development"
            ? err.stack
            : undefined
    })
}

export default errorMiddleware;