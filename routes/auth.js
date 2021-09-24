const express = require("express");
const router = new express.Router();
const ExpressError = require("../expressError");
const { SECRET_KEY } = require("../config")
const User = require("../models/user");
const jwt = require("jsonwebtoken");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

router.post("/login", async (req, res, next) => {
    try {
        const {username, password} = req.body;
        if (!username || !password) {
            throw new ExpressError("Username and password required", 400)
        };
        const exists = await User.authenticate(username, password);
        if (exists === true) {
            await User.updateLoginTimestamp(username);
            const token = jwt.sign({username}, SECRET_KEY);
            return res.send({token});
        };
        throw new ExpressError("Invalid user/password", 400)
    } catch (e) {
        return next(e)
    }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

router.post("/register", async (req, res, nest) => {
    try {
        if (Object.keys(req.body).length !== 5) {
            throw new ExpressError("Please fill in all forms", 400)
        };
        const user = await User.register(req.body);
        const token = jwt.sign({username: user.username}, SECRET_KEY);
        return res.send({token});
    } catch (e) {
        return next(e)
    }
})

module.exports = router;