const express = require('express');
const Blockchain = require('../blockchain');
const bodyParser = require('body-parser');
const P2pServer = require('./p2p-server.js');

const HTTP_PORT = process.env.HTTP_PORT || 3001;

const app  = express();
app.use(bodyParser.json());

const blockchain = new Blockchain();
const p2pserver = new P2pServer(blockchain);

app.get('/blocks',(req,res)=>{
    res.json(blockchain.chain);
});

app.get('/mine',(req,res)=>{
    const block = blockchain.addBlock(req.body.data);
    console.log(`Block added: ${block.toString()}`);
    p2pserver.syncChain();
    res.redirect('/blocks');
});

app.listen(HTTP_PORT,()=>{
    console.log(`listening on port ${HTTP_PORT}`);
});

p2pserver.listen();