const axios = require("axios");
const axiosInstance = axios.create({
    baseURL: process.env.ULTIMATE_UTILITY_AUTH_URL,
    withCredentials: true
});

const auth = async (req, res, next) => {
    try {
        let token = req.cookies.token;
        
        if(!token) {
            if(req.body.code) {
                // console.log(token)
                token = await checkIfValidCode(req.body.code);
            } else {
                throw new Error();
            }
        }

        // if(!author) throw new Error({ error: "Please authenticate." });
        user = await checkIfValidToken(req.body.code);

        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: "Please authenticate." });
    }
}

const checkIfValidCode = async (code) => {
    try {
        const response = await axiosInstance.post("/sso/crossAppLogin", { code });
        console.log("response",response.data)
        return response.data;
    } catch (e) {
        return undefined;
    };
}

const checkIfValidToken = async (token) => {
    try {
        const response = await axiosInstance.post("/user/me", { token });
        return response.data;
    } catch (e) {
        return undefined;
    }
}

module.exports = auth;