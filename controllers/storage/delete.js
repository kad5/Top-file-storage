const asyncHandler = require("express-async-handler");
const { dlt } = require("../../db/queries");

const shareLink = asyncHandler(async (req, res) => {
  const { linkId } = req.params;
  await dlt.shareLink(linkId);

  const referer = req.headers.referer || "/storage";
  return res.redirect(referer);
});
const file = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  await dlt.file(fileId);
  const referer = req.headers.referer || "/storage";
  return res.redirect(referer);
});
const folder = asyncHandler(async (req, res) => {
  const { id } = req.user;
  const folderId = req.params.folderId || null;
  await dlt.folder(id, folderId);
  const referer = req.headers.referer || "/storage";
  return res.redirect(referer);
});
module.exports = {
  file,
  folder,
  shareLink,
};
