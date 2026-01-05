const { initializeDatabase } = require("./db/db.connection");
const { Student } = require("./models/students.model");

const express = require("express");
const cors = require("cors");
const app = express();

app.use(express.json());


const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? "https://redux-school-management-backend.onrender.com/"  // Your frontend URL
    : "http://localhost:3000",  // Local dev
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],  // Explicit DELETE
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));


async function startServer() {
  try {
    await initializeDatabase();  // Wait for DB connection
    console.log("✅ Database connected");
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
  }
}

startServer();

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.get("/students", async (req, res) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/students", async (req, res) => {
  const { name, age, grade } = req.body;

  try {
    const student = new Student({ name, age, grade });
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/students/:id", async (req, res) => {
  const studentId = req.params.id;
  const updatedStudentData = req.body;

  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      updatedStudentData,
      { new: true },
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(updatedStudent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/students/:id", async (req, res) => {
  const studentId = req.params.id;
  console.log("Delete attempt for ID: ", studentId)
  try {
    const deletedStudent = await Student.findByIdAndDelete(studentId);
    console.log("Deleted student:", deletedStudent)
    if (!deletedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.status(200).json({
        message: "Student deleted successfully",
        id: deletedStudent,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});
