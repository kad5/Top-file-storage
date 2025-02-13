const control = require("../controllers/authControl");
const validate = require("../mw/validation");
const access = require("../mw/authentication");

const { Router } = require("express");
const router = Router();

router
  .route("/sign-up")
  .get(access.publicOnly, (req, res) =>
    res.render("sign-up", { payload: null })
  )
  .post(access.publicOnly, control.signUp);

router
  .route("/log-in")
  .get(access.publicOnly, (req, res) => res.render("log-in", { payload: null }))
  .post(access.publicOnly, control.logIn);

router.get("/log-out", access.privateOnly, control.logOut);

module.exports = router;
