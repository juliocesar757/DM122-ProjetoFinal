const latestLimit = 10;
const locale = 'pt-BR';
const currency = 'BRL';

export default class HtmlService {
    constructor(ufoService) {
        this.ufoService = ufoService;
        this.bindFormEvent();
        this.listTransactions();
    }

    bindFormEvent() {
        const form = document.querySelector('form');
        form.addEventListener('submit', event => {
            event.preventDefault();
            this.addTransaction(form.amount.value, form.description.value, form.type.value);
            form.reset();
            form.amount.focus();
        })
    }

    async addTransaction(amount, description, type) {
        const transaction = { amount, description, type, timestamp: Date.now() };
        const transactionId = await this.ufoService.save(transaction);
        transaction.id = transactionId;
        this.addToHtmlList(transaction);
    }

    async listTransactions () {
        const transactions = await this.ufoService.getLastest(latestLimit);
        transactions.forEach(transaction => this.addToHtmlList(transaction));
    }

    async deleteTransaction(li, transactionId) {
        await this.ufoService.delete(transactionId);
        li.remove();
    }

    async saveTransaction(transactionId) {
        const transaction = await this.ufoService.get(transactionId);
        await this.ufoService.save(transaction);
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
            tdAmount.textContent = '- ' + amount;
        } else {
            tdAmount.textContent = amount;
        }

        const button = document.createElement('button');
        button.innerHTML = '<span class="material-icons">delete</span>';
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            this.deleteTransaction(tr, transaction.id);
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