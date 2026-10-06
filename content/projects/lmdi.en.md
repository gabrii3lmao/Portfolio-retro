---
title: "Let Me Do It - Answer Sheet Grading"
slug: lmdi
locale: "en"
description: Full-stack platform for automated exam grading using computer vision with Google Gemini.
longDescription: Full-stack platform for automated exam grading using computer vision with Google Gemini.
tags: ["nodejs", "typescript", "vue", "mongodb", "redis", "bullmq"]
githubUrl: https://github.com/gabrii3lmao/lmdi-backend
liveDemoUrl: https://letmedoit.app.br
timestamp: 2026-07-20T02:39:03Z
featured: true
---

**Node.js · TypeScript · Vue · MongoDB · Redis · BullMQ**
**2025 – 2026**

- Built a full-stack platform for automated exam grading, using the Google Gemini API for computer vision processing of answer sheets.
- Architected a high-performance asynchronous flow with Redis and BullMQ, reducing server blocking time from 7s to milliseconds by offloading processing to dedicated workers.
- Implemented cloud file management with Cloudinary and Multer, optimizing storage and guaranteeing secure URL provisioning for AI analysis.
- Structured the backend following the layered pattern (MSC) with strict validation via Zod, ensuring data integrity and consistent types across the whole TypeScript ecosystem.
- Implemented resilience and failure-handling mechanisms using Exponential Backoff and retry strategies via BullMQ to deal with instability in external APIs.
- Set up a CI/CD pipeline with GitHub Actions, automating typecheck, unit tests (194) and build, with continuous deployment on Render only after full validation.
