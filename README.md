# API Connect — Gerenciamento de Funcionários

API REST para gerenciamento de funcionários, desenvolvida como MVP (Produto Mínimo Viável) para validação de uma ideia de negócio. Expõe operações completas de CRUD em formato JSON, com validação de entrada, códigos de status HTTP semânticos e respostas padronizadas.

---

## Objetivo

Fornecer ao time de front-end uma interface HTTP estável e previsível para consultar, cadastrar, atualizar e remover registros de funcionários, sem depender de um banco de dados provisionado.

A aplicação foi construída sob o padrão **MVC**, com separação explícita entre camada de dados, lógica de negócio e protocolo HTTP — de modo que substituir a persistência em memória por um banco relacional exija alteração em um único arquivo.

---

## Tecnologias utilizadas

| Tecnologia | Versão | Papel |
|---|---|---|
| [Node.js](https://nodejs.org) | ≥ 18 | Runtime JavaScript no servidor |
| [Express](https://expressjs.com) | ^4.19 | Framework HTTP: roteamento e middlewares |
| npm | ≥ 9 | Gerenciamento de dependências e scripts |
| Postman | — | Cliente HTTP para testes manuais |

Persistência simulada por **array em memória**, conforme escopo de MVP. Nenhuma dependência além do Express.

---

## Estrutura do projeto

```
.
├── src/
│   ├── app.js                              # monta o Express e os middlewares
│   ├── server.js                           # sobe o servidor na porta
│   ├── models/
│   │   └── funcionarios.model.js           # dados + operações de acesso
│   ├── controllers/
│   │   └── funcionarios.controller.js      # validação, regras e respostas HTTP
│   └── routes/
│       └── funcionarios.routes.js          # contrato REST das rotas
├── .gitignore
├── package.json
└── README.md
```

Fluxo de uma requisição:

```
HTTP → routes → controller → model → array em memória
```

A dependência é unidirecional: o model não conhece HTTP, e o controller é a única camada que manipula `req` e `res`.

---

## Executando localmente

### Pré-requisitos

- Node.js 18 ou superior
- npm

Verifique com:

```bash
node -v
npm -v
```

### Passo a passo

**1. Clone o repositório**

```bash
git clone https://github.com/SEU-USUARIO/api-connect-marlon-severo.git
cd api-connect-marlon-severo
```

**2. Instale as dependências**

```bash
npm install
```

**3. Inicie o servidor**

```bash
npm run dev     # modo desenvolvimento, com reinício automático
```

ou

```bash
npm start       # modo produção
```

**4. Confirme que está no ar**

```bash
curl http://localhost:3000
```

```json
{ "api": "Funcionarios API", "versao": "1.0.0", "status": "ok" }
```

A API sobe em `http://localhost:3000`. Para usar outra porta:

```bash
PORT=4000 npm start
```

---

## Modelo de dados

```json
{
  "id": 1,
  "nome": "Marlon",
  "cargo": "Desenvolvedor",
  "salario": 5000,
  "departamento": "TI"
}
```

| Campo | Tipo | Obrigatório | Regra |
|---|---|---|---|
| `id` | número | gerado | Incremental, imutável. Nunca aceito no corpo da requisição |
| `nome` | string | sim | Texto não vazio |
| `cargo` | string | sim | Texto não vazio |
| `salario` | número | sim | Maior que zero |
| `departamento` | string | sim | Texto não vazio |

A aplicação inicia com 5 registros pré-carregados. Como a persistência é em memória, **reiniciar o servidor restaura o estado inicial**.

---

## Padrão de respostas

Toda resposta segue um destes dois formatos, sem exceção:

**Sucesso**

```json
{ "data": { } }
```

**Erro**

```json
{
  "error": {
    "message": "Descrição do problema",
    "details": [
      { "field": "nome", "message": "O campo \"nome\" e obrigatorio." }
    ]
  }
}
```

A chave `details` aparece apenas em erros de validação campo a campo.

---

## Endpoints

| Método | Rota | Descrição | Sucesso |
|---|---|---|---|
| `GET` | `/` | Índice da API | 200 |
| `GET` | `/funcionarios` | Lista todos os funcionários | 200 |
| `GET` | `/funcionarios/:id` | Busca um funcionário por ID | 200 |
| `POST` | `/funcionarios` | Cadastra um novo funcionário | 201 |
| `PUT` | `/funcionarios/:id` | Substitui um funcionário existente | 200 |
| `DELETE` | `/funcionarios/:id` | Remove um funcionário | 200 |

---

### `GET /funcionarios` — Listagem

```bash
curl http://localhost:3000/funcionarios
```

**200 OK**

```json
{
  "data": [
    { "id": 1, "nome": "Marlon", "cargo": "Desenvolvedor", "salario": 5000, "departamento": "TI" },
    { "id": 2, "nome": "Ana", "cargo": "Designer", "salario": 4500, "departamento": "TI" },
    { "id": 3, "nome": "Bruno", "cargo": "Gerente", "salario": 8000, "departamento": "Vendas" }
  ]
}
```

Uma coleção vazia retorna `200` com `"data": []` — nunca `404`.

---

### `GET /funcionarios/:id` — Busca por ID

```bash
curl http://localhost:3000/funcionarios/3
```

**200 OK**

```json
{ "data": { "id": 3, "nome": "Bruno", "cargo": "Gerente", "salario": 8000, "departamento": "Vendas" } }
```

**404 Not Found** — ID válido, recurso inexistente

```json
{ "error": { "message": "Funcionario com id 999 nao encontrado." } }
```

**400 Bad Request** — ID malformado (`/funcionarios/abc`)

```json
{ "error": { "message": "O id deve ser um numero inteiro positivo." } }
```

---

### `POST /funcionarios` — Cadastro

```bash
curl -X POST http://localhost:3000/funcionarios \
  -H "Content-Type: application/json" \
  -d '{"nome":"Elis Regina","cargo":"Analista","salario":4800,"departamento":"RH"}'
```

**201 Created** — com header `Location: /funcionarios/6`

```json
{ "data": { "id": 6, "nome": "Elis Regina", "cargo": "Analista", "salario": 4800, "departamento": "RH" } }
```

**400 Bad Request** — campo obrigatório ausente

```json
{
  "error": {
    "message": "Dados invalidos.",
    "details": [
      { "field": "departamento", "message": "O campo \"departamento\" e obrigatorio." }
    ]
  }
}
```

A validação acumula **todos** os erros encontrados, em vez de interromper no primeiro.

---

### `PUT /funcionarios/:id` — Atualização

Substituição total: todos os campos são obrigatórios.

```bash
curl -X PUT http://localhost:3000/funcionarios/1 \
  -H "Content-Type: application/json" \
  -d '{"nome":"Marlon Severo","cargo":"Tech Lead","salario":9000,"departamento":"TI"}'
```

**200 OK**

```json
{ "data": { "id": 1, "nome": "Marlon Severo", "cargo": "Tech Lead", "salario": 9000, "departamento": "TI" } }
```

O `id` é imutável: mesmo que enviado no corpo, o valor original prevalece.

---

### `DELETE /funcionarios/:id` — Remoção

```bash
curl -X DELETE http://localhost:3000/funcionarios/2
```

**200 OK** — devolve o registro removido

```json
{ "data": { "id": 2, "nome": "Ana", "cargo": "Designer", "salario": 4500, "departamento": "TI" } }
```

Repetir a mesma requisição retorna **404**.

---

## Códigos de status

| Código | Quando ocorre |
|---|---|
| `200 OK` | Consulta, atualização ou remoção bem-sucedida |
| `201 Created` | Recurso criado com sucesso |
| `400 Bad Request` | Corpo inválido, campo obrigatório ausente ou ID malformado |
| `404 Not Found` | ID válido, mas nenhum recurso corresponde a ele |

A distinção entre `400` e `404` é deliberada: `400` indica requisição malformada, `404` indica ausência do recurso.

---

## Testes

### Postman

O repositório inclui a coleção `Funcionarios-API.postman_collection.json`. Importe via **Import → Upload Files** e execute com **Run collection** para rodar a bateria completa com asserções automáticas de status.

### Terminal

```bash
curl -i http://localhost:3000/funcionarios
curl -i http://localhost:3000/funcionarios/999
curl -i -X POST http://localhost:3000/funcionarios -H "Content-Type: application/json" -d '{}'
```

---

## Limitações conhecidas

- **Persistência volátil.** Os dados vivem em memória e são restaurados ao reiniciar o processo.
- **Instância única.** O contador de IDs é local ao processo; múltiplas instâncias gerariam IDs conflitantes.
- **Sem autenticação.** Todos os endpoints são públicos.
- **Sem paginação.** A listagem retorna a coleção completa.

Todas são conscientes e adequadas ao escopo de MVP. A arquitetura em camadas permite endereçá-las sem reescrita: trocar a persistência exige alterar apenas `src/models/funcionarios.model.js`.

---

## Licença

MIT
