import express from "express";
import { Login, ObtainToken, Register, ValidateToken } from "./auth.js";
import { editBook, newBook, searchBooks } from "./books.js";
import { Book } from "./models.js";

const app = express();
export default app;
app.use(express.json());

app.use(async (req, res, next) => {
  try {
    if (req.query.token) {
      res.locals.user = await ValidateToken(req.query.token);
    } else if (req.body.token) {
      res.locals.user = await ValidateToken(req.body.token);
    } else throw new Error();
  } catch {
    res.locals.user = null;
  }
  next();
});

function APIError(res, msg) {
  res.status(400).json({ msg: msg });
}

function LoggedInOnly(req, res, next) {
  if (res.locals.user) next();
  else APIError(res, "You must log in to do that.");
}

function LoggedOutOnly(req, res, next) {
  if (res.locals.user) APIError(res, "You're already logged in.");
  else next();
}

app.post("/login", LoggedOutOnly, async (req, res) => {
  const result = await Login(req.body.name, req.body.password);
  if (typeof result == "string") {
    APIError(res, result);
  } else {
    res.json({
      token: ObtainToken(result),
    });
  }
});

app.post("/register", LoggedOutOnly, async (req, res) => {
  const result = await Register(req.body.name, req.body.password);
  if (typeof result == "string") {
    APIError(res, result);
  } else {
    res.json({
      token: ObtainToken(result),
    });
  }
});

app.get("/me", LoggedInOnly, async (req, res) => {
  const { name, createdAt } = res.locals.user;
  res.json({ name: name, createdAt: createdAt });
});

app.get("/books", async (req, res) => {
  res.json(await searchBooks());
});

app.post("/books", LoggedInOnly, async (req, res) => {
  const { author, title, details } = req.body;
  const result = await newBook(author, title, details);
  if (typeof result == "string") {
    APIError(res, result);
  } else res.json(result);
});

app.put("/books/:id", LoggedInOnly, async (req, res) => {
  const id = req.params.id;
  const { author, title, details } = req.body;
  const result = await editBook(id, author, title, details);
  if (typeof result == "string") {
    APIError(res, result);
  } else res.json(result);
});

app.delete("/books/:id", LoggedInOnly, async (req, res) => {
  const book = await Book.findByPk(req.params.id);
  if (book) {
    await book.destroy();
    res.end();
  } else APIError(res, "No book with that id.");
});

app.get("/books/search/:title", async (req, res) => {
  const search = req.params.title;
  res.json(await searchBooks(search));
});

app.get("/books/:id", async (req, res) => {
  const id = req.params.id;
  res.json(await Book.findByPk(id));
});
