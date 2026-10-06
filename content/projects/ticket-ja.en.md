---
title: "Ticket-Já API - Ticket Sales Platform"
slug: ticket-ja
locale: "en"
description: Complete REST API for ticket sales, covering events, point of sale, categories, orders, tickets and payments.
longDescription: Complete REST API for ticket sales, covering events, point of sale, categories, orders, tickets and payments with NestJS and a domain-driven modular architecture.
tags: ["nodejs", "typescript", "nestjs", "prisma", "postgresql", "docker", "jwt", "swagger", "jest"]
githubUrl: https://github.com/gabrii3lmao/Ticket-Ja
timestamp: 2026-07-15T02:39:03Z
featured: true
---

**Node.js · TypeScript · NestJS · Prisma · PostgreSQL · Docker**
**2026**

- Built a complete REST API for ticket sales, covering the entire flow of events, point of sale, categories, orders, tickets and payments with NestJS and a domain-driven modular architecture.
- Implemented the purchase flow with Prisma transactions and atomic stock decrement, preventing overselling and double purchases under high concurrency.
- Designed the PostgreSQL database with enums, indexes and relationships using onDelete Restrict/Cascade, guaranteeing referential integrity.
- Implemented JWT authentication with Passport, global guards, access decorators, validation pipes and Helmet protection.
- Built layered error handling with Exception Filters, mapping Prisma errors (P2002→409, P2025→404) and logging by severity (5xx error / 4xx warning).
- Applied input validation with class-validator and a global ValidationPipe (whitelist + forbidNonWhitelisted), besides pagination and filtering on every resource.
- Wrote 143 unit tests (12 suites) with Prisma mocks and date-boundary coverage via fake timers for the sales window rules.
- Documented the API with OpenAPI/Swagger and containerized the application with Docker Compose.

**Repository:** https://github.com/gabrii3lmao/Ticket-Ja
