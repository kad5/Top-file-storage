const asyncHandler = require("express-async-handler");
const { get, update } = require("../../db/queries");
const read = require("./read");

const fileName = asyncHandler((req, res) => {
  return res.redirect(req.originalUrl);
});
const fileToTrash = asyncHandler((req, res) => {
  return res.redirect(req.originalUrl);
});
const restoreFile = asyncHandler((req, res) => {
  return res.redirect(req.originalUrl);
});
const folderName = asyncHandler((req, res) => {
  return res.redirect(req.originalUrl);
});
const folderToTrash = asyncHandler((req, res) => {
  return res.redirect(`/dir/${parentId}`);
});
const RestoreFolder = asyncHandler((req, res) => {
  return res.redirect(req.originalUrl);
});
module.exports = {
  fileName,
  fileToTrash,
  restoreFile,
  folderName,
  folderToTrash,
  RestoreFolder,
};
