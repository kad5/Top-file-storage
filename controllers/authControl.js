const asyncHandler = require("express-async-handler");
const db = require("../db/queries");
const { passport } = require("../mw/passportConfig");
const bcrypt = require("bcryptjs");

const signUp = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const isTaken = await db.getUserByUsername(username);
    if (isTaken) {
      const payload = {
        errors: { username: "The username is already taken" },
        formData: { username },
      };
      return res.render("sign-up", { payload });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.createUser(username, hashedPassword);
  } catch (err) {
    return next(err);
  }
});

const logIn = passport.authenticate("local", {
  successRedirect: "/storage/dashboard",
  failureRedirect: "/auth/log-in",
  failureMessage: true,
});

const logOut = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};

module.exports = { signUp, logIn, logOut };
