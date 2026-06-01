import jwt from "jsonwebtoken";

export const generateJWT = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
}

export const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export const tempJWT = (payload) => {
    return jwt.sign(payload, process.env.JWT_TEMP_SECRET, { expiresIn: '5m' });
}

export const verifyJWT = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error("Invalid token");
    }
}
export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
        throw new Error("Invalid refresh token");
    }
}


export const verifyTempJWT = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_TEMP_SECRET);
    } catch (error) {
        throw new Error("Invalid temporary token");
    }
}