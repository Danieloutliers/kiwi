/**
 * LoanBuddy - Módulo de Interface do Usuário
 * Responsável por manipular elementos da UI e atualizações visuais
 */

// Namespace para funções de UI
const UI = {
  // Inicializar componentes da UI
  initializeUI() {
    console.log('Inicializando interface do usuário...');
    
    // Carregar dados para o dashboard
    this.updateDashboardUI();
    
    // Carregar dados para as listas
    this.updateLoansTableUI();
    this.updateBorrowersGridUI();
    this.updatePaymentsTableUI();
  },
  
  // Atualizar UI do Dashboard
  updateDashboardUI() {
    console.log('Atualizando UI do Dashboard...');
    
    // Obter métricas do dashboard
    const metrics = DataStore.getDashboardMetrics();
    
    // Atualizar cards de métricas
    this.updateMetricCards(metrics);
    
    // Atualizar listas recentes
    this.updateRecentLoans();
    this.updateUpcomingPayments();
    this.updateOverdueLoans();
  },
  
  // Atualizar cards de métricas
  updateMetricCards(metrics) {
    // Formatar números para exibição
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    // Card 1: Total Emprestado
    const totalLoanedEl = document.querySelector('.metric-card:nth-child(1) .metric-value');
    if (totalLoanedEl) {
      totalLoanedEl.textContent = formatter.format(metrics.totalLoaned);
    }
    
    // Card 2: Juros Acumulados
    const totalInterestEl = document.querySelector('.metric-card:nth-child(2) .metric-value');
    if (totalInterestEl) {
      totalInterestEl.textContent = formatter.format(metrics.totalInterestAccrued);
    }
    
    // Card 3: Recebido este Mês
    const totalReceivedEl = document.querySelector('.metric-card:nth-child(3) .metric-value');
    if (totalReceivedEl) {
      totalReceivedEl.textContent = formatter.format(metrics.totalReceivedThisMonth);
    }
    
    // Card 4: Valor em Atraso
    const totalOverdueEl = document.querySelector('.metric-card:nth-child(4) .metric-value');
    if (totalOverdueEl) {
      totalOverdueEl.textContent = formatter.format(metrics.totalOverdue);
    }
    
    // Card 5: Previsto para o Mês
    const estimatedPaymentsEl = document.querySelector('.metric-card:nth-child(5) .metric-value');
    if (estimatedPaymentsEl) {
      // Calcular pagamentos estimados para o mês atual
      const upcomingPayments = DataStore.getUpcomingPayments(30);
      const currentMonth = new Date().getMonth();
      
      const paymentsThisMonth = upcomingPayments.filter(payment => {
        return new Date(payment.date).getMonth() === currentMonth;
      });
      
      const estimatedTotal = paymentsThisMonth.reduce((sum, payment) => sum + payment.amount, 0);
      
      estimatedPaymentsEl.textContent = formatter.format(estimatedTotal);
    }
    
    // Atualizar resumo por status
    this.updateStatusSummary(metrics.loansByStatus);
  },
  
  // Atualizar resumo por status
  updateStatusSummary(statusCounts) {
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    // Status Ativos
    const activeCountEl = document.querySelector('.status-item:nth-child(1) h4 + p');
    if (activeCountEl) {
      activeCountEl.textContent = `${statusCounts.active} empréstimos`;
    }
    
    const activeAmountEl = document.querySelector('.status-item:nth-child(1) h4 + p + p');
    if (activeAmountEl) {
      // Calcular valor total de empréstimos ativos
      const activeLoans = DataStore.getLoans().filter(loan => loan.status === 'active');
      const activeTotal = activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
      activeAmountEl.textContent = formatter.format(activeTotal);
    }
    
    // Status Em Atraso
    const overdueCountEl = document.querySelector('.status-item:nth-child(2) h4 + p');
    if (overdueCountEl) {
      overdueCountEl.textContent = `${statusCounts.overdue} empréstimos`;
    }
    
    const overdueAmountEl = document.querySelector('.status-item:nth-child(2) h4 + p + p');
    if (overdueAmountEl) {
      // Calcular valor total de empréstimos em atraso
      const overdueLoans = DataStore.getLoans().filter(loan => loan.status === 'overdue');
      const overdueTotal = overdueLoans.reduce((sum, loan) => sum + loan.amount, 0);
      overdueAmountEl.textContent = formatter.format(overdueTotal);
    }
    
    // Status Pagos
    const paidCountEl = document.querySelector('.status-item:nth-child(3) h4 + p');
    if (paidCountEl) {
      paidCountEl.textContent = `${statusCounts.paid} empréstimos`;
    }
    
    const paidAmountEl = document.querySelector('.status-item:nth-child(3) h4 + p + p');
    if (paidAmountEl) {
      // Calcular valor total de empréstimos pagos
      const paidLoans = DataStore.getLoans().filter(loan => loan.status === 'paid');
      const paidTotal = paidLoans.reduce((sum, loan) => sum + loan.amount, 0);
      paidAmountEl.textContent = formatter.format(paidTotal);
    }
    
    // Status Inadimplentes
    const defaultedCountEl = document.querySelector('.status-item:nth-child(4) h4 + p');
    if (defaultedCountEl) {
      defaultedCountEl.textContent = `${statusCounts.defaulted} empréstimos`;
    }
    
    const defaultedAmountEl = document.querySelector('.status-item:nth-child(4) h4 + p + p');
    if (defaultedAmountEl) {
      // Calcular valor total de empréstimos inadimplentes
      const defaultedLoans = DataStore.getLoans().filter(loan => loan.status === 'defaulted');
      const defaultedTotal = defaultedLoans.reduce((sum, loan) => sum + loan.amount, 0);
      defaultedAmountEl.textContent = formatter.format(defaultedTotal);
    }
  },
  
  // Atualizar lista de empréstimos recentes
  updateRecentLoans() {
    const recentLoansTable = document.querySelector('.recent-loans table tbody');
    if (!recentLoansTable) return;
    
    // Limpar tabela
    recentLoansTable.innerHTML = '';
    
    // Obter empréstimos ordenados por data (mais recentes primeiro)
    const loans = DataStore.getLoans()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3); // Mostrar apenas os 3 mais recentes
    
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    // Adicionar linhas à tabela
    loans.forEach(loan => {
      const borrower = DataStore.getBorrower(loan.borrowerId);
      if (!borrower) return;
      
      const row = document.createElement('tr');
      
      // Formatar data
      const date = new Date(loan.startDate);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      
      // Definir status
      let statusClass = '';
      let statusText = '';
      
      switch (loan.status) {
        case 'active':
          statusClass = 'active';
          statusText = 'Ativo';
          break;
        case 'overdue':
          statusClass = 'overdue';
          statusText = 'Atrasado';
          break;
        case 'paid':
          statusClass = 'paid';
          statusText = 'Pago';
          break;
        case 'defaulted':
          statusClass = 'defaulted';
          statusText = 'Inadimplente';
          break;
      }
      
      row.innerHTML = `
        <td>${borrower.name}</td>
        <td>${formatter.format(loan.amount)}</td>
        <td>${formattedDate}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
      `;
      
      recentLoansTable.appendChild(row);
    });
  },
  
  // Atualizar lista de próximos pagamentos
  updateUpcomingPayments() {
    const upcomingPaymentsTable = document.querySelector('.upcoming-payments table tbody');
    if (!upcomingPaymentsTable) return;
    
    // Limpar tabela
    upcomingPaymentsTable.innerHTML = '';
    
    // Obter próximos pagamentos
    const upcomingPayments = DataStore.getUpcomingPayments(30)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3); // Mostrar apenas os 3 mais próximos
    
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    // Adicionar linhas à tabela
    upcomingPayments.forEach(payment => {
      const row = document.createElement('tr');
      
      // Formatar data
      const date = new Date(payment.date);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      
      // Verificar se está atrasado
      const isOverdue = payment.days < 0;
      const daysClass = isOverdue ? 'overdue' : '';
      
      row.innerHTML = `
        <td>${payment.borrowerName}</td>
        <td>${formatter.format(payment.amount)}</td>
        <td>${formattedDate}</td>
        <td class="${daysClass}">${payment.days}</td>
      `;
      
      upcomingPaymentsTable.appendChild(row);
    });
  },
  
  // Atualizar lista de empréstimos em atraso
  updateOverdueLoans() {
    const overdueLoansTable = document.querySelector('.overdue-loans table tbody');
    if (!overdueLoansTable) return;
    
    // Limpar tabela
    overdueLoansTable.innerHTML = '';
    
    // Obter empréstimos em atraso
    const overdueLoans = DataStore.getOverdueLoans();
    
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    // Adicionar linhas à tabela
    overdueLoans.forEach(loan => {
      const borrower = DataStore.getBorrower(loan.borrowerId);
      if (!borrower) return;
      
      // Calcular valor total
      const totalAmount = DataStore.calculateTotalLoanAmount(loan);
      
      // Calcular valor pago
      const payments = DataStore.getPaymentsByLoan(loan.id);
      const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
      
      // Calcular valor em atraso
      const overdueDays = DataStore.getLoanDaysOverdue(loan);
      
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${borrower.name}</td>
        <td>${formatter.format(loan.amount)}</td>
        <td>${formatter.format(totalAmount - totalPaid)}</td>
        <td>${overdueDays}</td>
        <td>
          <button class="btn-small register-payment" data-loan-id="${loan.id}">Registrar Pagamento</button>
          <button class="btn-small contact" data-borrower-id="${borrower.id}">Contatar</button>
        </td>
      `;
      
      overdueLoansTable.appendChild(row);
      
      // Adicionar eventos aos botões
      row.querySelector('.register-payment').addEventListener('click', function() {
        const loanId = this.dataset.loanId;
        // Preencher o formulário de pagamento com o empréstimo selecionado
        document.getElementById('payment-loan').value = loanId;
        showModal('payment-modal');
      });
      
      row.querySelector('.contact').addEventListener('click', function() {
        const borrowerId = this.dataset.borrowerId;
        const borrower = DataStore.getBorrower(borrowerId);
        if (borrower) {
          alert(`Contatar ${borrower.name}\nTelefone: ${borrower.phone}\nEmail: ${borrower.email}`);
        }
      });
    });
    
    // Se não houver empréstimos em atraso, mostrar mensagem
    if (overdueLoans.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td colspan="5" class="text-center">Não há empréstimos em atraso.</td>
      `;
      overdueLoansTable.appendChild(row);
    }
  },
  
  // Atualizar tabela de empréstimos
  updateLoansTableUI() {
    const loansTable = document.querySelector('#loans-table tbody');
    if (!loansTable) return;
    
    // Limpar tabela
    loansTable.innerHTML = '';
    
    // Obter filtros
    const filters = AppState.filters.loans;
    
    // Filtrar e ordenar empréstimos
    let loans = DataStore.getLoans();
    
    // Aplicar filtro de status
    if (filters.status !== 'all') {
      loans = loans.filter(loan => loan.status === filters.status);
    }
    
    // Aplicar filtro de pesquisa
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      loans = loans.filter(loan => {
        const borrower = DataStore.getBorrower(loan.borrowerId);
        return borrower && borrower.name.toLowerCase().includes(searchLower);
      });
    }
    
    // Aplicar ordenação
    switch (filters.sort) {
      case 'date-desc':
        loans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'date-asc':
        loans.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'amount-desc':
        loans.sort((a, b) => (b.principal || b.amount) - (a.principal || a.amount));
        break;
      case 'amount-asc':
        loans.sort((a, b) => (a.principal || a.amount) - (b.principal || b.amount));
        break;
    }
    
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    // Adicionar linhas à tabela
    loans.forEach(loan => {
      const borrower = DataStore.getBorrower(loan.borrowerId);
      if (!borrower) return;
      
      const row = document.createElement('tr');
      
      // Formatar datas e valores
      const dueDate = new Date(loan.dueDate);
      const formattedDueDate = `${dueDate.getDate().toString().padStart(2, '0')}/${(dueDate.getMonth() + 1).toString().padStart(2, '0')}/${dueDate.getFullYear()}`;
      
      // Valor principal (usar amount se principal não existir)
      const principal = loan.principal || loan.amount || 0;
      
      // Calcular saldo remanescente do empréstimo
      const loanPayments = DataStore.getPaymentsByLoan(loan.id);
      const totalPaid = loanPayments.reduce((sum, payment) => sum + payment.amount, 0);
      
      // Calcular valor total com juros
      const totalWithInterest = principal + (principal * loan.interestRate / 100 * (loan.term / 12));
      const remainingBalance = totalWithInterest - totalPaid;
      
      // Calcular valor da parcela
      const installmentAmount = loan.paymentSchedule?.installmentAmount || (principal / loan.term || 1);
      
      // Definir status
      let statusClass = '';
      let statusText = '';
      
      switch (loan.status) {
        case 'active':
          statusClass = 'active';
          statusText = 'Ativo';
          break;
        case 'overdue':
          statusClass = 'overdue';
          statusText = 'Em Atraso';
          break;
        case 'paid':
          statusClass = 'paid';
          statusText = 'Pago';
          break;
        case 'defaulted':
          statusClass = 'defaulted';
          statusText = 'Inadimplente';
          break;
      }
      
      row.innerHTML = `
        <td>${borrower.name}</td>
        <td>${formatter.format(principal)}</td>
        <td>${loan.interestRate}%</td>
        <td>${formatter.format(installmentAmount)}</td>
        <td>${formattedDueDate}</td>
        <td><span class="status ${statusClass}">${statusText}</span></td>
        <td>${formatter.format(remainingBalance)}</td>
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
        </td>
      `;
      
      loansTable.appendChild(row);
      
      // Adicionar eventos aos botões
      const viewLoanButton = row.querySelector('.view-loan');
      if (viewLoanButton) {
        viewLoanButton.addEventListener('click', function(event) {
          const loanId = this.dataset.id;
          showLoanDetails(loanId);
        });
      }
      
      row.querySelector('.edit-loan').addEventListener('click', function() {
        const loanId = this.dataset.id;
        // Implementar edição do empréstimo
        alert(`Editar empréstimo ${loanId}`);
      });
      
      // Adicionar eventos para payment-history e add-payment
      const paymentHistoryButton = row.querySelector('.payment-history');
      if (paymentHistoryButton) {
        paymentHistoryButton.addEventListener('click', function(event) {
          const loanId = this.dataset.id;
          showPaymentHistory(loanId);
        });
      }
      
      const addPaymentButton = row.querySelector('.add-payment');
      if (addPaymentButton) {
        addPaymentButton.addEventListener('click', function(event) {
          const loanId = this.dataset.id;
          prepareAddPayment(loanId);
        });
      }
    });
    
    // Se não houver empréstimos, mostrar mensagem
    if (loans.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td colspan="8" class="text-center">Nenhum empréstimo encontrado.</td>
      `;
      loansTable.appendChild(row);
    }
  },
  
  // Atualizar grid de mutuários
  updateBorrowersGridUI() {
    const borrowersGrid = document.querySelector('.borrowers-grid');
    if (!borrowersGrid) return;
    
    // Limpar grid
    borrowersGrid.innerHTML = '';
    
    // Obter filtros
    const filters = AppState.filters.borrowers;
    
    // Filtrar e ordenar mutuários
    let borrowers = DataStore.getBorrowers();
    
    // Aplicar filtro de pesquisa
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      borrowers = borrowers.filter(borrower => 
        borrower.name.toLowerCase().includes(searchLower) ||
        borrower.email.toLowerCase().includes(searchLower) ||
        borrower.phone.includes(filters.search)
      );
    }
    
    // Aplicar ordenação
    switch (filters.sort) {
      case 'name-asc':
        borrowers.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        borrowers.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'loans-desc':
        borrowers.sort((a, b) => {
          const aLoans = DataStore.getLoansByBorrower(a.id).length;
          const bLoans = DataStore.getLoansByBorrower(b.id).length;
          return bLoans - aLoans;
        });
        break;
      case 'loans-asc':
        borrowers.sort((a, b) => {
          const aLoans = DataStore.getLoansByBorrower(a.id).length;
          const bLoans = DataStore.getLoansByBorrower(b.id).length;
          return aLoans - bLoans;
        });
        break;
    }
    
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    // Adicionar cards ao grid
    borrowers.forEach(borrower => {
      // Obter empréstimos do mutuário
      const loans = DataStore.getLoansByBorrower(borrower.id);
      
      // Calcular valor total de empréstimos
      const totalAmount = loans.reduce((sum, loan) => sum + loan.amount, 0);
      
      // Determinar status geral
      let statusClass = 'stat-active';
      let statusText = 'Ativo';
      
      // Verificar se há empréstimos em atraso
      const hasOverdue = loans.some(loan => loan.status === 'overdue');
      if (hasOverdue) {
        statusClass = 'stat-overdue';
        statusText = 'Atrasado';
      }
      
      // Verificar se há empréstimos inadimplentes
      const hasDefaulted = loans.some(loan => loan.status === 'defaulted');
      if (hasDefaulted) {
        statusClass = 'stat-defaulted';
        statusText = 'Inadimplente';
      }
      
      // Obter iniciais para o avatar
      const initials = borrower.name
        .split(' ')
        .map(name => name.charAt(0))
        .slice(0, 2)
        .join('');
      
      const card = document.createElement('div');
      card.className = 'borrower-card';
      card.innerHTML = `
        <div class="borrower-header">
          <div class="borrower-avatar">${initials}</div>
          <div class="borrower-info">
            <h3>${borrower.name}</h3>
            <p><i class="fas fa-phone"></i> ${borrower.phone}</p>
            <p><i class="fas fa-envelope"></i> ${borrower.email}</p>
          </div>
        </div>
        <div class="borrower-stats">
          <div class="stat">
            <span class="stat-value">${loans.length}</span>
            <span class="stat-label">Empréstimos</span>
          </div>
          <div class="stat">
            <span class="stat-value">${formatter.format(totalAmount)}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat">
            <span class="stat-value ${statusClass}">${statusText}</span>
            <span class="stat-label">Status</span>
          </div>
        </div>
        <div class="borrower-actions">
          <button class="btn-small view-borrower" data-id="${borrower.id}" title="Ver Detalhes">
            <i class="fas fa-eye"></i> Detalhes
          </button>
          <button class="btn-small edit-borrower" data-id="${borrower.id}" title="Editar">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn-small new-loan" data-id="${borrower.id}" title="Novo Empréstimo">
            <i class="fas fa-plus"></i> Novo Empréstimo
          </button>
        </div>
      `;
      
      borrowersGrid.appendChild(card);
      
      // Adicionar eventos aos botões
      card.querySelector('.view-borrower').addEventListener('click', function() {
        const borrowerId = this.dataset.id;
        // Implementar visualização detalhada do mutuário
        alert(`Ver detalhes do mutuário ${borrowerId}`);
      });
      
      card.querySelector('.edit-borrower').addEventListener('click', function() {
        const borrowerId = this.dataset.id;
        // Implementar edição do mutuário
        alert(`Editar mutuário ${borrowerId}`);
      });
      
      card.querySelector('.new-loan').addEventListener('click', function() {
        const borrowerId = this.dataset.id;
        // Preencher o formulário de empréstimo com o mutuário selecionado
        document.getElementById('loan-borrower').value = borrowerId;
        showModal('loan-modal');
      });
    });
    
    // Se não houver mutuários, mostrar mensagem
    if (borrowers.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'empty-message';
      emptyMessage.innerHTML = `
        <p>Nenhum mutuário encontrado.</p>
        <button class="btn-primary" id="empty-new-borrower-btn">
          <i class="fas fa-plus"></i> Adicionar Mutuário
        </button>
      `;
      borrowersGrid.appendChild(emptyMessage);
      
      // Adicionar evento ao botão
      emptyMessage.querySelector('#empty-new-borrower-btn').addEventListener('click', function() {
        showModal('borrower-modal');
      });
    }
  },
  
  // Atualizar tabela de pagamentos
  updatePaymentsTableUI() {
    const paymentsTable = document.querySelector('#payments-table tbody');
    if (!paymentsTable) return;
    
    // Limpar tabela
    paymentsTable.innerHTML = '';
    
    // Obter filtros
    const filters = AppState.filters.payments;
    
    // Filtrar e ordenar pagamentos
    let payments = DataStore.getPayments();
    
    // Aplicar filtro de período
    if (filters.period !== 'all') {
      const today = new Date();
      
      switch (filters.period) {
        case 'this-month':
          // Este mês
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          
          payments = payments.filter(payment => {
            const paymentDate = new Date(payment.date);
            return paymentDate >= firstDayOfMonth && paymentDate <= lastDayOfMonth;
          });
          break;
        case 'last-month':
          // Mês passado
          const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
          
          payments = payments.filter(payment => {
            const paymentDate = new Date(payment.date);
            return paymentDate >= firstDayOfLastMonth && paymentDate <= lastDayOfLastMonth;
          });
          break;
        case 'this-year':
          // Este ano
          const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
          const lastDayOfYear = new Date(today.getFullYear(), 11, 31);
          
          payments = payments.filter(payment => {
            const paymentDate = new Date(payment.date);
            return paymentDate >= firstDayOfYear && paymentDate <= lastDayOfYear;
          });
          break;
      }
    }
    
    // Aplicar filtro de pesquisa
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      payments = payments.filter(payment => {
        const loan = DataStore.getLoan(payment.loanId);
        if (!loan) return false;
        
        const borrower = DataStore.getBorrower(loan.borrowerId);
        return borrower && borrower.name.toLowerCase().includes(searchLower);
      });
    }
    
    // Aplicar ordenação
    switch (filters.sort) {
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
    
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    // Adicionar linhas à tabela
    payments.forEach(payment => {
      const loan = DataStore.getLoan(payment.loanId);
      if (!loan) return;
      
      const borrower = DataStore.getBorrower(loan.borrowerId);
      if (!borrower) return;
      
      const row = document.createElement('tr');
      
      // Formatar data
      const date = new Date(payment.date);
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
      
      // Traduzir método de pagamento
      let methodText = '';
      switch (payment.method) {
        case 'cash': methodText = 'Dinheiro'; break;
        case 'transfer': methodText = 'Transferência'; break;
        case 'pix': methodText = 'PIX'; break;
        case 'card': methodText = 'Cartão'; break;
        default: methodText = 'Outro';
      }
      
      row.innerHTML = `
        <td>${payment.id}</td>
        <td>${borrower.name}</td>
        <td>Empréstimo #${loan.id}</td>
        <td>${formatter.format(payment.amount)}</td>
        <td>${formattedDate}</td>
        <td>${methodText}</td>
        <td class="actions">
          <button class="action-icon view-payment" data-id="${payment.id}" title="Ver Detalhes">
            <i class="fas fa-eye"></i>
          </button>
          <button class="action-icon edit-payment" data-id="${payment.id}" title="Editar">
            <i class="fas fa-edit"></i>
          </button>
          <button class="action-icon delete-payment" data-id="${payment.id}" title="Excluir">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      
      paymentsTable.appendChild(row);
      
      // Adicionar eventos aos botões
      row.querySelector('.view-payment').addEventListener('click', function() {
        const paymentId = this.dataset.id;
        // Implementar visualização detalhada do pagamento
        alert(`Ver detalhes do pagamento ${paymentId}`);
      });
      
      row.querySelector('.edit-payment').addEventListener('click', function() {
        const paymentId = this.dataset.id;
        // Implementar edição do pagamento
        alert(`Editar pagamento ${paymentId}`);
      });
      
      row.querySelector('.delete-payment').addEventListener('click', function() {
        const paymentId = this.dataset.id;
        // Implementar exclusão do pagamento
        if (confirm(`Tem certeza que deseja excluir o pagamento ${paymentId}?`)) {
          DataStore.deletePayment(paymentId);
          UI.updatePaymentsTableUI();
          UI.updateDashboardUI();
          showToast('Pagamento excluído com sucesso!', 'success');
        }
      });
    });
    
    // Se não houver pagamentos, mostrar mensagem
    if (payments.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td colspan="7" class="text-center">Nenhum pagamento encontrado.</td>
      `;
      paymentsTable.appendChild(row);
    }
  }
};