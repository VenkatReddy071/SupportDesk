const errorMiddleware=(error,req,res,next)=>{
    const statusCode=error?.statusCode || 500;

    return res.status(statusCode).json({
        success:false,
        message:error?.message || "Interval Server error",
        stack:process.env.NODE_ENV === "development"
            ? err.stack
            : undefined
    })
}

export default errorMiddleware;