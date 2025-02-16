module.exports = errorHandler = (err, req, res, next) => {
  res.send("internal server error, we are working on it");
};
