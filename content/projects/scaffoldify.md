---
title: "Scaffoldify - Fullstack Boilerplate CLI"
slug: scaffoldify
description: "CLI interativa para scaffolding de aplicações fullstack prontas para produção com Vue 3 ou Next.js 15."
longDescription: "Ferramenta CLI para gerar boilerplates fullstack com arquitetura modular, Docker, Swagger, ORM type-safe e CI/CD embutido."
tags: ["nodejs", "typescript", "commander", "inquirer", "express", "vue", "react", "drizzle", "mongoose", "docker"]
githubUrl: https://github.com/gabrii3lmao/Scaffoldify
featured: true
timestamp: 2026-06-15T02:39:03Z
---

CLI interativa que gera boilerplates fullstack em segundos, com suporte a Vue 3 + Vite ou Next.js 15 no frontend e Express + TypeScript no backend.

- **Frontend modular** — Vue 3 (Pinia, TanStack Query, TailwindCSS 4) ou Next.js 15 (React 19, Zustand), ambos com estrutura pronta para produção.
- **Backend domain-driven** — Express + TypeScript com suporte a Drizzle ORM (PostgreSQL) ou Mongoose (MongoDB), incluindo schemas, controllers, services e rotas CRUD completas.
- **Infraestrutura inclusa** — Docker multi-estágio com health checks, Swagger auto-documentado, ESLint, Prettier e `.env.example`.
- **CI/CD ready** — Modo non-interactive com flags `--yes`, `--frontend` e `--database` para pipelines automatizadas.
- **Arquitetura extensível** — Template engine com funções puras e tipagem forte, facilitando a adição de novos módulos e frameworks.