const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

const Lead = mongoose.model(
  "Lead",
  new mongoose.Schema({
    name: String,
    email: String,
    verified: { type: Boolean, default: false },
  })
);

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email } = req.body;
    const newLead = await Lead.create({ name, email });

    // Email Verification Link
    const verificationLink = `http://localhost:5000/api/verify/${newLead._id}`;

    // Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASS,
      },
    });
    transporter.verify((error, success) => {
      if (error) {
        console.error("Nodemailer error:", error);
      } else {
        console.log("Server ready to send mail");
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Please verify your email",
      html: `<h2>Hello ${name},</h2><p>Click to verify: <a href="${verificationLink}">Verify Email</a></p>`,
    });

    res.json({
      message: "Signup successful! Check your email for verification.",
    });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Something went wrong on the server." });
  }
});

app.get("/api/verify/:id", async (req, res) => {
  const user = await Lead.findByIdAndUpdate(req.params.id, { verified: true });
  res.send(
    `<h1>Email Verified!</h1><p>Thank you for verifying, ${user.name}.</p>`
  );
});

app.listen(5000, () => console.log("Server running on port 5000"));
