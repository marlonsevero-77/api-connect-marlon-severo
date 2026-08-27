'use strict';

const { Router } = require('express');
const controller = require('../controllers/funcionarios.controller');

/**
 * ROUTES - o contrato REST.
 *
 * A URL nomeia o RECURSO (substantivo, plural) e o metodo HTTP expressa a
 * ACAO. Por isso nao existe /criarFuncionario: o verbo ja esta no protocolo.
 */
const router = Router();

router.get('/', controller.listar);           // GET    /funcionarios
router.get('/:id', controller.buscarPorId);   // GET    /funcionarios/3
router.post('/', controller.criar);           // POST   /funcionarios
router.put('/:id', controller.atualizar);     // PUT    /funcionarios/3
router.delete('/:id', controller.remover);    // DELETE /funcionarios/3

module.exports = router;
