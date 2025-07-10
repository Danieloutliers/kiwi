/**
 * LoanBuddy - Módulo de Formulários
 * Responsável por gerenciar a validação e envio de formulários
 */

// Namespace para funções de formulários
const Forms = {
  // Inicializar validações de formulários
  init() {
    console.log('Inicializando validações de formulários...');
    
    // Configurar validadores para cada formulário
    this.setupLoanForm();
    this.setupBorrowerForm();
    this.setupPaymentForm();
  },
  
  // Configurar validação do formulário de empréstimo
  setupLoanForm() {
    const form = document.getElementById('loan-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Validar formulário
      if (this.validateLoanForm()) {
        // Obter dados do formulário
        const formData = this.getLoanFormData();
        
        // Adicionar empréstimo
        DataStore.addLoan(formData);
        
        // Fechar modal
        closeAllModals();
        
        // Atualizar UI
        UI.updateLoansTableUI();
        UI.updateDashboardUI();
        Charts.updateCharts();
        
        // Mostrar notificação
        showToast('Empréstimo adicionado com sucesso!', 'success');
      }
    });
    
    // Atualizar valores ao mudar o valor do empréstimo ou prazo
    const amountInput = document.getElementById('loan-amount');
    const termInput = document.getElementById('loan-term');
    const interestInput = document.getElementById('loan-interest');
    
    const updatePaymentCalculation = () => {
      // ... Lógica para atualizar cálculos em tempo real (opcional)
    };
    
    if (amountInput) amountInput.addEventListener('input', updatePaymentCalculation);
    if (termInput) termInput.addEventListener('input', updatePaymentCalculation);
    if (interestInput) interestInput.addEventListener('input', updatePaymentCalculation);
  },
  
  // Validar formulário de empréstimo
  validateLoanForm() {
    // Obter elementos do formulário
    const borrowerSelect = document.getElementById('loan-borrower');
    const amountInput = document.getElementById('loan-amount');
    const interestInput = document.getElementById('loan-interest');
    const termInput = document.getElementById('loan-term');
    const paymentFrequencySelect = document.getElementById('loan-payment-frequency');
    const startDateInput = document.getElementById('loan-start-date');
    const firstPaymentInput = document.getElementById('loan-first-payment');
    
    // Validar campos obrigatórios
    if (!borrowerSelect.value) {
      showToast('Selecione um mutuário', 'error');
      borrowerSelect.focus();
      return false;
    }
    
    if (!amountInput.value || amountInput.value <= 0) {
      showToast('Informe um valor válido para o empréstimo', 'error');
      amountInput.focus();
      return false;
    }
    
    if (!interestInput.value || interestInput.value < 0) {
      showToast('Informe uma taxa de juros válida', 'error');
      interestInput.focus();
      return false;
    }
    
    if (!termInput.value || termInput.value <= 0) {
      showToast('Informe um prazo válido', 'error');
      termInput.focus();
      return false;
    }
    
    if (!paymentFrequencySelect.value) {
      showToast('Selecione uma frequência de pagamento', 'error');
      paymentFrequencySelect.focus();
      return false;
    }
    
    if (!startDateInput.value) {
      showToast('Informe a data de início do empréstimo', 'error');
      startDateInput.focus();
      return false;
    }
    
    if (!firstPaymentInput.value) {
      showToast('Informe a data do primeiro pagamento', 'error');
      firstPaymentInput.focus();
      return false;
    }
    
    // Validar data de primeiro pagamento maior que a data de início
    const startDate = new Date(startDateInput.value);
    const firstPaymentDate = new Date(firstPaymentInput.value);
    
    if (firstPaymentDate < startDate) {
      showToast('A data do primeiro pagamento deve ser igual ou posterior à data de início', 'error');
      firstPaymentInput.focus();
      return false;
    }
    
    return true;
  },
  
  // Obter dados do formulário de empréstimo
  getLoanFormData() {
    return {
      borrowerId: document.getElementById('loan-borrower').value,
      amount: parseFloat(document.getElementById('loan-amount').value),
      interestRate: parseFloat(document.getElementById('loan-interest').value),
      term: parseInt(document.getElementById('loan-term').value),
      paymentFrequency: document.getElementById('loan-payment-frequency').value,
      startDate: document.getElementById('loan-start-date').value,
      dueDate: this.calculateDueDate(
        document.getElementById('loan-start-date').value,
        parseInt(document.getElementById('loan-term').value)
      ),
      nextPaymentDate: document.getElementById('loan-first-payment').value,
      description: document.getElementById('loan-description').value || ''
    };
  },
  
  // Calcular data de vencimento
  calculateDueDate(startDate, termMonths) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + termMonths);
    return date.toISOString();
  },
  
  // Configurar validação do formulário de mutuário
  setupBorrowerForm() {
    const form = document.getElementById('borrower-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Validar formulário
      if (this.validateBorrowerForm()) {
        // Obter dados do formulário
        const formData = this.getBorrowerFormData();
        
        // Adicionar mutuário
        DataStore.addBorrower(formData);
        
        // Fechar modal
        closeAllModals();
        
        // Atualizar UI
        UI.updateBorrowersGridUI();
        
        // Mostrar notificação
        showToast('Mutuário adicionado com sucesso!', 'success');
      }
    });
  },
  
  // Validar formulário de mutuário
  validateBorrowerForm() {
    // Obter elementos do formulário
    const nameInput = document.getElementById('borrower-name');
    
    // Validar campos obrigatórios
    if (!nameInput.value.trim()) {
      showToast('Informe o nome do mutuário', 'error');
      nameInput.focus();
      return false;
    }
    
    return true;
  },
  
  // Obter dados do formulário de mutuário
  getBorrowerFormData() {
    return {
      name: document.getElementById('borrower-name').value.trim(),
      cpf: document.getElementById('borrower-cpf').value || '',
      phone: document.getElementById('borrower-phone').value || '',
      email: document.getElementById('borrower-email').value || '',
      address: document.getElementById('borrower-address').value || '',
      city: document.getElementById('borrower-city').value || '',
      notes: document.getElementById('borrower-notes').value || ''
    };
  },
  
  // Configurar validação do formulário de pagamento
  setupPaymentForm() {
    const form = document.getElementById('payment-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Validar formulário
      if (this.validatePaymentForm()) {
        // Obter dados do formulário
        const formData = this.getPaymentFormData();
        
        // Adicionar pagamento
        DataStore.addPayment(formData);
        
        // Fechar modal
        closeAllModals();
        
        // Atualizar UI
        UI.updatePaymentsTableUI();
        UI.updateDashboardUI();
        Charts.updateCharts();
        
        // Mostrar notificação
        showToast('Pagamento registrado com sucesso!', 'success');
      }
    });
  },
  
  // Validar formulário de pagamento
  validatePaymentForm() {
    // Obter elementos do formulário
    const loanSelect = document.getElementById('payment-loan');
    const amountInput = document.getElementById('payment-amount');
    const dateInput = document.getElementById('payment-date');
    const methodSelect = document.getElementById('payment-method');
    
    // Validar campos obrigatórios
    if (!loanSelect.value) {
      showToast('Selecione um empréstimo', 'error');
      loanSelect.focus();
      return false;
    }
    
    if (!amountInput.value || amountInput.value <= 0) {
      showToast('Informe um valor válido para o pagamento', 'error');
      amountInput.focus();
      return false;
    }
    
    if (!dateInput.value) {
      showToast('Informe a data do pagamento', 'error');
      dateInput.focus();
      return false;
    }
    
    if (!methodSelect.value) {
      showToast('Selecione um método de pagamento', 'error');
      methodSelect.focus();
      return false;
    }
    
    return true;
  },
  
  // Obter dados do formulário de pagamento
  getPaymentFormData() {
    return {
      loanId: document.getElementById('payment-loan').value,
      amount: parseFloat(document.getElementById('payment-amount').value),
      date: document.getElementById('payment-date').value,
      method: document.getElementById('payment-method').value,
      type: document.getElementById('payment-type').value,
      notes: document.getElementById('payment-notes').value || ''
    };
  }
};

// Inicializar formulários quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  Forms.init();
});