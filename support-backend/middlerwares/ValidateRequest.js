const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.validate(req.body, {
                abortEarly: false
            });

            next();
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };
};

export default validateRequest;