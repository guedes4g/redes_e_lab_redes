const Semaphore = require('semaphore-async-await').default
const { parseData } = require('./helpers/parse')
const systemout = require('./helpers/systemout')

module.exports = class Messenger {
    constructor({ socket, config }) {
        this.config = config
        this.socket = socket
        this.messages = new Array();
        this.lock = new Semaphore(1);
    }

    timeout(ms) {
        return new Promise((resolve) => {
            setTimeout(function () { resolve() }, ms);
        })
    }

    addToMessageQueue(data) {
        if (this.messages.length >= 10) {
            throw "Queue is Full"
        } else {
            this.messages.push(data)
        }
    }

    async enqueue(msg) {

        let formatedData
        try {
            formatedData = parseData(msg);
        } catch (e) {
            //TODO message with error
            systemout("Error", e)
            return
        }
        try {
            this.addToMessageQueue(formatedData);
            await this.timeout(this.config.tempo * 1000)
            
            this.dequeue();
        
        } catch (e) {
            systemout("Error", e)
            //TODO sei la o que fazer quando a fila está cheia? retorna erro?
            console.log(e)
        } 
    }

    _syncDequeue() {
        this.lock.acquire();
        // Shift faz o trabalho de deque no caso
        let msg = this.messages.shift();

        this.lock.release();
        return msg;
    }

    async dequeue() {
        const msg = this._syncDequeue();

    }


}