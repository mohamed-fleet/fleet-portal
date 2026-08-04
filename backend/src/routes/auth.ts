import { Router, Request, Response } from "express";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // السماح بالدخول للحساب التجريبي فوراً
    if (email === "admin@fleet.com" && password === "admin123") {
      return res.json({
        token: "demo-jwt-token-123456789",
        user: {
          id: "1",
          email: "admin@fleet.com",
          name: "Admin",
          role: "admin",
        },
      });
    }

    return res.status(401).json({ error: "Invalid email or password" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
