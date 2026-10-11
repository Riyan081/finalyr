import { Router, type Router as ExpressRouter } from "express";
import { aiController } from "../controllers/ai.controller.js";

const router: ExpressRouter = Router();

// Public AI Routes (Accessible by buyers on discover and product pages)
router.get("/semantic-search", (req, res) => aiController.semanticSearch(req, res));
router.get("/recommendations/:productId", (req, res) => aiController.getRecommendations(req, res));

// Creator AI Routes
router.post("/generate-copy", (req, res) => aiController.generateCopy(req, res));

export default router;
