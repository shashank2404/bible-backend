const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

// ✅ Load env FIRST, before anything else
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const app = express();

// ✅ CORS config
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "https://thebibleglory.com",
      "https://www.thebibleglory.com",
      "https://backend.thebibleglory.com",
      "http://localhost:3000",
      "http://localhost:5173"
    ];
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/auth", require("./routes/register"));
app.use("/api", require("./routes/googleAuth"));
app.use("/api", require("./routes/facebookLogin"));
app.use("/api/blog", require("./routes/Blog"));
app.use("/api/profile", require("./routes/profile"));

app.get("/", (req, res) => res.send("Backend Running"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error(err));