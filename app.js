const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
//require("dotenv").config();

const app = express();
// Sirf development mein .env load karo
if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
}

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || 
        origin.startsWith("http://localhost:") || 
        origin.startsWith("http://127.0.0.1:") || 
        origin === "https://thebibleglory.com" || 
        origin === "https://www.thebibleglory.com" ||
        origin === "https://backend.thebibleglory.com") {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth",    require("./routes/auth"));      // /api/auth/login
app.use("/api/auth",    require("./routes/register"));  // /api/auth/register
app.use("/api", require("./routes/googleAuth"));         // Google Auth signin
app.use("/api/blog",    require("./routes/Blog"));
app.use("/api/profile", require("./routes/profile"));

app.get("/", (req, res) => res.send("Backend Running"));

// Connect DB then start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));