import { Router } from "express";
import jwt from "jsonwebtoken";
import { users } from "../data/store";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: "Invalid email or password" });

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
  res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

export default router;
