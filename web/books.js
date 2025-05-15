import { Book } from "./models.js";
import { Op } from "sequelize";

/**
 * create a new book in the database
 * @param {string} author
 * @param {string} title
 * @param {string} details
 * @returns {Promise<string|Book>} error message or newly created book
 */
export const newBook = async (author, title, details) => {
  if (!(author && title && details)) return "You must fill out all fields!";
  const book = await Book.create({
    author: author,
    title: title,
    details: details,
  });
  return book;
};

/**
 * edit a book in the database based on its id
 * @param {number} id
 * @param {string} author
 * @param {string} title
 * @param {string} details
 * @returns {Promise<string|Book>} error message or updated book details
 */
export const editBook = async (id, author, title, details) => {
  console.log(author, title, details);
  if (!(author && title && details)) return "You must fill out all fields!";
  const book = await Book.findByPk(id);
  if (book) {
    await book.update({ author: author, title: title, details: details });
    return book;
  } else return "No book with that id!";
};

/**
 * search for books based on their title
 * @param {string} search search string
 * @returns {Promise<Book[]>} list of books whose title contains `search`
 */
export const searchBooks = (search) => {
  if (typeof search == "undefined") search = "";
  return Book.findAll({
    order: [["updatedAt", "DESC"]],
    where: { title: { [Op.like]: "%" + search + "%" } },
  });
};
