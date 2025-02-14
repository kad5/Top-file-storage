const asyncHandler = require("express-async-handler");
const { get, helpers } = require("../../db/queries");
const path = require("path");
const fs = require("fs");

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

const downloadFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const file = await get.fileById(fileId);
  if (!file) return res.send("File not found");
  const filePath = file.path;
  const fullFilePath = path.join(__dirname, "..", "..", filePath);

  if (fs.existsSync(fullFilePath)) {
    res.download(fullFilePath, file.name, (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).send("Error downloading the file");
      }
    });
  } else {
    res.status(404).send("File does not exist in the file system");
  }
  return res.redirect(req.originalUrl);
});

module.exports = {
  renderDir,
  renderTrash,
  renderShared,
  downloadFile,
  renderSharedPublic,
};
