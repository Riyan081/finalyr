import { Router, type Router as ExpressRouter } from "express";
import { requireAuth } from "../middleware/index.js";
import { payoutController } from "../controllers/payout.controller.js";

const router: ExpressRouter = Router();

// All payout routes require creator authentication
router.use(requireAuth);

router.get("/status", payoutController.getStatus);
router.post("/request", payoutController.requestPayout);
router.get("/history", payoutController.getHistory);

export default router;
