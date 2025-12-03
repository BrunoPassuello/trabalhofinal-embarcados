const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3');
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var db = new sqlite3.Database('./cancela.db', (err) => {
    if (err) {
        console.log('ERRO: não foi possível conectar ao SQLite.');
        throw err;
    }
    console.log('Conectado ao SQLite!');
});

//Tabela de logs
db.run(`CREATE TABLE IF NOT EXISTS logs 
        (id INTEGER PRIMARY KEY AUTOINCREMENT, 
         distancia INTEGER NOT NULL, 
         distancia_estipulada INTEGER NOT NULL,
         timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`, 
        [], (err) => {
   if (err) {
      console.log('ERRO: não foi possível criar tabela de logs.');
      throw err;
   }
});

//Tabela de abertura da cancela
db.run(`CREATE TABLE IF NOT EXISTS historico_aberturas 
        (id INTEGER PRIMARY KEY AUTOINCREMENT, 
         timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`, 
        [], (err) => {
   if (err) {
      console.log('ERRO: não foi possível criar tabela de aberturas.');
      throw err;
   }
});

//POST /Log
app.post('/Log', (req, res) => {
    db.run(`INSERT INTO logs(distancia, distancia_estipulada) VALUES(?, ?)`, 
         [req.body.distancia, req.body.distancia_estipulada], (err) => {
        if (err) {
            console.log("Erro: " + err);
            res.status(500).send('Erro ao registrar log.');
        } else {
            res.status(200).send('Log registrado com sucesso!');
        }
    });
});

//GET /Logs
app.get('/Logs', (req, res) => {
    db.all(`SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50`, [], (err, result) => {
        if (err) {
            console.log("Erro: " + err);
            res.status(500).send('Erro ao obter logs.');
        } else {
            res.status(200).json(result);
        }
    });
});

//POST /Abertura
app.post('/Abertura', (req, res) => {
    db.run(`INSERT INTO historico_aberturas DEFAULT VALUES`, [], (err) => {
        if (err) {
            console.log("Erro: " + err);
            res.status(500).send('Erro ao registrar abertura.');
        } else {
            console.log('Abertura da cancela registrada!');
            res.status(200).send('Abertura registrada com sucesso!');
        }
    });
});

//GET /HistoricoAberturas
app.get('/HistoricoAberturas', (req, res) => {
    db.all(`SELECT * FROM historico_aberturas ORDER BY timestamp DESC LIMIT 100`, 
           [], (err, result) => {
        if (err) {
            console.log("Erro: " + err);
            res.status(500).send('Erro ao obter histórico de aberturas.');
        } else {
            res.status(200).json(result);
        }
    });
});

let porta = 8090;
app.listen(porta, () => {
    console.log('Serviço de Logging em execução na porta: ' + porta);
});