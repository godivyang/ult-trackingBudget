const axios = require("axios");

const auth = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");
        const author = await checkIfValid(authHeader);

        if(!author) throw new Error({ error: "Please authenticate." });

        req.author = author;
        next();
    } catch (e) {
        res.status(401).send({ error: "Please authenticate." });
    }
}

const checkIfValid = async (token) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'http://localhost:3000/user/isValid',
        headers: { 
            'Authorization': token
        }
    };

    let response = await axios.request(config)
    .then((res) => {
        return res.data;
    })
    .catch((e) => {
        return undefined;
    });

    return response;
}

module.exports = auth;