import Url from "../models/url.model.js";
import crypto from "crypto"

export class UrlController {
  static getHealth(req, res) {
    res.status(200).json({ status: "ok" });
  }

  static async getUrls(req, res, next) {
    try {
      const page = Number(req.query.page ?? 1);
      const limit = Number(req.query.limit ?? 10)

      if( !Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1 || limit > 100) {
        return res.status(400).json({message: "Page must be >= 1 and limit must be between 1 and 100"})
      }

      const skip = (page - 1) * limit;

      const [urls, total] = await Promise.all([
        Url.find()
          .sort({ _id: -1 })
          .skip(skip)
          .limit(limit),
        Url.countDocuments()
      ]);

      return res.status(200).json({
        success: true,
        data: urls,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getShortCode(req, res, next) {
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
      next(error)
    }
  }

  static async postUrl(req, res, next) {
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
      next(error)
    }
  }
}
