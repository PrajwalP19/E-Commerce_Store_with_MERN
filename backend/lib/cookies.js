

export const setCookies = (res, refreshToken, accessToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,  //prevents XSS attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",  //prevents CSRF attacks
        maxAge: 20*60*1000   //20 minutes
    })

    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,  //prevents XSS attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",  //prevents CSRF attacks
        maxAge: 7*24*60*60*1000   //7 days
    })
}

