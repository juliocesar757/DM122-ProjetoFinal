import Dexie from 'https://cdn.jsdelivr.net/npm/dexie@3.0.3/dist/dexie.mjs';

let db;

export default class UfoService {
    constructor() {
        this.initializeDB();
    }

    initializeDB() {
        db = new Dexie('ufoDB');

        db.version(1).stores ({
            transactions: '++id, timestamp, type'
        });

        db.on('populate', async () => {
            await db.transactions.bulkPut([
                { amount: 1000.00, description: "Salário", type: "inflow", timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000) }, // adiciona um dia ao timestamp
                { amount: 30.25, description: "Almoço fora", type: "outflow", timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000)  }, // adiciona dois dias ao timestamp...
                { amount: 40.56, description: "Barzinho", type: "outflow", timestamp: Date.now() - (3 * 24 * 60 * 60 * 1000) },
                { amount: 50.85, description: "Cervejinha de sexta", type: "outflow", timestamp: Date.now() - (4 * 24 * 60 * 60 * 1000)  },
                { amount: 100.00, description: "Achei na rua ;)", type: "inflow", timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000) },
                { amount: 500.00, description: "Compra Speaker Bluetooth", type: "outflow", timestamp: Date.now() - (6 * 24 * 60 * 60 * 1000) },
            ]);
        });

        db.open();
    }

    getAll() {
        return db.transactions.toArray();
    }

    getAllByDateDesc() {
        return db.transactions
        .orderBy('timestamp')
        .reverse()
        .toArray();
    }

    getLastest(limit) {
        return db.transactions
        .orderBy('timestamp')
        .reverse()
        .limit(limit)
        .toArray();
    }  

    get(id) {
        return db.transactions.get(id);
    }

    save(task) {
        return db.transactions.put(task);
    }

    delete(id) {
        return db.transactions.delete(id);
    }

    getTotalByType(value) {
        return db.transactions
        .where('type')
        .equals(value)
        .toArray();
    } 
    
    getTotalLastMonth(timestamp) {
        return db.transactions
        .where('timestamp')
        .aboveOrEqual(timestamp)
        .toArray();
    }    
}