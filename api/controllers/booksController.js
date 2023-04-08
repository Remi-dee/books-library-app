const asyncHandler = require("express-async-handler");
const Book = require("../models/bookModel");
const { uploadBook, uploadCover } = require("./uploadController.js");
const fs = require("fs");

// @description Get books
// @route GET /api/books
// @access Private

const getBooks = asyncHandler(async (req, res) => {
  // const books = await Book.find()
  let books;

  try {
    books = await Book.find();
  } catch (err) {
    return new Error(err);
  }

  if (!books) {
    res.status(500).json({ message: "Internal Server Error" });
  }

  if (books.length === 0) {
    return res.status(404).json({ message: "No books found" });
  }
  return res.status(200).json(books);
});

// @description Set book
// @route POST /api/books
// @access Private
const addBook = asyncHandler(async (req, res) => {
  const { title, author, featured } = req.body;
  const bookData = req.files.book.data;
  const coverData = req.files.cover.data;

  if (
    !title &&
    title.trim() === "" &&
    !author &&
    author.trim() === "" &&
    !bookData &&
    bookData.trim() === "" &&
    !coverData &&
    coverData.trim() === ""
  ) {
    return res.status(422).json({ message: "Invalid Inputs" });
  }

 // Check if the book file is a PDF file
 const buffer = bookData.slice(0, 4); // Read the first 4 bytes
 const header = buffer.toString('hex');
 if (header !== '25504446') { // PDF file signature
   return res.status(422).json({ message: "The uploaded file is not a PDF" });
 }

  //Upload Book and Cover data to fileStack
  const bookUrl = await uploadBook(bookData);
  const imageUrl = await uploadCover(coverData);

  let book;

  try {
    book = new Book({ title, author, bookUrl, imageUrl, featured });
    book = await book.save();
  } catch (error) {
    return new Error(error);
  }

  if (!book) {
    return res.status(500).json({ message: "Internal Server Error" });
  }

  return res.status(201).json({ book });
});

// @description Update book
// @route  PUT /api/books/:id
// @access Private
const updateBook = asyncHandler(async (req, res) => {
  const { title, author, bookUrl, imageUrl, featured } = req.body;
  if (
    !title &&
    title.trim() === "" &&
    !author &&
    author.trim() === "" &&
    !bookUrl &&
    bookUrl.trim() === "" &&
    !imageUrl &&
    imageUrl.trim() === ""
  ) {
    return res.status(422).json({ message: "Invalid Inputs" });
  }

  let book;
  try {
    book = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        author,
        bookUrl,
        imageUrl,
        featured,
      },
      { new: true },
      { runValidators: true }
    );
  } catch (error) {
    return console.log(error);
  }

  if (!book) {
    res.status(500).json({ message: "Internal Server Error" });
  }

  return res.status(200).json({ message: "Book Updated" });
});

// @description Delete book
// @route DELETE /api/books/:id
// @access Private
const deleteBook = asyncHandler(async (req, res) => {
  let book;
  try {
    book = await Book.findByIdAndRemove(req.params.id);
  } catch (error) {
    return new Error(error);
  }

  if (!book) {
    return res.status(500).json({ message: "Unable to delete" });
  }

  return res.status(200).json({ message: "Book Successfully Deleted" });
});

const getBookById = asyncHandler(async (req, res) => {
  // const books = await Book.find()
  let book;

  try {
    book = await Book.findById(req.params.id);
  } catch (err) {
    return new Error(err);
  }

  if (!book) {
    res.status(404).json({ message: "No Book Found from Specified Id" });
  }

  return res.status(200).json(book);
});

module.exports = {
  getBookById,
  getBooks,
  addBook,
  updateBook,
  deleteBook,
};
