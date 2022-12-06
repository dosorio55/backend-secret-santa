import jwt from "jsonwebtoken"

const isAuth = (req, res, next) => {

    const authorization = req.headers.authorization

    if (!authorization) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized",
            data: null
        })
    }

    const [bearerString, jwtString] = authorization.split(" ")

    if (bearerString !== "Bearer") {
        return res.status(400).json({
            status: 400,
            message: "Bad Request",
            data: null
        })
    }

    try {
        var token = jwt.verify(jwtString, req.app.get("secretKey"));
    } catch (err) {
        return next(err)
    }

    const authority = {
        id: token.id,
        email: token.email,
        rol: token.rol
    }

    req.authority = authority;
    next();
}
export { isAuth }