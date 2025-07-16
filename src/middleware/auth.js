const axios = require("axios");
const axiosInstance = axios.create({
    baseURL: process.env.ULTIMATE_UTILITY_AUTH_URL,
    withCredentials: true
});

const auth = async (req, res, next) => {
    try {
        let token = req.cookies.token;
        // let token;
        // console.log("token", token)
        
        if(!token) {
            if(req.body.code) {
                // console.log("Step 2 success", req.body.code)
                token = await checkIfValidCode(req.body.code);
                // console.log("Step 3 success", token);
            } else {
                throw new Error();
            }
        }

        // if(!author) throw new Error({ error: "Please authenticate." });
        let verifyToken = await checkIfValidToken(token);
        if(!verifyToken) {
            if(req.body.code) {
                // console.log("Step 2 success", req.body.code)
                token = await checkIfValidCode(req.body.code);
                // console.log("Step 3 success", token);
                verifyToken = await checkIfValidToken(token);
            } else {
                throw new Error();
            }
        }
        const {userName, userId} = verifyToken;
        if(!userName) throw new Error();

        req.token = token;
        req.userName = userName;
        req.userId = userId;
        next();
    } catch (e) {
        res.status(401).send({ error: "Please authenticate." });
    }
}

const checkIfValidCode = async (code) => {
    try {
        const response = await axiosInstance.post("/sso/crossAppLogin", { code });
        // console.log("response",response.data)
        return response.data;
    } catch (e) {
        // console.log("Step 3 failed")
        return undefined;
    };
}

const checkIfValidToken = async (token) => {
    try {
        const response = await axiosInstance.post("/user/me", { token });
        // console.log("Step 4 success")
        return response.data;
    } catch (e) {
        // console.log("Step 4 failed")
        return undefined;
    }
}

module.exports = auth;