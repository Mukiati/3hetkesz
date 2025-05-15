import dotenv from "dotenv";
dotenv.config();

const secret = process.env.SECRET;
if (!secret) {
  console.error("You must set the SECRET env variable!");
  process.exit(1);
}

import { User } from "./models.js";
import JWT from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { hash } from "crypto";

/**
 * hash a password using sha256 and then with salted bcrypt
 * @param {string} password
 * @returns {string} hashed password
 */
function hashPassword(password) {
  const sha256d = hash("sha256", password);
  return bcryptjs.hashSync(sha256d);
}

/**
 * @param {string} userPassword hashed password to compare against
 * @param {string} password
 * @returns {boolean} whether the two passwords match
 */
function comparePassword(userPassword, password) {
  const sha256d = hash("sha256", password);
  return bcryptjs.compareSync(sha256d, userPassword);
}

/**
 * attempt to register new user
 * @param {string} name
 * @param {string} password
 * @returns {Promise<string|User>} error message or newly created user
 */
export const Register = async (name, password) => {
  if (name == "" || password == "")
    return "You can't have an empty name or password!";
  const existingUser = await User.findOne({ where: { name: name } });
  if (existingUser) return `A user with name "${name}" already exists!`;
  const newUser = await User.create({
    name: name,
    password: hashPassword(password),
  });
  return newUser;
};

/**
 * attempt to login
 * @param {string} name
 * @param {string} password
 * @returns {Promise<string|User>} error message or logged in user
 */
export const Login = async (name, password) => {
  if (name == "" || password == "")
    return "You can't have an empty name or password!";
  const existingUser = await User.findOne({ where: { name: name } });
  if (!existingUser) return `No user with name "${name}" exists.`;
  if (!comparePassword(existingUser.password, password))
    return "Wrong password!";
  return existingUser;
};

/**
 * obtain new JWT for given user
 * @param {User} user
 * @returns {string} JWT
 */
export const ObtainToken = (user) => {
  return JWT.sign({ id: user.id }, secret, { expiresIn: "1y" });
};

/**
 * validate a JWT token
 * @param {string} token
 * @returns {Promise<User>} user, if token was valid
 */
export const ValidateToken = async (token) => {
  return await User.findByPk(JWT.verify(token, secret).id);
};
