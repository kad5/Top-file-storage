const asyncHandler = require("express-async-handler");
const { update } = require("../../db/queries");

const fileName = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const { newName } = req.body;
  await update.fileName(fileId, newName);

  const referer = req.headers.referer || "/storage";
  return res.redirect(referer);
});
const folderName = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  const { newName } = req.body;
  await update.folderName(folderId, newName);

  const referer = req.headers.referer || "/storage";
  return res.redirect(referer);
});
const restoreFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  await update.restoreFileFromTrash(fileId);

  const referer = req.headers.referer || "/storage";
  return res.redirect(referer);
});

const fileToTrash = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  await update.moveFileToTrash(fileId);

  const referer = req.headers.referer || "/storage";
  return res.redirect(referer);
});

const RestoreFolder = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  await update.restorFolderFromTrash(folderId);

  const referer = req.headers.referer || "/storage";
  return res.redirect(referer);
});

const folderToTrash = asyncHandler(async (req, res) => {
  const { folderId } = req.params;
  const result = await update.moveFolderToTrash(folderId);
  const redirectUrl = result.parentId ? `/storage/dir/${result.parentId}` : "/";
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
