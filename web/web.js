import cookieParser from "cookie-parser";
import express from "express";
import { Login, ObtainToken, Register, ValidateToken } from "./auth.js";
import { editBook, newBook, searchBooks } from "./books.js";
import { Book } from "./models.js";

const app = express();
export default app;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("view options", {
  rmWhitespace: true,
});
app.locals.siteName = "Books";

app.use(async (req, res, next) => {
  try {
    if (req.cookies.user) {
      res.locals.user = await ValidateToken(req.cookies.user);
    } else throw new Error("");
  } catch {
    res.clearCookie("user");
    res.locals.user = null;
  }
  next();
});

function LoggedInOnly(req, res, next) {
  if (res.locals.user) next();
  else res.redirect("/");
}

function LoggedOutOnly(req, res, next) {
  if (res.locals.user) res.redirect("/");
  else next();
}

app.get("/", async (req, res) => {
  const search = req.query.search;
  res.render("index", {
    books: await searchBooks(search),
    search: search,
  });
});

app.get("/book/:id", async (req, res) => {
  res.render("book", { book: await Book.findByPk(req.params.id) });
});

app.get("/login", LoggedOutOnly, async (req, res) => {
  res.render("login", { pageName: "Login or register" });
});

app.post("/login", LoggedOutOnly, async (req, res) => {
  const result = await Login(req.body.name, req.body.password);
  if (typeof result == "string") {
    res.render("login", { msg: result });
  } else {
    res.cookie("user", ObtainToken(result), {
      maxAge: 31557600000,
    });
    res.redirect("/");
  }
});

app.post("/register", LoggedOutOnly, async (req, res) => {
  const result = await Register(req.body.name, req.body.password);
  if (typeof result == "string") {
    res.render("login", { msg: result });
  } else {
    res.cookie("user", ObtainToken(result), {
      maxAge: 31557600000,
    });
    res.redirect("/");
  }
});

app.get("/logout", async (req, res) => {
  res.clearCookie("user");
  res.redirect("/");
});

app.get("/newbook", LoggedInOnly, async (req, res) => {
  res.render("newbook", { author: "", title: "", details: "" });
});

app.post("/newbook", LoggedInOnly, async (req, res) => {
  const { author, title, details } = req.body;
  const result = await newBook(author, title, details);
  if (typeof result == "string") {
    res.render("newbook", {
      msg: result,
      author: author,
      title: title,
      details: details,
    });
  } else {
    res.redirect("/");
  }
});

app.get("/editbook/:id", LoggedInOnly, async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book)
    res.render("editbook", {
      id: book.id,
      author: book.author,
      title: book.title,
      details: book.details,
    });
});

app.post("/editbook/:id", LoggedInOnly, async (req, res) => {
  const { author, title, details } = req.body;
  const id = req.params.id;
  const result = await editBook(id, author, title, details);
  if (typeof result == "string") {
    res.render("editbook", {
      msg: result,
      id: id,
      author: author,
      title: title,
      details: details,
    });
  } else {
    res.redirect("/");
  }
});

app.get("/deletebook/:id", LoggedInOnly, async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) await book.destroy();
  res.redirect("/");
});

app.get("/me", LoggedInOnly, async (req, res) => {
  res.render("me");
});
