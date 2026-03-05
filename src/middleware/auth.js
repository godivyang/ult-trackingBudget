const axios = require("axios");
const { getError } = require("./response.js");
const axiosInstance = axios.create({
    baseURL: process.env.ULTIMATE_UTILITY_AUTH_URL,
    withCredentials: true
});

const auth = async (req, res, next) => {
    try {
        let token = req.body?.code || req.cookies?.token;
        
        if(!token) throw new Error("No token found.");

        if(req.body?.code) token = await checkIfValidCode(req.body.code);

        let userDetails = await checkIfValidToken(token);
        
        if(!userDetails && req.body?.code && req.cookies?.token) {
            token = req.cookies.token;
            userDetails = await checkIfValidToken(token);
        }

        if(!userDetails) throw new Error("Login token expired.");

        const {name, _id} = userDetails;
        
        if(!name) throw new Error("Token verified but user not found.");

        req.token = token;
        req.userName = name;
        req.userId = _id;

        next();
    
    } catch (e) {
        res.status(401).send(getError({
            code: "AUTH_ERROR",
            message: e.message
        }));
    }
}

const checkIfValidCode = async (code) => {
    try {
        const response = await axiosInstance.post("/sso/crossAppLogin", { code });
        return response.data.data;
    } catch (e) {
        return undefined;
    };
}

const checkIfValidToken = async (token) => {
    try {
        const response = await axiosInstance.post("/user/me", { token });
        return response.data.data;
    } catch (e) {
        return undefined;
    }
}

module.exports = auth;