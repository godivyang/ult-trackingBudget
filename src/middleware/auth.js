const axios = require("axios");

const auth = async (req, res, next) => {
    try {
        let token = req.cookies.token, author;
        
        if(!token) {
            if(req.body.token) {
                console.log(token)
                author = await checkIfValid(req.body.token);
            } else {
                throw new Error();
            }
        }
        if(!author) throw new Error({ error: "Please authenticate." });

        req.author = author;
        next();
    } catch (e) {
        res.status(401).send({ error: "Please authenticate." });
    }
}

const checkIfValid = async (token) => {
    const axiosInstance = axios.create({
        baseURL: process.env.ULTIMATE_UTILITY_AUTH_URL,
        withCredentials: true
    });
    
    try {
        const response = await axiosInstance.get("/user/" + token);
        console.log("response",response)
        return response.data;
    } catch (e) {
        return undefined;
    };
}

module.exports = auth;