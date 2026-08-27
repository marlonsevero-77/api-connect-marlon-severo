'use strict';

/**
 * MODEL - camada de dados.
 * Nao conhece HTTP: devolve dados puros ou null.
 */

let funcionarios = [
  { id: 1, nome: 'Marlon', cargo: 'Desenvolvedor', salario: 5000, departamento: 'TI' },
  { id: 2, nome: 'Ana',    cargo: 'Designer',      salario: 4500, departamento: 'TI' },
  { id: 3, nome: 'Bruno',  cargo: 'Gerente',       salario: 8000, departamento: 'Vendas' },
  { id: 4, nome: 'Carla',  cargo: 'Vendedora',     salario: 3500, departamento: 'Vendas' },
  { id: 5, nome: 'Diego',  cargo: 'Desenvolvedor', salario: 5500, departamento: 'TI' },
];

// Contador de IDs. Comeca em 6 e nunca reaproveita numeros removidos.
let proximoId = funcionarios.length + 1;

function gerarId() {
  return proximoId++;
}

function listarTodos() {
  return funcionarios;
}

function buscarPorId(id) {
  return funcionarios.find((f) => f.id === id) || null;
}

function criar(dados) {
  const novo = { id: gerarId(), ...dados };
  funcionarios.push(novo);
  return novo;
}

function atualizar(id, dados) {
  const indice = funcionarios.findIndex((f) => f.id === id);

  if (indice === -1) {
    return null;
  }

  const atualizado = {
    ...funcionarios[indice],      // mantem os campos nao enviados
    ...dados,                     // sobrescreve os enviados
    id: funcionarios[indice].id,  // o id e imutavel, nunca vem do corpo
  };

  funcionarios[indice] = atualizado;
  return atualizado;
}

function remover(id) {
  const indice = funcionarios.findIndex((f) => f.id === id);

  if (indice === -1) {
    return null;
  }

  return funcionarios.splice(indice, 1)[0];
}

module.exports = {
  listarTodos,
  buscarPorId,
  criar,
  atualizar,
  remover,
};
