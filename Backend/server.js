const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const winston = require("winston");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const FRONTEND_DIR = path.join(__dirname, "..", "Frontend");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(FRONTEND_DIR));

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

app.use(
  morgan("[:date[iso]] :method :url :status :res[content-length] - :response-time ms", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    logger.info({
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - start,
      params: req.params,
      query: req.query,
      body: req.method !== "GET" ? req.body : undefined,
    });
  });
  next();
});

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    enrollmentDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    duration: { type: Number, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

const Student = mongoose.model("Student", studentSchema);
const Course = mongoose.model("Course", courseSchema);

// User model for settings (bio, profile photo)
const userSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, trim: true },
    bio: { type: String, default: "" },
    profilePhoto: { type: String, default: null },
  },
  { timestamps: true, _id: false }
);

const User = mongoose.model("User", userSchema);

// Report model
const reportSchema = new mongoose.Schema(
  {
    reporterId: { type: String, ref: "User", required: true },
    targetId: { type: String, ref: "User" },
    reason: { type: String, required: true },
    details: { type: String },
    status: { type: String, enum: ["open", "reviewed", "closed"], default: "open" },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

// ensure uploads dir exists
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// file upload middleware
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2,8)}${ext}`;
    cb(null, name);
  },
});
const upload = multer({ storage });

function formatStudent(student) {
  const studentObj = student.toObject();
  return {
    ...studentObj,
    courseName: student.course?.name || null,
    course: student.course?._id || student.course,
  };
}

app.get("/api/courses", async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ name: 1 });
    res.json(courses);
  } catch (error) {
    next(error);
  }
});

app.post("/api/courses", async (req, res, next) => {
  try {
    const course = new Course(req.body);
    const savedCourse = await course.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    next(error);
  }
});

app.put("/api/courses/:id", async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/courses/:id", async (req, res, next) => {
  try {
    const enrolledCount = await Student.countDocuments({ course: req.params.id });
    if (enrolledCount > 0) {
      return res.status(400).json({ message: "Cannot delete course with enrolled students" });
    }
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/courses/:id", async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(course);
  } catch (error) {
    next(error);
  }
});

app.get("/api/students", async (req, res, next) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 }).populate("course", "name");
    res.json(students.map(formatStudent));
  } catch (error) {
    next(error);
  }
});

app.post("/api/students", async (req, res, next) => {
  try {
    const student = new Student(req.body);
    const savedStudent = await student.save();
    const populated = await Student.findById(savedStudent._id).populate("course", "name");
    res.status(201).json(formatStudent(populated));
  } catch (error) {
    next(error);
  }
});

// Settings endpoints
app.get('/api/users/:id/settings', async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ id: user._id, name: user.name, bio: user.bio, profilePhoto: user.profilePhoto });
  } catch (err) { next(err); }
});

app.put('/api/users/:id/bio', async (req, res, next) => {
  try {
    const { bio, name } = req.body;
    const update = {};
    if (typeof bio === 'string') update.bio = bio;
    if (typeof name === 'string') update.name = name;
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.json({ id: user._id, bio: user.bio, name: user.name });
  } catch (err) { next(err); }
});

app.post('/api/users/:id/profile-photo', upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const publicPath = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.params.id, { profilePhoto: publicPath }, { new: true, upsert: true, setDefaultsOnInsert: true });
    res.json({ id: user._id, profilePhoto: user.profilePhoto });
  } catch (err) { next(err); }
});

// Reports
app.post('/api/reports', async (req, res, next) => {
  try {
    const { reporterId, targetId, reason, details } = req.body;
    if (!reporterId || !reason) return res.status(400).json({ message: 'reporterId and reason required' });
    const report = new Report({ reporterId, targetId, reason, details });
    const saved = await report.save();
    res.status(201).json(saved);
  } catch (err) { next(err); }
});

app.get('/api/reports', async (req, res, next) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).populate('reporterId', 'name').populate('targetId', 'name');
    res.json(reports);
  } catch (err) { next(err); }
});

app.put("/api/students/:id", async (req, res, next) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate("course", "name");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(formatStudent(student));
  } catch (error) {
    next(error);
  }
});

app.delete("/api/students/:id", async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    next(error);
  }
});

app.get("/api/students/search", async (req, res, next) => {
  try {
    const q = req.query.q || "";
    const matchingCourses = await Course.find({ name: { $regex: q, $options: "i" } }).select("_id");
    const courseIds = matchingCourses.map((course) => course._id);
    const students = await Student.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { course: { $in: courseIds } },
      ],
    })
      .populate("course", "name")
      .sort({ createdAt: -1 });
    res.json(students.map(formatStudent));
  } catch (error) {
    next(error);
  }
});

app.get("/api/dashboard/stats", async (req, res, next) => {
  try {
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ status: "active" });
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ status: "active" });
    const graduates = await Student.countDocuments({ status: "inactive" });
    res.json({
      totalStudents,
      activeStudents,
      totalCourses,
      activeCourses,
      graduates,
      successRate: totalStudents ? Math.round((graduates / totalStudents) * 100) : 0,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

app.get('*', (req, res, next) => {
  if (
    req.method !== 'GET' ||
    req.path.startsWith('/api/') ||
    req.path.startsWith('/uploads') ||
    req.path.startsWith('/health')
  ) {
    return next();
  }
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.use((err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
    status: err.status || 500,
  });
  res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

const PORT = Number(process.env.PORT || 3000);
const PRIMARY_MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student-management-app";

async function startServer() {
  try {
    await mongoose.connect(PRIMARY_MONGODB_URI);
    console.log(`Connected to MongoDB at ${PRIMARY_MONGODB_URI}`);
  } catch (error) {
    console.warn("Primary MongoDB connection failed. Falling back to in-memory MongoDB.", error.message);
    const { MongoMemoryServer } = require("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log("Connected to in-memory MongoDB");
  }

  // Try to bind to an available port from a small list to avoid EADDRINUSE crashes
  const preferredPorts = [Number(process.env.PORT) || PORT, 8000, 3001, 3002];

  for (const p of preferredPorts) {
    try {
      await new Promise((resolve, reject) => {
        const srv = app.listen(p, () => {
          console.log(`Server running on port ${p}`);
          resolve(srv);
        });
        srv.on('error', (err) => {
          srv.close?.();
          reject(err);
        });
      });
      // success
      break;
    } catch (err) {
      if (err && err.code === 'EADDRINUSE') {
        console.warn(`Port ${p} in use, trying next port.`);
        continue;
      }
      console.error('Failed to start server:', err);
      process.exit(1);
    }
  }
}

startServer().catch((error) => {
  console.error("Failed to initialize server:", error);
  process.exit(1);
});
