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

  res.render("dashboard", {
    state: "shared",
    view: "private",
    username,
    folderId: null,
    contents,
    listContents,
    map,
  });
});

const renderSharedPublic = asyncHandler(async (req, res) => {
  // router.get("/shared/:linkId/", read.renderSharedPublic);
  // router.get("/shared/:linkId/:folderId", read.renderSharedPublic);
  const username = req.user?.username || null;
  const linkId = req.params.linkId || null;

  const shareLink = await get.shareDetails(linkId);
  if (!shareLink) return res.send("404");

  const { expiresAt, ownerId } = shareLink;
  const folderId = req.params.folderId || shareLink.folderId;

  //function to check expiry
  if (folderId) {
    const folderName = folderId
      ? (await get.folderById(folderId)).name
      : "root directory";
    const contents = await get.dirContents(ownerId, folderId);
    const listContents = contents;
    const fullMap = await helpers.generateDirTree(ownerId);
    const folder = fullMap.get(folderId);
    const map = [folder];
    //function to select from the map
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
  const referer = req.headers.referer || "/storage";
  return res.redirect(referer);
});

module.exports = {
  renderDir,
  renderTrash,
  renderShared,
  downloadFile,
  renderSharedPublic,
};
