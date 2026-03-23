const getError = ({code="ERROR", message="Something went wrong.", detail=""}) => {
    return {
        success: false,
        code,
        message,
        detail
    }
}

const getSuccess = ({code="SUCCESS", message="Service executed successfully.", data=[]}) => {
    return {
        success: true,
        code,
        message,
        data
    }
}

const tokenOptions = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE == "true",
    sameSite: process.env.COOKIE_SAME_SITE,
    maxAge: 7 * 24 * 60 * 60 * 1000
};

const setCookie = (res, token) => {
    res.cookie("token", token, tokenOptions);
};

export {getError, getSuccess, setCookie}