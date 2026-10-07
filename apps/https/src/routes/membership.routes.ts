import { Router, type Router as ExpressRouter } from "express";
import { requireAuth, optionalAuth } from "../middleware/index.js";
import { membershipController } from "../controllers/membership.controller.js";

const router: ExpressRouter = Router();

router.post("/subscribe", requireAuth, membershipController.subscribe);
router.get("/my-subscriptions", requireAuth, membershipController.getMySubscriptions);
router.get("/creator-members", requireAuth, membershipController.getCreatorMembers);
router.post("/:id/cancel", requireAuth, membershipController.cancel);
router.post("/:id/renew", requireAuth, membershipController.renew);
router.get("/access/:productId", optionalAuth, membershipController.checkAccess);

export default router;
