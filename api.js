import express from "express";
import { Login, ObtainToken, Register, ValidateToken } from "./auth.js";
import { editBook, newBook, searchBooks, getBooksByCategory } from "./books.js";
import {
  createCategory,
  getAllCategories,
  editCategory as editCategoryFunc,
  deleteCategory as deleteCategoryFunc,
  getCategoryStats,
  addCategoryToBook
} from "./categories.js";
import { Book, Category } from "./models.js";
import {
  createReview,
  deleteReview,
  getReviewsForBook
} from "./reviews.js";

const app = express();
export default app;
app.use(express.json());

// Middleware a token validálására és a felhasználó beállítására
app.use(async (req, res, next) => {
  try {
    let token;
    if (req.query.token) {
      token = req.query.token;
    } else if (req.body.token) {
      token = req.body.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      res.locals.user = await ValidateToken(token);
    } else {
      res.locals.user = null;
    }
  } catch {
    res.locals.user = null;
  }
  next();
});

function APIError(res, msg, statusCode = 400) {
  res.status(statusCode).json({ msg: msg });
}

function LoggedInOnly(req, res, next) {
  if (res.locals.user) next();
  else APIError(res, "You must log in to do that.", 401);
}

function LoggedOutOnly(req, res, next) {
  if (res.locals.user) APIError(res, "You're already logged in.");
  else next();
}

// --- AUTH ROUTES ---
// Ezek az útvonalak a server.js-ben lévő app.use("/api", APIApp) miatt /api/login, /api/register, /api/me lesznek.
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


// --- CATEGORY ROUTES ---
// Az útvonalakból eltávolítva az "/api" prefix, mert azt a server.js már kezeli.

app.post("/categories", LoggedInOnly, async (req, res) => {
  const { name } = req.body;
  if (!name) return APIError(res, "Category name is required.");
  const result = await createCategory(name);
  if (typeof result === "string") {
    APIError(res, result);
  } else {
    res.status(201).json(result);
  }
});

app.get("/categories", async (req, res) => {
  const categories = await getAllCategories();
  res.json(categories);
});

app.get("/categories/stats", async (req, res) => {
  const stats = await getCategoryStats();
  res.json(stats);
});

app.put("/categories/:id", LoggedInOnly, async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id))) return APIError(res, "Invalid category ID.");
  const { name } = req.body;
  if (!name) return APIError(res, "Category name is required for update.");
  const result = await editCategoryFunc(parseInt(id), name);
  if (typeof result === "string") {
    APIError(res, result);
  } else {
    res.json(result);
  }
});

app.delete("/categories/:id", LoggedInOnly, async (req, res) => {
  const { id } = req.params;
  if (isNaN(parseInt(id))) return APIError(res, "Invalid category ID.");
  const result = await deleteCategoryFunc(parseInt(id));
  if (typeof result === "string") {
    APIError(res, result, result === "Category not found." ? 404 : 400);
  } else if (result === true) {
    res.status(204).end();
  } else {
    APIError(res, "Failed to delete category for an unknown reason.", 500);
  }
});


// --- BOOK ROUTES ---
// Az útvonalakból eltávolítva az "/api" prefix.

app.get("/books", async (req, res) => {
  res.json(await searchBooks(req.query.search));
});

app.post("/books", LoggedInOnly, async (req, res) => {
  const { author, title, details, categoryIds } = req.body;
  const result = await newBook(author, title, details, categoryIds);
  if (typeof result == "string") {
    APIError(res, result);
  } else res.status(201).json(result);
});

app.put("/books/:id", LoggedInOnly, async (req, res) => {
  const id = req.params.id;
  if (isNaN(parseInt(id))) return APIError(res, "Invalid book ID.");
  const { author, title, details, categoryIds } = req.body;
  const result = await editBook(parseInt(id), author, title, details, categoryIds);
  if (typeof result == "string") {
    APIError(res, result);
  } else res.json(result);
});

app.delete("/books/:id", LoggedInOnly, async (req, res) => {
  const id = req.params.id;
  if (isNaN(parseInt(id))) return APIError(res, "Invalid book ID.");
  const book = await Book.findByPk(parseInt(id));
  if (book) {
    await book.destroy();
    res.status(204).end();
  } else APIError(res, "No book with that id.", 404);
});

app.get("/books/search/:title", async (req, res) => {
  const search = req.params.title;
  res.json(await searchBooks(search));
});

app.get("/books/:id", async (req, res) => {
  const id = req.params.id;
  if (isNaN(parseInt(id))) return APIError(res, "Invalid book ID.");
  const book = await Book.findByPk(parseInt(id), {
    include: [{ model: Category, as: 'categories', through: { attributes: [] } }]
  });
  if (book) {
    res.json(book);
  } else {
    APIError(res, "Book not found", 404);
  }
});

app.get("/books/category/:categoryId", async (req, res) => {
  const { categoryId } = req.params;
  if (isNaN(parseInt(categoryId))) return APIError(res, "Invalid category ID.");
  const books = await getBooksByCategory(parseInt(categoryId));
  res.json(books);
});

// Ez az útvonal azért maradt /api prefix-szel, mert speciálisabb,
// de a konvenció az lenne, hogy ezt is a /books/ útvonal alá szervezzük, pl. /books/:bookId/categories
// A kliens jelenleg a /api/books/:bookId/category címet hívja, ami /api/api/books/... lenne.
// Javítva a kliensnek megfelelőre: /books/:bookId/category
app.put("/books/:bookId/category", LoggedInOnly, async (req, res) => {
    const { bookId } = req.params;
    const { categoryId } = req.body;

    if (!categoryId) {
        return APIError(res, "categoryId is required in the request body.");
    }
    if (isNaN(parseInt(bookId)) || isNaN(parseInt(categoryId))) {
        return APIError(res, "Invalid bookId or categoryId.");
    }

    const result = await addCategoryToBook(parseInt(bookId), parseInt(categoryId));
    if (typeof result === 'string') {
        APIError(res, result);
    } else {
        res.json(result); // Visszaadja a frissített könyvet a kategóriákkal
    }
});

// Csak bejelentkezett felhasználó véleményezhet
app.post("/reviews", LoggedInOnly, async (req, res) => {
  const { bookId, content, rating } = req.body;
  const result = await createReview(res.locals.user.id, bookId, content, rating);
  if (typeof result === "string") return APIError(res, result);
  res.status(201).json(result);
});

// Vélemény törlése
app.delete("/reviews/:id", LoggedInOnly, async (req, res) => {
  const result = await deleteReview(res.locals.user.id, req.params.id);
  if (typeof result === "string") return APIError(res, result, 403);
  res.status(204).end();
});

// Egy könyv összes véleménye
app.get("/books/:id/reviews", async (req, res) => {
  const reviews = await getReviewsForBook(req.params.id);
  res.json(reviews);
});