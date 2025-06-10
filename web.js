import cookieParser from "cookie-parser";
import express from "express";
import { Login, ObtainToken, Register, ValidateToken } from "./auth.js";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  editCategory as editCategoryFunc,
  deleteCategory as deleteCategoryFunc,
  getCategoryStats,
} from "./categories.js";
import { editBook, newBook, searchBooks, getBooksByCategory } from "./books.js";
import { Book, Category } from "./models.js";
import { getReviewsForBook, createReview, deleteReview } from "./reviews.js";
import methodOverride from "method-override";


const app = express();
export default app;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("view options", {
  rmWhitespace: true, 
});
app.locals.siteName = "Books";

app.use(async (req, res, next) => {
  try {
    if (req.cookies.user) {
      res.locals.user = await ValidateToken(req.cookies.user);
    } else { 
      res.locals.user = null;
    }
  } catch { 
    res.clearCookie("user");
    res.locals.user = null;
  }
  next();
});

function LoggedInOnly(req, res, next) {
  if (res.locals.user) next();
  else res.redirect("/login"); 
}

function LoggedOutOnly(req, res, next) {
  if (res.locals.user) res.redirect("/");
  else next();
}

function renderWithError(res, view, pageName, data = {}, msg = null) {
    res.render(view, { ...data, pageName, msg, user: res.locals.user, siteName: app.locals.siteName });
}


app.get("/", async (req, res) => {
  const searchQuery = req.query.search || "";
  const books = await searchBooks(searchQuery);
  res.render("index", {
    books: books,
    search: searchQuery,
    pageName: "Home"
  });
});

app.get("/book/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.render("error", { message: "Invalid book ID" });
  const book = await Book.findByPk(id, {
    include: [{ model: Category, as: 'categories', through: { attributes: [] } }]
  });
  if (book) {
    const reviews = await getReviewsForBook(id); // <-- reviews lekérése
    let userHasReviewed = false;
    if (res.locals.user) {
      userHasReviewed = reviews.some(r => r.userId === res.locals.user.id);
    }
    res.render("book", {
      book,
      reviews,            // <-- reviews átadása a template-nek
      user: res.locals.user, // <-- user átadása, ha kell
      userHasReviewed
    });
  } else {
    res.render("error", { message: "Book not found" });
  }
});

app.get("/login", LoggedOutOnly, async (req, res) => {
  renderWithError(res, "login", "Login or register");
});

app.post("/login", LoggedOutOnly, async (req, res) => {
  const result = await Login(req.body.name, req.body.password);
  if (typeof result == "string") {
    renderWithError(res, "login", "Login or register", {}, result);
  } else {
    res.cookie("user", ObtainToken(result), {
      maxAge: 31557600000, 
      httpOnly: true, 
    });
    res.redirect("/");
  }
});

app.post("/register", LoggedOutOnly, async (req, res) => {
  const result = await Register(req.body.name, req.body.password);
  if (typeof result == "string") {
    renderWithError(res, "login", "Login or register", {}, result);
  } else {
    res.cookie("user", ObtainToken(result), {
      maxAge: 31557600000, httpOnly: true
    });
    res.redirect("/");
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect("/");
});

app.get("/newbook", LoggedInOnly, async (req, res) => {
  const allCategories = await getAllCategories();
  renderWithError(res, "newbook", "Add New Book", { 
    author: "", title: "", details: "", allCategories, bookCategories: [] 
  });
});

app.post("/newbook", LoggedInOnly, async (req, res) => {
  const { author, title, details } = req.body;
  let { categoryIds } = req.body;
  categoryIds = Array.isArray(categoryIds) ? categoryIds : (categoryIds ? [categoryIds] : []);
  
  const result = await newBook(author, title, details, categoryIds);
  if (typeof result == "string") {
    const allCategories = await getAllCategories();
    renderWithError(res, "newbook", "Add New Book", { 
      author, title, details, allCategories, 
      bookCategories: categoryIds.map(id => parseInt(id)) 
    }, result);
  } else {
    res.redirect(`/book/${result.id}`);
  }
});

app.get("/editbook/:id", LoggedInOnly, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.redirect("/");
  const book = await Book.findByPk(id, {
    include: [{ model: Category, as: 'categories' }]
  });
  if (book) {
    const allCategories = await getAllCategories();
    const bookCategoryIds = book.categories.map(cat => cat.id);
    renderWithError(res, "editbook", `Edit Book: ${book.title}`, {
      id: book.id, author: book.author, title: book.title, details: book.details,
      allCategories, bookCategories: bookCategoryIds,
    });
  } else {
    res.redirect("/");
  }
});

app.post("/editbook/:id", LoggedInOnly, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.redirect("/");
  const { author, title, details } = req.body;
  let { categoryIds } = req.body;
  categoryIds = Array.isArray(categoryIds) ? categoryIds : (categoryIds ? [categoryIds] : []);

  const result = await editBook(id, author, title, details, categoryIds);
  if (typeof result == "string") {
    const allCategories = await getAllCategories();
    const submittedCategoryIds = categoryIds.map(cid => parseInt(cid, 10)).filter(cid => !isNaN(cid));
    renderWithError(res, "editbook", `Edit Book`, { 
        id, author, title, details, allCategories, bookCategories: submittedCategoryIds
    }, result);
  } else {
    res.redirect(`/book/${id}`);
  }
});

app.get("/deletebook/:id", LoggedInOnly, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.redirect("/");
  const book = await Book.findByPk(id);
  if (book) {
    await book.destroy();
  }
  res.redirect("/");
});

app.get("/me", LoggedInOnly, async (req, res) => {
  renderWithError(res, "me", "My Profile");
});

app.get("/newcategory", LoggedInOnly, (req, res) => {
  renderWithError(res, "newcategory", "New Category", { name: "" });
});

app.post("/newcategory", LoggedInOnly, async (req, res) => {
  const { name } = req.body;
  const result = await createCategory(name);
  if (typeof result === "string") {
    renderWithError(res, "newcategory", "New Category", { name }, result);
  } else {
    res.redirect("/categories");
  }
});

app.get("/categories", async (req, res) => {
  const categories = await getAllCategories();
  renderWithError(res, "categorieslist", "Categories", { categories });
});

app.get("/books/category/:categoryId", async (req, res) => {
  const categoryId = parseInt(req.params.categoryId);
  if (isNaN(categoryId)) return res.redirect("/categories");
  
  const category = await getCategoryById(categoryId);
  if (!category) {
    return renderWithError(res, "index", "Category Not Found", { books: [], search: "" }, "Category not found.");
  }
  const books = await getBooksByCategory(categoryId);
  renderWithError(res, "index", `Books in ${category.name}`, { books, search: "" });
});

app.get("/categories/stats", async (req, res) => {
  const stats = await getCategoryStats();
  renderWithError(res, "categorystats", "Category Statistics", { stats });
});

app.get("/editcategory/:id", LoggedInOnly, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.redirect("/categories");
  const category = await getCategoryById(id);
  if (category) {
    renderWithError(res, "editcategory", `Edit Category: ${category.name}`, { category });
  } else {
    res.redirect("/categories");
  }
});

app.post("/editcategory/:id", LoggedInOnly, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.redirect("/categories");
  const { name } = req.body;
  const result = await editCategoryFunc(id, name);
  if (typeof result === "string") {
    const category = { id, name }; 
    renderWithError(res, "editcategory", `Edit Category`, { category }, result);
  } else {
    res.redirect("/categories");
  }
});

app.get("/deletecategory/:id", LoggedInOnly, async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.redirect("/categories");
  await deleteCategoryFunc(id); 
  res.redirect("/categories");
});

app.post("/book/:id/review", LoggedInOnly, async (req, res) => {
  const bookId = parseInt(req.params.id);
  const { content, rating } = req.body;
  const result = await createReview(res.locals.user.id, bookId, content, rating);
  if (typeof result === "string") {
    const book = await Book.findByPk(bookId, {
      include: [{ model: Category, as: 'categories', through: { attributes: [] } }]
    });
    const reviews = await getReviewsForBook(bookId);
    let userHasReviewed = reviews.some(r => r.userId === res.locals.user.id);
    return res.render("book", {
      book,
      reviews,
      user: res.locals.user,
      userHasReviewed,
      msg: result
    });
  }
  res.redirect(`/book/${bookId}`);
});

app.delete("/book/:bookId/review/:reviewId", LoggedInOnly, async (req, res) => {
  const { bookId, reviewId } = req.params;
  await deleteReview(res.locals.user.id, reviewId);
  res.redirect(`/book/${bookId}`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).render("error", { // Javasolt: err.status használata, ha van
      pageName: "Error",
      message: err.message || "Something went wrong!", // msg -> message, és err.message használata
      error: req.app.get('env') === 'development' ? err : {} // Opcionális: több info fejlesztéskor
  });
});