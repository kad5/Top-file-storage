const asyncHandler = require("express-async-handler");
const { get, helpers } = require("../../db/queries");

const renderDir = asyncHandler(async (req, res) => {
  const { id, username } = req.user;
  const folderId = req.params.folderId || null;
  const contents = await get.dirContents(id, folderId);
  const map = await helpers.generateDirTree(id);
  res.render("dashboard", { username, contents, map });
});

const renderTrash = asyncHandler(async (req, res) => {
  const { id, username } = req.user;
  const contents = await get.trash(id);
  const map = await helpers.generateDirTree(id);
  res.render("dashboard", { username, contents, map });
});

const renderShared = asyncHandler(async (req, res) => {
  const { id, username } = req.user;
  const contents = await get.allSharedByUser(id);
  const map = await helpers.generateDirTree(id);
  res.render("dashboard", { username, contents, map });
});

const renderSharedPublic = asyncHandler(async (req, res) => {
  //router.get("/shared/:linkId", read.renderSharedPublic);
  const username = req.user?.username || null;
  const linkId = req.params.folderId || null;

  const shareLink = await read.shareDetails(linkId);
  if (!shareLink) return res.send("404");

  const { expiresAt, ownerId, folderId } = shareLink;
  //function to check expiry
  if (folderId) {
    const contents = await get.dirContents(ownerId, folderId);
    const map = await helpers.generateDirTree(ownerId);
    //function to select from the map
    return res.render("dashboard", { username, contents, map });
  }
  res.send("not allowed");
});

const downloadFile = asyncHandler((req, res) => {
  res.render("dashboard");
});

module.exports = {
  renderDir,
  renderTrash,
  renderShared,
  downloadFile,
  renderSharedPublic,
};
