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
                { amount: 1000.00, description: "Job", type: "inflow", timestamp: Date.now() - (90 * 24 * 60 * 60 * 1000) }, // subtrai 90 dia ao timestamp atual
                { amount: 30.25, description: "Almoço fora", type: "outflow", timestamp: Date.now() - (80 * 24 * 60 * 60 * 1000)  }, // subtrai 80 dias ao timestamp...
                { amount: 40.56, description: "Barzinho", type: "outflow", timestamp: Date.now() - (70 * 24 * 60 * 60 * 1000) },
                { amount: 20.60, description: "Café da manhã", type: "outflow", timestamp: Date.now() - (60 * 24 * 60 * 60 * 1000) },
                { amount: 100.00, description: "Job Freelancer", type: "inflow", timestamp: Date.now() - (50 * 24 * 60 * 60 * 1000) },
                { amount: 50.85, description: "Cervejinha de sexta", type: "outflow", timestamp: Date.now() - (40 * 24 * 60 * 60 * 1000)  },
                { amount: 150.00, description: "Job Freelancer", type: "inflow", timestamp: Date.now() - (30 * 24 * 60 * 60 * 1000) },
                { amount: 500.00, description: "Compra Speaker Bluetooth", type: "outflow", timestamp: Date.now() - (20 * 24 * 60 * 60 * 1000) },
                { amount: 600.00, description: "Compra do mês", type: "outflow", timestamp: Date.now() - (10 * 24 * 60 * 60 * 1000) },
                { amount: 1000.00, description: "Job", type: "inflow", timestamp: Date.now() - (5 * 24 * 60 * 60 * 1000) },
                { amount: 40.00, description: "Almoço", type: "outflow", timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000) },
            ]);
        });

        db.open();
    }

    getAll() {
        return db.transactions.toArray();
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

    getLastestDays(timestamp) {
        return db.transactions
        .where('timestamp')
        .aboveOrEqual(timestamp)        
        .reverse()
        .toArray();
    }    
}