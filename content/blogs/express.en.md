---
title: "Express: Everything You Need to Know Before Creating Your Server"
slug: "express-tudo-o-que-você-precisa-saber-antes-de-criar-seu-servidor"
locale: "en"
description: A practical guide to layered architecture, TypeScript, and development best practices.
longDescription: A practical guide to layered architecture, TypeScript, and development best practices.
cardImage: "https://miro.medium.com/v2/resize:fit:1100/format:webp/0*6h2nNbVtQ-xutr0q.png"
tags: ["express", "code", "typescript", "backend", "api"]
readTime: 13
featured: true
timestamp: 2026-05-24T02:39:03Z
---
### 1. ) The nature of Express

Unlike frameworks such as Laravel or Spring Boot, which have a more defined structure, Express does not impose a specific architecture on the application. It is minimalist by default.

This ends up being a double-edged sword: on the one hand it is flexible and simple, but it also opens the door to a very common problem: the so-called “fat controllers”, where business rules, database access, and validations end up concentrated inside the controllers.

In small projects this may seem harmless (and even advisable to avoid premature complexity), but as the project grows, maintenance starts to get harder and harder.

In this guide, we are going to build an Express application using TypeScript and a layered architecture (Controller -> Service -> Repository) to keep the code more organized and decoupled.

### 1.1 ) Why use TypeScript with Express?

Besides adding static typing to the application, TypeScript helps prevent surprises during development, reducing mismatch errors as the project grows.

Another important benefit is the improved developer experience. Features such as autocomplete, real-time validation, and go-to-definition make the code more predictable and more productive to work with.

That is why, in this tutorial, we will use TypeScript not only because it is the industry standard, but also because of the real advantages it brings in organization, readability, and safety when compared to plain JavaScript.

### 1.2 ) Project structure

In this guide, we are going to build a simple product registration application.

To keep the project simple, we will use a class to simulate the database, since the focus will be on organizing an Express application using TypeScript and a layered architecture.

The folder structure will look like this:
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

Where:

- The config folder will hold shared application files, such as HTTP exception classes.
- The middlewares folder will store the middlewares responsible for intercepting and processing requests.
- The modules folder will group the domain modules of the application. Since the system will only have product management, we will have a single product module.
- The router folder will centralize the registration of the application routes.
- The index.ts will be the entry point of the Express server.

### 1.3 ) Initial project setup

First, create the project folder and access the directory:

``` bash
mkdir express-ts  
cd express-ts
```

Next, initialize the Node.js project with npm:

``` bash
npm init -y
```

Don’t forget to change “type”: “module” in your package.json

Now install Express, along with the development dependencies used by TypeScript:

``` bash
npm i express  
npm i -D typescript tsx @types/node @types/express
```

Generate the TypeScript configuration file:

``` bash
npx tsc --init
```

Finally, let’s create the index.ts, which will serve as the entry point for our server:

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

### 2. ) Creating our Repository

Layered architecture splits the application into parts with well-defined responsibilities. Each layer solves one specific kind of problem and communicates only with its adjacent layers.

In the case of the Repository, it represents the layer closest to the data. Its responsibility is exclusively to persist and retrieve information, without applying business rules or validations.

Follow this small diagram that summarizes this architecture:

![](https://cdn-images-1.medium.com/max/1000/1*iecVuUO-4gDcyyPJeiQIeQ.png)

Notice how each part has a single responsibility

In other words, the only goal of the Repository is to fetch and insert data into the database, without worrying about validation or business rules.

The code of our product.repository.ts

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

The ProductRepository class encapsulates the data access operations. When a product is not found in the getProductByName method, the return is undefined, leaving the next layer responsible for handling that case.

And that next layer is precisely the brain of our system: the Service.

### 2.1 ) Creating our Service

If the Repository is the “dumb” layer, the Service is the opposite: it is the smartest layer of the software. This is where the business rules live.

The Service does not know whether the data is coming from an in-memory array or a PostgreSQL database. Its only concern is applying your business rules (such as complex validations, calculations, and permissions) and calling the repository to save or fetch the data.

Another important point is Dependency Injection: instead of instantiating the Repository directly inside the Service, it is received through the constructor. This reduces coupling and makes testing easier.

Our product.service.ts file:

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

The ProductService acts as the layer that orchestrates the operations related to products. It uses the ProductRepository to access and manipulate data, but adds validation rules before running any operation.

In the lookup, update, and removal methods, the service first checks whether the product exists. Otherwise, it throws an error, preventing invalid operations on the repository.

This way, the service keeps the application logic centralized and prevents business rules from ending up scattered across the controller or the repository.

### 2.2 ) Creating our Controller

The Controller is the layer responsible for intermediating the communication between client and server. It receives HTTP requests, validates the data, and delegates the processing to the Service.

In other words, the Controller should contain neither business rules nor direct database access. It simply receives the data from the request, calls the Service, and returns the appropriate HTTP response.

Create the product.controller.ts file and add the code below:

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

Notice that the catch blocks capture the errors thrown in the Service layer with throw new Error() and turn those errors into appropriate HTTP responses for the client.

Right now, we are validating errors manually through the exception message:

``` ts
if (error.message === "Produto não encontrado.")
```

This approach is considered bad practice, because it makes error handling fragile and hard to scale. Later on, we will replace this behavior with a global error-handling middleware.

It is worth mentioning that we are declaring our functions using Arrow functions to keep the this scope. Without that, dependency injection would not work correctly.

Our next step is to define the endpoints of the application.

### 2.3 ) Creating our Routes

Routes are responsible for mapping application endpoints to specific controller methods.

An endpoint is an API URL associated with an HTTP method, such as GET /products or POST /products. When a request arrives at that endpoint, Express runs the corresponding controller method.

Create the product.routes.ts file and type the code below:
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

With that, the application starts responding to requests such as:

- GET /api/product
- POST /api/product
- GET /api/product/:id
- PUT /api/product/:id
- DELETE /api/product/:id

The routes now act as the entry point of the API, connecting HTTP requests to the controller methods.

That concludes the 2nd part of our tutorial! From now on, if you have done everything correctly, you can test the application with an API testing tool such as [Insomnia](https://insomnia.rest/download) or [Postman](https://www.postman.com/).

The next topic is optional and only covers global error handling in Express. I recommend reading it, as it complements the architecture presented so far.

### 3. ) Global error handling

As mentioned earlier in chapter 2.2, I said that checking the Service error message to deliver a response in the Controller would be a terrible decision.

Imagine you decide to create three more modules in your project. The number of error handlers you would have to create would grow exponentially! That would break one of the clean code principles: DRY (Don’t Repeat Yourself).

That is why many developers prefer to create a global error middleware. That way, they would only need to throw an exception and let the middleware handle the HTTP response automatically.

In your src/config/httpException.ts file:
``` ts
export class HttpException extends Error {  
  statusCode: number;  
  constructor(message: string, statusCode: number) {  
    super(message);  
    this.statusCode = statusCode;  
  }  
}
```

This creates an HttpException class that receives a message and a status code. However, that in itself does not solve anything.

To solve this once and for all, we need a middleware that will intercept the error and turn it into an HTTP response.

In your src/middlewares/errorHandler.ts:
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
Here is that check we performed earlier. However, instead of checking the error string, we check whether it is an instance of the HttpException class (which we will throw throughout our program).

This way, the middleware centralizes all error responses sent to the client. Another advantage is that this pattern avoids exposing internal application details to the client, such as stack traces and sensitive error messages.

Now you just need to use this middleware in your main server file. In your index.ts:
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

Now, let’s update our product module to reflect our change.

The updated product.service.ts:
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

and, finally, the updated product.controller.ts:
 
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

Notice that the catch blocks capture the errors thrown in the Service layer with throw new Error() and turn those errors into appropriate HTTP responses for the client.

Right now, we are validating errors manually through the exception message:

``` ts
if (error.message === "Produto não encontrado.")
```

This approach is considered bad practice, because it makes error handling fragile and hard to scale. Later on, we will replace this behavior with a global error-handling middleware.

It is worth mentioning that we are declaring our functions using Arrow functions to keep the this scope. Without that, dependency injection would not work correctly.

Our next step is to define the endpoints of the application.

### 2.3 ) Creating our Routes

Routes are responsible for mapping application endpoints to specific controller methods.

An endpoint is an API URL associated with an HTTP method, such as GET /products or POST /products. When a request arrives at that endpoint, Express runs the corresponding controller method.

Create the product.routes.ts file and type the code below:
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

With that, the application starts responding to requests such as:

- GET /api/product
- POST /api/product
- GET /api/product/:id
- PUT /api/product/:id
- DELETE /api/product/:id

The routes now act as the entry point of the API, connecting HTTP requests to the controller methods.

That concludes the 2nd part of our tutorial! From now on, if you have done everything correctly, you can test the application with an API testing tool such as [Insomnia](https://insomnia.rest/download) or [Postman](https://www.postman.com/).

The next topic is optional and only covers global error handling in Express. I recommend reading it, as it complements the architecture presented so far.

### 3. ) Global error handling

As mentioned earlier in chapter 2.2, I said that checking the Service error message to deliver a response in the Controller would be a terrible decision.

Imagine you decide to create three more modules in your project. The number of error handlers you would have to create would grow exponentially! That would break one of the clean code principles: DRY (Don’t Repeat Yourself).

That is why many developers prefer to create a global error middleware. That way, they would only need to throw an exception and let the middleware handle the HTTP response automatically.

In your src/config/httpException.ts file:
``` ts
export class HttpException extends Error {  
  statusCode: number;  
  constructor(message: string, statusCode: number) {  
    super(message);  
    this.statusCode = statusCode;  
  }  
}
```

This creates an HttpException class that receives a message and a status code. However, that in itself does not solve anything.

To solve this once and for all, we need a middleware that will intercept the error and turn it into an HTTP response.

In your src/middlewares/errorHandler.ts:
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
Here is that check we performed earlier. However, instead of checking the error string, we check whether it is an instance of the HttpException class (which we will throw throughout our program).

This way, the middleware centralizes all error responses sent to the client. Another advantage is that this pattern avoids exposing internal application details to the client, such as stack traces and sensitive error messages.

Now you just need to use this middleware in your main server file. In your index.ts:
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

Now, let’s update our product module to reflect our change.

The updated product.service.ts:
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

and, finally, the updated product.controller.ts:
 
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
### 4. ) Conclusion

First of all, I hope you enjoyed this article. This is my first of many, and I am really happy you read it all the way to the end :)

I truly hope from the bottom of my heart that you learned something new with this article. It took me a good amount of work, and writing it was truly rewarding.

Even so, with this introduction you should already feel ready to explore more advanced concepts of architecture and web development best practices.

A short summary of everything that was implemented:

- Initial project structure with Express and TypeScript
- Implementation of the layered architecture (Repository, Service, and Controller)
- Creation of an in-memory Repository to simulate data persistence
- Implementation of business rules in the Service with validations and calculations
- Building the Controller to handle HTTP requests and responses
- Definition and organization of the application routes
- Introduction of error handling via exceptions in the Service
- Preparation for the global error-handling middleware

### 4.1 ) About the Author

My name is Gabriel Luz, I am 18 years old, and I am a computer science student at the Instituto Federal do Piauí. I have always been very curious about computing and technology, but my interest in the field only really started in 2025, when I was 17. That is the year I discovered Web Development and became truly interested in programming.

Thank you, friends! Wishing you all happy studies! Cheers!