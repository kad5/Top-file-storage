require("dotenv").config();
const path = require("node:path");
const express = require("express");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const { PrismaClient } = require("@prisma/client");
const { passport } = require("./mw/passportConfig");

const publicRouter = require("./routers/publicRouter");
const privateRouter = require("./routers/privateRouter");
const access = require("./mw/authentication");
const errorHandler = require("./mw/errorHandler");

// init app and storage
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // ms
    },
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: new PrismaSessionStore(new PrismaClient(), {
      checkPeriod: 2 * 60 * 1000, //ms
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  })
);
app.use(passport.session());

// routes declaration

app.use("/", publicRouter);
app.use("/storage", access.privateOnly, privateRouter);
app.use("/", (req, res) => {
  res.statusCode = 400;
  res.render("404");
});
app.use(errorHandler);

// init the server

app.listen(process.env.PORT, () =>
  console.log(`app listening on port ${process.env.PORT}!`)
);
