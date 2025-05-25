/**
 * LoanBuddy - Sistema de Gestão de Empréstimos
 * Aplicação HTML/CSS/JS pura
 */

// Estado Global da Aplicação
const AppState = {
  // Tema atual (light ou dark)
  theme: localStorage.getItem('theme') || 'light',
  
  // Página atual
  currentPage: 'dashboard',
  
  // Estado de conexão
  isOnline: navigator.onLine,
  
  // Estado de sincronização
  isSyncing: false,
  
  // Estado do menu mobile
  isMobileMenuOpen: false,
  
  // Detectar se é dispositivo móvel
  isMobile: window.innerWidth <= 767,
  
  // Referência para o popup de histórico de pagamentos ativo
  activePaymentHistoryPopup: null,
  
  // Paginação
  pagination: {
    loans: {
      currentPage: 1,
      totalItems: 0
    }
  },
  
  // Filtros
  filters: {
    loans: {
      status: 'all',
      sort: 'date-desc',
      search: ''
    },
    borrowers: {
      sort: 'name-asc',
      search: ''
    },
    payments: {
      period: 'all',
      sort: 'date-desc',
      search: ''
    }
  },
  
  // Configurações
  settings: {
    currency: 'BRL',
    dateFormat: 'DD/MM/YYYY',
    defaultInterestRate: 5,
    defaultPaymentPeriod: 'monthly',
    defaultGraceDays: 30,
    enableNotifications: true,
    paymentReminderDays: 3,
    notifyLatePayments: true,
    autoBackup: true
  }
};

// Inicializar a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', initApp);

// Função de inicialização principal
function initApp() {
  console.log('Inicializando LoanBuddy...');
  
  // Aplicar tema salvo
  applyTheme();
  
  // Inicializar listeners de eventos
  setupEventListeners();
  
  // Inicializar componentes da UI
  UI.initializeUI();
  
  // Carregar dados
  loadData();
  
  // Inicializar gráficos
  Charts.initializeCharts();
  
  // Verificar estado de conexão
  updateConnectionStatus();
  
  console.log('LoanBuddy inicializado com sucesso!');
}

// Configurar listeners de eventos
function setupEventListeners() {
  // Navegação sidebar
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', handleNavigation);
  });
  
  // Navegação mobile
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', handleNavigation);
  });
  
  // Toggle menu mobile
  document.querySelector('.mobile-toggle').addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('active');
  });
  
  // Toggle tema
  document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
  
  // Links "Ver todos"
  document.querySelectorAll('.view-all').forEach(link => {
    link.addEventListener('click', handleNavigation);
  });
  
  // Ações rápidas
  document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', handleQuickAction);
  });
  
  // Botões de novo empréstimo
  document.getElementById('new-loan-btn')?.addEventListener('click', showLoanForm);
  document.getElementById('empty-add-loan-btn')?.addEventListener('click', showLoanForm);
  document.getElementById('close-loan-form')?.addEventListener('click', hideLoanForm);
  document.getElementById('cancel-loan-btn')?.addEventListener('click', hideLoanForm);
  
  // Botões de novo mutuário
  document.getElementById('new-borrower-btn')?.addEventListener('click', () => {
    showModal('borrower-modal');
  });
  
  // Botões de novo pagamento
  document.getElementById('new-payment-btn')?.addEventListener('click', () => {
    showModal('payment-modal');
  });
  
  // Toggle para mostrar/ocultar empréstimos arquivados
  document.getElementById('toggle-archived-btn')?.addEventListener('click', toggleArchivedLoans);
  document.getElementById('toggle-archived-link')?.addEventListener('click', function(e) {
    e.preventDefault();
    toggleArchivedLoans();
  });
  
  // Voltar de empréstimos arquivados para empréstimos
  document.getElementById('back-to-loans-btn')?.addEventListener('click', () => {
    changePage('loans');
  });
  
  // Botões para filtrar empréstimos
  document.getElementById('apply-filters-btn')?.addEventListener('click', applyLoanFilters);
  document.getElementById('clear-filters-btn')?.addEventListener('click', clearLoanFilters);
  
  // Histórico de pagamentos e ações de empréstimo
  document.querySelectorAll('.payment-history').forEach(btn => {
    btn.addEventListener('click', showPaymentHistory);
  });
  
  document.querySelectorAll('.add-payment').forEach(btn => {
    btn.addEventListener('click', prepareAddPayment);
  });
  
  document.querySelectorAll('.archive-loan').forEach(btn => {
    btn.addEventListener('click', handleArchiveLoan);
  });
  
  // Botões para fechar modais
  document.querySelectorAll('.close-modal, .cancel-modal').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });
  
  // Formulários de modais
  document.getElementById('loan-form')?.addEventListener('submit', handleLoanForm);
  document.getElementById('borrower-form')?.addEventListener('submit', handleBorrowerForm);
  document.getElementById('payment-form')?.addEventListener('submit', handlePaymentForm);
  
  // Filtros
  document.getElementById('status-filter')?.addEventListener('change', applyLoanFilters);
  document.getElementById('sort-filter')?.addEventListener('change', applyLoanFilters);
  document.getElementById('borrower-sort-filter')?.addEventListener('change', applyBorrowerFilters);
  document.getElementById('period-filter')?.addEventListener('change', applyPaymentFilters);
  document.getElementById('payment-sort-filter')?.addEventListener('change', applyPaymentFilters);
  
  // Pesquisa
  document.querySelectorAll('.search-box input').forEach(input => {
    input.addEventListener('input', handleSearch);
  });
  
  // Toggle More Menu (mobile)
  document.querySelector('.nav-item[data-page="more"]')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('.more-menu').classList.add('active');
  });
  
  document.querySelector('.close-more-menu')?.addEventListener('click', () => {
    document.querySelector('.more-menu').classList.remove('active');
  });
  
  document.querySelector('.more-menu-backdrop')?.addEventListener('click', () => {
    document.querySelector('.more-menu').classList.remove('active');
  });
  
  // Eventos de conexão
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  // Eventos de configurações
  document.getElementById('theme-select')?.addEventListener('change', handleThemeChange);
  document.getElementById('default-interest-rate')?.addEventListener('change', saveSettings);
  document.getElementById('default-payment-period')?.addEventListener('change', saveSettings);
  document.getElementById('default-grace-days')?.addEventListener('change', saveSettings);
  document.getElementById('notifications-toggle')?.addEventListener('change', saveSettings);
  document.getElementById('payment-reminder-days')?.addEventListener('change', saveSettings);
  document.getElementById('late-payment-toggle')?.addEventListener('change', saveSettings);
  document.getElementById('auto-backup-toggle')?.addEventListener('change', saveSettings);
  
  // Botões de exportar/importar dados
  document.getElementById('export-data-btn')?.addEventListener('click', exportData);
  document.getElementById('import-data-btn')?.addEventListener('click', importData);
  document.getElementById('clear-data-btn')?.addEventListener('click', clearAllData);
}

// Funções de navegação
function handleNavigation(e) {
  e.preventDefault();
  
  // Obter a página de destino
  let targetPage = this.dataset.page;
  
  // Se o target não existir, tentar obter do elemento pai
  if (!targetPage && this.parentElement) {
    targetPage = this.parentElement.dataset.page;
  }
  
  // Se ainda não existir, tentar obter do atributo href
  if (!targetPage && this.hasAttribute('href')) {
    targetPage = this.getAttribute('href').replace('#', '');
  }
  
  // Se ainda não existir, não fazer nada
  if (!targetPage) return;
  
  // Remover active de todos os links
  document.querySelectorAll('.sidebar-link, .nav-item').forEach(link => {
    link.classList.remove('active');
  });
  
  // Adicionar active ao link clicado
  this.classList.add('active');
  
  // Mudar para a página
  changePage(targetPage);
  
  // Se estiver em mobile, fechar sidebar
  document.querySelector('.sidebar')?.classList.remove('active');
  
  // Fechar o menu "more" se estiver aberto
  document.querySelector('.more-menu')?.classList.remove('active');
}

function changePage(page) {
  // Não fazer nada se já estiver na mesma página
  if (AppState.currentPage === page) return;
  
  console.log(`Mudando para a página: ${page}`);
  
  // Atualizar estado
  AppState.currentPage = page;
  
  // Atualizar classes active nas links
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === page);
  });
  
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === page);
  });
  
  // Ocultar todas as páginas
  document.querySelectorAll('.page').forEach(pageEl => {
    pageEl.classList.remove('active');
  });
  
  // Mostrar a página desejada
  const targetPage = document.getElementById(`${page}-page`);
  if (targetPage) {
    targetPage.classList.add('active');
  }
  
  // Atualizar título da página
  updatePageTitle(page);
  
  // Carregar dados específicos da página
  if (page === 'archived-loans') {
    loadArchivedLoans();
  } else if (page === 'loans') {
    loadLoansData();
  } else if (page === 'reports') {
    // Inicializar módulo de relatórios
    if (typeof Reports !== 'undefined') {
      Reports.init();
    }
  }
  
  // Atualizar URL (para suporte de histórico, opcional)
  window.history.pushState({ page }, '', `#${page}`);
}

function updatePageTitle(page) {
  let title = 'Dashboard';
  
  switch (page) {
    case 'loans': title = 'Empréstimos'; break;
    case 'archived-loans': title = 'Empréstimos Arquivados'; break;
    case 'borrowers': title = 'Mutuários'; break;
    case 'payments': title = 'Pagamentos'; break;
    case 'reports': title = 'Relatórios'; break;
    case 'settings': title = 'Configurações'; break;
    default: title = 'Dashboard';
  }
  
  document.querySelector('.page-title').textContent = title;
}

// Funções de tema
function applyTheme() {
  const theme = AppState.theme;
  document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  
  // Atualizar ícone do botão de tema
  const themeToggle = document.querySelector('.theme-toggle i');
  if (themeToggle) {
    themeToggle.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }
  
  // Atualizar select nas configurações
  const themeSelect = document.getElementById('theme-select');
  if (themeSelect) {
    themeSelect.value = theme;
  }
  
  // Atualizar tema dos gráficos nos relatórios
  if (typeof Reports !== 'undefined' && Reports.updateChartsTheme) {
    Reports.updateChartsTheme(theme);
  }
  
  // Atualizar tema dos gráficos no dashboard
  if (typeof Charts !== 'undefined' && Charts.updateChartsTheme) {
    Charts.updateChartsTheme(theme);
  }
  
  console.log(`Tema aplicado: ${theme}`);
}

function toggleTheme() {
  AppState.theme = AppState.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', AppState.theme);
  applyTheme();
}

// Funções de paginação
function updateLoanPagination(totalItems) {
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  // Atualizar total de itens
  AppState.pagination.loans.totalItems = totalItems;
  
  const currentPageElement = document.getElementById('current-page');
  const totalPagesElement = document.getElementById('total-pages');
  const prevButton = document.getElementById('prev-page');
  const nextButton = document.getElementById('next-page');
  
  if (!currentPageElement || !totalPagesElement || !prevButton || !nextButton) {
    return;
  }
  
  // Obter página atual do estado da aplicação ou definir como 1
  const currentPage = AppState.pagination.loans.currentPage || 1;
  
  // Atualizar elementos de paginação
  currentPageElement.textContent = currentPage;
  totalPagesElement.textContent = totalPages;
  
  // Habilitar/desabilitar botões de navegação
  prevButton.disabled = currentPage <= 1;
  nextButton.disabled = currentPage >= totalPages;
  
  // Adicionar event listeners aos botões
  prevButton.removeEventListener('click', goToPrevPage);
  prevButton.addEventListener('click', goToPrevPage);
  
  nextButton.removeEventListener('click', goToNextPage);
  nextButton.addEventListener('click', goToNextPage);
}

function goToPrevPage() {
  if (AppState.pagination.loans.currentPage > 1) {
    AppState.pagination.loans.currentPage--;
    loadLoansData();
  }
}

function goToNextPage() {
  const totalItems = AppState.pagination.loans.totalItems || 0;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (AppState.pagination.loans.currentPage < totalPages) {
    AppState.pagination.loans.currentPage++;
    loadLoansData();
  }
}

function handleThemeChange(e) {
  const selectedTheme = e.target.value;
  AppState.theme = selectedTheme;
  localStorage.setItem('theme', selectedTheme);
  applyTheme();
}

// Funções para controle de modais
function showModal(modalId) {
  console.log(`Abrindo modal: ${modalId}`);
  
  // Fechar todos os modais primeiro
  closeAllModals();
  
  // Mostrar o modal desejado
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    
    // Definir valores padrão nos formulários
    if (modalId === 'loan-modal') {
      setDefaultLoanFormValues();
    } else if (modalId === 'payment-modal') {
      setDefaultPaymentFormValues();
    }
  }
}

function closeAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('active');
  });
}

// Funções para manipulação de formulários
function setDefaultLoanFormValues() {
  const today = new Date();
  const startDateInput = document.getElementById('loan-start-date');
  const firstPaymentInput = document.getElementById('loan-first-payment');
  
  if (startDateInput) {
    startDateInput.valueAsDate = today;
  }
  
  if (firstPaymentInput) {
    // Definir data do primeiro pagamento para 30 dias após
    const nextMonth = new Date(today);
    nextMonth.setDate(today.getDate() + 30);
    firstPaymentInput.valueAsDate = nextMonth;
  }
  
  // Definir taxa de juros padrão
  const interestInput = document.getElementById('loan-interest');
  if (interestInput) {
    interestInput.value = AppState.settings.defaultInterestRate;
  }
  
  // Definir frequência de pagamento padrão
  const frequencySelect = document.getElementById('loan-payment-frequency');
  if (frequencySelect) {
    frequencySelect.value = AppState.settings.defaultPaymentPeriod;
  }
}

function setDefaultPaymentFormValues() {
  const today = new Date();
  const paymentDateInput = document.getElementById('payment-date');
  
  if (paymentDateInput) {
    paymentDateInput.valueAsDate = today;
  }
}

function handleLoanForm(e) {
  e.preventDefault();
  
  // Obter dados do formulário
  const form = document.getElementById('loan-form');
  if (!form) return;
  
  // Verificar se estamos editando ou criando um novo empréstimo
  const saveButton = document.getElementById('save-loan-btn');
  const isEditing = saveButton && saveButton.dataset.mode === 'edit';
  const loanId = isEditing ? saveButton.dataset.id : null;
  
  const borrowerId = document.getElementById('loan-borrower').value;
  const amount = parseFloat(document.getElementById('loan-amount').value);
  const interestRate = parseFloat(document.getElementById('loan-interest-rate').value);
  const term = parseInt(document.getElementById('loan-term').value);
  const startDate = document.getElementById('loan-start-date').value;
  const paymentFrequency = document.getElementById('loan-payment-frequency').value;
  const description = document.getElementById('loan-description').value;
  
  // Validar campos obrigatórios
  if (!borrowerId || isNaN(amount) || isNaN(interestRate) || isNaN(term) || !startDate) {
    showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
    return;
  }
  
  // Calcular data de vencimento
  const dueDate = new Date(startDate);
  dueDate.setMonth(dueDate.getMonth() + term);
  
  // Calcular data do próximo pagamento
  let nextPaymentDate = new Date(startDate);
  switch (paymentFrequency) {
    case 'weekly':
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
      break;
    case 'biweekly':
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 14);
      break;
    case 'monthly':
    default:
      nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      break;
  }
  
  // Criar objeto do empréstimo
  const loan = {
    borrowerId,
    amount,
    interestRate,
    term,
    paymentFrequency,
    startDate,
    dueDate: dueDate.toISOString(),
    nextPaymentDate: nextPaymentDate.toISOString(),
    description,
    status: 'active'
  };
  
  console.log(`${isEditing ? 'Atualizando' : 'Salvando'} empréstimo:`, loan);
  
  let success = false;
  
  if (isEditing && loanId) {
    // Atualizar empréstimo existente
    const updatedLoan = DataStore.updateLoan(loanId, loan);
    success = !!updatedLoan;
    
    if (success) {
      showToast('Empréstimo atualizado com sucesso!', 'success');
    } else {
      showToast('Erro ao atualizar empréstimo. Verifique os dados e tente novamente.', 'error');
    }
  } else {
    // Criar novo empréstimo
    const newLoan = DataStore.addLoan(loan);
    success = !!newLoan;
    
    if (success) {
      showToast('Empréstimo criado com sucesso!', 'success');
    } else {
      showToast('Erro ao criar empréstimo. Verifique os dados e tente novamente.', 'error');
    }
  }
  
  if (success) {
    // Fechar o formulário
    hideLoanForm();
    
    // Recarregar dados e atualizar a interface
    loadLoansData();
    UI.updateLoansTableUI();
    UI.updateDashboardUI();
    
    // Resetar o modo do botão para criar novo
    if (saveButton) {
      saveButton.textContent = 'Salvar Empréstimo';
      saveButton.dataset.mode = 'create';
      delete saveButton.dataset.id;
    }
  }
}

function handleBorrowerForm(e) {
  e.preventDefault();
  
  // Aqui você implementaria a lógica para salvar o mutuário
  // Para este exemplo, vamos apenas mostrar uma notificação
  console.log('Formulário de mutuário enviado');
  
  closeAllModals();
  showToast('Mutuário criado com sucesso!', 'success');
  
  // Recarregar dados
  loadData();
}

function handlePaymentForm(e) {
  e.preventDefault();
  
  // Registrar logs para debug
  console.log('Formulário de pagamento enviado');
  
  // Obter o formulário que foi submetido
  const form = e.target;
  if (!form) {
    console.error('Formulário de pagamento não encontrado');
    return;
  }
  
  // Verificar se estamos em um modal de detalhes de empréstimo
  const isInLoanDetails = form.closest('.loan-details-modal');
  let loanId;
  
  // Tentativa 1: Obter loanId do campo hidden no formulário
  const loanIdField = form.querySelector('[name="loan"]');
  if (loanIdField && loanIdField.value) {
    loanId = loanIdField.value;
    console.log(`ID do empréstimo obtido do campo escondido: ${loanId}`);
  } 
  // Tentativa 2: Extrair do ID do formulário (formato "payment-form-{loanId}")
  else if (form.id && form.id.startsWith('payment-form-')) {
    loanId = form.id.replace('payment-form-', '');
    console.log(`ID do empréstimo extraído do ID do formulário: ${loanId}`);
  }
  // Tentativa 3: Extrair do texto no modal (se estiver dentro de um modal de detalhes)
  else if (isInLoanDetails) {
    const loanIdElement = isInLoanDetails.querySelector('p');
    if (loanIdElement) {
      const idMatch = loanIdElement.textContent.match(/ID:\s*([^\s|]+)/);
      if (idMatch && idMatch[1]) {
        loanId = idMatch[1];
        console.log(`ID do empréstimo extraído do texto do modal: ${loanId}`);
      }
    }
  }
  // Tentativa 4: Buscar do select padrão para formulários externos
  else {
    const loanSelect = document.getElementById('payment-loan');
    if (loanSelect) {
      loanId = loanSelect.value;
      console.log(`ID do empréstimo obtido do select: ${loanId}`);
    }
  }
  
  // Obter valores do formulário - vamos buscar por ID específico ou por nome do campo
  let amountInput, dateInput, methodSelect, principalInput, interestInput, notesInput, statusSelect;
  
  // Se temos ID do empréstimo, podemos tentar encontrar campos com IDs específicos
  if (loanId) {
    amountInput = document.getElementById(`payment-amount-${loanId}`) || form.querySelector('[name="amount"]');
    dateInput = document.getElementById(`payment-date-${loanId}`) || form.querySelector('[name="date"]');
    methodSelect = document.getElementById(`payment-method-${loanId}`) || form.querySelector('[name="method"]');
    principalInput = document.getElementById(`payment-principal-${loanId}`) || form.querySelector('[name="principal"]');
    interestInput = document.getElementById(`payment-interest-${loanId}`) || form.querySelector('[name="interest"]');
    notesInput = document.getElementById(`payment-notes-${loanId}`) || form.querySelector('[name="notes"]');
    statusSelect = document.getElementById(`payment-status-${loanId}`) || form.querySelector('[name="status"]');
  } else {
    // Se não temos ID, buscamos pelos nomes dos campos no formulário
    amountInput = form.querySelector('[name="amount"]');
    dateInput = form.querySelector('[name="date"]');
    methodSelect = form.querySelector('[name="method"]');
    principalInput = form.querySelector('[name="principal"]');
    interestInput = form.querySelector('[name="interest"]');
    notesInput = form.querySelector('[name="notes"]');
    statusSelect = form.querySelector('[name="status"]');
  }
  
  // Verificar se os campos principais existem
  if (!amountInput || !dateInput) {
    console.error('Campos obrigatórios do formulário não encontrados', {
      loanId: !!loanId,
      amountInput: !!amountInput,
      dateInput: !!dateInput
    });
    showToast('Erro no formulário. Campos obrigatórios não encontrados.', 'error');
    return;
  }
  
  // Obter valores dos campos
  const amount = amountInput.value ? parseFloat(amountInput.value) : 0;
  const date = dateInput.value;
  const method = methodSelect ? methodSelect.value : 'cash';
  const status = statusSelect ? statusSelect.value : 'completed';
  const notes = notesInput ? notesInput.value : '';
  
  // Obter valores de principal e juros do formulário se existirem
  let principalValue = principalInput && principalInput.value ? parseFloat(principalInput.value) : null;
  let interestValue = interestInput && interestInput.value ? parseFloat(interestInput.value) : null;
  
  console.log(`Processando pagamento: LoanID=${loanId}, Amount=${amount}, Date=${date}, Method=${method}`);
  
  // Validação básica
  if (!loanId) {
    showToast('Por favor, selecione um empréstimo.', 'error');
    return;
  }
  
  if (isNaN(amount) || amount <= 0) {
    showToast('Por favor, insira um valor válido para o pagamento.', 'error');
    return;
  }
  
  if (!date) {
    showToast('Por favor, selecione uma data para o pagamento.', 'error');
    return;
  }
  
  // Buscar informações do empréstimo para calcular a divisão entre principal e juros
  const loan = DataStore.getLoan(loanId);
  if (!loan) {
    showToast('Empréstimo não encontrado. Por favor, tente novamente.', 'error');
    return;
  }
  
  // Calcular o valor de juros (baseado na taxa de juros do empréstimo)
  const loanPrincipal = parseFloat(loan.amount);
  const interestRate = parseFloat(loan.interestRate) / 100; // Converter porcentagem para decimal
  
  // Juros simples: Juros = Principal * Taxa de Juros
  const totalInterest = loanPrincipal * interestRate;
  
  // Valor da parcela sem juros (apenas o principal)
  const principalInstallment = loanPrincipal / loan.term;
  
  // Valor do juros por parcela
  const interestPerInstallment = totalInterest / loan.term;
  
  // Se o usuário já definiu os valores de principal e juros no formulário, usamos esses valores
  let paymentForPrincipal, paymentForInterest;
  
  if (principalValue !== null && interestValue !== null && 
      Math.abs((principalValue + interestValue) - amount) < 0.01) {
    // Usar os valores do formulário se disponíveis e a soma bate com o valor total
    paymentForPrincipal = principalValue;
    paymentForInterest = interestValue;
    console.log('Usando valores de principal e juros definidos pelo usuário:', {
      principal: paymentForPrincipal,
      interest: paymentForInterest
    });
  } else {
    // Calcular a divisão entre principal e juros
    // Se o pagamento é pelo menos igual ao juros por parcela, então pague o juros primeiro
    // e o restante vai para o principal
    paymentForInterest = Math.min(interestPerInstallment, amount);
    paymentForPrincipal = amount - paymentForInterest;
    console.log('Calculando valores de principal e juros automaticamente:', {
      principal: paymentForPrincipal,
      interest: paymentForInterest
    });
  }
  
  console.log(`Detalhes do cálculo:
    - Valor do empréstimo: ${loanPrincipal}
    - Taxa de juros: ${interestRate * 100}%
    - Juros total: ${totalInterest}
    - Prazo: ${loan.term} parcelas
    - Parcela principal: ${principalInstallment.toFixed(2)}
    - Parcela juros: ${interestPerInstallment.toFixed(2)}
    - Pagamento total: ${amount}
    - Pagamento para juros: ${paymentForInterest.toFixed(2)}
    - Pagamento para principal: ${paymentForPrincipal.toFixed(2)}
  `);
  
  // Criar objeto do pagamento com os valores calculados
  const payment = {
    loanId: loanId.toString(), // Garantir que é string
    amount: amount,
    principal: paymentForPrincipal,
    interest: paymentForInterest,
    date: new Date(date).toISOString(),
    method: method,
    type: 'scheduled',
    notes: notes || ''
  };
  
  console.log('Salvando pagamento:', payment);
  
  try {
    // Salvar o pagamento usando o DataStore
    const newPayment = DataStore.addPayment(payment);
    
    if (newPayment) {
      // Fechar o modal
      closeAllModals();
      
      // Mostrar mensagem de sucesso com detalhes do pagamento
      showToast(`Pagamento de ${amount.toFixed(2)} registrado! (Principal: ${paymentForPrincipal.toFixed(2)}, Juros: ${paymentForInterest.toFixed(2)})`, 'success');
      
      // Recalcular status do empréstimo
      DataStore.updateLoanStatusAfterPayment(loanId);
      
      // Recarregar dados e atualizar interface
      loadData();
      UI.updateDashboardUI();
      
      // Se estiver na página de detalhes do empréstimo, atualizar a exibição
      const loanDetailsContainer = document.querySelector('.loan-details-modal');
      if (loanDetailsContainer) {
        // Atualizar a lista de pagamentos
        showLoanDetails(loanId);
      }
      
      // Limpar o formulário
      form.reset();
      
      return true;
    } else {
      showToast('Erro ao registrar pagamento. Tente novamente.', 'error');
      return false;
    }
  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    showToast('Erro ao registrar pagamento: ' + (error.message || 'Erro desconhecido'), 'error');
    return false;
  }
}

// Funções para ações rápidas
function handleQuickAction(e) {
  const action = this.dataset.action;
  
  switch (action) {
    case 'new-loan':
      showModal('loan-modal');
      break;
    case 'new-borrower':
      showModal('borrower-modal');
      break;
    case 'register-payment':
      showModal('payment-modal');
      break;
    case 'generate-report':
      changePage('reports');
      break;
  }
}

// Funções para filtros
function applyLoanFilters() {
  const statusFilter = document.getElementById('status-filter').value;
  const sortFilter = document.getElementById('sort-filter').value;
  
  AppState.filters.loans.status = statusFilter;
  AppState.filters.loans.sort = sortFilter;
  
  // Aqui você implementaria a lógica para filtrar os empréstimos
  console.log(`Filtros de empréstimos aplicados: status=${statusFilter}, sort=${sortFilter}`);
  
  // Recarregar os dados com os novos filtros
  loadLoansData();
}

function applyBorrowerFilters() {
  const sortFilter = document.getElementById('borrower-sort-filter').value;
  
  AppState.filters.borrowers.sort = sortFilter;
  
  // Aqui você implementaria a lógica para filtrar os mutuários
  console.log(`Filtros de mutuários aplicados: sort=${sortFilter}`);
  
  // Recarregar os dados com os novos filtros
  loadBorrowersData();
}

function applyPaymentFilters() {
  const periodFilter = document.getElementById('period-filter').value;
  const sortFilter = document.getElementById('payment-sort-filter').value;
  
  AppState.filters.payments.period = periodFilter;
  AppState.filters.payments.sort = sortFilter;
  
  // Aqui você implementaria a lógica para filtrar os pagamentos
  console.log(`Filtros de pagamentos aplicados: period=${periodFilter}, sort=${sortFilter}`);
  
  // Recarregar os dados com os novos filtros
  loadPaymentsData();
}

function handleSearch(e) {
  const searchQuery = e.target.value.trim();
  const searchContext = e.target.closest('.search-box').parentElement.parentElement.id;
  
  if (searchContext.includes('loans')) {
    AppState.filters.loans.search = searchQuery;
    loadLoansData();
  } else if (searchContext.includes('borrowers')) {
    AppState.filters.borrowers.search = searchQuery;
    loadBorrowersData();
  } else if (searchContext.includes('payments')) {
    AppState.filters.payments.search = searchQuery;
    loadPaymentsData();
  }
}

// Funções para carregar dados
function loadData() {
  // Carregar dados para todas as seções
  loadDashboardData();
  loadLoansData();
  loadBorrowersData();
  loadPaymentsData();
}

function loadDashboardData() {
  console.log('Carregando dados do dashboard...');
  // Implementação real buscaria dados do localStorage ou API
}

function loadLoansData() {
  console.log('Carregando dados de empréstimos...');
  
  // Referências aos elementos da página
  const tableBody = document.getElementById('loans-table-body');
  const noLoansMessage = document.getElementById('no-loans-message');
  const statusFilter = document.getElementById('status-filter');
  const sortFilter = document.getElementById('sort-filter');
  const searchInput = document.getElementById('loan-search');
  const showArchived = document.getElementById('archived-btn-text').textContent.includes('Ocultar');
  
  // Aplicar filtros
  const status = statusFilter ? statusFilter.value : 'all';
  const sort = sortFilter ? sortFilter.value : 'date-desc';
  const search = searchInput ? searchInput.value.toLowerCase() : '';
  
  // Buscar empréstimos do DataStore
  let loans = DataStore.getLoans();
  
  // Aplicar filtro de arquivamento
  if (!showArchived) {
    loans = loans.filter(loan => !loan.archived);
  }
  
  // Aplicar filtro de status
  if (status && status !== 'all') {
    loans = loans.filter(loan => loan.status === status);
  }
  
  // Aplicar filtro de pesquisa
  if (search) {
    loans = loans.filter(loan => {
      const borrower = DataStore.getBorrower(loan.borrowerId);
      const borrowerName = borrower ? borrower.name.toLowerCase() : '';
      
      return (
        loan.id.toString().includes(search) ||
        borrowerName.includes(search) ||
        (loan.description && loan.description.toLowerCase().includes(search))
      );
    });
  }
  
  // Aplicar ordenação
  switch (sort) {
    case 'date-desc':
      loans.sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));
      break;
    case 'date-asc':
      loans.sort((a, b) => new Date(a.createdAt || a.startDate) - new Date(b.createdAt || b.startDate));
      break;
    case 'amount-desc':
      loans.sort((a, b) => (b.amount || 0) - (a.amount || 0));
      break;
    case 'amount-asc':
      loans.sort((a, b) => (a.amount || 0) - (b.amount || 0));
      break;
  }
  
  // Atualizar a tabela
  if (tableBody) {
    if (loans.length === 0) {
      // Mostrar mensagem de nenhum empréstimo
      if (noLoansMessage) {
        noLoansMessage.style.display = 'flex';
      }
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center">Nenhum empréstimo encontrado.</td>
        </tr>
      `;
    } else {
      // Ocultar mensagem de nenhum empréstimo
      if (noLoansMessage) {
        noLoansMessage.style.display = 'none';
      }
      
      // Formatar valores para exibição
      const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      });
      
      const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // Preencher tabela com os empréstimos
      tableBody.innerHTML = loans.map(loan => {
        // Buscar dados do mutuário
        const borrower = DataStore.getBorrower(loan.borrowerId);
        const borrowerName = borrower ? borrower.name : 'Mutuário não encontrado';
        
        // Calcular o valor da parcela
        const loanPrincipalAmount = loan.principal || loan.amount;
        const installmentAmount = (loanPrincipalAmount / (loan.term || 1));
        
        return `
          <tr>
            <td>${loan.id}</td>
            <td>${borrowerName}</td>
            <td>${formatter.format(loan.amount || 0)}</td>
            <td>${loan.interestRate}%</td>
            <td>${loan.term} meses</td>
            <td>${safeDateFormat(loan.dueDate, dateFormatter)}</td>
            <td><span class="status ${loan.status || 'unknown'}">${getStatusText(loan.status)}</span></td>
            <td class="actions">
              <button class="action-icon view-loan" data-id="${loan.id}" title="Ver Detalhes">
                <i class="fas fa-eye"></i>
              </button>
              <button class="action-icon edit-loan" data-id="${loan.id}" title="Editar">
                <i class="fas fa-edit"></i>
              </button>
              <button class="action-icon payment-history" data-id="${loan.id}" title="Histórico de Pagamentos">
                <i class="fas fa-credit-card"></i>
              </button>
              <button class="action-icon add-payment" data-id="${loan.id}" title="Registrar Pagamento">
                <i class="fas fa-hand-holding-usd"></i>
              </button>
              <button class="action-icon archive-loan" data-id="${loan.id}" title="Arquivar" ${loan.status === 'paid' ? '' : 'disabled'}>
                <i class="fas fa-archive"></i>
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }
  
  // Paginação
  updateLoanPagination(loans.length);

  // Configurar event listeners
  setTimeout(() => {
    // Adicionar event listeners para botões de visualização
    document.querySelectorAll('.view-loan').forEach(btn => {
      btn.removeEventListener('click', showLoanDetails);
      btn.addEventListener('click', showLoanDetails);
    });
    
    // Adicionar event listeners para botões de histórico de pagamentos
    document.querySelectorAll('.payment-history').forEach(btn => {
      btn.removeEventListener('click', showPaymentHistory);
      btn.addEventListener('click', showPaymentHistory);
    });
    
    // Adicionar event listeners para botões de arquivamento
    document.querySelectorAll('.archive-loan').forEach(btn => {
      btn.removeEventListener('click', handleArchiveLoan);
      btn.addEventListener('click', handleArchiveLoan);
    });
    
    // Adicionar event listeners para botões de adicionar pagamento
    document.querySelectorAll('.add-payment').forEach(btn => {
      btn.removeEventListener('click', prepareAddPayment);
      btn.addEventListener('click', prepareAddPayment);
    });
    
    // Adicionar event listeners para botões de editar
    document.querySelectorAll('.edit-loan').forEach(btn => {
      btn.removeEventListener('click', editLoan);
      btn.addEventListener('click', editLoan);
    });
    
    // Adicionar event listener para botão de limpar filtros
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    if (clearFiltersBtn) {
      clearFiltersBtn.removeEventListener('click', clearLoanFilters);
      clearFiltersBtn.addEventListener('click', clearLoanFilters);
    }
    
    // Adicionar listeners para os filtros
    if (statusFilter) {
      statusFilter.removeEventListener('change', applyLoanFilters);
      statusFilter.addEventListener('change', applyLoanFilters);
    }
    
    if (sortFilter) {
      sortFilter.removeEventListener('change', applyLoanFilters);
      sortFilter.addEventListener('change', applyLoanFilters);
    }
    
    if (searchInput) {
      searchInput.removeEventListener('input', handleSearch);
      searchInput.addEventListener('input', handleSearch);
    }
  }, 100);
}

function loadBorrowersData() {
  console.log('Carregando dados de mutuários...');
  // Implementação real buscaria dados do localStorage ou API e aplicaria filtros
}

function loadPaymentsData() {
  console.log('Carregando dados de pagamentos...');
  
  // Referências aos elementos da página
  const tableBody = document.getElementById('payments-table-body');
  const noPaymentsMessage = document.getElementById('no-payments-message');
  const periodFilter = document.getElementById('period-filter');
  const sortFilter = document.getElementById('payment-sort-filter');
  const searchInput = document.getElementById('payment-search');
  
  if (!tableBody) {
    console.log('Tabela de pagamentos não encontrada');
    return;
  }
  
  // Aplicar filtros
  const period = periodFilter ? periodFilter.value : 'all';
  const sort = sortFilter ? sortFilter.value : 'date-desc';
  const search = searchInput ? searchInput.value.toLowerCase() : '';
  
  // Buscar pagamentos do DataStore
  let payments = DataStore.getPayments();
  console.log(`Total de pagamentos carregados: ${payments.length}`);
  
  // Aplicar filtro de período
  if (period && period !== 'all') {
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }
    
    payments = payments.filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= startDate;
    });
    
    console.log(`Pagamentos após filtro de período (${period}): ${payments.length}`);
  }
  
  // Aplicar filtro de pesquisa
  if (search) {
    payments = payments.filter(payment => {
      // Buscar o empréstimo associado para pegar dados do mutuário
      const loan = DataStore.getLoan(payment.loanId);
      const borrower = loan ? DataStore.getBorrower(loan.borrowerId) : null;
      const borrowerName = borrower ? borrower.name.toLowerCase() : '';
      
      return (
        payment.id.toString().includes(search) ||
        payment.loanId.toString().includes(search) ||
        borrowerName.includes(search) ||
        (payment.notes && payment.notes.toLowerCase().includes(search))
      );
    });
    
    console.log(`Pagamentos após filtro de pesquisa (${search}): ${payments.length}`);
  }
  
  // Aplicar ordenação
  switch (sort) {
    case 'date-desc':
      payments.sort((a, b) => new Date(b.date) - new Date(a.date));
      break;
    case 'date-asc':
      payments.sort((a, b) => new Date(a.date) - new Date(b.date));
      break;
    case 'amount-desc':
      payments.sort((a, b) => b.amount - a.amount);
      break;
    case 'amount-asc':
      payments.sort((a, b) => a.amount - b.amount);
      break;
  }
  
  // Atualizar a tabela
  if (payments.length === 0) {
    // Mostrar mensagem de nenhum pagamento
    if (noPaymentsMessage) {
      noPaymentsMessage.style.display = 'flex';
    }
    
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center">Nenhum pagamento encontrado.</td>
      </tr>
    `;
  } else {
    // Ocultar mensagem de nenhum pagamento
    if (noPaymentsMessage) {
      noPaymentsMessage.style.display = 'none';
    }
    
    // Formatar valores para exibição
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Preencher tabela com os pagamentos
    tableBody.innerHTML = payments.map(payment => {
      // Buscar dados do empréstimo e mutuário
      const loan = DataStore.getLoan(payment.loanId);
      const borrower = loan ? DataStore.getBorrower(loan.borrowerId) : null;
      
      const borrowerName = borrower ? borrower.name : 'Mutuário não encontrado';
      const loanId = payment.loanId || 'N/A';
      
      return `
        <tr>
          <td>${payment.id}</td>
          <td>${borrowerName}</td>
          <td>${loanId}</td>
          <td>${formatter.format(payment.amount || 0)}</td>
          <td>${safeDateFormat(payment.date, dateFormatter)}</td>
          <td>${getPaymentMethodText(payment.method)}</td>
          <td class="actions">
            <button class="action-icon view-payment" data-id="${payment.id}" title="Ver Detalhes">
              <i class="fas fa-eye"></i>
            </button>
            <button class="action-icon" data-id="${payment.id}" title="Editar">
              <i class="fas fa-edit"></i>
            </button>
            <button class="action-icon" data-id="${payment.id}" title="Recibo">
              <i class="fas fa-file-invoice"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }
  
  // Configurar event listeners
  setTimeout(() => {
    // Adicionar event listeners para botões de visualização
    document.querySelectorAll('.view-payment').forEach(btn => {
      // Implementar função para visualizar detalhes do pagamento
      // btn.addEventListener('click', showPaymentDetails);
    });
    
    // Adicionar listeners para os filtros
    if (periodFilter) {
      periodFilter.removeEventListener('change', applyPaymentFilters);
      periodFilter.addEventListener('change', applyPaymentFilters);
    }
    
    if (sortFilter) {
      sortFilter.removeEventListener('change', applyPaymentFilters);
      sortFilter.addEventListener('change', applyPaymentFilters);
    }
    
    if (searchInput) {
      searchInput.removeEventListener('input', handleSearch);
      searchInput.addEventListener('input', handleSearch);
    }
  }, 100);
}

// Funções para configurações
function saveSettings() {
  // Verificar se é uma mudança na persistência de dados
  const oldAutoBackup = AppState.settings.autoBackup;
  const newAutoBackup = document.getElementById('auto-backup-toggle').checked;
  
  // Salvar todas as configurações do formulário no estado da aplicação
  AppState.settings.defaultInterestRate = parseFloat(document.getElementById('default-interest-rate').value);
  AppState.settings.defaultPaymentPeriod = document.getElementById('default-payment-period').value;
  AppState.settings.defaultGraceDays = parseInt(document.getElementById('default-grace-days').value);
  AppState.settings.enableNotifications = document.getElementById('notifications-toggle').checked;
  AppState.settings.paymentReminderDays = parseInt(document.getElementById('payment-reminder-days').value);
  AppState.settings.notifyLatePayments = document.getElementById('late-payment-toggle').checked;
  AppState.settings.autoBackup = newAutoBackup;
  
  // Salvar no localStorage
  localStorage.setItem('settings', JSON.stringify(AppState.settings));
  
  // Notificar mudança de persistência
  if (oldAutoBackup !== newAutoBackup) {
    if (newAutoBackup) {
      console.log('Persistência de dados ATIVADA - dados serão salvos no navegador');
      showToast('Backup automático ativado! Seus dados serão salvos no navegador.', 'success');
      
      // Salvar dados atuais se persistência foi ativada
      DataStore.saveToStorage('all');
    } else {
      console.log('Persistência de dados DESATIVADA - dados serão mantidos apenas em memória');
      showToast('Backup automático desativado! Dados serão mantidos apenas temporariamente.', 'info');
    }
  }
  
  // Notificar usuário sobre salvamento das configurações
  showToast('Configurações salvas com sucesso!', 'success');
}

// Funções para exportar/importar dados
function exportData() {
  // Implementação real exportaria todos os dados para um arquivo
  console.log('Exportando dados...');
  
  showToast('Dados exportados com sucesso!', 'success');
}

function importData() {
  // Implementação real importaria dados de um arquivo
  console.log('Importando dados...');
  
  showToast('Dados importados com sucesso!', 'success');
}

function clearAllData() {
  // Implementação real limparia todos os dados do localStorage após confirmação
  if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação é irreversível.')) {
    console.log('Limpando todos os dados...');
    
    // Limpar dados do localStorage
    localStorage.removeItem('borrowers');
    localStorage.removeItem('loans');
    localStorage.removeItem('payments');
    
    // Recarregar dados
    loadData();
    
    showToast('Todos os dados foram limpos!', 'info');
  }
}

// Funções para notificações
function showToast(message, type = 'info') {
  // Criar elemento de toast
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Definir ícone com base no tipo
  let icon = 'info-circle';
  let title = 'Informação';
  
  switch (type) {
    case 'success':
      icon = 'check-circle';
      title = 'Sucesso';
      break;
    case 'warning':
      icon = 'exclamation-circle';
      title = 'Alerta';
      break;
    case 'error':
      icon = 'times-circle';
      title = 'Erro';
      break;
  }
  
  // Estrutura do toast
  toast.innerHTML = `
    <div class="toast-icon"><i class="fas fa-${icon}"></i></div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <div class="toast-close"><i class="fas fa-times"></i></div>
  `;
  
  // Adicionar ao container
  const container = document.querySelector('.toast-container');
  container.appendChild(toast);
  
  // Adicionar evento de fechar
  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });
  
  // Auto-remoção após 5 segundos
  setTimeout(() => {
    toast.classList.add('toast-hiding');
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// Funções para status de conexão
function updateConnectionStatus() {
  const isOnline = navigator.onLine;
  AppState.isOnline = isOnline;
  
  const offlineIndicator = document.querySelector('.offline-indicator');
  if (offlineIndicator) {
    offlineIndicator.style.display = isOnline ? 'none' : 'block';
  }
  
  console.log(`Status de conexão: ${isOnline ? 'online' : 'offline'}`);
}

function handleOnline() {
  updateConnectionStatus();
  showToast('Conexão restabelecida!', 'success');
  
  // Implementação real sincronizaria dados pendentes
  syncData();
}

function handleOffline() {
  updateConnectionStatus();
  showToast('Você está offline. Algumas funções podem estar limitadas.', 'warning');
}

// Sincronização de dados
function syncData() {
  if (!AppState.isOnline) {
    console.log('Não é possível sincronizar: offline');
    return;
  }
  
  if (AppState.isSyncing) {
    console.log('Já está sincronizando dados...');
    return;
  }
  
  console.log('Sincronizando dados...');
  AppState.isSyncing = true;
  
  // Atualizar visual do botão de sincronização
  const syncBtn = document.querySelector('.sync-status');
  if (syncBtn) {
    syncBtn.classList.add('syncing');
  }
  
  // Simulação de sincronização
  setTimeout(() => {
    AppState.isSyncing = false;
    
    // Atualizar visual do botão
    if (syncBtn) {
      syncBtn.classList.remove('syncing');
    }
    
    console.log('Sincronização concluída!');
    showToast('Dados sincronizados com sucesso!', 'success');
  }, 2000);
}

// Funções para empréstimos arquivados
function loadArchivedLoans() {
  console.log('Carregando empréstimos arquivados...');
  // Implementação real buscaria empréstimos arquivados e atualizaria a tabela
  
  // Em uma implementação real, você buscaria dados do servidor ou do localStorage
  // e atualizaria a tabela de empréstimos arquivados com os dados reais
  
  // Aqui vamos obter os empréstimos arquivados da DataStore
  const archivedLoans = DataStore.getArchivedLoans();
  const archivedLoansTable = document.getElementById('archived-loans-table');
  
  if (archivedLoansTable) {
    const tbody = archivedLoansTable.querySelector('tbody');
    
    // Se não houver empréstimos arquivados, mostrar estado vazio
    if (!archivedLoans || archivedLoans.length === 0) {
      tbody.innerHTML = `
        <tr class="empty-state">
          <td colspan="8">
            <div class="empty-state-container">
              <i class="fas fa-archive"></i>
              <h3>Não há empréstimos arquivados</h3>
              <p>Empréstimos pagos podem ser arquivados para manter sua lista principal organizada.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      // Se houver empréstimos arquivados, limpar estado vazio e adicionar linhas
      const emptyState = tbody.querySelector('.empty-state');
      if (emptyState) {
        emptyState.style.display = 'none';
      }
      
      // Esta parte seria preenchida com dados reais em uma implementação completa
      // Por enquanto, mantemos a linha de exemplo que já está no HTML
    }
    
    // Adicionar event listeners aos botões da tabela de empréstimos arquivados
    setTimeout(() => {
      // Adicionar event listeners para botões de histórico de pagamentos
      document.querySelectorAll('#archived-loans-table .payment-history').forEach(btn => {
        btn.removeEventListener('click', showPaymentHistory);
        btn.addEventListener('click', showPaymentHistory);
      });
      
      // Adicionar event listeners para botões de restaurar empréstimo
      document.querySelectorAll('#archived-loans-table .restore-loan').forEach(btn => {
        btn.removeEventListener('click', handleRestoreLoan);
        btn.addEventListener('click', handleRestoreLoan);
      });
      
      // Atualizar estilos e comportamentos após carregamento
      console.log('Event listeners para empréstimos arquivados adicionados');
    }, 100);
  }
}
  
function handleArchiveLoan() {
  const loanId = this.dataset.id;
  if (!loanId) return;
  
  console.log(`Arquivando empréstimo ${loanId}...`);
  
  // Arquivar o empréstimo usando o DataStore
  const archivedLoan = DataStore.archiveLoan(loanId);
  
  if (archivedLoan) {
    // Notificar o usuário
    showToast('Empréstimo arquivado com sucesso!', 'success');
    
    // Recarregar os dados
    loadLoansData();
    loadArchivedLoans();
  } else {
    // Notificar o usuário sobre o erro
    showToast('Erro ao arquivar empréstimo. Por favor, tente novamente.', 'error');
  }
}
  
// Funções para histórico de pagamentos
function showPaymentHistory(e) {
  // Obter ID do empréstimo
  const loanId = e.currentTarget.dataset.id;
  if (!loanId) {
    console.error('ID do empréstimo não fornecido para histórico de pagamentos');
    return;
  }
  
  console.log(`Mostrando histórico de pagamentos para o empréstimo ${loanId}...`);
  
  // Buscar dados do empréstimo
  const loan = DataStore.getLoan(loanId);
  if (!loan) {
    showToast('Empréstimo não encontrado.', 'error');
    return;
  }
  
  // Buscar pagamentos associados ao empréstimo
  const payments = DataStore.getPaymentsByLoan(loanId);
  
  // Buscar dados do mutuário
  const borrower = DataStore.getBorrower(loan.borrowerId);
  const borrowerName = borrower ? borrower.name : 'Mutuário não encontrado';
  
  // Criar popup/modal de histórico de pagamentos
  const popupHTML = `
    <div class="modal payment-history-modal active">
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="text-light">Histórico de Pagamentos</h3>
          <button class="close-modal text-light"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <div class="payment-history-header">
            <div class="loan-info">
              <p class="text-light"><strong>Empréstimo #${loan.id}</strong></p>
              <p class="text-light">Mutuário: ${borrowerName}</p>
              <p class="text-light">Valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(loan.amount || 0)}</p>
            </div>
          </div>
          
          <div class="payment-history-table-container">
            ${payments.length > 0 ? `
              <table class="payment-history-table text-light">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Valor</th>
                    <th>Método</th>
                    <th>Status</th>
                    <th>Observações</th>
                  </tr>
                </thead>
                <tbody>
                  ${payments.map(payment => `
                    <tr>
                      <td>${safeDateFormat(payment.paymentDate || payment.date)}</td>
                      <td>${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount || 0)}</td>
                      <td>${payment.paymentMethod ? getPaymentMethodText(payment.paymentMethod) : 'Não especificado'}</td>
                      <td>
                        <span class="status ${payment.status || 'pending'}">
                          ${payment.status === 'completed' ? 'Concluído' : 
                            payment.status === 'pending' ? 'Pendente' : 
                            payment.status === 'failed' ? 'Falhou' : 'Desconhecido'}
                        </span>
                      </td>
                      <td>${payment.notes || '-'}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : `
              <div class="empty-state text-light">
                <i class="fas fa-file-invoice-dollar empty-icon"></i>
                <p>Nenhum pagamento registrado para este empréstimo.</p>
              </div>
            `}
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary close-modal">Fechar</button>
          <button class="btn-primary add-payment" data-id="${loan.id}">Registrar Pagamento</button>
        </div>
      </div>
    </div>
  `;
  
  // Remover modal existente, se houver
  const existingModal = document.querySelector('.payment-history-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Adicionar o popup ao DOM
  document.body.insertAdjacentHTML('beforeend', popupHTML);
  
  // Função para fechar o modal atual
  const closePaymentHistoryModal = () => {
    const modalElement = document.querySelector('.payment-history-modal');
    if (modalElement) {
      modalElement.classList.add('closing');
      setTimeout(() => {
        modalElement.remove();
      }, 150);
    }
  };
  
  // Configurar evento de fechar popup
  document.querySelectorAll('.payment-history-modal .close-modal, .payment-history-modal .modal-overlay').forEach(el => {
    el.addEventListener('click', closePaymentHistoryModal);
  });
  
  // Configurar botão de adicionar pagamento
  document.querySelector('.payment-history-modal .add-payment').addEventListener('click', function() {
    const loanId = this.dataset.id;
    closePaymentHistoryModal();
    setTimeout(() => {
      prepareAddPayment(loanId);
    }, 200);
  });
}

// Função para restaurar empréstimos arquivados
function handleRestoreLoan() {
  const loanId = this.dataset.id;
  if (!loanId) return;
  
  console.log(`Restaurando empréstimo ${loanId}...`);
  
  try {
    // Tentar restaurar o empréstimo
    const restoredLoan = DataStore.restoreLoan(loanId);
    
    if (restoredLoan) {
      // Atualizar a UI
      document.querySelector(`tr[data-loan-id="${loanId}"]`)?.remove();
      
      // Verificar se a tabela está vazia
      const archivedLoansTable = document.getElementById('archived-loans-table');
      const tbody = archivedLoansTable?.querySelector('tbody');
      
      if (tbody && !tbody.querySelector('tr:not(.empty-state)')) {
        tbody.innerHTML = `
          <tr class="empty-state">
            <td colspan="8">
              <div class="empty-state-container">
                <i class="fas fa-archive"></i>
                <h3>Não há empréstimos arquivados</h3>
                <p>Empréstimos pagos podem ser arquivados para manter sua lista principal organizada.</p>
              </div>
            </td>
          </tr>
        `;
      }
      
      // Notificar o usuário
      showToast('Empréstimo restaurado com sucesso!', 'success');
      
      // Recarregar os dados
      loadLoansData();
      loadArchivedLoans();
    } else {
      throw new Error('Falha ao restaurar empréstimo');
    }
  } catch (error) {
    console.error('Erro ao restaurar empréstimo:', error);
    showToast('Erro ao restaurar empréstimo. Por favor, tente novamente.', 'error');
  }
}
  
function prepareAddPayment(e) {
  // Obter o ID do empréstimo a partir do botão clicado ou do parâmetro passado
  let loanId;
  
  if (e && e.currentTarget && e.currentTarget.dataset) {
    // Chamado como um event listener
    loanId = e.currentTarget.dataset.id;
    e.preventDefault(); // Prevenir comportamento padrão
  } else if (e && typeof e === 'string') {
    // Chamado diretamente com um ID
    loanId = e;
  } else if (this && this.dataset && this.dataset.id) {
    // Chamado como método de um botão
    loanId = this.dataset.id;
  }
  
  if (!loanId) {
    console.error('ID do empréstimo não fornecido para prepareAddPayment');
    showToast('Erro ao preparar formulário de pagamento', 'error');
    return;
  }
  
  console.log(`Preparando para adicionar pagamento ao empréstimo ${loanId}...`);
  
  // Buscar dados do empréstimo
  const loan = DataStore.getLoan(loanId);
  if (!loan) {
    console.error(`Empréstimo ${loanId} não encontrado`);
    showToast('Erro ao preparar formulário de pagamento', 'error');
    return;
  }
  
  // Mostrar modal de pagamento
  showModal('payment-modal');
  
  // Limpar opções anteriores e depois preencher o dropdown de seleção de empréstimo
  const loanSelect = document.getElementById('payment-loan');
  if (loanSelect) {
    // Manter apenas a primeira opção (placeholder)
    while (loanSelect.options.length > 1) {
      loanSelect.remove(1);
    }
    
    // Buscar dados do mutuário para exibir nome
    const borrower = DataStore.getBorrower(loan.borrowerId);
    const borrowerName = borrower ? borrower.name : 'Desconhecido';
    
    // Formatar o valor do empréstimo
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    // Criar opção
    const option = document.createElement('option');
    option.value = loanId;
    option.textContent = `${borrowerName} - ${formatter.format(loan.amount || 0)}`;
    
    // Adicionar ao select e selecionar
    loanSelect.appendChild(option);
    loanSelect.value = loanId;
  }
  
  // Pré-preencher data com a data atual
  const dateInput = document.getElementById('payment-date');
  if (dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
  }
  
  // Pré-preencher valor com o valor da parcela
  const amountInput = document.getElementById('payment-amount');
  if (amountInput && loan.amount && loan.term) {
    const installmentAmount = loan.amount / loan.term;
    amountInput.value = installmentAmount.toFixed(2);
  }
}
  
// Função para mostrar detalhes do empréstimo
/**
 * Exibe um modal com os detalhes do empréstimo 
 * Versão completamente reconstruída com tratamento de erros robusto
 */
function showLoanDetails(e) {
  // Obter o ID do empréstimo a partir do botão clicado
  const loanId = e && e.currentTarget ? e.currentTarget.dataset.id : e;
  if (!loanId) {
    console.error('ID do empréstimo não fornecido');
    return;
  }
  
  console.log(`Mostrando detalhes do empréstimo ${loanId}...`);
  
  // Buscar o empréstimo do DataStore
  const loan = DataStore.getLoan(loanId);
  if (!loan) {
    showToast('Empréstimo não encontrado.', 'error');
    return;
  }
  
  console.log('Buscando empréstimo com ID', loanId, '(tipo:', typeof loanId, ')');
  console.log('Total de empréstimos:', DataStore.getLoans().length);
  console.log('Empréstimo encontrado:', loan);
  
  // Buscar pagamentos associados ao empréstimo
  const payments = DataStore.getPaymentsByLoan(loanId);
  console.log(`Buscando pagamentos para o empréstimo ID ${loanId} (tipo: ${typeof loanId})`);
  console.log(`Encontrados ${payments.length} pagamentos para o empréstimo ${loanId}`);
  
  // Buscar dados do mutuário
  const borrower = DataStore.getBorrower(loan.borrowerId);
  const borrowerName = borrower ? borrower.name : 'Mutuário não encontrado';
  
  // Calcular valores importantes
  const valorPrincipal = loan.amount || 0;
  const valorJuros = valorPrincipal * ((loan.interestRate || 0) / 100);
  const valorTotal = valorPrincipal + (valorPrincipal * ((loan.interestRate || 0) / 100) * (loan.term || 1));
  const valorPago = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const saldoRestante = valorTotal - valorPago;
  const percentualPago = valorTotal > 0 ? Math.min(100, Math.round((valorPago / valorTotal) * 100)) : 0;
  
  // Verificar dias em atraso
  const isOverdue = loan.status === 'overdue' || loan.status === 'defaulted';
  const hoje = new Date();
  const vencimento = new Date(loan.dueDate);
  const daysOverdue = isOverdue && vencimento ? Math.max(0, Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24))) : 0;
  
  const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  
  // Criar modal ao estilo React com múltiplas abas
  const modalHTML = `
    <div class="modal loan-details-modal active" style="z-index: 9999;">
      <div class="modal-overlay"></div>
      <div class="modal-container" style="max-width: 900px; width: 90%; max-height: 90vh; overflow-y: auto; background-color: white; border-radius: 8px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);">
        <!-- Cabeçalho estilo React com gradiente e botões de ação -->
        <div class="modal-header" style="background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); color: white; border-radius: 8px 8px 0 0; padding: 20px; position: relative;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div>
              <h3 style="margin: 0; color: white; font-size: 24px; margin-bottom: 5px;">
                Empréstimo para ${borrowerName}
              </h3>
              <p style="margin: 0; opacity: 0.9; font-size: 14px;">
                ID: ${loan.id} | Criado em: ${safeDateFormat(loan.startDate || loan.createdAt)}
              </p>
            </div>
            <div style="display: flex; gap: 8px;">
              <button onclick="editLoan(event)" data-id="${loan.id}" class="button" style="background: rgba(255, 255, 255, 0.2); border: none; display: flex; align-items: center; gap: 6px; color: white;">
                <i class="fas fa-edit"></i> Editar
              </button>
              ${loan.status === 'paid' ? `
                <button onclick="handleArchiveLoan('${loan.id}')" class="button" style="background: rgba(255, 255, 255, 0.2); border: none; display: flex; align-items: center; gap: 6px; color: white;">
                  <i class="fas fa-archive"></i> Arquivar
                </button>
              ` : ''}
              <button onclick="handleDeleteLoan('${loan.id}')" class="button danger" style="background: rgba(220, 38, 38, 0.8); border: none; display: flex; align-items: center; gap: 6px; color: white;">
                <i class="fas fa-trash"></i> Excluir
              </button>
            </div>
          </div>
          <button class="close-modal" style="position: absolute; top: 15px; right: 15px; color: white; background: transparent; border: none; cursor: pointer; font-size: 18px;">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <!-- Cards de informação rápida -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; padding: 20px;">
          <div style="background-color: white; border-radius: 8px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
            <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 5px;">Valor Total</div>
            <div style="font-size: 22px; font-weight: 600; color: var(--text-primary);">${formatter.format(valorPrincipal)}</div>
            <div style="display: flex; align-items: center; margin-top: 5px; color: var(--text-secondary); font-size: 13px;">
              <i class="fas fa-dollar-sign" style="margin-right: 5px;"></i> Principal
            </div>
          </div>
          <div style="background-color: white; border-radius: 8px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
            <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 5px;">Taxa de Juros</div>
            <div style="font-size: 22px; font-weight: 600; color: var(--text-primary);">${loan.interestRate}%</div>
            <div style="display: flex; align-items: center; margin-top: 5px; color: var(--text-secondary); font-size: 13px;">
              <i class="fas fa-percentage" style="margin-right: 5px;"></i> Taxa mensal
            </div>
          </div>
          <div style="background-color: white; border-radius: 8px; padding: 15px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
            <div style="color: var(--text-secondary); font-size: 14px; margin-bottom: 5px;">Status</div>
            <div style="font-size: 18px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
              <span style="
                display: inline-block; 
                padding: 4px 12px; 
                border-radius: 9999px; 
                font-size: 13px; 
                font-weight: 500;
                ${loan.status === 'active' ? 'background-color: #dcfce7; color: #166534;' : 
                  loan.status === 'overdue' ? 'background-color: #fee2e2; color: #b91c1c;' :
                  loan.status === 'paid' ? 'background-color: #dbeafe; color: #1e40af;' :
                  loan.status === 'defaulted' ? 'background-color: #fef3c7; color: #92400e;' :
                  'background-color: #e5e7eb; color: #374151;'}
              ">
                ${getStatusText(loan.status)}
              </span>
              ${isOverdue ? `<span style="font-size: 13px; color: #b91c1c; font-weight: normal;">${daysOverdue} dias em atraso</span>` : ''}
            </div>
            <div style="display: flex; align-items: center; margin-top: 5px; color: var(--text-secondary); font-size: 13px;">
              <i class="fas fa-calendar" style="margin-right: 5px;"></i> Vencimento: ${safeDateFormat(loan.dueDate)}
            </div>
          </div>
        </div>
        
        <!-- Abas estilo React -->
        <div class="loan-details-tabs" style="padding: 0 20px;">
          <div class="tabs-list" style="display: flex; border-bottom: 1px solid #e5e7eb;">
            <button class="tab-trigger active" data-tab="details" style="padding: 12px 20px; font-size: 15px; font-weight: 500; background: none; border: none; border-bottom: 2px solid var(--primary-color); color: var(--primary-color); cursor: pointer;">Detalhes</button>
            <button class="tab-trigger" data-tab="payments" style="padding: 12px 20px; font-size: 15px; font-weight: 500; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-secondary); cursor: pointer;">Pagamentos</button>
            <button class="tab-trigger" data-tab="new-payment" style="padding: 12px 20px; font-size: 15px; font-weight: 500; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-secondary); cursor: pointer;">Registrar Pagamento</button>
          </div>
          
          <!-- Conteúdo da aba Detalhes -->
          <div class="tab-content active" data-tab="details" style="padding: 20px 0;">
            <div style="background: white; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden; margin-bottom: 20px;">
              <div style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                <h4 style="margin: 0; font-size: 18px;">Detalhes do Empréstimo</h4>
              </div>
              <div style="padding: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                  <h5 style="font-size: 16px; margin-top: 0; margin-bottom: 15px;">Informações Gerais</h5>
                  <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
                      <span style="color: var(--text-secondary);">Mutuário</span>
                      <span style="font-weight: 500;">${borrowerName}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
                      <span style="color: var(--text-secondary);">Valor Principal</span>
                      <span style="font-weight: 500;">${formatter.format(valorPrincipal)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
                      <span style="color: var(--text-secondary);">Taxa de Juros</span>
                      <span style="font-weight: 500;">${loan.interestRate}%</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
                      <span style="color: var(--text-secondary);">Data de Emissão</span>
                      <span style="font-weight: 500;">${safeDateFormat(loan.startDate || loan.createdAt)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
                      <span style="color: var(--text-secondary);">Data de Vencimento</span>
                      <span style="font-weight: 500;">${safeDateFormat(loan.dueDate)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
                      <span style="color: var(--text-secondary);">Status</span>
                      <span style="
                        display: inline-block; 
                        padding: 4px 12px; 
                        border-radius: 9999px; 
                        font-size: 12px; 
                        font-weight: 500;
                        ${loan.status === 'active' ? 'background-color: #dcfce7; color: #166534;' : 
                          loan.status === 'overdue' ? 'background-color: #fee2e2; color: #b91c1c;' :
                          loan.status === 'paid' ? 'background-color: #dbeafe; color: #1e40af;' :
                          loan.status === 'defaulted' ? 'background-color: #fef3c7; color: #92400e;' :
                          'background-color: #e5e7eb; color: #374151;'}
                      ">
                        ${getStatusText(loan.status)}
                      </span>
                    </div>
                  </div>
                  
                  ${loan.description ? `
                    <div style="margin-top: 20px; background-color: #f9fafb; padding: 15px; border-radius: 6px;">
                      <h5 style="font-size: 15px; margin-top: 0; margin-bottom: 10px;">Observações</h5>
                      <p style="margin: 0; color: var(--text-primary);">
                        ${loan.description}
                      </p>
                    </div>
                  ` : ''}
                </div>
                
                <div>
                  <h5 style="font-size: 16px; margin-top: 0; margin-bottom: 15px;">Cronograma de Pagamento</h5>
                  <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
                      <span style="color: var(--text-secondary);">Frequência</span>
                      <span style="font-weight: 500;">
                        ${loan.paymentFrequency === 'monthly' ? 'Mensal' : 
                         loan.paymentFrequency === 'biweekly' ? 'Quinzenal' : 
                         loan.paymentFrequency === 'weekly' ? 'Semanal' : 
                         loan.paymentFrequency === 'quarterly' ? 'Trimestral' : 
                         loan.paymentFrequency === 'yearly' ? 'Anual' : 'Personalizado'}
                      </span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
                      <span style="color: var(--text-secondary);">Próximo Pagamento</span>
                      <span style="font-weight: 500;">${safeDateFormat(loan.nextPaymentDate)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
                      <span style="color: var(--text-secondary);">Número de Parcelas</span>
                      <span style="font-weight: 500;">${loan.term || 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
                      <span style="color: var(--text-secondary);">Valor da Parcela</span>
                      <span style="font-weight: 500;">${formatter.format((valorPrincipal + (valorPrincipal * ((loan.interestRate || 0) / 100) * (loan.term || 1))) / (loan.term || 1))}</span>
                    </div>
                  </div>
                  
                  <h5 style="font-size: 16px; margin-top: 25px; margin-bottom: 15px;">Resumo Financeiro</h5>
                  <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
                      <span style="color: var(--text-secondary);">Total Principal</span>
                      <span style="font-weight: 500;">${formatter.format(valorPrincipal)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
                      <span style="color: var(--text-secondary);">Total Juros</span>
                      <span style="font-weight: 500;">${formatter.format(valorTotal - valorPrincipal)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
                      <span style="color: var(--text-secondary);">Total Pago</span>
                      <span style="font-weight: 500;">${formatter.format(valorPago)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding-bottom: 8px;">
                      <span style="color: var(--text-secondary); font-weight: 600;">Saldo Devedor</span>
                      <span style="font-weight: 600;">${formatter.format(saldoRestante)}</span>
                    </div>
                    
                    <!-- Barra de progresso -->
                    <div style="margin-top: 10px;">
                      <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                        <span style="font-size: 13px; color: var(--text-secondary);">Progresso</span>
                        <span style="font-size: 13px; color: var(--text-secondary);">${percentualPago}%</span>
                      </div>
                      <div style="height: 8px; background-color: #e5e7eb; border-radius: 9999px; overflow: hidden;">
                        <div style="height: 100%; width: ${percentualPago}%; background: linear-gradient(90deg, var(--primary-color), var(--secondary-color)); border-radius: 9999px;"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Informações do Mutuário -->
            <div style="background: white; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">
              <div style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                <h4 style="margin: 0; font-size: 18px;">Informações do Mutuário</h4>
              </div>
              <div style="padding: 20px;">
                ${borrower ? `
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
                        <span style="color: var(--text-secondary);">Nome</span>
                        <span style="font-weight: 500;">${borrower.name}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
                        <span style="color: var(--text-secondary);">Email</span>
                        <span style="font-weight: 500;">${borrower.email || 'Não informado'}</span>
                      </div>
                      <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px;">
                        <span style="color: var(--text-secondary);">Telefone</span>
                        <span style="font-weight: 500;">${borrower.phone || 'Não informado'}</span>
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: flex-end;">
                      <a href="#borrowers" onclick="changePage('borrowers')" class="button primary" style="display: inline-flex; align-items: center; gap: 8px;">
                        <i class="fas fa-user"></i> Ver Perfil Completo
                      </a>
                    </div>
                  </div>
                ` : `
                  <div style="text-align: center; padding: 30px;">
                    <p style="margin: 0; color: var(--text-secondary);">Informações do mutuário não disponíveis.</p>
                  </div>
                `}
              </div>
            </div>
          </div>
          
          <!-- Conteúdo da aba Pagamentos -->
          <div class="tab-content" data-tab="payments" style="padding: 20px 0; display: none;">
            <div style="background: white; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">
              <div style="padding: 15px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
                <h4 style="margin: 0; font-size: 18px;">Histórico de Pagamentos</h4>
                <button class="button primary" style="display: flex; align-items: center; gap: 6px;" onclick="showTab('new-payment')">
                  <i class="fas fa-plus"></i> Registrar Pagamento
                </button>
              </div>
              <div style="padding: 20px;">
                ${payments.length > 0 ? `
                  <div class="payments-table" style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                      <thead>
                        <tr style="background-color: #f9fafb; text-align: left;">
                          <th style="padding: 12px 16px; font-weight: 500; color: var(--text-secondary); border-bottom: 1px solid #e5e7eb;">Data</th>
                          <th style="padding: 12px 16px; font-weight: 500; color: var(--text-secondary); border-bottom: 1px solid #e5e7eb;">Valor</th>
                          <th style="padding: 12px 16px; font-weight: 500; color: var(--text-secondary); border-bottom: 1px solid #e5e7eb;">Principal</th>
                          <th style="padding: 12px 16px; font-weight: 500; color: var(--text-secondary); border-bottom: 1px solid #e5e7eb;">Juros</th>
                          <th style="padding: 12px 16px; font-weight: 500; color: var(--text-secondary); border-bottom: 1px solid #e5e7eb;">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${payments.map(payment => {
                          // Obter valores de principal e juros, ou calculá-los se não estiverem definidos
                          const paymentAmount = payment.amount || 0;
                          // Usar os valores específicos se disponíveis, caso contrário faça uma estimativa
                          const paymentPrincipal = payment.principal !== undefined ? payment.principal : (paymentAmount * 0.7); // Estimativa de 70% para principal se não definido
                          const paymentInterest = payment.interest !== undefined ? payment.interest : (paymentAmount * 0.3); // Estimativa de 30% para juros se não definido
                          
                          return `
                            <tr style="border-bottom: 1px solid #e5e7eb;">
                              <td style="padding: 12px 16px;">${safeDateFormat(payment.date || payment.paymentDate)}</td>
                              <td style="padding: 12px 16px;">${formatter.format(paymentAmount)}</td>
                              <td style="padding: 12px 16px;">${formatter.format(paymentPrincipal)}</td>
                              <td style="padding: 12px 16px;">${formatter.format(paymentInterest)}</td>
                              <td style="padding: 12px 16px;">
                                <span style="
                                  display: inline-block; 
                                  padding: 4px 12px; 
                                  border-radius: 9999px; 
                                  font-size: 12px; 
                                  font-weight: 500;
                                  ${payment.status === 'completed' ? 'background-color: #dcfce7; color: #166534;' : 
                                    payment.status === 'pending' ? 'background-color: #fef9c3; color: #854d0e;' : 
                                    payment.status === 'failed' ? 'background-color: #fee2e2; color: #b91c1c;' : 'background-color: #e5e7eb; color: #374151;'}
                                ">
                                  ${payment.status === 'completed' ? 'Concluído' : 
                                    payment.status === 'pending' ? 'Pendente' : 
                                    payment.status === 'failed' ? 'Falhou' : 'Concluído'}
                                </span>
                              </td>
                            </tr>
                          `;
                        }).join('')}
                      </tbody>
                    </table>
                  </div>
                ` : `
                  <div style="text-align: center; padding: 30px; background-color: #f9fafb; border-radius: 6px;">
                    <p style="margin-bottom: 15px; color: var(--text-secondary);">Nenhum pagamento registrado para este empréstimo.</p>
                    <button class="button primary" style="display: inline-flex; align-items: center; gap: 6px;" onclick="showTab('new-payment')">
                      <i class="fas fa-plus"></i> Registrar Novo Pagamento
                    </button>
                  </div>
                `}
              </div>
            </div>
          </div>
          
          <!-- Conteúdo da aba Registrar Pagamento -->
          <div class="tab-content" data-tab="new-payment" style="padding: 20px 0; display: none;">
            <div style="background: white; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden;">
              <div style="padding: 15px; border-bottom: 1px solid #e5e7eb;">
                <h4 style="margin: 0; font-size: 18px;">Registrar Novo Pagamento</h4>
              </div>
              <div style="padding: 20px;">
                <form id="payment-form-${loanId}" class="payment-form" onsubmit="handlePaymentForm(event)">
                  <input type="hidden" name="loan" value="${loanId}">
                  
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div class="form-group">
                      <label for="payment-date-${loanId}" style="display: block; margin-bottom: 6px; font-weight: 500;">Data do Pagamento</label>
                      <input type="date" id="payment-date-${loanId}" name="date" class="form-control" required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                    </div>
                    
                    <div class="form-group">
                      <label for="payment-amount-${loanId}" style="display: block; margin-bottom: 6px; font-weight: 500;">Valor do Pagamento</label>
                      <input type="number" id="payment-amount-${loanId}" name="amount" step="0.01" min="0" class="form-control" required style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                    </div>
                    
                    <div class="form-group">
                      <label for="payment-principal-${loanId}" style="display: block; margin-bottom: 6px; font-weight: 500;">Principal</label>
                      <input type="number" id="payment-principal-${loanId}" name="principal" step="0.01" min="0" class="form-control" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                      <small style="display: block; margin-top: 4px; font-size: 12px; color: var(--text-secondary);">Parte do pagamento que reduz o principal</small>
                    </div>
                    
                    <div class="form-group">
                      <label for="payment-interest-${loanId}" style="display: block; margin-bottom: 6px; font-weight: 500;">Juros</label>
                      <input type="number" id="payment-interest-${loanId}" name="interest" step="0.01" min="0" class="form-control" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                      <small style="display: block; margin-top: 4px; font-size: 12px; color: var(--text-secondary);">Parte do pagamento relativa a juros</small>
                    </div>
                    
                    <div class="form-group">
                      <label for="payment-method-${loanId}" style="display: block; margin-bottom: 6px; font-weight: 500;">Método de Pagamento</label>
                      <select id="payment-method-${loanId}" name="method" class="form-control" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                        <option value="cash">Dinheiro</option>
                        <option value="bank_transfer">Transferência Bancária</option>
                        <option value="credit_card">Cartão de Crédito</option>
                        <option value="debit_card">Cartão de Débito</option>
                        <option value="check">Cheque</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>
                    
                    <div class="form-group">
                      <label for="payment-status-${loanId}" style="display: block; margin-bottom: 6px; font-weight: 500;">Status</label>
                      <select id="payment-status-${loanId}" name="status" class="form-control" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px;">
                        <option value="completed">Concluído</option>
                        <option value="pending">Pendente</option>
                        <option value="failed">Falhou</option>
                      </select>
                    </div>
                  </div>
                  
                  <div class="form-group">
                    <label for="payment-notes-${loanId}" style="display: block; margin-bottom: 6px; font-weight: 500;">Observações</label>
                    <textarea id="payment-notes-${loanId}" name="notes" class="form-control" rows="3" style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; resize: vertical;"></textarea>
                  </div>
                  
                  <div style="margin-top: 20px; display: flex; justify-content: flex-end;">
                    <button type="button" class="button outline" style="margin-right: 10px;" onclick="showTab('details')">Cancelar</button>
                    <button type="submit" class="button primary">Salvar Pagamento</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Remover qualquer modal existente para evitar duplicatas
  const existingModal = document.querySelector('.loan-details-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Inserir o novo modal no DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Adicionar listeners para as abas
  document.querySelectorAll('.loan-details-tabs .tab-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      const tab = e.currentTarget.dataset.tab;
      showTab(tab);
    });
  });
  
  // Adicionar listener para fechar o modal
  const closeButton = document.querySelector('.loan-details-modal .close-modal');
  const modalOverlay = document.querySelector('.loan-details-modal .modal-overlay');
  
  closeButton.addEventListener('click', () => {
    document.querySelector('.loan-details-modal').remove();
  });
  
  modalOverlay.addEventListener('click', () => {
    document.querySelector('.loan-details-modal').remove();
  });
  
  // Preencher o formulário de pagamento com a data atual
  const currentDate = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById(`payment-date-${loanId}`);
  if (dateInput) {
    dateInput.value = currentDate;
  }
  
  // Preencher estimativas de principal e juros quando o valor do pagamento mudar
  const amountInput = document.getElementById(`payment-amount-${loanId}`);
  const principalInput = document.getElementById(`payment-principal-${loanId}`);
  const interestInput = document.getElementById(`payment-interest-${loanId}`);
  
  if (amountInput && principalInput && interestInput) {
    amountInput.addEventListener('input', (e) => {
      const amount = parseFloat(e.target.value || 0);
      const principal = parseFloat(loan.amount || 0);
      const interestRate = parseFloat(loan.interestRate || 0) / 100;
      
      // Calcular o juros mensal (taxa aplicada sobre o principal)
      // Ex: 10% ao mês sobre R$1.000 = R$100 de juros mensais
      const monthlyInterest = principal * interestRate;
      
      // Para o pagamento, priorizar o pagamento de juros
      const interestEstimate = Math.min(monthlyInterest, amount);
      const principalEstimate = amount - interestEstimate;
      
      console.log(`Calculando divisão de pagamento:
        - Valor do empréstimo: ${principal}
        - Taxa de juros: ${interestRate * 100}%
        - Juros mensal: ${monthlyInterest.toFixed(2)}
        - Pagamento: ${amount}
        - Para juros: ${interestEstimate.toFixed(2)}
        - Para principal: ${principalEstimate.toFixed(2)}
      `);
      
      principalInput.value = principalEstimate.toFixed(2);
      interestInput.value = interestEstimate.toFixed(2);
    });
  }
}

// Função para manipular a exclusão de um empréstimo a partir do modal de detalhes
function handleDeleteLoan(loanId) {
  if (!loanId) return;
  
  // Criar um confirm dialog personalizado
  const confirmHTML = `
    <div class="modal confirm-dialog active" style="z-index: 10000;">
      <div class="modal-overlay"></div>
      <div class="modal-container" style="max-width: 450px;">
        <div class="modal-header" style="background: #f9fafb; padding: 20px; border-bottom: 1px solid #e5e7eb;">
          <h3 style="margin: 0; font-size: 18px;">Confirmar Exclusão</h3>
        </div>
        <div class="modal-body" style="padding: 20px;">
          <p style="margin-top: 0;">Esta ação não pode ser desfeita. Isso excluirá permanentemente o empréstimo e todos os pagamentos associados.</p>
        </div>
        <div class="modal-footer" style="padding: 15px 20px; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #e5e7eb;">
          <button class="cancel-button button outline">Cancelar</button>
          <button class="confirm-button button danger">Sim, excluir</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', confirmHTML);
  
  // Adicionar event listeners
  const confirmDialog = document.querySelector('.confirm-dialog');
  const cancelButton = confirmDialog.querySelector('.cancel-button');
  const confirmButton = confirmDialog.querySelector('.confirm-button');
  const modalOverlay = confirmDialog.querySelector('.modal-overlay');
  
  // Fechar o diálogo
  const closeDialog = () => {
    confirmDialog.remove();
  };
  
  cancelButton.addEventListener('click', closeDialog);
  modalOverlay.addEventListener('click', closeDialog);
  
  // Confirmar exclusão
  confirmButton.addEventListener('click', () => {
    // Excluir o empréstimo
    const result = DataStore.deleteLoan(loanId);
    
    if (result) {
      // Atualizar a interface
      loadLoansData();
      UI.updateLoansTableUI();
      UI.updateDashboardUI();
      
      // Exibir mensagem de sucesso
      showToast('Empréstimo excluído com sucesso', 'success');
      
      // Fechar o modal de detalhes
      const detailsModal = document.querySelector('.loan-details-modal');
      if (detailsModal) {
        detailsModal.remove();
      }
    } else {
      showToast('Erro ao excluir empréstimo', 'error');
    }
    
    closeDialog();
  });
}

// Função para arquivar um empréstimo
function handleArchiveLoan(loanId) {
  if (!loanId) return;
  
  // Criar um confirm dialog personalizado
  const confirmHTML = `
    <div class="modal confirm-dialog active" style="z-index: 10000;">
      <div class="modal-overlay"></div>
      <div class="modal-container" style="max-width: 450px;">
        <div class="modal-header" style="background: #f9fafb; padding: 20px; border-bottom: 1px solid #e5e7eb;">
          <h3 style="margin: 0; font-size: 18px;">Arquivar Empréstimo</h3>
        </div>
        <div class="modal-body" style="padding: 20px;">
          <p style="margin-top: 0;">Você está prestes a arquivar este empréstimo. Empréstimos arquivados serão movidos para a seção de "Arquivados" e não aparecerão na lista principal. Esta ação pode ser revertida posteriormente.</p>
        </div>
        <div class="modal-footer" style="padding: 15px 20px; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #e5e7eb;">
          <button class="cancel-button button outline">Cancelar</button>
          <button class="confirm-button button primary">Sim, arquivar</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', confirmHTML);
  
  // Adicionar event listeners
  const confirmDialog = document.querySelector('.confirm-dialog');
  const cancelButton = confirmDialog.querySelector('.cancel-button');
  const confirmButton = confirmDialog.querySelector('.confirm-button');
  const modalOverlay = confirmDialog.querySelector('.modal-overlay');
  
  // Fechar o diálogo
  const closeDialog = () => {
    confirmDialog.remove();
  };
  
  cancelButton.addEventListener('click', closeDialog);
  modalOverlay.addEventListener('click', closeDialog);
  
  // Confirmar arquivamento
  confirmButton.addEventListener('click', () => {
    // Arquivar o empréstimo
    const result = DataStore.archiveLoan(loanId);
    
    if (result) {
      // Atualizar a interface
      loadLoansData();
      UI.updateLoansTableUI();
      UI.updateDashboardUI();
      
      // Exibir mensagem de sucesso
      showToast('Empréstimo arquivado com sucesso', 'success');
      
      // Fechar o modal de detalhes
      const detailsModal = document.querySelector('.loan-details-modal');
      if (detailsModal) {
        detailsModal.remove();
      }
      
      // Mostrar a opção de empréstimos arquivados
      toggleArchivedLoans();
    } else {
      showToast('Erro ao arquivar empréstimo', 'error');
    }
    
    closeDialog();
  });
}

// Função auxiliar para mostrar uma aba específica
function showTab(tabId) {
  // Desativar todas as abas
  document.querySelectorAll('.loan-details-tabs .tab-trigger').forEach(trigger => {
    trigger.classList.remove('active');
    trigger.style.borderBottom = '2px solid transparent';
    trigger.style.color = 'var(--text-secondary)';
  });
  
  document.querySelectorAll('.loan-details-tabs .tab-content').forEach(content => {
    content.classList.remove('active');
    content.style.display = 'none';
  });
  
  // Ativar a aba selecionada
  const selectedTrigger = document.querySelector(`.loan-details-tabs .tab-trigger[data-tab="${tabId}"]`);
  const selectedContent = document.querySelector(`.loan-details-tabs .tab-content[data-tab="${tabId}"]`);
  
  if (selectedTrigger) {
    selectedTrigger.classList.add('active');
    selectedTrigger.style.borderBottom = '2px solid var(--primary-color)';
    selectedTrigger.style.color = 'var(--primary-color)';
  }
  
  if (selectedContent) {
    selectedContent.classList.add('active');
    selectedContent.style.display = 'block';
  }
  
  // Pré-preencher o formulário da aba "new-payment" quando for selecionada
  if (tabId === 'new-payment') {
    // Obter o ID do empréstimo atual
    const loanDetailsModal = document.querySelector('.loan-details-modal');
    if (!loanDetailsModal) return;
    
    // Extrair o ID do texto em algum elemento no modal
    const loanIdElement = loanDetailsModal.querySelector('p');
    if (!loanIdElement) return;
    
    // Tentativa de extrair o ID do texto "ID: 123456 | Criado em: ..."
    const idMatch = loanIdElement.textContent.match(/ID:\s*([^\s|]+)/);
    if (!idMatch || !idMatch[1]) return;
    
    const loanId = idMatch[1];
    const loan = DataStore.getLoan(loanId);
    if (!loan) return;
    
    // Preencher o valor de uma parcela no campo de valor
    const paymentAmountInput = document.getElementById(`payment-amount-${loanId}`);
    if (paymentAmountInput && loan.amount && loan.term) {
      const installmentAmount = loan.amount / loan.term;
      paymentAmountInput.value = installmentAmount.toFixed(2);
    }
    
    // Preencher a data atual no campo de data
    const paymentDateInput = document.getElementById(`payment-date-${loanId}`);
    if (paymentDateInput) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      paymentDateInput.value = `${year}-${month}-${day}`;
    }
  }
}

// Função para converter status em texto legível
function getStatusText(status) {
  switch (status) {
    case 'active': return 'Ativo';
    case 'overdue': return 'Em Atraso';
    case 'paid': return 'Pago';
    case 'defaulted': return 'Inadimplente';
    case 'archived': return 'Arquivado';
    default: return 'Desconhecido';
  }
}

// Função para converter método de pagamento em texto legível
function getPaymentMethodText(method) {
  switch (method) {
    case 'cash': return 'Dinheiro';
    case 'transfer': 
    case 'bank_transfer': return 'Transferência';
    case 'pix': return 'PIX';
    case 'card': return 'Cartão';
    case 'credit_card': return 'Cartão de Crédito';
    case 'debit_card': return 'Cartão de Débito';
    case 'check': return 'Cheque';
    case 'other': return 'Outro';
    default: return method || 'Desconhecido';
  }
}

// Função para limpar filtros
function clearLoanFilters() {
  // Limpar campos de filtro
  const statusFilter = document.getElementById('status-filter');
  const sortFilter = document.getElementById('sort-filter');
  const searchInput = document.getElementById('loan-search');
  
  if (statusFilter) statusFilter.value = 'all';
  if (sortFilter) sortFilter.value = 'date-desc';
  if (searchInput) searchInput.value = '';
  
  // Resetar filtros no estado da aplicação
  AppState.filters.loans = {
    status: 'all',
    sort: 'date-desc',
    search: ''
  };
  
  // Resetar paginação
  AppState.pagination.loans.currentPage = 1;
  
  // Recarregar dados
  loadLoansData();
  
  showToast('Filtros limpos!', 'info');
}

// Função para alternar entre mostrar e ocultar empréstimos arquivados
function toggleArchivedLoans() {
  const btnText = document.getElementById('archived-btn-text');
  const statusMsg = document.getElementById('archived-display-status');
  const toggleLink = document.getElementById('toggle-archived-link');
  
  if (!btnText || !statusMsg || !toggleLink) return;
  
  const isShowingArchived = btnText.textContent.includes('Ocultar');
  
  if (isShowingArchived) {
    btnText.textContent = 'Ver Arquivados';
    statusMsg.textContent = 'não são';
    toggleLink.textContent = 'Ver empréstimos arquivados';
  } else {
    btnText.textContent = 'Ocultar Arquivados';
    statusMsg.textContent = 'são';
    toggleLink.textContent = 'Ocultar empréstimos arquivados';
  }
  
  // Recarregar lista de empréstimos
  loadLoansData();
}

// Funções para gerenciar formulário de empréstimo
function showLoanForm() {
  document.getElementById('loan-form-container').style.display = 'block';
  document.getElementById('loans-filter-card').style.display = 'none';
  document.getElementById('loans-table-card').style.display = 'none';
  document.getElementById('no-loans-message').style.display = 'none';
  
  // Preencher lista de mutuários
  const borrowerSelect = document.getElementById('loan-borrower');
  if (borrowerSelect) {
    // Limpar opções existentes, exceto a primeira (placeholder)
    while (borrowerSelect.options.length > 1) {
      borrowerSelect.remove(1);
    }
    
    // Buscar mutuários do DataStore
    const borrowers = DataStore.getBorrowers();
    
    // Adicionar opções para cada mutuário
    borrowers.forEach(borrower => {
      const option = document.createElement('option');
      option.value = borrower.id;
      option.textContent = borrower.name;
      borrowerSelect.appendChild(option);
    });
  }
  
  // Definir data de início para hoje
  const startDateInput = document.getElementById('loan-start-date');
  if (startDateInput) {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    startDateInput.value = formattedDate;
  }
}

function hideLoanForm() {
  document.getElementById('loan-form-container').style.display = 'none';
  document.getElementById('loans-filter-card').style.display = 'block';
  document.getElementById('loans-table-card').style.display = 'block';
  
  // Verificar se há empréstimos para decidir se mostra a mensagem vazia
  const loans = DataStore.getLoans();
  if (loans.length === 0) {
    document.getElementById('no-loans-message').style.display = 'flex';
  } else {
    document.getElementById('no-loans-message').style.display = 'none';
  }
  
  // Limpar formulário
  document.getElementById('loan-form').reset();
}

// Função para editar empréstimo
function editLoan(e) {
  const loanId = e.currentTarget.dataset.id;
  if (!loanId) return;
  
  console.log(`Editando empréstimo ${loanId}...`);
  
  // Buscar o empréstimo pelo ID
  const loan = DataStore.getLoan(loanId);
  if (!loan) {
    showToast('Empréstimo não encontrado.', 'error');
    return;
  }
  
  // Mostrar formulário de edição
  showLoanForm();
  
  // Preencher campos com os dados do empréstimo
  document.getElementById('loan-borrower').value = loan.borrowerId;
  document.getElementById('loan-amount').value = loan.amount;
  document.getElementById('loan-interest-rate').value = loan.interestRate;
  document.getElementById('loan-term').value = loan.term;
  
  // Formatar data para o formato YYYY-MM-DD para o input date
  let startDate = loan.startDate;
  if (startDate instanceof Date) {
    startDate = startDate.toISOString().split('T')[0];
  } else if (typeof startDate === 'string' && startDate.includes('T')) {
    startDate = startDate.split('T')[0];
  }
  document.getElementById('loan-start-date').value = startDate;
  
  document.getElementById('loan-payment-frequency').value = loan.paymentFrequency || 'monthly';
  document.getElementById('loan-description').value = loan.description || '';
  
  // Modificar o botão de salvar para atualizar o empréstimo em vez de criar um novo
  const saveButton = document.getElementById('save-loan-btn');
  saveButton.textContent = 'Atualizar Empréstimo';
  saveButton.dataset.mode = 'edit';
  saveButton.dataset.id = loanId;
}

// Note: Esta função já foi definida acima com mais opções

// Função auxiliar para formatar datas de forma segura
function safeDateFormat(dateValue, formatter) {
  if (!dateValue) return 'N/A';
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Data inválida';
    
    if (formatter) {
      return formatter.format(date);
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Erro de data';
  }
}

// Funções para Responsividade e Menu Mobile
function toggleMobileMenu() {
  AppState.isMobileMenuOpen = !AppState.isMobileMenuOpen;
  const sidebar = document.querySelector('.sidebar');
  const appContainer = document.querySelector('.app-container');
  
  if (AppState.isMobileMenuOpen) {
    sidebar.classList.add('mobile-open');
    appContainer.classList.add('sidebar-open');
  } else {
    sidebar.classList.remove('mobile-open');
    appContainer.classList.remove('sidebar-open');
  }
}

function closeMobileMenu() {
  if (AppState.isMobileMenuOpen) {
    AppState.isMobileMenuOpen = false;
    const sidebar = document.querySelector('.sidebar');
    const appContainer = document.querySelector('.app-container');
    
    sidebar.classList.remove('mobile-open');
    appContainer.classList.remove('sidebar-open');
  }
}

function handleWindowResize() {
  const newIsMobile = window.innerWidth <= 767;
  
  if (AppState.isMobile !== newIsMobile) {
    AppState.isMobile = newIsMobile;
    
    // Fechar menu mobile se mudou para desktop
    if (!newIsMobile && AppState.isMobileMenuOpen) {
      closeMobileMenu();
    }
  }
}

function handleMobileNavigation(e) {
  e.preventDefault();
  const page = e.currentTarget.getAttribute('data-page');
  if (page) {
    changePage(page);
    // Fechar menu mobile após navegação
    if (AppState.isMobile) {
      closeMobileMenu();
    }
  }
}

// Melhorar navegação para fechar menu mobile
function enhanceNavigation() {
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.addEventListener('click', (e) => {
      // Fechar menu mobile após clicar em um link
      if (AppState.isMobile) {
        setTimeout(() => {
          closeMobileMenu();
        }, 100);
      }
    });
  });
}

// Adicionar suporte para swipe em dispositivos móveis
function addSwipeSupport() {
  let startX = 0;
  let endX = 0;
  
  document.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });
  
  document.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    handleSwipe();
  });
  
  function handleSwipe() {
    const swipeThreshold = 100;
    const swipeDistance = endX - startX;
    
    // Swipe da esquerda para a direita (abrir menu)
    if (swipeDistance > swipeThreshold && startX < 50 && !AppState.isMobileMenuOpen) {
      toggleMobileMenu();
    }
    
    // Swipe da direita para a esquerda (fechar menu)
    if (swipeDistance < -swipeThreshold && AppState.isMobileMenuOpen) {
      closeMobileMenu();
    }
  }
}

// Funções para histórico do navegador
window.addEventListener('popstate', (e) => {
  if (e.state && e.state.page) {
    changePage(e.state.page);
  }
});

// Inicializar recursos de responsividade
document.addEventListener('DOMContentLoaded', () => {
  // Adicionar event listeners para responsividade
  const mobileToggle = document.querySelector('.mobile-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', toggleMobileMenu);
  }
  
  // Event listener para redimensionamento
  window.addEventListener('resize', handleWindowResize);
  
  // Melhorar navegação
  enhanceNavigation();
  
  // Adicionar suporte para swipe
  if (AppState.isMobile) {
    addSwipeSupport();
  }
  
  // Event listener para fechar menu ao clicar fora
  document.addEventListener('click', (e) => {
    if (AppState.isMobileMenuOpen && 
        !e.target.closest('.sidebar') && 
        !e.target.closest('.mobile-toggle')) {
      closeMobileMenu();
    }
  });
});