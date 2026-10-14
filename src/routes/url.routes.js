import { UrlController } from "../controllers/url.controller.js";
import { Router } from "express";

const router = Router();

router.get('/health', UrlController.getHealth);
router.get('/:shortCode', UrlController.getShortCode);
router.post('/api/urls', UrlController.postUrl);

export default router;