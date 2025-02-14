const asyncHandler = require("express-async-handler");
const { update } = require("../../db/queries");

const fileName = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const { newName } = req.body;
  await update.fileName(fileId, newName);
  return res.redirect(req.originalUrl);
});
const folderName = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  const { newName } = req.body;
  await update.folderName(folderId, newName);
  return res.redirect(req.originalUrl);
});
const restoreFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  await update.restoreFileFromTrash(fileId);
  return res.redirect(req.originalUrl);
});

const fileToTrash = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  await update.moveFileToTrash(fileId);
  return res.redirect(req.originalUrl);
});

const RestoreFolder = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  await update.restorFolderFromTrash(folderId);
  return res.redirect(req.originalUrl);
});

const folderToTrash = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  const result = await update.moveFolderToTrash(folderId);
  const redirectUrl = result.parentId ? `/dir/${result.parentId}` : "/";
  return res.redirect(redirectUrl);
});

module.exports = {
  fileName,
  fileToTrash,
  restoreFile,
  folderName,
  folderToTrash,
  RestoreFolder,
};
