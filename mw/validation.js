const signUp = (req, res, next) => {
  console.log("valid");
  next();
};
const logIn = (req, res, next) => {
  console.log("valid");
  next();
};

const shareInput = (req, res, next) => {
  console.log("valid");
  next();
};

const Newfile = (req, res, next) => {
  console.log("valid");
  next();
};
const string = (req, res, next) => {
  console.log("valid");
  next();
};

module.exports = { Newfile, string, signUp, logIn, shareInput };
