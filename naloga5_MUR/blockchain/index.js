const SHA256 = require('crypto-js/sha256');
const DIFFICULTY = 4;
const MINE_RATE = 3;

var globIndex = 1;

class Block{
    constructor(index, timestamp,lastHash,hash,data,nonce,difficulty){
        this.index = index;
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty || DIFFICULTY;
    }

    toString(){
        return `Block - 
        Index:    : ${this.index}
        Timestamp : ${this.timestamp}
        Last Hash : ${this.lastHash.substring(0,10)}
        Hash      : ${this.hash.substring(0,10)}
        Nonce     : ${this.nonce}
        Data      : ${this.data}
        Difficulty: ${this.difficulty}`;
    }

    static genesis(){
        return new this(0,'Genesis time','0','0000000',[],0,DIFFICULTY);
    }

    static mineBlock(lastBlock,data){
        let hash;
        let timestamp;
        const lastHash = lastBlock.hash;
        let { difficulty } = lastBlock;
        let index = globIndex;
        let nonce = 0;
        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty(lastBlock,timestamp);
            hash = Block.hash(index, timestamp,lastHash,data,nonce,difficulty);
        } while(hash.substring(0,difficulty) !== '0'.repeat(difficulty));

        return new this(index, timestamp,lastHash,hash,data,nonce,difficulty);
    }

    static hash(index, timestamp,lastHash,data,nonce,difficulty){
        return SHA256(`${index}${timestamp}${lastHash}${data}${nonce}${difficulty}`).toString();
    }

    static blockHash(block){
        const { index, timestamp, lastHash, data, nonce,difficulty } = block;
        return Block.hash(index, timestamp,lastHash,data,nonce,difficulty);
    }

    static adjustDifficulty(lastBlock,currentTime){
        let { difficulty } = lastBlock;
        difficulty = lastBlock.timestamp + MINE_RATE > currentTime ? difficulty + 1 : difficulty - 1; 
        return difficulty; 
    }

}


class Blockchain{
    constructor(){
        this.chain = [Block.genesis()];
    }
  
    addBlock(data){
        const block = Block.mineBlock(this.chain[this.chain.length-1],data);
        this.chain.push(block);
        globIndex++;
        return block;
    }
  
    isValidChain(chain){
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis()))
            return false;

        for(let i = 1 ; i<chain.length; i++){
            const block = chain[i];
            const lastBlock = chain[i-1];
            if((block.lastHash !== lastBlock.hash) || (block.hash !== Block.blockHash(block)) || (block.index = lastBlock.index + 1))
            return false;
        }
        return true;
    }
    
    replaceChain(newChain){
        if(newChain.length <= this.chain.length){
            console.log("Recieved chain is not longer than the current chain");
            return;
        }else if(!this.isValidChain(newChain)){
            console.log("Recieved chain is invalid");
            return;
        } 
        console.log("Replacing the current chain with new chain");
        this.chain = newChain; 
    }
}

module.exports = Blockchain;