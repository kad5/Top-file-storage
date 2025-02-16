const control = require("../controllers/authControl");
const validate = require("../mw/validation");
const read = require("../controllers/storage/read");
const access = require("../mw/authentication");
const { Router } = require("express");
const router = Router();

//router.get("/", (req, res) => res.render("home"));
router.get("/shared/:linkId/", read.renderSharedPublic);
router.get("/shared/:linkId/:folderId", read.renderSharedPublic);
router
  .route("/sign-up")
  .get(access.publicOnly, (req, res) =>
    res.render("sign-up", { payload: null })
  )
  .post(access.publicOnly, validate.signUp, control.signUp);

router
  .route("/log-in")
  .get(access.publicOnly, (req, res) => res.render("log-in", { payload: null }))
  .post(access.publicOnly, validate.logIn, control.logIn);

router.get("/log-out", access.privateOnly, control.logOut);

module.exports = router;
