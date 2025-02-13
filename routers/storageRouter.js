const main = require("../controllers/storage/main");
const files = require("../controllers/storage/files");
const folders = require("../controllers/storage/folders");
const trash = require("../controllers/storage/trash");
const shared = require("../controllers/storage/shared");

const validate = require("../mw/validation");

const { Router } = require("express");
const router = Router();

//storage
router.get("/", (req, res) => res.render("dashboard"));

//trash
router.get("/trash", (req, res) => res.render("dashboard"));
router.post("/trash/folder/send", (req, res) => res.render("dashboard"));
router.post("/trash/folder/restore", (req, res) => res.render("dashboard"));
router.post("/trash/file/send", (req, res) => res.render("dashboard"));
router.post("/trash/file/trestore", (req, res) => res.render("dashboard"));

//files
router.post("/files/new", (req, res) => res.render("dashboard"));
router.post("/files/rename", (req, res) => res.render("dashboard"));
router.post("/files/delete", (req, res) => res.render("dashboard"));
router.get("/files/details", (req, res) => res.render("dashboard"));

//folders
router.post("/folders/new", (req, res) => res.render("dashboard"));
router.post("/folders/rename", (req, res) => res.render("dashboard"));
router.post("/folders/delete", (req, res) => res.render("dashboard"));
router.get("/folders/details", (req, res) => res.render("dashboard"));

//shared
router.get("/shared", (req, res) => res.render("dashboard"));
router.post("/shared/new", (req, res) => res.render("dashboard"));
router.post("/shared/delete", (req, res) => res.render("dashboard"));

module.exports = router;

/*
crud
c: file, folder, share link
r: dir, tree, trash, shared, file, folder
u: file, folder, trash in and out, parent
d: link, file, folder
*/
