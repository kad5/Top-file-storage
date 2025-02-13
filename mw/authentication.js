function checkAcess(requiredLevel) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      req.session.returnTo = req.originalUrl; //stores the original url the user was trying to get to and returns them to it on successful login
      return res.redirect("/log-in");
    }

    if (req.user.auth_level >= requiredLevel) {
      return next();
    }
    const error = new Error("Access denied");
    error.status = 403;
    return next(error);
  };
}

function publicOnly(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/storage/dashboard");
  }
  next();
}
function privateOnly(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect("/auth/log-in");
  }
  next();
}

module.exports = { publicOnly, privateOnly };
