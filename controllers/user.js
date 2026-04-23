const {v4: uuidv4} = require('uuid');
const User = require('../models/user');
const {setUser} = require('../service/auth');

async function handleUserSignup(req, res) {
    const {name, email, password } = req.body;
    try {
        await User.create({
            name,
            email,
            password,
        });
        return res.json({ success: true, message: "User created successfully" });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ error: "Email already exists" });
        }
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

async function handleUserLogin(req, res) {
    const {email, password } = req.body;
    const user = await User.findOne({
        email,
        password,
    });
    if(!user) return res.status(401).json({
        error: "Invalid Username or Password",
    });
    const sessionId = uuidv4();
    setUser(sessionId, user);
    res.cookie("uid", sessionId)
    return res.json({ success: true, message: "Logged in successfully", user: { name: user.name, email: user.email } });
}

module.exports = {
    handleUserSignup,
    handleUserLogin,
};


