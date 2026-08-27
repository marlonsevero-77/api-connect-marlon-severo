'use strict';

const model = require('../models/funcionarios.model');

/* ============================================================
   ENVELOPE PADRAO DE RESPOSTA
   ============================================================ */

function responderSucesso(res, status, data) {
  return res.status(status).json({ data });
}

function responderErro(res, status, message, details) {
  const error = { message };

  // "details" so aparece quando ha erro campo a campo.
  if (details !== undefined) {
    error.details = details;
  }

  return res.status(status).json({ error });
}

/* ============================================================
   VALIDACOES
   ============================================================ */

const CAMPOS_OBRIGATORIOS = ['nome', 'cargo', 'salario', 'departamento'];

/** req.params.id chega como string; converte e valida. */
function validarId(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/**
 * Valida o corpo da requisicao.
 *
 * Devolve um array de { field, message }. Array vazio = tudo certo.
 * Nao interrompe no primeiro erro: acumula TODOS, para o front-end
 * poder marcar todos os campos invalidos de uma vez no formulario.
 */
function validarCorpo(corpo) {
  const details = [];

  // 1. O corpo precisa ser um objeto JSON
  if (typeof corpo !== 'object' || corpo === null || Array.isArray(corpo)) {
    return [{ field: 'body', message: 'O corpo da requisicao deve ser um objeto JSON.' }];
  }

  // 2. Presenca dos campos obrigatorios
  for (const campo of CAMPOS_OBRIGATORIOS) {
    if (corpo[campo] === undefined || corpo[campo] === null) {
      details.push({ field: campo, message: `O campo "${campo}" e obrigatorio.` });
    }
  }

  // 3. Tipo e dominio de cada campo presente
  if (corpo.nome !== undefined && corpo.nome !== null) {
    if (typeof corpo.nome !== 'string' || corpo.nome.trim() === '') {
      details.push({ field: 'nome', message: 'O campo "nome" deve ser um texto nao vazio.' });
    }
  }

  if (corpo.cargo !== undefined && corpo.cargo !== null) {
    if (typeof corpo.cargo !== 'string' || corpo.cargo.trim() === '') {
      details.push({ field: 'cargo', message: 'O campo "cargo" deve ser um texto nao vazio.' });
    }
  }

  if (corpo.salario !== undefined && corpo.salario !== null) {
    if (typeof corpo.salario !== 'number' || Number.isNaN(corpo.salario) || corpo.salario <= 0) {
      details.push({ field: 'salario', message: 'O campo "salario" deve ser um numero maior que zero.' });
    }
  }

  if (corpo.departamento !== undefined && corpo.departamento !== null) {
    if (typeof corpo.departamento !== 'string' || corpo.departamento.trim() === '') {
      details.push({ field: 'departamento', message: 'O campo "departamento" deve ser um texto nao vazio.' });
    }
  }

  return details;
}

/** Sanitiza a entrada ja validada antes de gravar. */
function normalizar(corpo) {
  return {
    nome: corpo.nome.trim(),
    cargo: corpo.cargo.trim(),
    salario: corpo.salario,
    departamento: corpo.departamento.trim(),
  };
}

/* ============================================================
   OPERACOES
   ============================================================ */

/** GET /funcionarios */
function listar(req, res) {
  return responderSucesso(res, 200, model.listarTodos());
}

/** GET /funcionarios/:id */
function buscarPorId(req, res) {
  const id = validarId(req.params.id);

  if (id === null) {
    return responderErro(res, 400, 'O id deve ser um numero inteiro positivo.');
  }

  const funcionario = model.buscarPorId(id);

  if (!funcionario) {
    return responderErro(res, 404, `Funcionario com id ${id} nao encontrado.`);
  }

  return responderSucesso(res, 200, funcionario);
}

/** POST /funcionarios */
function criar(req, res) {
  const details = validarCorpo(req.body);

  if (details.length > 0) {
    return responderErro(res, 400, 'Dados invalidos.', details);
  }

  const novo = model.criar(normalizar(req.body));

  res.location(`/funcionarios/${novo.id}`);
  return responderSucesso(res, 201, novo);
}

/** PUT /funcionarios/:id */
function atualizar(req, res) {
  const id = validarId(req.params.id);

  if (id === null) {
    return responderErro(res, 400, 'O id deve ser um numero inteiro positivo.');
  }

  const details = validarCorpo(req.body);

  if (details.length > 0) {
    return responderErro(res, 400, 'Dados invalidos.', details);
  }

  const atualizado = model.atualizar(id, normalizar(req.body));

  if (!atualizado) {
    return responderErro(res, 404, `Funcionario com id ${id} nao encontrado.`);
  }

  return responderSucesso(res, 200, atualizado);
}

/** DELETE /funcionarios/:id */
function remover(req, res) {
  const id = validarId(req.params.id);

  if (id === null) {
    return responderErro(res, 400, 'O id deve ser um numero inteiro positivo.');
  }

  const removido = model.remover(id);

  if (!removido) {
    return responderErro(res, 404, `Funcionario com id ${id} nao encontrado.`);
  }

  return responderSucesso(res, 200, removido);
}

module.exports = { listar, buscarPorId, criar, atualizar, remover };
