const asyncHandler = require("express-async-handler");
const { dlt } = require("../../db/queries");

const shareLink = asyncHandler(async (req, res) => {
  const { linkId } = req.params;
  await dlt.shareLink(linkId);
  return res.redirect(req.originalUrl);
});
const file = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  await dlt.file(fileId);
  return res.redirect(req.originalUrl);
});
const folder = asyncHandler(async (req, res) => {
  const folderId = req.params.folderId || null;
  await dlt.folder(folderId);
  return res.redirect(req.originalUrl);
});
module.exports = {
  file,
  folder,
  shareLink,
};
