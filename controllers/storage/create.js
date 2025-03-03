const asyncHandler = require("express-async-handler");
const { create } = require("../../db/queries");

const file = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.send("upload something");
  }
  const ownerId = req.user.id;
  const parentId = req.body.folderId || null;
  const { originalname, mimetype, size, path } = req.file;
  await create.file(originalname, ownerId, size, mimetype, path, parentId);

  const referer = req.headers.referer || "/storage";
  return res.redirect(referer);
});
const folder = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const name = req.body.name;

  const parentId = req.body.folderId || null;
  await create.folder(name, ownerId, parentId);

  const referer = req.headers.referer || "/storage";
  return res.redirect(referer);
});
const shareLink = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;
  const { expiresAt, type, itemId } = req.body;
  const formatted = new Date(expiresAt);
  await create.shareLink(ownerId, formatted, type, itemId);
  return res.redirect("/storage/shared");
});

module.exports = {
  file,
  folder,
  shareLink,
};
