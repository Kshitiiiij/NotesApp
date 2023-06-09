const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const asyncHandler = require("express-async-handler");

//GET ALL NOTE
const getAllNote = asyncHandler(async (req, res) => {
  const notes = await prisma.notes.findMany({
    select: {
        title: true,
        text: true,
        userId: true,
    }
  });

  // Check if notes exist

  if (!notes || notes.length === 0) {
    return res.status(404).json({ message: "No Notes found" });
  }

  // Get username of each note
  const notesWithUser = await Promise.all(
    notes.map(async (note) => {
      const user = await prisma.user.findUnique({
        where: {
          id: note.userId,
        },
        select: {
          username: true,
        },
      });
      return {
        ...note,
        username: user.username,
      };
    })
  );

  res.json(notesWithUser);
});

//CREATE NEW NOTE
const createNewNote = asyncHandler(async (req, res) => {
  const { id, title, text } = req.body;

  // Check if all fields are present
  if (!id || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check if user with this id exists
  const notExistUser = await prisma.user.findUnique({
    where: {
      id: id,
    },
  });
  if (!notExistUser) {
    return res
      .status(400)
      .json({ message: "User with this id does not exist" });
  }
// Check if note with this title already exists
  const duplicateNote = await prisma.notes.findUnique({
    where: {
      title: title,
    },
  });

  if (duplicateNote) {
    return res
      .status(400)
      .json({ message: "Note with this title already exists" });
  }

  const newNote = await prisma.notes.create({
    data: {
      title: title,
      text: text,
      userId: id,
    },
  });
  if (newNote) {
    // Created
    return res.status(201).json({ message: "New note created" });
  } else {
    return res.status(400).json({ message: "Invalid note data received" });
  }
});

//UPDATE NOTE
const updateNote = asyncHandler(async (req, res) => {});

//DELETE NOTE
const deleteNote = asyncHandler(async (req, res) => {});

module.exports = { getAllNote, createNewNote, updateNote, deleteNote };
