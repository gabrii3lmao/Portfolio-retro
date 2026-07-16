---
title: "Let Me Do It - Correção de Gabaritos"
slug: lmdi
description: Plataforma Full Stack para correção automatizada de exames utilizando visão computacional com Google Gemini.
longDescription: Plataforma Full Stack para correção automatizada de exames utilizando visão computacional com Google Gemini.
tags: ["nodejs", "typescript", "vue", "mongodb", "redis", "bullmq"]
githubUrl: https://github.com/gabrii3lmao/lmdi-backend
liveDemoUrl: https://letmedoit.app.br
timestamp: 2026-01-15T02:39:03Z
featured: true
---

**Node.js · TypeScript · Vue · MongoDB · Redis · BullMQ**
**2025 – 2026**

- Desenvolvi uma plataforma Full Stack para correção automatizada de exames, utilizando a API do Google Gemini para processamento de visão computacional em gabaritos.
- Arquiteturei um fluxo assíncrono de alta performance com Redis e BullMQ, reduzindo o tempo de bloqueio do servidor de 7s para milissegundos através do desacoplamento do processamento em workers dedicados.
- Implementei gestão de arquivos em nuvem com Cloudinary e Multer, otimizando o armazenamento e garantindo o provisionamento seguro de URLs para análise da IA.
- Estruturei o backend seguindo o padrão de camadas (MSC) com validação rigorosa via Zod, garantindo integridade de dados e tipos consistentes em todo o ecossistema TypeScript.
- Implementei mecanismos de resiliência e tratamento de falhas utilizando estratégias de Exponential Backoff e Retries via BullMQ para lidar com instabilidades em APIs externas.
- Configurei pipeline de CI/CD com GitHub Actions, automatizando typecheck, testes unitários (194) e build, com deploy contínuo no Render apenas após validação completa.
