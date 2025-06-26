// server.js
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));
app.use(session({
  secret: "your-secret-key",
  resave: false,
  saveUninitialized: false
}));

// MongoDB connection
mongoose.connect("mongodb+srv://yandamuriakash:Aakash123@cluster0.bgow6g3.mongodb.net/blood_donation", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  isAdmin: { type: Boolean, default: false }
});
const User = mongoose.model("User", userSchema);

const donorSchema = new mongoose.Schema({
  name: String,
  bloodGroup: String,
  location: String,
  email: { type: String, unique: true },
  phone: { type: String, unique: true }
});
const Donor = mongoose.model("Donor", donorSchema);

const requestSchema = new mongoose.Schema({
  bloodGroup: String,
  location: String,
  email: String,
  phone: String
});
const Request = mongoose.model("Request", requestSchema);

// ========== Routes ==========

// ✅ User Sign Up
app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(409).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashed });
    await newUser.save();
    res.status(200).json({ message: "User registered!" });
  } catch (err) {
    res.status(500).json({ message: "Signup failed" });
  }
});

// ✅ User Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: "Incorrect password" });

    req.session.user = {
      email: user.email,
      isAdmin: user.isAdmin
    };

    res.status(200).json({ 
      message: "Login successful", 
      isAdmin: user.isAdmin  // ✅ This tells frontend if admin
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});


// ✅ Register Donor
app.post("/donor", async (req, res) => {
  const { name, bloodGroup, location, email, phone } = req.body;

  try {
    // Check for duplicate
    const existing = await Donor.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(400).json({ message: "⚠️ Donor already exists with this email or mobile." });
    }

    const donor = new Donor({ name, bloodGroup, location, email, phone });
    await donor.save();
    res.status(201).json({ message: "✅ Donor registered successfully!" });
  } catch (err) {
    console.error("Donor Save Error:", err);
    res.status(500).json({ message: "❌ Server error" });
  }
});

// ✅ Request Blood
app.post("/request", async (req, res) => {
  const { bloodGroup, location, email, phone } = req.body;

  try {
    // Save request to DB
    await new Request({ bloodGroup, location, email, phone }).save();

    // Match donors by exact blood group and partial location match (case-insensitive)
    const matchedDonors = await Donor.find({
      bloodGroup,
      location: { $regex: new RegExp(location, 'i') }
    });

    res.status(200).json({
      message: matchedDonors.length > 0 ? "Donors found" : "No matching donors found",
      donors: matchedDonors
    });
  } catch (err) {
    console.error("Request error:", err);
    res.status(500).json({ message: "Server error" });
  }
});
   

// ✅ Middleware to protect admin routes
function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
    next(); // allow admin access
  } else {
    res.status(403).json({ message: "Access denied. Admins only." });
  }
}


//admin donor

app.get("/admin/donors", requireAdmin, async (req, res) => {
  try {
    const donors = await Donor.find();
    res.json(donors);
  } catch (err) {
    res.status(500).json({ message: "Error fetching donors" });
  }
});

//admin request

app.get("/admin/requests", requireAdmin, async (req, res) => {
  try {
    const requests = await Request.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Error fetching requests" });
  }
});


// DELETE a donor by ID
app.delete("/admin/donor/:id", requireAdmin, async (req, res) => {
  try {
    await Donor.findByIdAndDelete(req.params.id);
    res.json({ message: "Donor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting donor" });
  }
});

// DELETE a request by ID
app.delete("/admin/request/:id", requireAdmin, async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: "Request deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting request" });
  }
});

// ✅ Protect admin routes
function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: "Access denied" });
  }
}

// ✅ Delete Donor
app.delete("/admin/delete-donor/:id", requireAdmin, async (req, res) => {
  try {
    await Donor.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Donor deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to delete donor" });
  }
});

// ✅ Delete Request
app.delete("/admin/delete-request/:id", requireAdmin, async (req, res) => {
  try {
    await Request.findByIdAndDelete(req.params.id);
    res.json({ message: "✅ Request deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to delete request" });
  }
});


// ✅ Start Server
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
