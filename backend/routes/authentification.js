const express = require("express");
const bcrypt = require("bcrypt");
const authRouter = express.Router();
const userAuth = require("../model/authuser");
const jwt = require("jsonwebtoken");
const isAuth = require("../middleware/isAuth");
const {
  registerValidation,
  login,
  validation,
} = require("../middleware/RegisterValidation");
// register
authRouter.post(
  "/register",
  registerValidation,
  validation,
  async (req, res) => {
    try {
      const { name, lastname, email, password } = req.body;
      // talwij mte3 el user  email deja mwjoud
      const founduser = await userAuth.findOne({ email });
      if (founduser) {
        return res
          .status(404)
          .json({ msg: "vous avez deja un compte voir le login" });
      }
      const newUser = await new userAuth(req.body);
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(password, salt);
      newUser.password = hash;
      newUser.save();
      res
        .status(200)
        .json({ msg: "you did a good job welcome to the platform", newUser });
    } catch (err) {
      console.log(err);
    }
  }
);

// login

authRouter.post("/login", login, validation, async (req, res) => {
  try {
    const { email, password } = req.body;
    const founduser = await userAuth.findOne({ email });

    if (!founduser) {
      return res.status(404).json({ msg: "error register please " });
    }

    const match = await bcrypt.compare(password, founduser.password);

    if (!match) {
      return res.status(404).json({ msg: "error wrong mdp" });
    }

    const payload = { id: founduser._id };
    var token = jwt.sign(payload, process.env.privateKey);
    res.status(200).send({ msg: "welcome ", founduser, token });
  } catch (err) {
    console.log(err);
  }
});

//view profil
authRouter.get("/account", isAuth, async (req, res) => {
  res.send(req.user);
});

module.exports = authRouter;
