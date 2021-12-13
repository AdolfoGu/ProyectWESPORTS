const express = require("express");
const path = require("path");
const multer = require("multer");
const engine = require("ejs-mate");
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("passport");
const morgan = require("morgan");
const { v4: uuidv4 } = require("uuid");

// Inicializacion
const app = express();
require("./database");
require("./passport/local-auth");

// Configuraciones
app.listen(3000);
const storage = multer.diskStorage({
  destination: path.join(__dirname, "public/img/up"),
    filename: (req, file, cb, filename) => {
      console.log(file);
      cb(null, uuidv4() + path.extname(file.originalname));
    },
});

app.use(multer({ storage: storage }).single("image"));
app.use(express.static(__dirname + "/public"));
app.engine("ejs", engine);
app.set("view engine", "ejs");

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));

app.set("views", path.join(__dirname, "views"));

app.use(
  session({
    secret: "No temo al dolor por que ya nacio a mi lado",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  app.locals.signinMessage = req.flash("signinMessage");
  app.locals.signupMessage = req.flash("signupMessage");
  app.locals.user = req.user;
  console.log(app.locals);
  next();
});

app.use("/", require("./routes/index"));

console.log("servidor en el ", 3000);
