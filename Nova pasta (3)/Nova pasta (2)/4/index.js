function calculateInstallment(input) {
    const row = input.parentNode.parentNode;
    const cells = row.getElementsByTagName('td');
    const principal = parseFloat(cells[1].getElementsByTagName('input')[0].value) || 0;
    const rate = parseFloat(cells[2].getElementsByTagName('input')[0].value) / 100 || 0;
    const months = parseInt(cells[3].getElementsByTagName('input')[0].value) || 0;

    if (principal > 0 && rate > 0) {
        const interest = principal * rate;
        cells[8].getElementsByTagName('input')[0].value = interest.toFixed(2);

        if (months > 0) {
            const totalInterest = interest * months;
            const total = principal + totalInterest;
            const installment = total / months;
            cells[7].getElementsByTagName('input')[0].value = installment.toFixed(2);
        } else {
            cells[7].getElementsByTagName('input')[0].value = '';
        }
    } else {
        cells[7].getElementsByTagName('input')[0].value = '';
        cells[8].getElementsByTagName('input')[0].value = '';
    }

    updateTotals();
}

function updateTotals() {
    const rows = document.getElementById('loanTable').getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    let totalInstallment = 0;
    let totalInterest = 0;

    for (let row of rows) {
        const cells = row.getElementsByTagName('td');
        const installment = parseFloat(cells[7].getElementsByTagName('input')[0].value) || 0;
        const interest = parseFloat(cells[8].getElementsByTagName('input')[0].value) || 0;
        totalInstallment += installment;
        totalInterest += interest;
    }

    document.getElementById('totalInstallment').value = totalInstallment.toFixed(2);
    document.getElementById('totalInterest').value = totalInterest.toFixed(2);
}

function addRow() {
    const table = document.getElementById('loanTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    for (let i = 0; i < 9; i++) {
        const newCell = newRow.insertCell(i);
        const input = document.createElement('input');
        input.type = (i === 1 || i === 3 || i === 7 || i === 8) ? 'number' : 'text';
        if (i === 2 || i === 7 || i === 8) input.step = '0.01';
        if (i === 4 || i === 5) input.type = 'date';
        if (i === 1 || i === 2 || i === 3) input.oninput = function() { calculateInstallment(this); };
        if (i === 7 || i === 8) input.readOnly = true;
        newCell.appendChild(input);
    }
    const actionsCell = newRow.insertCell(9);
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Excluir';
    deleteButton.onclick = function() { deleteRow(this); };
    actionsCell.appendChild(deleteButton);
}

function deleteRow(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateTotals();
}

function saveTable() {
    const table = document.getElementById('loanTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    const data = [];
    for (let row of rows) {
        const cells = row.getElementsByTagName('td');
        const rowData = [];
        for (let cell of cells) {
            const input = cell.getElementsByTagName('input')[0];
            if (input) rowData.push(input.value);
        }
        data.push(rowData);
    }
    localStorage.setItem('loanTableData', JSON.stringify(data));
    alert('Tabela salva com sucesso!');
}

function loadTable() {
    const data = JSON.parse(localStorage.getItem('loanTableData'));
    if (data) {
        const table = document.getElementById('loanTable').getElementsByTagName('tbody')[0];
        table.innerHTML = '';
        for (let rowData of data) {
            const newRow = table.insertRow();
            for (let i = 0; i < rowData.length; i++) {
                const newCell = newRow.insertCell(i);
                const input = document.createElement('input');
                input.type = (i === 1 || i === 3 || i === 7 || i === 8) ? 'number' : 'text';
                if (i === 2 || i === 7 || i === 8) input.step = '0.01';
                if (i === 4 || i === 5) input.type = 'date';
                if (i === 1 || i === 2 || i === 3) input.oninput = function() { calculateInstallment(this); };
                if (i === 7 || i === 8) input.readOnly = true;
                input.value = rowData[i];
                newCell.appendChild(input);
            }
            const actionsCell = newRow.insertCell(9);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.onclick = function() { deleteRow(this); };
            actionsCell.appendChild(deleteButton);
        }
        updateTotals();
    }
}

window.onload = loadTable;
