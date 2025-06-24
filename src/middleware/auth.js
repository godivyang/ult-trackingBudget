const axios = require("axios");
const axiosInstance = axios.create({
    baseURL: process.env.ULTIMATE_UTILITY_AUTH_URL,
    withCredentials: true
});

const auth = async (req, res, next) => {
    try {
        // let token = req.cookies.token;
        let token;
        
        if(!token) {
            if(req.body.code) {
                console.log(req.body)
                token = await checkIfValidCode(req.body.code);
            } else {
                throw new Error();
            }
        }

        // if(!author) throw new Error({ error: "Please authenticate." });
        const user = await checkIfValidToken(token);
        if(!user) throw new Error();

        req.token = token;
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
        // console.log(response.data)
        return response.data;
    } catch (e) {
        return undefined;
    }
}

module.exports = auth;