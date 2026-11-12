import { registerUser, loginUser } from "../services/authService.js";

const registerController = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const user = await registerUser({ fullName, email, password });

    return res.status(201).json({
      status: "success",
      message: "Account registered successfully.",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        status: "error",
        message: "Email is already registered.",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Registration failed",
    });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({ email, password });

    // Store JWT in an HTTP-only cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      path: "/",
    });

    return res.status(200).json({
      status: "success",
      message: "Login successful.",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(401).json({
      status: "error",
      message: "Invalid email or password",
    });
  }
};

const logoutController = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    status: "success",
    message: "Logged out successful.",
  });
};

export { registerController, loginController, logoutController };
