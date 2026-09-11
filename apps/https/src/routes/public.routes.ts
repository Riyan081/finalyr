import { Router } from "express";
import { publicController } from "../controllers/public.controller.js";

const router: import("express").Router = Router();

// All public routes — NO auth required
router.get("/featured", publicController.getFeaturedProducts);
router.get("/:username", publicController.getCreatorStorefront);
router.get("/:username/:slug", publicController.getProductBySlug);

export default router;
