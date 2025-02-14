const asyncHandler = require("express-async-handler");
const { get } = require("../../db/queries");

const file = asyncHandler((req, res) => {
  res.render("dashboard");
});
const folder = asyncHandler((req, res) => {
  res.render("dashboard");
});
const shareLink = asyncHandler((req, res) => {
  res.render("dashboard");
});

module.exports = {
  file,
  folder,
  shareLink,
};
