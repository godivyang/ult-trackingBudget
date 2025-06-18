const axios = require("axios");

const auth = async (req, res, next) => {
    try {
        let token = req.cookies.token;
        
        if(!token) throw new Error();
        const author = await checkIfValid();
        
        if(!author) throw new Error({ error: "Please authenticate." });

        req.author = author;
        next();
    } catch (e) {
        res.status(401).send({ error: "Please authenticate." });
    }
}

const checkIfValid = async () => {
    const axiosInstance = axios.create({
        baseURL: process.env.ULTIMATE_UTILITY_AUTH_URL,
        withCredentials: true
    });
    
    try {
        const response = await axiosInstance.get("/user/me");
        console.log("response",response)
        return response.data;
    } catch (e) {
        return undefined;
    };
}

module.exports = auth;