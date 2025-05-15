import { faker } from "@faker-js/faker";
import { newBook } from "./books.js";

for (let i = 0; i < 100; i++) {
  newBook(faker.book.author(), faker.book.title(), faker.lorem.sentence());
}
