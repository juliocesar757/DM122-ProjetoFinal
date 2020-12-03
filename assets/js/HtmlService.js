const latestLimit = 10;
const locale = 'pt-BR';
const currency = 'BRL';

export default class HtmlService {
    constructor(ufoService) {
        this.ufoService = ufoService;
        this.bindFormEvent();
        this.refreshUI();
    }

    bindFormEvent() {
        const form = document.querySelector('form');
        form.addEventListener('submit', event => {
            event.preventDefault();
            this.addTransaction(form);
            form.reset();
            form.amount.focus();
        })
    }

    refreshUI() {
        this.updateList('#latest-transactions');
        this.updateBalance();
        this.updateLastMonthStats();
    }

    updateList(listId) {
        document.querySelector(listId).innerHTML = '';
        this.listTransactions();
    }

    async getTotalByType(value) {
        const transactions = await this.ufoService.getTotalByType(value);

        let total = 0;

        transactions.map( (transaction) => {
            total += parseFloat(transaction.amount);
        });
        
        return total;
    }

    async getTotalLastMonthByType(timestamp) {
        const transactions = await this.ufoService.getTotalLastMonth(timestamp);

        let totalInflow = 0;
        let totalOutflow = 0;

        transactions.map( (transaction) => {
            if(transaction.type == 'inflow') {
                totalInflow += parseFloat(transaction.amount);
            } else {
                totalOutflow += parseFloat(transaction.amount);
            }
        });
        
        return [totalInflow, totalOutflow];
    } 
    
    async updateLastMonthStats() {
        const lastMonthTimestamp = Date.now() - (30 * 24 * 60 * 60 * 1000); // timestamp 30 dias atrás

        const [totalInflow, totalOutflow] = await this.getTotalLastMonthByType(lastMonthTimestamp);

        const total = parseFloat(totalInflow) + parseFloat(totalOutflow);

        const percentInflow = Math.round(100 * parseFloat(totalInflow) / total);
        const percentOutflow = Math.round(100 * parseFloat(totalOutflow) / total);

        document.querySelector('#inflow-bar').textContent = this.formatAmount(totalInflow, locale, currency);
        document.querySelector('#inflow-bar').setAttribute('style', 'width:' + percentInflow + '%');

        document.querySelector('#outflow-bar').textContent = this.formatAmount(totalOutflow, locale, currency);
        document.querySelector('#outflow-bar').setAttribute('style', 'width:' + percentOutflow + '%');
    }

    async updateBalance() {
        const inflow = await this.getTotalByType('inflow');
        const outflow = await this.getTotalByType('outflow');

        let balance = parseFloat(inflow) - parseFloat(outflow);

        let status = (balance < 0) ? 'negative' : 'positive';

        balance = this.formatAmount(balance, locale, currency);

        const element = document.querySelector('#balance');

        if(status == 'negative') {
            element.classList.add("outflow");
        } else {
            element.classList.remove("outflow");
        }

        element.textContent = balance;
    }

    async addTransaction(form) {
        const transaction = {
            amount: form.amount.value,
            description: form.description.value,
            type: form.type.value,
            timestamp: Date.now()
        };

        await this.ufoService.save(transaction);

        this.refreshUI();
    }

    async listTransactions () {
        const transactions = await this.ufoService.getLastest(latestLimit);
        transactions.forEach(transaction => this.addToHtmlList(transaction));
    }

    async deleteTransaction(transactionId) {
        await this.ufoService.delete(transactionId);
        this.refreshUI();
    }

    formatAmount(amount, locale, currency) {
        return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(amount) ;      
    }   

    formatTimestamp(timestamp) {
        let date = new Date(timestamp);
        
        return date.toLocaleString(undefined, {
            day:    'numeric',
            month:  'numeric',
            year:   '2-digit',
            hour:   '2-digit',
            minute: '2-digit',
        });
    }

    addToHtmlList(transaction) {
        const tbody = document.querySelector('#latest-transactions');
        const tr = document.createElement('tr');

        const tdDate = document.createElement('td');
        tdDate.textContent = this.formatTimestamp(transaction.timestamp);
        tdDate.classList.add("mdl-data-table__cell--non-numeric");
 
        const tdDescription = document.createElement('td');
        tdDescription.textContent = transaction.description;
        tdDescription.classList.add("mdl-data-table__cell--non-numeric");        

        const tdAmount = document.createElement('td');
        const amount = this.formatAmount(transaction.amount, locale, currency);

        if(transaction.type == 'outflow') {
            tdAmount.classList.add("outflow");
            tdAmount.textContent = '-' + amount;
        } else {
            tdAmount.textContent = amount;
        }

        const button = document.createElement('button');
        button.innerHTML = '<span class="material-icons">delete</span>';
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            this.deleteTransaction( transaction.id);
        });

        const tdDelete = document.createElement('td');        

        tr.appendChild(tdDate);
        tr.appendChild(tdDescription);
        tr.appendChild(tdAmount);
        tdDelete.appendChild(button);
        tr.appendChild(tdDelete);

        tbody.appendChild(tr);
    }
 }