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

function ensureNotAuth(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  next();
}
