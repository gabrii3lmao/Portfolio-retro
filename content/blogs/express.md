---
title: "Express: tudo o que você precisa saber antes de criar seu servidor"
slug: "express-tudo-o-que-você-precisa-saber-antes-de-criar-seu-servidor"
description: Um guia prático de arquitetura em camadas, TypeScript e boas práticas de desenvolvimento.
longDescription: Um guia prático de arquitetura em camadas, TypeScript e boas práticas de desenvolvimento.
cardImage: "https://miro.medium.com/v2/resize:fit:1100/format:webp/0*6h2nNbVtQ-xutr0q.png"
tags: ["express", "code", "typescript", "backend", "api"]
readTime: 13
featured: true
timestamp: 2026-05-24T02:39:03Z
---
### 1. ) A natureza do Express

Diferente de frameworks como Laravel ou Spring Boot, que possuem uma estrutura mais definida, o Express não impõe uma arquitetura específica para a aplicação. Ele é minimalista por padrão.

Isso acaba se tornando uma faca de dois gumes: por um lado ele é flexível e simples, mas também abre espaço para um problema muito comum: os chamados “fat controllers”, onde regras de negócio, acesso ao banco de dados e validações acabam ficando concentrados dentro dos controllers.

Em projetos pequenos isso pode parecer inofensivo (e até recomendável para evitar a complexidade prematura), mas conforme o projeto cresce, a manutenção começa a ficar cada vez mais difícil.

Neste guia, vamos criar uma aplicação Express utilizando TypeScript e uma arquitetura em camadas (Controller -> Service -> Repository) para manter o código mais organizado e desacoplado.

### 1.1 ) Por que usar TypeScript no Express?

Além de adicionar tipagem estática à aplicação, o TypeScript ajuda a evitar surpresas durante o desenvolvimento, reduzindo os erros de incompatibilidade conforme o projeto cresce.

Outro benefício importante é a melhora da experiência de desenvolvimento. Recursos como autocomplete, validação em tempo real e navegação entre definições tornam o código mais previsível e produtivo de se trabalhar.

Por isso, neste tutorial utilizaremos TypeScript não apenas por ser o padrão de mercado, mas também pelas vantagens reais que ele oferece em organização, legibilidade e segurança quando comparado ao Javascript puro.

### 1.2 ) Estrutura do projeto

Neste guia, iremos criar uma aplicação simples de cadastro de produtos.

Para simplificar o projeto, utilizaremos uma classe para simular o banco de dados, já que o foco será a organização de uma aplicação Express utilizando TypeScript e arquitetura em camadas.

A estrutura de pastas será a seguinte:
``` txt
src/  
├── config/  
│	└── httpException.ts  
├── middlewares/  
│	└── errorHandler.ts  
├── modules/  
│   └── product/  
│	 └── product.controller.ts  
│	 └── product.repository.ts  
│	 └── product.routes.ts		  
│        └── product.service.ts  
└── router/  
│	└── index.ts  
└── index.ts
```

Onde: 

- A pasta config conterá arquivos compartilhados da aplicação, como classes de exceção HTTP.
- A pasta middlewares armazenará os middlewares responsáveis por interceptar e processar requisições.
- A pasta modules concentrará os módulos de domínio da aplicação. Como o sistema terá apenas o gerenciamento de produtos, teremos apenas o módulo product.
- A pasta router centralizará o registro das rotas da aplicação.
- O index.ts será o ponto de inicialização do servidor Express.

### 1.3 ) Setup inicial do projeto

Primeiro, crie a pasta do projeto e acesse o diretório:

``` bash
mkdir express-ts  
cd express-ts
```

Em seguida, inicialize o projeto Node.js com o npm: 

``` bash
npm init -y
```

Não se esqueça de mudar o “type”: “module” no seu package.json

Agora instale o Express, junto com as dependências de desenvolvimento utilizadas pelo TypeScript:

``` bash
npm i express  
npm i -D typescript tsx @types/node @types/express
```

Gere o arquivo de configuração do TypeScript:

``` bash
npx tsc --init
```

Por fim, vamos criar o index.ts, que vai servir como a porta de entrada para o nosso servidor:

``` ts
import express from "express";  
  
const app = express();  
const PORT = 3000;  
  
app.use(express.json());  
  
function bootstrap() {  
  try {  
    app.listen(PORT, () => {  
      console.log(`O servidor está rodando na porta ${PORT}`);  
    });  
  } catch (error) {  
    console.error("Erro ao inicializar o servidor:", error);  
    process.exit(1);  
  }  
}  
  
bootstrap();
```

### 2. ) Criando o nosso Repository

A arquitetura em camadas separa a aplicação em partes com responsabilidades bem definidas. Cada camada resolve um tipo específico de problema e se comunica apenas com as adjacentes.

No caso do Repository, ele representa a camada mais próxima dos dados. Sua responsabilidade é exclusivamente persistir e recuperar informações, sem aplicar regras de negócio ou validações.

Siga esse pequeno esquema que resume essa arquitetura:

![](https://cdn-images-1.medium.com/max/1000/1*iecVuUO-4gDcyyPJeiQIeQ.png)

Perceba como cada parte tem uma responsabilidade única 

Ou seja, o único objetivo do Repository é buscar e inserir dados no banco de dados, sem se preocupar com validação nem regra de negócio.

O código do nosso product.repository.ts

``` ts
export type Product = {  
  id: number;  
  name: string;  
  amount: number;  
  value: number;  
};  
  
export type CreateProductDTO = Omit<Product, "id">;  
  
export class ProductRepository {  
  private products: Product[] = []; // O nosso "Banco de Dados"  
  private nextId = 0;  
  
  createProduct(data: CreateProductDTO): Product {  
    const newProduct = {  
      id: this.nextId++,  
      ...data,  
    };  
    this.products.push(newProduct);  
    return newProduct;  
  }  
  
  listProducts(): Product[] {  
    return this.products;  
  }  
  
  getProductById(id: number): Product | undefined {  
    return this.products.find((x) => x.id === id);  
  }  
  
  updateProductById(  
    id: number,  
    updatedData: CreateProductDTO,  
  ): Product | undefined {  
    const productIndex = this.products.findIndex((x) => x.id === id);  
    if (productIndex !== -1) {  
      this.products[productIndex] = { id, ...updatedData };  
    }  
    return this.products[productIndex];  
  }  
  
  deleteProductById(id: number): void {  
    const productIndex = this.products.findIndex((x) => x.id === id);  
    if (productIndex !== -1) {  
      this.products.splice(productIndex, 1);  
    }  
  }  
}

```

A classe ProductRepository encapsula as operações de acesso aos dados. Quando um produto não é encontrado no método getProductByName, o retorno é undefined, deixando para a próxima camada a responsabilidade de tratar esse caso.

E essa próxima camada é justamente o cérebro do nosso sistema: o Service.

### 2.1 ) Criando o nosso Service

Se o Repository é a camada “burra”, o Service é o oposto: ele é a camada mais inteligente do software. É aqui que moram as regras de negócio.

O Service não sabe se os dados estão vindo de um array na memória ou de um banco PostgreSQL. A única preocupação dele é aplicar as regras do seu negócio (como validações complexas, cálculos e permissões) e chamar o repositório para salvar ou buscar os dados.

Outro ponto importante é a Injeção de Dependência: em vez de instanciar o Repository diretamente dentro do Service, ele é recebido via construtor. Isso reduz acoplamento e facilita testes.

O nosso arquivo product.service.ts:

``` ts
import {  
  ProductRepository,  
  type Product,  
  type CreateProductDTO,  
} from "./product.repository.js";  
  
export class ProductService {  
  // não precisamos instanciar a classe do repositório. Apenas precisamos  
  // passar ela pelo construtor como uma dependência.   
  constructor(private readonly _productRepository: ProductRepository) {}  
  
  createProduct(data: CreateProductDTO): Product {  
    return this._productRepository.createProduct(data);  
  }  
  
  getAllProducts(): Product[] {  
    return this._productRepository.listProducts();  
  }  
  
  getProductById(id: number): Product {  
    const product = this._productRepository.getProductById(id);  
    if (!product) {  
      throw new Error("Produto não encontrado.");  
    }  
    return product;  
  }  
  
  updateProductById(id: number, updatedData: CreateProductDTO): Product {  
    const productExist = this._productRepository.getProductById(id);  
  
    if (!productExist) {  
      throw new Error("Produto não encontrado.");  
    }  
  
    this._productRepository.updateProductById(id, updatedData);  
  
    return { id, ...updatedData };  
  }  
  
  deleteProductById(id: number): void {  
    const productExist = this._productRepository.getProductById(id);  
    if (!productExist) {  
      throw new Error("Produto não encontrado.");  
    }  
    this._productRepository.deleteProductById(id);  
  }  
    
  // A importância do service: Regras de Negócio!  
  getTotalValueOfProductById(id: number): number {  
    const product = this._productRepository.getProductById(id);  
  
    if (!product) {  
      throw new Error("Produto não encontrado.");  
    }  
  
    return product.amount * product.value;  
  }  
}

```

O ProductService atua como a camada que orquestra as operações relacionadas a produtos. Ele utiliza o ProductRepository para acessar e manipular os dados, mas adiciona regras de validação antes de executar qualquer operação.

Nos métodos de busca, atualização e remoção, o service primeiro verifica se o produto existe. Caso contrário, lança um erro, evitando operações inválidas no repositório.

Dessa forma, o service mantém a lógica da aplicação centralizada e evita que regras de negócio fiquem espalhadas pelo controller ou repository.

### 2.2 ) Criando o nosso Controller

O Controller é a camada responsável por intermediar a comunicação entre o cliente e servidor. Ele recebe as requisições HTTP, valida os dados e delega o processamento para o Service.

Em outras palavras, o Controller não deve conter regras de negócio nem acesso direto ao banco de dados. Ele apenas recebe os dados da requisição, chama o Service e retorna a resposta HTTP apropriada.

Crie o arquivo product.controller.ts e adicione o código abaixo:

``` ts
import type { Request, Response } from "express";  
import { ProductService } from "./product.service.js";  
  
export class ProductController {  
  constructor(private readonly _productService: ProductService) {}  
  
  create = (req: Request, res: Response) => {  
    try {  
      const { name, amount, value } = req.body;  
  
      if (!name || amount === undefined || value === undefined) {  
        return res.status(400).json({ erro: "Estão faltando informações" });  
      }  
  
      const product = this._productService.createProduct({  
        name,  
        amount,  
        value,  
      });  
  
      return res  
        .status(201)  
        .json({ message: "Produto criado com sucesso", product });  
    } catch (error) {  
      console.error("Ocorreu um erro ao criar o produto:", error);  
      return res.status(500).json({ message: "Erro interno no servidor" });  
    }  
  }  
  
  getAll = (req: Request, res: Response) => {  
    try {  
      const products = this._productService.getAllProducts();  
      return res.status(200).json({ products });  
    } catch (error) {  
      console.error("Ocorreu um erro ao listar os produtos:", error);  
      return res.status(500).json({ message: "Erro interno no servidor" });  
    }  
  }  
  
  getOne = (req: Request, res: Response) => {  
    try {  
      const id = Number(req.params.id);  
  
      if (isNaN(id)) {  
        return res.status(400).json({ message: "ID inválido" });  
      }  
  
      const product = this._productService.getProductById(id);  
      const totalValue = this._productService.getTotalValueOfProductById(id);  
  
      return res.status(200).json({ product: product, totalValue: totalValue });  
    } catch (error: any) {  
      // Veja como estamos validando o erro manualmente. Isso é considerado péssima prática de programação. No futuro, nós vamos substituir isso por um middleware global de erro.  
      if (error.message === "Produto não encontrado.") {  
        return res.status(404).json({ message: error.message });  
      }  
      return res.status(500).json({ message: "Erro interno no servidor" });  
    }  
  }  
  
  update = (req: Request, res: Response) => {  
    try {  
      const id = Number(req.params.id);  
      const { name, amount, value } = req.body;  
  
      if (isNaN(id)) {  
        return res.status(400).json({ message: "ID inválido" });  
      }  
      if (!name || amount === undefined || value === undefined) {  
        return res.status(400).json({ erro: "Estão faltando informações" });  
      }  
  
      const updatedProduct = this._productService.updateProductById(id, {  
        name,  
        amount,  
        value,  
      });  
      return res  
        .status(200)  
        .json({ message: "Produto atualizado", product: updatedProduct });  
    } catch (error: any) {  
      if (error.message === "Produto não encontrado.") {  
        return res.status(404).json({ message: error.message });  
      }  
      return res.status(500).json({ message: "Erro interno no servidor" });  
    }  
  }  
  
  delete = (req: Request, res: Response) => {  
    try {  
      const id = Number(req.params.id);  
  
      if (isNaN(id)) {  
        return res.status(400).json({ message: "ID inválido" });  
      }  
  
      this._productService.deleteProductById(id);  
      return res.status(200).json({ message: "Produto removido com sucesso!" });  
    } catch (error: any) {  
      if (error.message === "Produto não encontrado.") {  
        return res.status(404).json({ message: error.message });  
      }  
      return res.status(500).json({ message: "Erro interno no servidor" });  
    }  
  }  
}
```

Perceba que os blocos catch capturam os erros lançados na camada de Service com throw new Error() e transformam esses erros em respostas HTTP apropriadas para o cliente.

Atualmente, estamos validando os erros manualmente através da mensagem da exceção:

``` ts
if (error.message === "Produto não encontrado.")
```

Essa abordagem é considerada má prática, pois torna o tratamento de erros frágil e difícil de escalar. Mais adiante, substituiremos esse comportamento por um middleware global de tratamento de erros.

É importante mencionar que estamos usando a declaração das funções usando as Arrow functions para manter o escopo do this. Sem isso, a injeção de dependência não funcionaria corretamente.

Nosso próximo passo é definir os endpoints da aplicação.

### 2.3 ) Criando as nossas Rotas 

As rotas são responsáveis por mapear endpoints da aplicação para métodos específicos do controller.

Um endpoint é uma URL da API associada a um método HTTP, como GET /products ou POST /products. Quando uma requisição chega nesse endpoint, o Express executa o método correspondente do controller.

Crie o arquivo product.routes.ts e digite o código abaixo: 
``` ts
import { ProductController } from "./product.controller.js";  
import { ProductService } from "./product.service.js";  
import { ProductRepository } from "./product.repository.js";  
import express from "express";  
  
// Injeção de Dependência na prática:  
// cada classe é instanciada apenas uma vez e compartilhada entre as camadas.  
const productRepository = new ProductRepository();  
const productService = new ProductService(productRepository);  
const productController = new ProductController(productService);  
  
const productRoutes = express.Router();  
  
productRoutes.get("/", productController.getAll);  
productRoutes.post("/", productController.create);  
productRoutes.get("/:id", productController.getOne);  
productRoutes.put("/:id", productController.update);  
productRoutes.delete("/:id", productController.delete);  
  
export default productRoutes;

Agora crie o arquivo **router/index.ts** para centralizar as rotas da aplicação:

import express from "express";  
import productRoutes from "../modules/product/product.routes.js";  
const mainRouter = express.Router();  
  
mainRouter.use("/product", productRoutes);  
  
export default mainRouter;

Por fim, conecte o roteador principal ao servidor no **index.ts**:

import express from "express";  
import mainRouter from "./router/index.js";  
  
const app = express();  
const PORT = 3000;  
  
app.use(express.json());  
// Todas as rotas da aplicação estarão sob o prefixo "/api"  
app.use("/api", mainRouter);  
function bootstrap() {  
  try {  
    app.listen(PORT, () => {  
      console.log(`O servidor está rodando na porta ${PORT}`);  
    });  
  } catch (error) {  
    console.error("Erro ao inicializar o servidor:", error);  
    process.exit(1);  
  }  
}  
  
bootstrap();
```

Com isso, a aplicação passa a responder requisições como:

- GET /api/product
- POST /api/product
- GET /api/product/:id
- PUT /api/product/:id
- DELETE /api/product/:id

As rotas agora atuam como o ponto de entrada da API, conectando as requisições HTTP aos métodos do controller.

Isso finaliza a nossa 2ª parte do tutorial! A partir de agora, se você tiver feito tudo corretamente, poderá testar a aplicação com algum programa de teste de API, como o [Insomnia](https://insomnia.rest/download) ou o [Postman](https://www.postman.com/).

O próximo tópico é opcional e aborda apenas o tratamento global de erros no Express. Recomendo a leitura, pois ele complementa a arquitetura apresentada até aqui.

### 3. ) Tratamento de erros global

Como citado anteriormente no capítulo 2.2, eu disse que verificar a mensagem de erro do Service para entregar uma resposta no Controller seria uma péssima decisão.

Imagine que você decida criar mais três módulos no seu projeto. A quantidade de tratamentos de erro que você teria que criar cresceria exponencialmente! Isso quebraria um dos princípios do código limpo: o DRY (Don’t Repeat Yourself).

Por isso, muitos desenvolvedores preferem criar um middleware global de erro. Assim, eles precisariam apenas lançar uma exceção e deixar que o middleware lide automaticamente com a resposta HTTP.

No seu arquivo src/config/httpException.ts:
``` ts
export class HttpException extends Error {  
  statusCode: number;  
  constructor(message: string, statusCode: number) {  
    super(message);  
    this.statusCode = statusCode;  
  }  
}
```

Isso cria uma classe HttpException que recebe uma mensagem e um status code. Porém, isso por si só não resolve nada.

Para resolver isso de uma vez, precisamos de um middleware que vai interceptar e transformar o erro em uma resposta HTTP.

No seu src/middlewares/errorHandler.ts:
``` ts
import type { Request, Response, NextFunction } from "express";  
import { HttpException } from "../config/httpException.js";  
  
export default function errorMiddleware(  error: unknown,  
  req: Request,  
  res: Response,  
  next: NextFunction,) {  
  if (error instanceof HttpException) {  
    return res.status(error.statusCode).json({ message: error.message });  
  }  
  
  if (error instanceof Error) {  
    console.error(error);  
    return res.status(500).json({ message: error.message });  
  }  
  
  console.error("Unexpected error", error);  
  return res.status(500).json({ message: "Internal server error" });  
}
```
Aqui está aquela verificação que fizemos anteriormente. Porém, em vez de checar a string do erro, verificamos se ele é uma instância da classe HttpException (que vamos lançar ao longo do nosso programa).

Assim, o middleware centraliza todo o envio de respostas de erro para o cliente. Outra vantagem é que esse padrão evita expor detalhes internos da aplicação para o cliente, como stack traces e mensagens sensíveis de erro.

Agora você precisa apenas usar esse middleware no seu arquivo principal do servidor. No seu index.ts: 
``` ts
import express from "express";  
import mainRouter from "./router/index.js";  
// importamos o middleware de erro global  
import errorMiddleware from "./middlewares/errorHandler.js";  
const app = express();  
const PORT = 3000;  
  
app.use(express.json());  
  
app.use("/api", mainRouter);  
// IMPORTANTE: middlewares de erro devem ser registrados após as rotas  
app.use(errorMiddleware);  
  
function bootstrap() {  
  try {  
    app.listen(PORT, () => {  
      console.log(`O servidor está rodando na porta ${PORT}`);  
    });  
  } catch (error) {  
    console.error("Erro ao inicializar o servidor:", error);  
    process.exit(1);  
  }  
}  
  
bootstrap();
```

Agora, vamos atualizar o nosso módulo de produtos para acompanhar a nossa mudança.

O product.service.ts atualizado:
``` ts
import { HttpException } from "../../config/httpException.js";  
import {  
  ProductRepository,  
  type Product,  
  type CreateProductDTO,  
} from "./product.repository.js";  
  
export class ProductService {  
  constructor(private readonly _productRepository: ProductRepository) {}  
  
  createProduct(data: CreateProductDTO): Product {  
    return this._productRepository.createProduct(data);  
  }  
  
  getAllProducts(): Product[] {  
    const products = this._productRepository.listProducts();  
    return products;  
  }  
  
  getProductById(id: number): Product {  
    const product = this._productRepository.getProductById(id);  
    if (!product) {  
      // Agora apenas lançamos uma exceção HTTP com uma   
      // mensagem e um código de status.  
      throw new HttpException("Produto não encontrado.", 404);   
    }  
    return product;  
  }  
  
  updateProductById(id: number, updatedData: CreateProductDTO): Product {  
    const productExist = this._productRepository.getProductById(id);  
  
    if (!productExist) {  
      throw new HttpException("Produto não encontrado", 404);  
    }  
  
    this._productRepository.updateProductById(id, updatedData);  
  
    return { id, ...updatedData };  
  }  
  
  deleteProductById(id: number): void {  
    const productExist = this._productRepository.getProductById(id);  
    if (!productExist) {  
      throw new HttpException("Produto não encontrado", 404);  
    }  
    this._productRepository.deleteProductById(id);  
  }  
  
  getTotalValueOfProductById(id: number): number {  
    const product = this._productRepository.getProductById(id);  
  
    if (!product) {  
      throw new HttpException("Produto não encontrado", 404);  
    }  
  
    return product.amount * product.value;  
  }  
}
```

e, por fim, o product.controller.ts atualizado:
 
``` ts
import type { NextFunction, Request, Response } from "express";  
import { ProductService } from "./product.service.js";  
import { HttpException } from "../../config/httpException.js";  
  
export class ProductController {  
  constructor(private readonly _productService: ProductService) {}  
  // Atualização: agora precisamos passar o next como parâmetro!  
  create = (req: Request, res: Response, next: NextFunction) => {  
    try {  
      const { name, amount, value } = req.body;  
  
      if (!name || amount === undefined || value === undefined) {  
        throw new HttpException("Estão faltando informações", 400);  
      }  
  
      const product = this._productService.createProduct({  
        name,  
        amount,  
        value,  
      });  
  
      return res  
        .status(201)  
        .json({ message: "Produto criado com sucesso", product });  
    } catch (error) {  
      // Agora precisamos apenas   
      // encaminhar o erro para o middleware usando next()   
      // e ele será processado automaticamente pelo middleware global.  
      next(error);   
    }  
  };  
  
  getAll = (req: Request, res: Response, next: NextFunction) => {  
    try {  
      const products = this._productService.getAllProducts();  
      return res.status(200).json({ products });  
    } catch (error) {  
      next(error);  
    }  
  };  
  
  getOne = (req: Request, res: Response, next: NextFunction) => {  
    try {  
      const id = Number(req.params.id);  
  
      if (isNaN(id)) {  
        throw new HttpException("ID Inválido", 400);  
      }  
  
      const product = this._productService.getProductById(id);  
      const totalValue = this._productService.getTotalValueOfProductById(id);  
  
      return res.status(200).json({ product: product, totalValue: totalValue });  
    } catch (error) {  
      next(error);  
    }  
  };  
  
  update = (req: Request, res: Response, next: NextFunction) => {  
    try {  
      const id = Number(req.params.id);  
      const { name, amount, value } = req.body;  
  
      if (isNaN(id)) {  
        throw new HttpException("ID inválido", 400);  
      }  
      if (!name || amount === undefined || value === undefined) {  
        throw new HttpException("Estão faltando informações", 400);  
      }  
  
      const updatedProduct = this._productService.updateProductById(id, {  
        name,  
        amount,  
        value,  
      });  
      return res  
        .status(200)  
        .json({ message: "Produto atualizado", product: updatedProduct });  
    } catch (error) {  
      next(error);  
    }  
  };  
  
  delete = (req: Request, res: Response, next: NextFunction) => {  
    try {  
      const id = Number(req.params.id);  
  
      if (isNaN(id)) {  
        throw new HttpException("ID inválido", 400);  
      }  
  
      this._productService.deleteProductById(id);  
      return res.status(200).json({ message: "Produto removido com sucesso!" });  
    } catch (error) {  
      next(error);  
    }  
  };  
}
```

Perceba que os blocos catch capturam os erros lançados na camada de Service com throw new Error() e transformam esses erros em respostas HTTP apropriadas para o cliente.

Atualmente, estamos validando os erros manualmente através da mensagem da exceção:

``` ts
if (error.message === "Produto não encontrado.")
```

Essa abordagem é considerada má prática, pois torna o tratamento de erros frágil e difícil de escalar. Mais adiante, substituiremos esse comportamento por um middleware global de tratamento de erros.

É importante mencionar que estamos usando a declaração das funções usando as Arrow functions para manter o escopo do this. Sem isso, a injeção de dependência não funcionaria corretamente.

Nosso próximo passo é definir os endpoints da aplicação.

### 2.3 ) Criando as nossas Rotas 

As rotas são responsáveis por mapear endpoints da aplicação para métodos específicos do controller.

Um endpoint é uma URL da API associada a um método HTTP, como GET /products ou POST /products. Quando uma requisição chega nesse endpoint, o Express executa o método correspondente do controller.

Crie o arquivo product.routes.ts e digite o código abaixo: 
``` ts
import { ProductController } from "./product.controller.js";  
import { ProductService } from "./product.service.js";  
import { ProductRepository } from "./product.repository.js";  
import express from "express";  
  
// Injeção de Dependência na prática:  
// cada classe é instanciada apenas uma vez e compartilhada entre as camadas.  
const productRepository = new ProductRepository();  
const productService = new ProductService(productRepository);  
const productController = new ProductController(productService);  
  
const productRoutes = express.Router();  
  
productRoutes.get("/", productController.getAll);  
productRoutes.post("/", productController.create);  
productRoutes.get("/:id", productController.getOne);  
productRoutes.put("/:id", productController.update);  
productRoutes.delete("/:id", productController.delete);  
  
export default productRoutes;

Agora crie o arquivo router/index.ts para centralizar as rotas da aplicação:

import express from "express";  
import productRoutes from "../modules/product/product.routes.js";  
const mainRouter = express.Router();  
  
mainRouter.use("/product", productRoutes);  
  
export default mainRouter;

Por fim, conecte o roteador principal ao servidor no index.ts:

import express from "express";  
import mainRouter from "./router/index.js";  
  
const app = express();  
const PORT = 3000;  
  
app.use(express.json());  
// Todas as rotas da aplicação estarão sob o prefixo "/api"  
app.use("/api", mainRouter);  
function bootstrap() {  
  try {  
    app.listen(PORT, () => {  
      console.log(`O servidor está rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("Erro ao inicializar o servidor:", error);
    process.exit(1);
  }
}

bootstrap();
```

Com isso, a aplicação passa a responder requisições como:

- GET /api/product
- POST /api/product
- GET /api/product/:id
- PUT /api/product/:id
- DELETE /api/product/:id

As rotas agora atuam como o ponto de entrada da API, conectando as requisições HTTP aos métodos do controller.

Isso finaliza a nossa 2ª parte do tutorial! A partir de agora, se você tiver feito tudo corretamente, poderá testar a aplicação com algum programa de teste de API, como o [Insomnia](https://insomnia.rest/download) ou o [Postman](https://www.postman.com/).

O próximo tópico é opcional e aborda apenas o tratamento global de erros no Express. Recomendo a leitura, pois ele complementa a arquitetura apresentada até aqui.

### 3. ) Tratamento de erros global

Como citado anteriormente no capítulo 2.2, eu disse que verificar a mensagem de erro do Service para entregar uma resposta no Controller seria uma péssima decisão.

Imagine que você decida criar mais três módulos no seu projeto. A quantidade de tratamentos de erro que você teria que criar cresceria exponencialmente! Isso quebraria um dos princípios do código limpo: o DRY (Don’t Repeat Yourself).

Por isso, muitos desenvolvedores preferem criar um middleware global de erro. Assim, eles precisariam apenas lançar uma exceção e deixar que o middleware lide automaticamente com a resposta HTTP.

No seu arquivo src/config/httpException.ts:
``` ts
export class HttpException extends Error {  
  statusCode: number;  
  constructor(message: string, statusCode: number) {  
    super(message);  
    this.statusCode = statusCode;  
  }  
}
```

Isso cria uma classe HttpException que recebe uma mensagem e um status code. Porém, isso por si só não resolve nada.

Para resolver isso de uma vez, precisamos de um middleware que vai interceptar e transformar o erro em uma resposta HTTP.

No seu src/middlewares/errorHandler.ts:
``` ts
import type { Request, Response, NextFunction } from "express";  
import { HttpException } from "../config/httpException.js";  
  
export default function errorMiddleware(  error: unknown,  
  req: Request,  
  res: Response,  
  next: NextFunction,) {  
  if (error instanceof HttpException) {  
    return res.status(error.statusCode).json({ message: error.message });  
  }  
  
  if (error instanceof Error) {  
    console.error(error);  
    return res.status(500).json({ message: error.message });  
  }  
  
  console.error("Unexpected error", error);  
  return res.status(500).json({ message: "Internal server error" });  
}
```
Aqui está aquela verificação que fizemos anteriormente. Porém, em vez de checar a string do erro, verificamos se ele é uma instância da classe HttpException (que vamos lançar ao longo do nosso programa).

Assim, o middleware centraliza todo o envio de respostas de erro para o cliente. Outra vantagem é que esse padrão evita expor detalhes internos da aplicação para o cliente, como stack traces e mensagens sensíveis de erro.

Agora você precisa apenas usar esse middleware no seu arquivo principal do servidor. No seu index.ts: 
``` ts
import express from "express";  
import mainRouter from "./router/index.js";  
// importamos o middleware de erro global  
import errorMiddleware from "./middlewares/errorHandler.js";  
const app = express();  
const PORT = 3000;  
  
app.use(express.json());  
  
app.use("/api", mainRouter);  
// IMPORTANTE: middlewares de erro devem ser registrados após as rotas  
app.use(errorMiddleware);  
  
function bootstrap() {  
  try {  
    app.listen(PORT, () => {  
      console.log(`O servidor está rodando na porta ${PORT}`);  
    });  
  } catch (error) {  
    console.error("Erro ao inicializar o servidor:", error);  
    process.exit(1);  
  }  
}  
  
bootstrap();
```

Agora, vamos atualizar o nosso módulo de produtos para acompanhar a nossa mudança.

O product.service.ts atualizado:
``` ts
import { HttpException } from "../../config/httpException.js";  
import {  
  ProductRepository,  
  type Product,  
  type CreateProductDTO,  
} from "./product.repository.js";  
  
export class ProductService {  
  constructor(private readonly _productRepository: ProductRepository) {}  
  
  createProduct(data: CreateProductDTO): Product {  
    return this._productRepository.createProduct(data);  
  }  
  
  getAllProducts(): Product[] {  
    const products = this._productRepository.listProducts();  
    return products;  
  }  
  
  getProductById(id: number): Product {  
    const product = this._productRepository.getProductById(id);  
    if (!product) {  
      // Agora apenas lançamos uma exceção HTTP com uma   
      // mensagem e um código de status.  
      throw new HttpException("Produto não encontrado.", 404);   
    }  
    return product;  
  }  
  
  updateProductById(id: number, updatedData: CreateProductDTO): Product {  
    const productExist = this._productRepository.getProductById(id);  
  
    if (!productExist) {  
      throw new HttpException("Produto não encontrado", 404);  
    }  
  
    this._productRepository.updateProductById(id, updatedData);  
  
    return { id, ...updatedData };  
  }  
  
  deleteProductById(id: number): void {  
    const productExist = this._productRepository.getProductById(id);  
    if (!productExist) {  
      throw new HttpException("Produto não encontrado", 404);  
    }  
    this._productRepository.deleteProductById(id);  
  }  
  
  getTotalValueOfProductById(id: number): number {  
    const product = this._productRepository.getProductById(id);  
  
    if (!product) {  
      throw new HttpException("Produto não encontrado", 404);  
    }  
  
    return product.amount * product.value;  
  }  
}
```

e, por fim, o product.controller.ts atualizado:
 
``` ts
import type { NextFunction, Request, Response } from "express";  
import { ProductService } from "./product.service.js";  
import { HttpException } from "../../config/httpException.js";  
  
export class ProductController {  
  constructor(private readonly _productService: ProductService) {}  
  // Atualização: agora precisamos passar o next como parâmetro!  
  create = (req: Request, res: Response, next: NextFunction) => {  
    try {  
      const { name, amount, value } = req.body;  
  
      if (!name || amount === undefined || value === undefined) {  
        throw new HttpException("Estão faltando informações", 400);  
      }  
  
      const product = this._productService.createProduct({  
        name,  
        amount,  
        value,  
      });  
  
      return res  
        .status(201)  
        .json({ message: "Produto criado com sucesso", product });  
    } catch (error) {  
      // Agora precisamos apenas   
      // encaminhar o erro para o middleware usando next()   
      // e ele será processado automaticamente pelo middleware global.  
      next(error);   
    }  
  };  
  
  getAll = (req: Request, res: Response, next: NextFunction) => {  
    try {  
      const products = this._productService.getAllProducts();  
      return res.status(200).json({ products });  
    } catch (error) {  
      next(error);  
    }  
  };  
  
  getOne = (req: Request, res: Response, next: NextFunction) => {  
    try {  
      const id = Number(req.params.id);  
  
      if (isNaN(id)) {  
        throw new HttpException("ID Inválido", 400);  
      }  
  
      const product = this._productService.getProductById(id);  
      const totalValue = this._productService.getTotalValueOfProductById(id);  
  
      return res.status(200).json({ product: product, totalValue: totalValue });  
    } catch (error) {  
      next(error);  
    }  
  };  
  
  update = (req: Request, res: Response, next: NextFunction) => {  
    try {  
      const id = Number(req.params.id);  
      const { name, amount, value } = req.body;  
  
      if (isNaN(id)) {  
        throw new HttpException("ID inválido", 400);  
      }  
      if (!name || amount === undefined || value === undefined) {  
        throw new HttpException("Estão faltando informações", 400);  
      }  
  
      const updatedProduct = this._productService.updateProductById(id, {  
        name,  
        amount,  
        value,  
      });  
      return res  
        .status(200)  
        .json({ message: "Produto atualizado", product: updatedProduct });  
    } catch (error) {  
      next(error);  
    }  
  };  
  
  delete = (req: Request, res: Response, next: NextFunction) => {  
    try {  
      const id = Number(req.params.id);  
  
      if (isNaN(id)) {  
        throw new HttpException("ID inválido", 400);  
      }  
  
      this._productService.deleteProductById(id);  
      return res.status(200).json({ message: "Produto removido com sucesso!" });  
    } catch (error) {  
      next(error);  
    }  
  };  
}
```
### 4. ) Conclusão 

Primeiramente, eu espero que tenham gostado desse artigo. Este é o meu primeiro de muitos e fico realmente feliz que tenha lido até aqui :)

Eu realmente espero de coração que você tenha aprendido alguma coisa nova com esse artigo. Ele me deu um bom trabalho e foi algo realmente gratificante ter escrito ele.

Porém, com essa introdução, você já deve se sentir preparado para explorar conceitos mais avançados de arquiteturas e boas práticas de programação web.

Um pequeno resumo de tudo que foi implementado:

- Estrutura inicial do projeto com Express e TypeScript
- Implementação da arquitetura em camadas (Repository, Service e Controller)
- Criação de um Repository em memória para simular persistência de dados
- Implementação de regras de negócio no Service com validações e cálculos
- Construção do Controller para lidar com requisições HTTP e respostas
- Definição e organização das rotas da aplicação
- Introdução do tratamento de erros via exceções no Service
- Preparação para o middleware global de tratamento de erros

### 4.1 ) Sobre o Autor

Meu nome é Gabriel Luz, tenho 18 anos e sou estudante de informática no Instituto Federal do Piauí. Sempre fui muito curioso sobre computação e tecnologias, porém o interesse pela área só fui surgir mesmo em 2025, aos meus 17 anos. Fui nesse ano que descobri o Desenvolvimento Web e me interessei de vez por programação.

Obrigado, amigos! Desejo bons estudos a cada um de vocês! Beijos!