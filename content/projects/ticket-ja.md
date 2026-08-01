---
title: "Ticket-Já API - Plataforma de Venda de Ingressos"
slug: ticket-ja
description: API REST completa para venda de ingressos, cobrindo eventos, pontos de venda, categorias, pedidos, ingressos e pagamentos.
longDescription: API REST completa para venda de ingressos, cobrindo eventos, pontos de venda, categorias, pedidos, ingressos e pagamentos com NestJS e arquitetura modular por domínio.
tags: ["nodejs", "typescript", "nestjs", "prisma", "postgresql", "docker", "jwt", "swagger", "jest"]
githubUrl: https://github.com/gabrii3lmao/Ticket-Ja
timestamp: 2026-07-15T02:39:03Z
featured: true
---

**Node.js · TypeScript · NestJS · Prisma · PostgreSQL · Docker**
**2026**

- Desenvolvi uma API REST completa para venda de ingressos, cobrindo todo o fluxo de eventos, pontos de venda, categorias, pedidos, ingressos e pagamentos com NestJS e arquitetura modular por domínio.
- Implementei o fluxo de compra com transações do Prisma e decremento atômico de estoque, prevenindo overselling e double-purchase sob alta concorrência.
- Modelei o banco de dados PostgreSQL com enums, índices e relacionamentos com onDelete Restrict/Cascade, garantindo integridade referencial.
- Implementei autenticação JWT com Passport, guards globais, decorators de acesso, pipes de validação e proteção com Helmet.
- Construí tratamento de erros em camadas com Exception Filters, mapeando erros do Prisma (P2002→409, P2025→404) e logging por severidade (5xx error / 4xx warning).
- Apliquei validação de entrada com class-validator e ValidationPipe global (whitelist + forbidNonWhitelisted), além de paginação e filtros em todos os recursos.
- Escrevi 143 testes unitários (12 suítes) com mocks do Prisma e cobertura de bordas de datas via fake timers para as regras de janela de venda.
- Documentei a API com OpenAPI/Swagger e containerizei a aplicação com Docker Compose.

**Repositório:** https://github.com/gabrii3lmao/Ticket-Ja
