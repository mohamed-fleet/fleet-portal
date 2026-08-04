import { Router, Request, Response } from "express";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // السماح بالدخول بحساب الأدمن التلقائي مباشرة
  if (email === "admin@fleet.com" && password === "admin123") {
    return res.json({
      token: "demo-jwt-token-12345",
      user: {
        id: "1",
        email: "admin@fleet.com",
        name: "Admin User",
        role: "admin",
      },
    });
  }

  return res.status(401).json({ error: "Invalid email or password" });
});

export default router;
