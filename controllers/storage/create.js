const asyncHandler = require("express-async-handler");
const { create } = require("../../db/queries");

const file = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.send("upload something");
  }
  const ownerId = req.user.id;
  const parentId = req.params.folderId || null;
  const { originalname, mimetype, size, path } = req.file;
  await create.file(originalname, ownerId, size, mimetype, path, parentId);
  return res.redirect(req.originalUrl);
});
const folder = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const name = req.body.name;
  const parentId = req.body.parentId || null;
  await create.folder(name, ownerId, parentId);
  return res.redirect(req.originalUrl);
});
const shareLink = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const { expiresAt, type, itemId } = req.body;
  await create.shareLink(ownerId, expiresAt, type, itemId);
  return res.redirect("/shared");
});

module.exports = {
  file,
  folder,
  shareLink,
};
