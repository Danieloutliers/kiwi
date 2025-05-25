/**
 * LoanBuddy - Módulo de Dados
 * Responsável por gerenciar o armazenamento e manipulação de dados
 */

// Namespace para funções de dados
const DataStore = {
  // Dados da aplicação
  borrowers: [],
  loans: [],
  payments: [],
  archivedLoans: [],
  
  // Inicializar dados
  init() {
    console.log('Inicializando armazenamento de dados...');
    this.loadFromStorage();
  },
  
  // Verificar se a persistência está habilitada
  isPersistenceEnabled() {
    // Verificar se as configurações existem e se o backup automático está ativado
    return AppState && AppState.settings && AppState.settings.autoBackup === true;
  },
  
  // Carregar dados do localStorage
  loadFromStorage() {
    try {
      // Carregar mutuários
      const storedBorrowers = localStorage.getItem('borrowers');
      if (storedBorrowers) {
        this.borrowers = JSON.parse(storedBorrowers);
        console.log(`${this.borrowers.length} mutuários carregados`);
      } else {
        // Usar dados de exemplo se não existirem dados
        this.borrowers = this.getSampleBorrowers();
        this.saveToStorage('borrowers');
        console.log(`${this.borrowers.length} mutuários de exemplo carregados`);
      }
      
      // Carregar empréstimos
      const storedLoans = localStorage.getItem('loans');
      if (storedLoans) {
        this.loans = JSON.parse(storedLoans);
        console.log(`${this.loans.length} empréstimos carregados`);
      } else {
        // Usar dados de exemplo se não existirem dados
        this.loans = this.getSampleLoans();
        this.saveToStorage('loans');
        console.log(`${this.loans.length} empréstimos de exemplo carregados`);
      }
      
      // Carregar empréstimos arquivados
      const storedArchivedLoans = localStorage.getItem('archivedLoans');
      if (storedArchivedLoans) {
        this.archivedLoans = JSON.parse(storedArchivedLoans);
        console.log(`${this.archivedLoans.length} empréstimos arquivados carregados`);
      } else {
        this.archivedLoans = [];
        this.saveToStorage('archivedLoans');
        console.log('Nenhum empréstimo arquivado encontrado');
      }
      
      // Carregar pagamentos
      const storedPayments = localStorage.getItem('payments');
      if (storedPayments) {
        this.payments = JSON.parse(storedPayments);
        console.log(`${this.payments.length} pagamentos carregados`);
      } else {
        // Usar dados de exemplo se não existirem dados
        this.payments = this.getSamplePayments();
        this.saveToStorage('payments');
        console.log(`${this.payments.length} pagamentos de exemplo carregados`);
      }
      
      // Carregar configurações
      const storedSettings = localStorage.getItem('settings');
      if (storedSettings) {
        AppState.settings = { ...AppState.settings, ...JSON.parse(storedSettings) };
        console.log('Configurações carregadas');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
    }
  },
  
  // Salvar dados no localStorage (apenas se a persistência estiver habilitada)
  saveToStorage(dataType) {
    try {
      // Verificar se os dados devem ser persistidos
      const shouldPersist = this.isPersistenceEnabled();
      
      // Sempre salvar configurações, independentemente da configuração de persistência
      const isSettings = dataType === 'settings';
      
      if (!shouldPersist && !isSettings) {
        console.log(`Persistência desativada - dados de ${dataType} mantidos apenas em memória`);
        return;
      }
      
      switch (dataType) {
        case 'borrowers':
          localStorage.setItem('borrowers', JSON.stringify(this.borrowers));
          console.log(`${this.borrowers.length} mutuários salvos no localStorage`);
          break;
        case 'loans':
          localStorage.setItem('loans', JSON.stringify(this.loans));
          console.log(`${this.loans.length} empréstimos salvos no localStorage`);
          break;
        case 'archivedLoans':
          localStorage.setItem('archivedLoans', JSON.stringify(this.archivedLoans));
          console.log(`${this.archivedLoans.length} empréstimos arquivados salvos no localStorage`);
          break;
        case 'payments':
          localStorage.setItem('payments', JSON.stringify(this.payments));
          console.log(`${this.payments.length} pagamentos salvos no localStorage`);
          break;
        case 'settings':
          localStorage.setItem('settings', JSON.stringify(AppState.settings));
          console.log('Configurações salvas no localStorage');
          break;
        case 'all':
          this.saveToStorage('borrowers');
          this.saveToStorage('loans');
          this.saveToStorage('archivedLoans');
          this.saveToStorage('payments');
          this.saveToStorage('settings');
          break;
      }
    } catch (error) {
      console.error(`Erro ao processar dados (${dataType}):`, error);
    }
  },
  
  // MÉTODOS PARA MUTUÁRIOS
  
  // Obter todos os mutuários
  getBorrowers() {
    return this.borrowers;
  },
  
  // Obter um mutuário pelo ID
  getBorrower(id) {
    return this.borrowers.find(borrower => borrower.id === id);
  },
  
  // Adicionar um novo mutuário
  addBorrower(borrower) {
    // Gerar um ID único
    borrower.id = Date.now().toString();
    
    // Adicionar data de criação
    borrower.createdAt = new Date().toISOString();
    
    // Adicionar ao array
    this.borrowers.push(borrower);
    
    // Salvar no localStorage
    this.saveToStorage('borrowers');
    
    return borrower;
  },
  
  // Atualizar um mutuário
  updateBorrower(id, updates) {
    const index = this.borrowers.findIndex(borrower => borrower.id === id);
    
    if (index !== -1) {
      // Mesclar as atualizações com o mutuário existente
      this.borrowers[index] = { ...this.borrowers[index], ...updates, updatedAt: new Date().toISOString() };
      
      // Salvar no localStorage
      this.saveToStorage('borrowers');
      
      return this.borrowers[index];
    }
    
    return null;
  },
  
  // Excluir um mutuário
  deleteBorrower(id) {
    const initialLength = this.borrowers.length;
    this.borrowers = this.borrowers.filter(borrower => borrower.id !== id);
    
    // Se algo foi removido, salvar no localStorage
    if (initialLength !== this.borrowers.length) {
      this.saveToStorage('borrowers');
      return true;
    }
    
    return false;
  },
  
  // MÉTODOS PARA EMPRÉSTIMOS
  
  // Obter todos os empréstimos
  getLoans() {
    return this.loans;
  },
  
  // Obter um empréstimo pelo ID
  getLoan(id) {
    console.log(`Buscando empréstimo com ID ${id} (tipo: ${typeof id})`);
    console.log(`Total de empréstimos: ${this.loans.length}`);
    
    // Converter para string para garantir comparação correta
    const strId = id.toString(); 
    const loan = this.loans.find(loan => loan.id.toString() === strId);
    
    console.log(`Empréstimo encontrado:`, loan);
    return loan;
  },
  
  // Obter empréstimos de um mutuário
  getLoansByBorrower(borrowerId) {
    return this.loans.filter(loan => loan.borrowerId === borrowerId);
  },
  
  // Adicionar um novo empréstimo
  addLoan(loan) {
    // Gerar um ID único
    loan.id = Date.now().toString();
    
    // Adicionar data de criação
    loan.createdAt = new Date().toISOString();
    
    // Definir status inicial como ativo
    loan.status = 'active';
    
    // Adicionar ao array
    this.loans.push(loan);
    
    // Salvar no localStorage
    this.saveToStorage('loans');
    
    return loan;
  },
  
  // Atualizar um empréstimo
  updateLoan(id, updates) {
    // Converter para string para garantir comparação correta (como feito em getLoan)
    const strId = id.toString();
    const index = this.loans.findIndex(loan => loan.id.toString() === strId);
    
    if (index !== -1) {
      // Preservar o ID e status original, a menos que seja explicitamente alterado
      const originalId = this.loans[index].id;
      const originalStatus = this.loans[index].status;
      
      // Mesclar as atualizações com o empréstimo existente
      this.loans[index] = { 
        ...this.loans[index], 
        ...updates, 
        id: originalId, // Garantir que o ID não seja alterado
        status: updates.status || originalStatus, // Manter status original se não for alterado
        updatedAt: new Date().toISOString() 
      };
      
      console.log(`Empréstimo ${strId} atualizado:`, this.loans[index]);
      
      // Salvar no localStorage
      this.saveToStorage('loans');
      
      return this.loans[index];
    }
    
    console.error(`Empréstimo ${strId} não encontrado para atualização`);
    return null;
  },
  
  // Excluir um empréstimo
  deleteLoan(id) {
    console.log(`Tentando excluir empréstimo com ID ${id}`);
    
    // Converter para string para garantir comparação correta
    const strId = id.toString();
    const initialLength = this.loans.length;
    
    this.loans = this.loans.filter(loan => loan.id.toString() !== strId);
    
    // Se algo foi removido, salvar no localStorage
    if (initialLength !== this.loans.length) {
      console.log(`Empréstimo ${strId} excluído com sucesso`);
      this.saveToStorage('loans');
      return true;
    }
    
    console.error(`Empréstimo ${strId} não encontrado para exclusão`);
    return false;
  },
  
  // MÉTODOS PARA PAGAMENTOS
  
  // Obter todos os pagamentos
  getPayments() {
    return this.payments;
  },
  
  // Obter um pagamento pelo ID
  getPayment(id) {
    return this.payments.find(payment => payment.id === id);
  },
  
  // Obter pagamentos de um empréstimo
  getPaymentsByLoan(loanId) {
    console.log(`Buscando pagamentos para o empréstimo ID ${loanId} (tipo: ${typeof loanId})`);
    
    // Converter para string para garantir comparação correta
    const strId = loanId.toString();
    const result = this.payments.filter(payment => payment.loanId.toString() === strId);
    
    console.log(`Encontrados ${result.length} pagamentos para o empréstimo ${loanId}`);
    return result;
  },
  
  // Adicionar um novo pagamento
  addPayment(payment) {
    // Gerar um ID único
    payment.id = Date.now().toString();
    
    // Adicionar data de criação
    payment.createdAt = new Date().toISOString();
    
    // Verificar se é necessário calcular principal e juros
    if (payment.principal === undefined || payment.interest === undefined) {
      const loan = this.getLoan(payment.loanId);
      if (loan) {
        const principal = parseFloat(loan.amount);
        const interestRate = parseFloat(loan.interestRate) / 100;
        
        // Juros é calculado por mês como uma porcentagem do principal
        // Ex: 10% ao mês sobre R$1.000 = R$100 de juros mensais
        const monthlyInterest = principal * interestRate;
        
        // Dividir o pagamento entre principal e juros
        payment.interest = Math.min(monthlyInterest, payment.amount);
        payment.principal = payment.amount - payment.interest;
        
        console.log(`Divisão calculada do pagamento: 
          - Total: ${payment.amount}
          - Principal: ${payment.principal}
          - Juros: ${payment.interest}`);
      }
    }
    
    // Adicionar ao array
    this.payments.push(payment);
    
    // Salvar no localStorage
    this.saveToStorage('payments');
    
    // Atualizar status do empréstimo se necessário
    this.updateLoanStatusAfterPayment(payment.loanId);
    
    return payment;
  },
  
  // Atualizar um pagamento
  updatePayment(id, updates) {
    const index = this.payments.findIndex(payment => payment.id === id);
    
    if (index !== -1) {
      // Mesclar as atualizações com o pagamento existente
      this.payments[index] = { ...this.payments[index], ...updates, updatedAt: new Date().toISOString() };
      
      // Salvar no localStorage
      this.saveToStorage('payments');
      
      // Atualizar status do empréstimo se necessário
      this.updateLoanStatusAfterPayment(this.payments[index].loanId);
      
      return this.payments[index];
    }
    
    return null;
  },
  
  // Excluir um pagamento
  deletePayment(id) {
    const payment = this.getPayment(id);
    const loanId = payment ? payment.loanId : null;
    
    const initialLength = this.payments.length;
    this.payments = this.payments.filter(payment => payment.id !== id);
    
    // Se algo foi removido, salvar no localStorage
    if (initialLength !== this.payments.length) {
      this.saveToStorage('payments');
      
      // Atualizar status do empréstimo se necessário
      if (loanId) {
        this.updateLoanStatusAfterPayment(loanId);
      }
      
      return true;
    }
    
    return false;
  },
  
  // MÉTODOS DE NEGÓCIOS
  
  // Atualizar status do empréstimo após um pagamento
  updateLoanStatusAfterPayment(loanId) {
    const loan = this.getLoan(loanId);
    if (!loan) return;
    
    // Obter todos os pagamentos deste empréstimo
    const loanPayments = this.getPaymentsByLoan(loanId);
    
    // Calcular o valor total pago
    const totalPaid = loanPayments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Obter o valor total do empréstimo + juros
    const totalLoanAmount = this.calculateTotalLoanAmount(loan);
    
    // Se o valor pago for igual ou maior que o valor total, marcar como pago
    if (totalPaid >= totalLoanAmount) {
      this.updateLoan(loanId, { status: 'paid', paidAt: new Date().toISOString() });
      return;
    }
    
    // Verificar se o empréstimo está em atraso
    const isOverdue = this.isLoanOverdue(loan);
    
    // Atualizar o status
    if (isOverdue) {
      // Verificar se está inadimplente (atraso > dias de carência)
      const daysOverdue = this.getLoanDaysOverdue(loan);
      const graceDays = AppState.settings.defaultGraceDays;
      
      if (daysOverdue > graceDays) {
        this.updateLoan(loanId, { status: 'defaulted' });
      } else {
        this.updateLoan(loanId, { status: 'overdue' });
      }
    } else {
      this.updateLoan(loanId, { status: 'active' });
    }
  },
  
  // Calcular valor total do empréstimo com juros
  calculateTotalLoanAmount(loan) {
    // Verificar se o empréstimo é válido
    if (!loan) {
      console.warn('Empréstimo inválido passado para calculateTotalLoanAmount');
      return 0;
    }
    
    // Cálculo simples de juros para este exemplo
    const principal = parseFloat(loan.amount);
    const interestRate = parseFloat(loan.interestRate) / 100; // Converter porcentagem para decimal
    const term = parseInt(loan.term) || 1;
    
    // Verificar se os valores são números válidos
    if (isNaN(principal) || isNaN(interestRate)) {
      console.warn('Valores inválidos no empréstimo:', loan);
      return 0;
    }
    
    // Juros mensais: taxa mensal aplicada ao valor principal
    // Ex: 10% ao mês sobre R$1.000 = R$100 de juros por mês
    const monthlyInterest = principal * interestRate;
    
    // Juros total = juros mensal * número de meses
    const totalInterest = monthlyInterest * term;
    const totalAmount = principal + totalInterest;
    
    console.log(`Calculando total do empréstimo: Principal=${principal}, Taxa=${interestRate*100}% ao mês, Juros mensal=${monthlyInterest}, Total de juros=${totalInterest}, Total do empréstimo=${totalAmount}`);
    
    return totalAmount;
  },
  
  // Verificar se um empréstimo está em atraso
  isLoanOverdue(loan) {
    if (loan.status === 'paid') return false;
    
    // Obter data atual
    const today = new Date();
    
    // Obter data de vencimento
    const dueDate = new Date(loan.dueDate);
    
    // Empréstimo está em atraso se a data atual é posterior à data de vencimento
    return today > dueDate;
  },
  
  // Obter dias em atraso
  getLoanDaysOverdue(loan) {
    if (loan.status === 'paid' || !this.isLoanOverdue(loan)) return 0;
    
    // Obter data atual
    const today = new Date();
    
    // Obter data de vencimento
    const dueDate = new Date(loan.dueDate);
    
    // Calcular diferença em dias
    const diffTime = Math.abs(today - dueDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  },
  
  // MÉTODOS PARA EMPRÉSTIMOS ARQUIVADOS
  
  // Obter todos os empréstimos arquivados
  getArchivedLoans() {
    return this.archivedLoans;
  },
  
  // Obter um empréstimo arquivado pelo ID
  getArchivedLoan(id) {
    return this.archivedLoans.find(loan => loan.id === id);
  },
  
  // Arquivar um empréstimo
  archiveLoan(id) {
    // Buscar o empréstimo na lista de ativos
    const loan = this.getLoan(id);
    if (!loan) return null;
    
    // Adicionar data de arquivamento
    const archivedLoan = { 
      ...loan, 
      archivedAt: new Date().toISOString() 
    };
    
    // Adicionar à lista de arquivados
    this.archivedLoans.push(archivedLoan);
    
    // Remover da lista de empréstimos ativos
    this.deleteLoan(id);
    
    // Salvar ambas as listas
    this.saveToStorage('loans');
    this.saveToStorage('archivedLoans');
    
    return archivedLoan;
  },
  
  // Restaurar um empréstimo arquivado
  restoreLoan(id) {
    // Buscar o empréstimo na lista de arquivados
    const archivedLoan = this.getArchivedLoan(id);
    if (!archivedLoan) return null;
    
    // Remover data de arquivamento e criar cópia
    const { archivedAt, ...restoredLoan } = archivedLoan;
    
    // Atualizar data de restauração
    restoredLoan.updatedAt = new Date().toISOString();
    
    // Adicionar à lista de empréstimos ativos
    this.loans.push(restoredLoan);
    
    // Remover da lista de arquivados
    this.archivedLoans = this.archivedLoans.filter(loan => loan.id !== id);
    
    // Salvar ambas as listas
    this.saveToStorage('loans');
    this.saveToStorage('archivedLoans');
    
    return restoredLoan;
  },
  
  // Obter empréstimos em atraso
  getOverdueLoans() {
    return this.loans.filter(loan => 
      loan.status === 'overdue' || loan.status === 'defaulted'
    );
  },
  
  // Obter próximos pagamentos
  getUpcomingPayments(days = 30) {
    // Obter data atual
    const today = new Date();
    
    // Data limite
    const limitDate = new Date(today);
    limitDate.setDate(today.getDate() + days);
    
    // Filtrar empréstimos ativos
    const activeLoans = this.loans.filter(loan => 
      loan.status === 'active' || loan.status === 'overdue'
    );
    
    // Criar lista de próximos pagamentos
    const upcomingPayments = [];
    
    activeLoans.forEach(loan => {
      // Obter mutuário
      const borrower = this.getBorrower(loan.borrowerId);
      if (!borrower) return;
      
      // Obter próxima data de pagamento
      const nextPaymentDate = new Date(loan.nextPaymentDate || loan.dueDate);
      
      // Se a data estiver dentro do período
      if (nextPaymentDate >= today && nextPaymentDate <= limitDate) {
        // Calcular valor do pagamento
        const paymentAmount = this.calculateLoanPaymentAmount(loan);
        
        upcomingPayments.push({
          id: `upcoming-${loan.id}`,
          loanId: loan.id,
          borrowerId: loan.borrowerId,
          borrowerName: borrower.name,
          amount: paymentAmount,
          date: nextPaymentDate.toISOString(),
          days: Math.ceil((nextPaymentDate - today) / (1000 * 60 * 60 * 24))
        });
      }
    });
    
    // Ordenar por data
    return upcomingPayments.sort((a, b) => new Date(a.date) - new Date(b.date));
  },
  
  // Calcular valor da parcela de um empréstimo
  calculateLoanPaymentAmount(loan) {
    // Verificar se o empréstimo é válido
    if (!loan) {
      console.warn('Empréstimo inválido passado para calculateLoanPaymentAmount');
      return 0;
    }
    
    // Cálculo para juros simples com taxa mensal
    const principal = parseFloat(loan.amount);
    const interestRate = parseFloat(loan.interestRate) / 100; // Converter porcentagem para decimal
    const termMonths = parseFloat(loan.term);
    
    // Verificar se os valores são números válidos
    if (isNaN(principal) || isNaN(interestRate) || isNaN(termMonths) || termMonths === 0) {
      console.warn('Valores inválidos no empréstimo:', loan);
      return 0;
    }
    
    // Juros mensal = principal × taxa
    // Ex: 10% sobre R$1.000 = R$100 de juros por mês
    const monthlyInterest = principal * interestRate;
    
    // Juros total = juros mensal × número de meses
    const totalInterest = monthlyInterest * termMonths;
    
    // Valor total = principal + juros total
    const totalAmount = principal + totalInterest;
    
    // Valor da parcela = valor total dividido pelo número de parcelas
    const paymentAmount = totalAmount / termMonths;
    
    console.log(`Calculando parcela do empréstimo: 
      - Principal: R$${principal.toFixed(2)}
      - Taxa: ${interestRate*100}% ao mês
      - Juros mensal: R$${monthlyInterest.toFixed(2)}
      - Termo: ${termMonths} meses
      - Total de juros: R$${totalInterest.toFixed(2)}
      - Total do empréstimo: R$${totalAmount.toFixed(2)}
      - Valor da parcela: R$${paymentAmount.toFixed(2)}`);
    
    return paymentAmount;
  },
  
  // Obter métricas do dashboard
  getDashboardMetrics() {
    // Verificar se os dados estão disponíveis
    if (!Array.isArray(this.loans) || !Array.isArray(this.payments)) {
      console.error('Dados de empréstimos ou pagamentos não disponíveis');
      // Retornar valores default para evitar NaN
      return {
        totalLoaned: 0,
        totalInterestAccrued: 0,
        totalReceivedThisMonth: 0,
        totalOverdue: 0,
        loansByStatus: {
          active: 0,
          overdue: 0,
          defaulted: 0,
          paid: 0
        }
      };
    }
    
    // Total emprestado - garantir que amount seja um número
    const totalLoaned = this.loans.reduce((sum, loan) => {
      // Verificar se amount é um número válido
      const amount = parseFloat(loan.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    // Total de juros acumulados - apenas do mês atual
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const totalInterestAccrued = this.payments.reduce((sum, payment) => {
      try {
        const paymentDate = new Date(payment.date || payment.paymentDate);
        
        // Verificar se o pagamento é deste mês
        if (paymentDate >= firstDayOfMonth && paymentDate <= lastDayOfMonth) {
          // Se o pagamento tem o valor de juros especificado
          if (payment.interest) {
            const interest = parseFloat(payment.interest);
            return sum + (isNaN(interest) ? 0 : interest);
          }
          
          // Se não tem juros especificado, calcular baseado no empréstimo
          const loan = this.getLoan(payment.loanId);
          if (loan && loan.interestRate) {
            const paymentAmount = parseFloat(payment.amount || 0);
            return sum + (paymentAmount * (loan.interestRate / 100));
          }
        }
        return sum;
      } catch (e) {
        console.warn('Erro ao calcular juros:', e);
        return sum;
      }
    }, 0);
    
    // Filtrar pagamentos deste mês
    const paymentsThisMonth = this.payments.filter(payment => {
      try {
        const paymentDate = new Date(payment.date || payment.paymentDate);
        return paymentDate >= firstDayOfMonth && paymentDate <= lastDayOfMonth;
      } catch (e) {
        console.warn('Data de pagamento inválida:', payment);
        return false;
      }
    });
    
    console.log(`Pagamentos filtrados para este mês: ${paymentsThisMonth.length}`);
    
    const totalReceivedThisMonth = paymentsThisMonth.reduce((sum, payment) => {
      const amount = parseFloat(payment.amount);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    console.log(`Valor total recebido este mês: ${totalReceivedThisMonth}`);
    
    // Total em atraso
    const overdueLoans = this.getOverdueLoans();
    const totalOverdue = overdueLoans.reduce((sum, loan) => {
      try {
        const payments = this.getPaymentsByLoan(loan.id);
        const totalPaid = payments.reduce((paidSum, payment) => {
          const amount = parseFloat(payment.amount);
          return paidSum + (isNaN(amount) ? 0 : amount);
        }, 0);
        const totalDue = this.calculateTotalLoanAmount(loan);
        const difference = totalDue - totalPaid;
        return sum + (difference > 0 ? difference : 0);
      } catch (e) {
        console.warn('Erro ao calcular atraso para empréstimo:', loan.id, e);
        return sum;
      }
    }, 0);
    
    // Dados de empréstimos por status
    const loansByStatus = {
      active: this.loans.filter(loan => loan.status === 'active').length,
      overdue: this.loans.filter(loan => loan.status === 'overdue').length,
      defaulted: this.loans.filter(loan => loan.status === 'defaulted').length,
      paid: this.loans.filter(loan => loan.status === 'paid').length
    };
    
    return {
      totalLoaned,
      totalInterestAccrued,
      totalReceivedThisMonth,
      totalOverdue,
      loansByStatus
    };
  },
  
  // DADOS DE EXEMPLO
  
  // Dados de exemplo para mutuários
  getSampleBorrowers() {
    return [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 98765-4321',
        cpf: '123.456.789-00',
        address: 'Rua A, 123',
        city: 'São Paulo',
        createdAt: '2025-04-01T10:00:00.000Z'
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '(11) 98765-1234',
        cpf: '987.654.321-00',
        address: 'Rua B, 456',
        city: 'São Paulo',
        createdAt: '2025-04-05T14:30:00.000Z'
      },
      {
        id: '3',
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira@email.com',
        phone: '(21) 99876-5432',
        cpf: '456.789.123-00',
        address: 'Av. C, 789',
        city: 'Rio de Janeiro',
        createdAt: '2025-04-10T09:15:00.000Z'
      }
    ];
  },
  
  // Dados de exemplo para empréstimos
  getSampleLoans() {
    const today = new Date();
    
    // Empréstimo 1 - Ativo
    const loan1StartDate = new Date('2025-05-01');
    const loan1DueDate = new Date('2026-05-01');
    
    // Empréstimo 2 - Em atraso
    const loan2StartDate = new Date('2025-04-27');
    const loan2DueDate = new Date('2026-04-27');
    
    // Empréstimo 3 - Ativo
    const loan3StartDate = new Date('2025-04-15');
    const loan3DueDate = new Date('2026-04-15');
    
    return [
      {
        id: '1',
        borrowerId: '1',
        amount: 5000,
        interestRate: 5,
        term: 12, // meses
        startDate: loan1StartDate.toISOString(),
        dueDate: loan1DueDate.toISOString(),
        nextPaymentDate: new Date('2025-05-07').toISOString(),
        paymentFrequency: 'monthly',
        description: 'Empréstimo para reforma residencial',
        status: 'active',
        createdAt: loan1StartDate.toISOString()
      },
      {
        id: '2',
        borrowerId: '2',
        amount: 10000,
        interestRate: 5,
        term: 12, // meses
        startDate: loan2StartDate.toISOString(),
        dueDate: loan2DueDate.toISOString(),
        nextPaymentDate: new Date('2025-04-27').toISOString(), // Atrasado
        paymentFrequency: 'monthly',
        description: 'Empréstimo para compra de automóvel',
        status: 'overdue',
        createdAt: loan2StartDate.toISOString()
      },
      {
        id: '3',
        borrowerId: '3',
        amount: 20000,
        interestRate: 5,
        term: 24, // meses
        startDate: loan3StartDate.toISOString(),
        dueDate: loan3DueDate.toISOString(),
        nextPaymentDate: new Date('2025-06-02').toISOString(),
        paymentFrequency: 'monthly',
        description: 'Empréstimo para negócio',
        status: 'active',
        createdAt: loan3StartDate.toISOString()
      }
    ];
  },
  
  // Dados de exemplo para pagamentos
  getSamplePayments() {
    return [
      {
        id: '1',
        loanId: '1',
        amount: 437.50,
        date: '2025-04-01T10:30:00.000Z',
        method: 'transfer',
        type: 'scheduled',
        notes: 'Primeiro pagamento',
        createdAt: '2025-04-01T10:30:00.000Z'
      },
      {
        id: '2',
        loanId: '2',
        amount: 525.00,
        date: '2025-03-27T14:45:00.000Z',
        method: 'cash',
        type: 'scheduled',
        notes: 'Primeiro pagamento',
        createdAt: '2025-03-27T14:45:00.000Z'
      },
      {
        id: '3',
        loanId: '3',
        amount: 866.67,
        date: '2025-03-15T09:20:00.000Z',
        method: 'pix',
        type: 'scheduled',
        notes: 'Primeiro pagamento',
        createdAt: '2025-03-15T09:20:00.000Z'
      },
      {
        id: '4',
        loanId: '1',
        amount: 437.50,
        date: '2025-05-07T10:00:00.000Z',
        method: 'transfer',
        type: 'scheduled',
        notes: 'Segundo pagamento',
        createdAt: '2025-05-07T10:00:00.000Z'
      },
      {
        id: '5',
        loanId: '3',
        amount: 866.67,
        date: '2025-04-15T11:30:00.000Z',
        method: 'pix',
        type: 'scheduled',
        notes: 'Segundo pagamento',
        createdAt: '2025-04-15T11:30:00.000Z'
      },
      {
        id: '6',
        loanId: '3',
        amount: 866.67,
        date: '2025-05-15T14:00:00.000Z',
        method: 'pix',
        type: 'scheduled',
        notes: 'Terceiro pagamento',
        createdAt: '2025-05-15T14:00:00.000Z'
      },
      {
        id: '7',
        loanId: '3',
        amount: 866.67,
        date: '2025-06-02T09:00:00.000Z',
        method: 'pix',
        type: 'scheduled',
        notes: 'Quarto pagamento',
        createdAt: '2025-06-02T09:00:00.000Z'
      }
    ];
  },
  
  // Exportar todos os dados
  exportAllData() {
    const data = {
      borrowers: this.borrowers,
      loans: this.loans,
      archivedLoans: this.archivedLoans,
      payments: this.payments,
      settings: AppState.settings,
      exportDate: new Date().toISOString()
    };
    
    return JSON.stringify(data, null, 2);
  },
  
  // Importar todos os dados
  importAllData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.borrowers) {
        this.borrowers = data.borrowers;
      }
      
      if (data.loans) {
        this.loans = data.loans;
      }
      
      if (data.archivedLoans) {
        this.archivedLoans = data.archivedLoans;
      }
      
      if (data.payments) {
        this.payments = data.payments;
      }
      
      if (data.settings) {
        AppState.settings = { ...AppState.settings, ...data.settings };
      }
      
      // Salvar tudo no localStorage
      this.saveToStorage('all');
      
      return true;
    } catch (error) {
      console.error('Erro ao importar dados:', error);
      return false;
    }
  }
};

// Inicializar dados ao carregar o arquivo
DataStore.init();