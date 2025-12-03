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
        console.log('ERRO: não foi posssível conectar ao SQLite.');
        throw err;
    }
    console.log('Conectado ao SQLite!');
});

//tabela de configuracao (distancia e se a luz está ligada ou não)
db.run(`CREATE TABLE IF NOT EXISTS configuracao 
        (id INTEGER PRIMARY KEY, distancia INTEGER NOT NULL, light INTEGER NOT NULL)`, 
        [], (err) => {
   if (err) {
      console.log('ERRO: não foi possí­vel criar tabela.');
      throw err;
   }
   db.run(`INSERT OR IGNORE INTO configuracao(id, distancia, light) VALUES(1, 20, 0)`);
});

//tabela de historico das configurações, distancia e horario
db.run(`CREATE TABLE IF NOT EXISTS historico_configuracoes 
        (id INTEGER PRIMARY KEY AUTOINCREMENT, 
         distancia INTEGER NOT NULL, 
         timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)`, 
        [], (err) => {
   if (err) {
      console.log('ERRO: não foi possível criar tabela de histórico.');
      throw err;
   }
});

//GET /Configuracao
app.get('/Configuracao', (req, res) => {
    db.get(`SELECT * FROM configuracao WHERE id = 1`, [], (err, result) => {
        if (err) {
            console.log("Erro: " + err);
            res.status(500).send('Erro ao obter configuração.');
        } else {
            res.status(200).json(result);
        }
    });
});

//PATCH /Configuracao
app.patch('/Configuracao', (req, res) => {
    const distancia = req.body.distancia;
    
    db.run(`UPDATE configuracao SET distancia = ? WHERE id = 1`,
           [distancia], function(err) {
        if (err){
            res.status(500).send('Erro ao alterar configuração.');
        } else {
            db.run(`INSERT INTO historico_configuracoes(distancia) VALUES(?)`,
                   [distancia], (err) => {
                if (err) console.log('Erro ao registrar histórico:', err);
            });
            
            console.log(`Distância atualizada para: ${distancia} cm`);
            res.status(200).send('Configuração atualizada com sucesso!');
        }
    });
});

//PATCH /Light
app.patch('/Light', (req, res) => {
    const light = req.body.light;
    db.run(`UPDATE configuracao SET light = ? WHERE id = 1`,
           [light], function(err) {
        if (err){
            res.status(500).send('Erro ao alterar luz.');
        } else {
            console.log(`Luz atualizada para: ${light}`);
            res.status(200).send('Luz atualizada com sucesso!');
        }
    });
});

//GET /HistoricoConfiguracoes
app.get('/HistoricoConfiguracoes', (req, res) => {
    db.all(`SELECT * FROM historico_configuracoes ORDER BY timestamp DESC LIMIT 100`, 
           [], (err, result) => {
        if (err) {
            console.log("Erro: " + err);
            res.status(500).send('Erro ao obter histórico.');
        } else {
            res.status(200).json(result);
        }
    });
});

let porta = 8080;
app.listen(porta, () => {
    console.log('Serviço de Controle em execução na porta: ' + porta);
});