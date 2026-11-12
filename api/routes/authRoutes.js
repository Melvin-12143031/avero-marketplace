import express from "express";
import {
  registerController,
  loginController,
  logoutController,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Register a new account
router.post("/register", registerController);

// Login to an existing account
router.post("/login", loginController);

// Restore the authenticated user's session
router.get("/me", protect, (req, res) => {
  return res.status(200).json({
    status: "success",
    message: "Authenticated successfully.",
    user: {
      id: req.user.id,
      fullName: req.user.full_name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

// Logout and clear the authentication cookie
router.post("/logout", logoutController);

export default router;
