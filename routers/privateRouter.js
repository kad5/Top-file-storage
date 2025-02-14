const create = require("../controllers/storage/create");
const read = require("../controllers/storage/read");
const update = require("../controllers/storage/update");
const dlt = require("../controllers/storage/delete");
const validate = require("../mw/validation");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { Router } = require("express");
const router = Router();

//get requests all start with /storage
router.get("/", read.renderDir);
router.get("/dir/:folderId", read.renderDir);
router.get("/trash", read.renderTrash);
router.get("/shared", read.renderShared);
router.get("/download/:fileId", read.downloadFile);
//files post
router.post(
  "/file/upload",
  validate.Newfile,
  upload.single("file"),
  create.file
);
router.post("/file/rename/:fileId", validate.string, update.fileName);
router.post("/file/trash/:fileId", update.fileToTrash);
router.post("/file/restore/:fileId", update.restoreFile);
router.post("/file/delete/:fileId", dlt.file);
//folders post
router.post("/folder/new", validate.string, create.folder);
router.post("/folder/rename/:folderId", validate.string, update.folderName);
router.post("/folder/trash/:folderId", update.folderToTrash);
router.post("/folder/restore/:folderId", update.RestoreFolder);
router.post("/folder/delete/:folderId", dlt.folder);
//shared post
router.post("/shared/new", validate.shareInput, create.shareLink);
router.post("/shared/delete/:linkId", dlt.shareLink);

module.exports = router;

/*
crud
c: file, folder, share link
r: dir, tree, trash, shared, file, folder
u: file, folder, trash in and out, parent
d: link, file, folder
*/
/*
return res.redirect(req.originalUrl); 
const updateFile = asyncHandler(async (req, res, next) => {
  const { fileId } = req.params;

  // Your file update logic here
  // ...

  // After handling the file update, redirect back to the same dynamic URL
  const folderId = req.body.folderId; // Get the folderId from the form submission (adjust as necessary)
  return res.redirect(`/dir/${folderId}`);  // Redirect to the same directory page
});

*/
