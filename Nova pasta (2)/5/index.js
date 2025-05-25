// Variável global para armazenar a linha arrastada
let draggedRow = null;

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

        // Atualizar os checkboxes de acordo com o número de meses
        updateCheckboxes(row, months);
    } else {
        cells[7].getElementsByTagName('input')[0].value = '';
        cells[8].getElementsByTagName('input')[0].value = '';
    }

    updateTotals();
}

function updateCheckboxes(row, months) {
    const checkboxCell = row.getElementsByTagName('td')[9]; // A coluna de checkboxes
    checkboxCell.innerHTML = ''; // Limpa o conteúdo atual

    for (let i = 0; i < months; i++) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkboxCell.appendChild(checkbox);

        // Adicionar um espaço entre os checkboxes
        if (i < months - 1) {
            checkboxCell.appendChild(document.createTextNode(' '));
        }
    }
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

// Função para permitir que as linhas sejam arrastáveis
function makeRowsDraggable() {
    const rows = document.querySelectorAll('#loanTable tbody tr');

    rows.forEach(row => {
        row.draggable = true; // Permite que a linha seja arrastada

        row.addEventListener('dragstart', (e) => {
            draggedRow = row; // Armazena a linha sendo arrastada
            e.dataTransfer.effectAllowed = 'move';
        });

        row.addEventListener('dragover', (e) => {
            e.preventDefault(); // Previne o comportamento padrão para permitir o drop
            e.dataTransfer.dropEffect = 'move';
        });

        row.addEventListener('drop', (e) => {
            e.preventDefault(); // Previne o comportamento padrão
            if (draggedRow !== row) {
                const tbody = document.querySelector('#loanTable tbody');
                const allRows = Array.from(tbody.querySelectorAll('tr'));
                const draggedIndex = allRows.indexOf(draggedRow);
                const targetIndex = allRows.indexOf(row);

                // Move a linha arrastada para a posição antes da linha alvo
                if (draggedIndex > targetIndex) {
                    tbody.insertBefore(draggedRow, row); // Coloca antes
                } else {
                    tbody.insertBefore(draggedRow, row.nextSibling); // Coloca depois
                }
            }
        });
    });
}

// Função de adicionar uma nova linha
function addRow() {
    const table = document.getElementById('loanTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    for (let i = 0; i < 10; i++) {
        const newCell = newRow.insertCell(i);

        if (i === 9) { // Coluna de checkbox (Parcela)
            const checkboxContainer = document.createElement('div');
            checkboxContainer.className = 'checkbox-container'; // Adiciona a classe para aplicar o CSS
            newCell.appendChild(checkboxContainer);
        } else {
            const input = document.createElement('input');
            input.type = (i === 1 || i === 3 || i === 7 || i === 8) ? 'number' : 'text';
            if (i === 2 || i === 7 || i === 8) input.step = '0.01';
            if (i === 4 || i === 5) input.type = 'date';
            if (i === 1 || i === 2 || i === 3) input.oninput = function() { calculateInstallment(this); };
            if (i === 7 || i === 8) input.readOnly = true;
            newCell.appendChild(input);
        }
    }

    const actionsCell = newRow.insertCell(10);
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Excluir';
    deleteButton.onclick = function() { deleteRow(this); };
    actionsCell.appendChild(deleteButton);

    // Atualizar as linhas para permitir drag and drop
    makeRowsDraggable();
}

// Função para excluir uma linha
function deleteRow(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    updateTotals();
}

// Chama a função makeRowsDraggable para ativar o drag and drop nas linhas existentes
window.onload = function() {
    loadTable(); // Carrega a tabela salva se houver
    makeRowsDraggable(); // Ativa o drag and drop nas linhas carregadas
};

function saveTable() {
    const table = document.getElementById('loanTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');
    const data = [];
    for (let row of rows) {
        const cells = row.getElementsByTagName('td');
        const rowData = [];
        for (let i = 0; i < cells.length - 1; i++) { // -1 para excluir a célula de ações
            const input = cells[i].getElementsByTagName('input')[0];
            if (input) rowData.push(input.value);
        }

        // Salvar o estado das checkboxes
        const checkboxes = cells[9].getElementsByTagName('input');
        let checkboxStates = [];
        for (let checkbox of checkboxes) {
            checkboxStates.push(checkbox.checked);
        }
        rowData.push(checkboxStates); // Adicionar os estados dos checkboxes à linha de dados

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
            for (let i = 0; i < rowData.length - 1; i++) { // -1 para excluir o estado dos checkboxes
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

            // Carregar o estado dos checkboxes
            const checkboxCell = newRow.insertCell(9);
            const checkboxStates = rowData[rowData.length - 1];
            for (let i = 0; i < checkboxStates.length; i++) {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = checkboxStates[i];
                checkboxCell.appendChild(checkbox);
                // Adicionar um espaço entre os checkboxes
                if (i < checkboxStates.length - 1) {
                    checkboxCell.appendChild(document.createTextNode(' '));
                }
            }

            const actionsCell = newRow.insertCell(10);
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Excluir';
            deleteButton.onclick = function() { deleteRow(this); };
            actionsCell.appendChild(deleteButton);
        }
        updateTotals();
    }
}
