
import "dotenv/config";

import mongoose from "mongoose";
import request from "supertest";
import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  test
} from "@jest/globals";

import app from "../src/app.js";
import Url from "../src/models/url.model.js";

beforeAll(async () => {
  if (!process.env.MONGODB_TEST_URI) {
    throw new Error("MONGODB_TEST_URI is not configured");
  }

  await mongoose.connect(process.env.MONGODB_TEST_URI);
});

afterEach(async () => {
  await Url.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("URL Shortener API", () => {
  test("GET /health returns 200", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  test("POST /api/urls creates a short URL", async () => {
    const response = await request(app)
      .post("/api/urls")
      .send({ originalUrl: "https://example.com/page" });

    expect(response.status).toBe(201);
    expect(response.body.originalUrl).toBe(
      "https://example.com/page"
    );
    expect(response.body.shortCode).toBeDefined();

    const savedUrl = await Url.findOne({
      shortCode: response.body.shortCode
    });

    expect(savedUrl).not.toBeNull();
    expect(savedUrl.originalUrl).toBe("https://example.com/page");
  });

  test("POST /api/urls rejects an invalid URL", async () => {
    const response = await request(app)
      .post("/api/urls")
      .send({ originalUrl: "not-a-valid-url" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid URL");
  });

  test("GET /:shortCode redirects to the original URL", async () => {
    const url = await Url.create({
      originalUrl: "https://example.com/destination",
      shortCode: "test123"
    });

    const response = await request(app)
      .get(`/${url.shortCode}`)
      .redirects(0);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(url.originalUrl);
  });

  test("GET /:shortCode returns 404 for an unknown code", async () => {
    const response = await request(app).get("/doesnotexist");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Url not found");
  });

  test("GET /api/urls returns paginated results", async () => {
    await Url.create([
      {
        originalUrl: "https://example.com/one",
        shortCode: "pageone"
      },
      {
        originalUrl: "https://example.com/two",
        shortCode: "pagetwo"
      },
      {
        originalUrl: "https://example.com/three",
        shortCode: "pagethree"
      }
    ]);

    const response = await request(app)
      .get("/api/urls?page=1&limit=2");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 2,
      total: 3,
      totalPages: 2
    });
  });
});
