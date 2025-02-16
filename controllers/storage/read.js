const asyncHandler = require("express-async-handler");
const { get, helpers } = require("../../db/queries");
const path = require("path");
const fs = require("fs");

const renderDir = asyncHandler(async (req, res) => {
  const { id, username } = req.user;
  const folderId = req.params.folderId || null;
  const folderName = folderId
    ? (await get.folderById(folderId)).name
    : "root directory";
  const contents = await get.dirContents(id, folderId);
  const listContents = contents;
  const fullMap = await helpers.generateDirTree(id);
  const map = Array.from(fullMap.values()).filter(
    (obj) => obj.parentId === null
  );

  res.render("dashboard", {
    state: "storage",
    view: "private",
    username,
    folderId,
    folderName,
    contents,
    listContents,
    map,
  });
});

const renderTrash = asyncHandler(async (req, res) => {
  const { id, username } = req.user;
  const contents = await get.trash(id);
  const listContents = await get.dirContents(id, null);
  const fullMap = await helpers.generateDirTree(id);
  const map = Array.from(fullMap.values()).filter(
    (obj) => obj.parentId === null
  );
  res.render("dashboard", {
    state: "trash",
    view: "private",
    username,
    folderId: null,
    contents,
    listContents,
    map,
  });
});

const renderShared = asyncHandler(async (req, res) => {
  const { id, username } = req.user;
  const contents = await get.allSharedByUser(id);
  const listContents = await get.dirContents(id, null);
  const fullMap = await helpers.generateDirTree(id);
  const map = Array.from(fullMap.values()).filter(
    (obj) => obj.parentId === null
  );
  const url = process.env.BASE_URL;

  res.render("dashboard", {
    state: "shared",
    view: "private",
    username,
    folderId: null,
    contents,
    listContents,
    map,
    url,
  });
});

const renderSharedPublic = asyncHandler(async (req, res) => {
  // router.get("/shared/:linkId/", read.renderSharedPublic);
  // router.get("/shared/:linkId/:folderId", read.renderSharedPublic);
  const username = req.user?.username || null;
  const linkId = req.params.linkId || null;

  const shareLink = await get.shareDetails(linkId);
  if (!shareLink) return res.send("404");
  const headFolderId = shareLink.folderId;
  const folderId = req.params.folderId || shareLink.folderId;
  const { expiresAt, ownerId } = shareLink;

  const today = new Date();
  const expiryDate = new Date(expiresAt);

  if (expiryDate < today) return res.render("unauth");

  if (folderId) {
    const folderName = folderId
      ? (await get.folderById(folderId)).name
      : "root directory";
    const contents = await get.dirContents(ownerId, folderId);
    const listContents = contents;
    const fullMap = await helpers.generateDirTree(ownerId);
    const folder = fullMap.get(headFolderId);
    const map = [folder];
    return res.render("dashboard", {
      state: "storage",
      view: "public",
      username,
      folderId,
      folderName,
      contents,
      listContents,
      map,
      linkId,
    });
  }
  res.send("not allowed");
});

const downloadFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const file = await get.fileById(fileId);
  if (!file) {
    return res.render("404");
  }
  const filePath = file.cloudId;
  const fullFilePath = path.join(__dirname, "..", "..", filePath);
  if (!fs.existsSync(fullFilePath)) {
    return res.render("404");
  }

  res.setHeader("Content-Disposition", `attachment; filename="${file.name}"`);

  res.sendFile(fullFilePath, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      if (!res.headersSent) {
        res.status(500).send("Error downloading the file");
      }
    }
  });
});

module.exports = {
  renderDir,
  renderTrash,
  renderShared,
  downloadFile,
  renderSharedPublic,
};
