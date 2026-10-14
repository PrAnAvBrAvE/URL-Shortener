import Url from "../models/url.model.js";
import crypto from "crypto"

export class UrlController {
  static getHealth(req, res) {
    res.status(200).json({ status: "ok" });
  }

  static async getShortCode(req, res) {
    const { shortCode } = req.params;
    try {
      const url = await Url.findOne({ shortCode });

      if (!url) {
        return res.status(404).json({
          message: "Url not found",
        });
      }

      return res.redirect(302, url.originalUrl);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to redirect",
      });
    }
  }

  static async postUrl(req, res) {
    const { originalUrl } = req.body ?? {};

    if (typeof originalUrl !== "string" || !originalUrl.trim()) {
      return res.status(400).json({
        message: "originalUrl is required and must be a non-empty string",
      });
    }

    let parsedUrl;

    try {
      parsedUrl = new URL(originalUrl);
    } catch {
      return res.status(400).json({
        message: "Invalid URL",
      });
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return res.status(400).json({
        message: "Only HTTP and HTTPS URLs are supported",
      });
    }

    try {
      const shortCode = crypto.randomBytes(6).toString("base64url");

      const url = await Url.create({
        originalUrl,
        shortCode,
      });

      return res.status(201).json({
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to create short URL",
      });
    }
  }
}
