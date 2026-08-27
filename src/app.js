'use strict';

const express = require('express');
const funcionariosRoutes = require('./routes/funcionarios.routes');

const app = express();

// Leitura de JSON no corpo. Precisa vir ANTES das rotas.
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ api: 'Funcionarios API', versao: '1.0.0', status: 'ok' });
});

// Todo caminho do roteador ganha o prefixo /funcionarios
app.use('/funcionarios', funcionariosRoutes);

module.exports = app;
