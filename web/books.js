import { Book } from "./models.js";
import { Op } from "sequelize";

export const newBook = async (author, title, details) => {
  if (!(author && title && details)) return "You must fill out all fields!";
  const book = await Book.create({
    author: author,
    title: title,
    details: details,
  });
  return book;
};

export const editBook = async (id, author, title, details) => {
  console.log(author, title, details);
  if (!(author && title && details)) return "You must fill out all fields!";
  const book = await Book.findByPk(id);
  if (book) {
    await book.update({ author: author, title: title, details: details });
    return book;
  } else return "No book with that id!";
};

export const searchBooks = (search) => {
  return Book.findAll({
    order: [["updatedAt", "DESC"]],
    where: { title: { [Op.like]: "%" + search + "%" } },
  });
};
