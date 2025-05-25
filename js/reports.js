/**
 * LoanBuddy - Módulo de Relatórios
 * Responsável pelas funcionalidades da página de relatórios
 */

// Namespace para funções de relatórios
const Reports = {
  // Referências aos objetos de gráficos
  loanStatusChart: null,
  paymentsTrendChart: null,
  
  // Dados e configurações
  currentReportType: 'summary',
  currentPeriod: 'month',
  
  // Inicializar o módulo de relatórios
  init() {
    console.log('Inicializando módulo de relatórios...');
    
    try {
      // Inicializar event listeners
      this.setupEventListeners();
      
      // Inicializar gráficos de relatório
      this.initReportCharts();
      
      // Carregar dados dos relatórios
      this.loadReportData();
      
      console.log('Módulo de relatórios inicializado com sucesso!');
    } catch (error) {
      console.error('Erro ao inicializar módulo de relatórios:', error);
    }
  },
  
  // Configurar event listeners
  setupEventListeners() {
    // Listener para seleção de tipo de relatório
    const reportTypeSelect = document.getElementById('report-type');
    if (reportTypeSelect) {
      reportTypeSelect.addEventListener('change', (e) => {
        this.currentReportType = e.target.value;
        this.switchTab(this.currentReportType);
        this.loadReportData();
      });
    }
    
    // Listener para seleção de período
    const reportPeriodSelect = document.getElementById('report-period');
    if (reportPeriodSelect) {
      reportPeriodSelect.addEventListener('change', (e) => {
        this.currentPeriod = e.target.value;
        this.loadReportData();
        this.updatePeriodLabels();
      });
    }
    
    // Listener para botão de impressão
    const printBtn = document.getElementById('print-report-btn');
    if (printBtn) {
      printBtn.addEventListener('click', this.printReport.bind(this));
    }
    
    // Listener para botão de exportação PDF
    const exportBtn = document.getElementById('export-pdf-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', this.exportToPDF.bind(this));
    }
    
    // Listeners para abas de relatório
    const reportTabs = document.querySelectorAll('.report-tab');
    reportTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        this.currentReportType = tabName;
        document.getElementById('report-type').value = tabName;
        this.switchTab(tabName);
      });
    });
    
    // Listeners para botões de relatórios adicionais
    const reportButtons = document.querySelectorAll('.report-actions button');
    reportButtons.forEach(button => {
      button.addEventListener('click', () => {
        const reportType = button.dataset.report;
        this.generateSpecialReport(reportType);
      });
    });
  },
  
  // Mudar entre abas de relatório
  switchTab(tabName) {
    // Atualizar tabs
    const tabs = document.querySelectorAll('.report-tab');
    tabs.forEach(tab => {
      if (tab.dataset.tab === tabName) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // Atualizar conteúdo
    const tabContents = document.querySelectorAll('.report-tab-content');
    tabContents.forEach(content => {
      if (content.id === `${tabName}-tab`) {
        content.classList.add('active');
      } else {
        content.classList.remove('active');
      }
    });
    
    // Atualizar dados específicos da aba
    this.loadReportData();
  },
  
  // Inicializar gráficos específicos para relatórios
  initReportCharts() {
    try {
      console.log('Inicializando gráficos de relatórios...');
      
      // Se já existirem gráficos, destruí-los primeiro para evitar duplicação
      if (this.loanStatusChart) {
        console.log('Destruindo gráfico de status de empréstimos existente');
        this.loanStatusChart.destroy();
        this.loanStatusChart = null;
      }
      
      if (this.paymentsTrendChart) {
        console.log('Destruindo gráfico de tendências de pagamentos existente');
        this.paymentsTrendChart.destroy();
        this.paymentsTrendChart = null;
      }
      
      // Verificar se os elementos canvas existem no DOM
      const loanStatusCanvas = document.getElementById('reportLoanStatusChart');
      const paymentsTrendCanvas = document.getElementById('reportPaymentsTrendChart');
      
      if (!loanStatusCanvas) {
        console.error('Elemento canvas para gráfico de status não encontrado no DOM');
      } else {
        // Inicializar gráfico de status de empréstimos
        setTimeout(() => {
          this.initLoanStatusChart();
        }, 100);
      }
      
      if (!paymentsTrendCanvas) {
        console.error('Elemento canvas para gráfico de tendências não encontrado no DOM');
      } else {
        // Inicializar gráfico de tendências de pagamentos com um pequeno delay
        setTimeout(() => {
          this.initPaymentsTrendChart();
        }, 200);
      }
      
      // Aplicar tema atual aos gráficos recém-inicializados após um breve delay
      setTimeout(() => {
        const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
        console.log(`Aplicando tema ${currentTheme} aos gráficos de relatórios na inicialização`);
        this.updateChartsTheme(currentTheme);
        console.log('Gráficos de relatórios inicializados com sucesso');
      }, 300);
      
    } catch (error) {
      console.error('Erro ao inicializar gráficos de relatórios:', error);
      console.error('Detalhes do erro:', error.message);
      console.error('Stack trace:', error.stack);
    }
  },
  
  // Inicializar gráfico de status de empréstimos
  initLoanStatusChart() {
    try {
      console.log('Iniciando gráfico de status de empréstimos...');
      const ctx = document.getElementById('reportLoanStatusChart');
      
      if (!ctx) {
        console.error('Elemento de canvas não encontrado para o gráfico de status');
        return;
      }
      
      // Garantir que o canvas seja visível
      if (ctx.offsetParent === null) {
        console.log('Canvas do gráfico de status não está visível, não inicializando...');
        return;
      }
      
      // Verificar se o elemento é um canvas
      if (!(ctx instanceof HTMLCanvasElement)) {
        console.error('Elemento não é um canvas válido:', ctx);
        return;
      }
      
      // Verificar tamanho do canvas
      if (ctx.width === 0 || ctx.height === 0) {
        console.warn('Canvas do gráfico de status tem dimensões zero, ajustando...');
        ctx.width = 400;
        ctx.height = 300;
      }
      
      // Limpar o canvas antes de desenhar
      const context = ctx.getContext('2d');
      if (!context) {
        console.error('Não foi possível obter contexto 2d do canvas');
        return;
      }
      
      context.clearRect(0, 0, ctx.width, ctx.height);
      
      // Obter dados para o gráfico
      const loans = DataStore.getLoans();
      console.log('Empréstimos carregados para o gráfico:', loans.length);
      
      // Contar empréstimos por status
      const statusCounts = {
        active: loans.filter(loan => loan.status === 'active').length,
        overdue: loans.filter(loan => loan.status === 'overdue').length,
        paid: loans.filter(loan => loan.status === 'paid').length,
        defaulted: loans.filter(loan => loan.status === 'defaulted').length
      };
      
      console.log('Contagem de status:', statusCounts);
      
      // Definir configuração do gráfico
      const config = {
      type: 'doughnut',
      data: {
        labels: ['Ativos', 'Em Atraso', 'Pagos', 'Inadimplentes'],
        datasets: [{
          data: [
            statusCounts.active,
            statusCounts.overdue,
            statusCounts.paid,
            statusCounts.defaulted
          ],
          backgroundColor: [
            '#10b981', // verde para ativos
            '#f59e0b', // âmbar para em atraso
            '#3b82f6', // azul para pagos
            '#ef4444'  // vermelho para inadimplentes
          ],
          borderColor: 'transparent',
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              boxWidth: 12,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        cutout: '70%'
      }
    };
    
    // Criar gráfico
    this.loanStatusChart = new Chart(ctx, config);
    
    console.log('Gráfico de status de empréstimos de relatório inicializado');
    
    // Atualizar a tabela de status
    this.updateStatusTable(statusCounts);
      
    } catch (error) {
      console.error('Erro ao inicializar gráfico de status de empréstimos:', error);
    }
  },
  
  // Inicializar gráfico de tendências de pagamentos
  initPaymentsTrendChart() {
    try {
      console.log('Iniciando gráfico de tendências de pagamentos...');
      const ctx = document.getElementById('reportPaymentsTrendChart');
      
      if (!ctx) {
        console.error('Elemento de canvas não encontrado para o gráfico de tendências');
        return;
      }
      
      // Garantir que o canvas seja visível
      if (ctx.offsetParent === null) {
        console.log('Canvas do gráfico de tendências não está visível, não inicializando...');
        return;
      }
      
      // Verificar se o elemento é um canvas
      if (!(ctx instanceof HTMLCanvasElement)) {
        console.error('Elemento não é um canvas válido:', ctx);
        return;
      }
      
      // Verificar tamanho do canvas
      if (ctx.width === 0 || ctx.height === 0) {
        console.warn('Canvas do gráfico de tendências tem dimensões zero, ajustando...');
        ctx.width = 400;
        ctx.height = 300;
      }
      
      // Limpar o canvas antes de desenhar
      const context = ctx.getContext('2d');
      if (!context) {
        console.error('Não foi possível obter contexto 2d do canvas');
        return;
      }
      
      context.clearRect(0, 0, ctx.width, ctx.height);
    
    // Obter pagamentos filtrados por período
    const payments = this.getFilteredPayments();
    
    // Processar dados para o gráfico
    const chartData = this.processPaymentsChartData(payments);
    
    // Definir configuração do gráfico
    const config = {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Principal',
            data: chartData.principal,
            backgroundColor: '#60a5fa',
            borderColor: '#3b82f6',
            borderWidth: 1
          },
          {
            label: 'Juros',
            data: chartData.interest,
            backgroundColor: '#f87171',
            borderColor: '#ef4444',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(value);
              }
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw || 0;
                return `${context.dataset.label}: ${new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(value)}`;
              }
            }
          }
        }
      }
    };
    
    // Criar gráfico
    this.paymentsTrendChart = new Chart(ctx, config);
    
    console.log('Gráfico de tendências de pagamentos de relatório inicializado');
    
    } catch (error) {
      console.error('Erro ao inicializar gráfico de tendências de pagamentos:', error);
    }
  },
  
  // Obter pagamentos filtrados por período
  getFilteredPayments() {
    const now = new Date();
    let startDate = new Date();
    
    switch(this.currentPeriod) {
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date(0); // Desde o início dos tempos
        break;
    }
    
    // Filtrar pagamentos pelo período selecionado
    const payments = DataStore.getPayments().filter(payment => {
      const paymentDate = new Date(payment.date);
      return paymentDate >= startDate && paymentDate <= now;
    });
    
    return payments;
  },
  
  // Processar dados de pagamentos para o gráfico
  processPaymentsChartData(payments) {
    // Verificar se os pagamentos são válidos
    if (!Array.isArray(payments) || payments.length === 0) {
      console.warn('Nenhum pagamento disponível para processar dados do gráfico');
      return {
        labels: [],
        principal: [],
        interest: []
      };
    }
    
    // Agrupar pagamentos por mês
    const paymentsByMonth = {};
    
    payments.forEach(payment => {
      try {
        // Obter data de pagamento de forma segura
        let date;
        try {
          date = new Date(payment.date || payment.paymentDate);
          if (isNaN(date.getTime())) {
            console.warn('Data de pagamento inválida:', payment);
            return; // Pular este pagamento
          }
        } catch (e) {
          console.warn('Erro ao processar data de pagamento:', e);
          return; // Pular este pagamento
        }
        
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        let monthName;
        try {
          monthName = date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' });
        } catch (e) {
          // Fallback para formato mais simples em caso de erro
          monthName = `${date.getMonth() + 1}/${date.getFullYear().toString().substring(2)}`;
        }
        
        if (!paymentsByMonth[monthKey]) {
          paymentsByMonth[monthKey] = {
            label: monthName,
            total: 0,
            principal: 0,
            interest: 0
          };
        }
        
        // Obter valores com validação
        const amountValue = parseFloat(payment.amount);
        if (!isNaN(amountValue)) {
          paymentsByMonth[monthKey].total += amountValue;
          
          // Verificar se o pagamento tem dados de principal/interest
          if (payment.principal !== undefined && payment.interest !== undefined) {
            const principalValue = parseFloat(payment.principal);
            const interestValue = parseFloat(payment.interest);
            
            if (!isNaN(principalValue)) {
              paymentsByMonth[monthKey].principal += principalValue;
            }
            
            if (!isNaN(interestValue)) {
              paymentsByMonth[monthKey].interest += interestValue;
            }
          } else {
            // Caso não tenha principal/interest, dividir o valor (90% principal, 10% juros)
            paymentsByMonth[monthKey].principal += amountValue * 0.9;
            paymentsByMonth[monthKey].interest += amountValue * 0.1;
          }
        }
      } catch (e) {
        console.error('Erro ao processar pagamento para gráfico:', e);
      }
    });
    
    // Verificar se temos algum mês com dados
    if (Object.keys(paymentsByMonth).length === 0) {
      console.warn('Nenhum mês válido encontrado nos pagamentos');
      return {
        labels: [],
        principal: [],
        interest: []
      };
    }
    
    // Converter para arrays
    const sortedMonths = Object.keys(paymentsByMonth).sort();
    const labels = sortedMonths.map(key => paymentsByMonth[key].label);
    const principal = sortedMonths.map(key => paymentsByMonth[key].principal);
    const interest = sortedMonths.map(key => paymentsByMonth[key].interest);
    
    return { labels, principal, interest };
  },
  
  // Atualizar tabela de status
  updateStatusTable(statusCounts) {
    const tableBody = document.getElementById('status-table-body');
    if (!tableBody) return;
    
    const total = statusCounts.active + statusCounts.overdue + statusCounts.paid + statusCounts.defaulted;
    
    const getPercentage = (count) => {
      return total > 0 ? Math.round((count / total) * 100) : 0;
    };
    
    // Atualizar linhas da tabela
    tableBody.innerHTML = `
      <tr>
        <td><span class="status active">Ativos</span></td>
        <td>${statusCounts.active}</td>
        <td>${getPercentage(statusCounts.active)}%</td>
      </tr>
      <tr>
        <td><span class="status overdue">Em Atraso</span></td>
        <td>${statusCounts.overdue}</td>
        <td>${getPercentage(statusCounts.overdue)}%</td>
      </tr>
      <tr>
        <td><span class="status paid">Pagos</span></td>
        <td>${statusCounts.paid}</td>
        <td>${getPercentage(statusCounts.paid)}%</td>
      </tr>
      <tr>
        <td><span class="status defaulted">Inadimplentes</span></td>
        <td>${statusCounts.defaulted}</td>
        <td>${getPercentage(statusCounts.defaulted)}%</td>
      </tr>
    `;
  },
  
  // Carregar dados de empréstimos para a tabela de relatório
  loadLoansTable() {
    const tableBody = document.getElementById('loans-table-body');
    if (!tableBody) return;
    
    // Obter empréstimos
    const loans = DataStore.getLoans();
    
    // Verificar se os dados existem
    if (!Array.isArray(loans) || loans.length === 0) {
      // Exibir mensagem de tabela vazia
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Nenhum empréstimo encontrado</td></tr>';
      return;
    }
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    // Adicionar empréstimos à tabela
    loans.forEach(loan => {
      try {
        // Obter nome do mutuário
        const borrower = DataStore.getBorrower(loan.borrowerId);
        const borrowerName = borrower ? borrower.name : 'Desconhecido';
        
        // Formatar valores - usar amount como fallback para principal
        const principalValue = loan.principal !== undefined ? loan.principal : loan.amount;
        const principalAmount = parseFloat(principalValue);
        
        const principal = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(isNaN(principalAmount) ? 0 : principalAmount);
        
        // Verificar e converter taxa de juros
        const interestRateValue = parseFloat(loan.interestRate);
        const interestRate = new Intl.NumberFormat('pt-BR', {
          style: 'percent',
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }).format((isNaN(interestRateValue) ? 0 : interestRateValue) / 100);
        
        // Usar startDate como fallback para issueDate e formatar datas de forma segura
        let issueDate = 'N/A';
        try {
          const issueDateValue = loan.issueDate || loan.startDate || loan.createdAt;
          if (issueDateValue) {
            issueDate = new Date(issueDateValue).toLocaleDateString('pt-BR');
          }
        } catch (e) {
          console.warn('Erro ao formatar data de emissão do empréstimo:', e);
        }
        
        let dueDate = 'N/A';
        try {
          if (loan.dueDate) {
            dueDate = new Date(loan.dueDate).toLocaleDateString('pt-BR');
          }
        } catch (e) {
          console.warn('Erro ao formatar data de vencimento do empréstimo:', e);
        }
        
        // Mapear status para texto em português
        const statusMap = {
          'active': 'Ativo',
          'overdue': 'Em Atraso',
          'paid': 'Pago',
          'defaulted': 'Inadimplente'
        };
        
        const statusText = statusMap[loan.status] || 'Desconhecido';
      
      // Criar linha da tabela
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${borrowerName}</td>
        <td>${principal}</td>
        <td>${interestRate} a.m.</td>
        <td>${issueDate}</td>
        <td>${dueDate}</td>
        <td><span class="status ${loan.status}">${statusText}</span></td>
      `;
      
      tableBody.appendChild(row);
      
      } catch (e) {
        console.error('Erro ao processar empréstimo para tabela:', e);
      }
    });
  },
  
  // Carregar dados de pagamentos para a tabela de relatório
  loadPaymentsTable() {
    const tableBody = document.getElementById('payments-table-body');
    if (!tableBody) return;
    
    // Obter pagamentos filtrados por período
    const payments = this.getFilteredPayments();
    
    // Limpar tabela
    tableBody.innerHTML = '';
    
    // Verificar se existem pagamentos
    if (!Array.isArray(payments) || payments.length === 0) {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td colspan="5" class="empty-table">Nenhum pagamento encontrado no período selecionado</td>
      `;
      tableBody.appendChild(row);
      return;
    }
    
    // Adicionar pagamentos à tabela
    payments.forEach(payment => {
      try {
        // Obter informações do empréstimo e mutuário
        const loan = DataStore.getLoan(payment.loanId);
        const borrower = loan ? DataStore.getBorrower(loan.borrowerId) : null;
        const borrowerName = borrower ? borrower.name : 'Desconhecido';
        
        // Formatar valores com validação
        const amountValue = parseFloat(payment.amount);
        const amount = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(isNaN(amountValue) ? 0 : amountValue);
        
        // Os dados de pagamento da versão HTML podem não ter principal/interest separados
        // Nesse caso, vamos calcular uma estimativa baseada na taxa de juros do empréstimo
        let principalValue = 0;
        let interestValue = 0;
        
        if (payment.principal !== undefined && payment.interest !== undefined) {
          principalValue = parseFloat(payment.principal);
          interestValue = parseFloat(payment.interest);
        } else if (loan && !isNaN(amountValue)) {
          // Estimar principal/juros - aproximação simples
          const interestRateValue = parseFloat(loan.interestRate);
          if (!isNaN(interestRateValue)) {
            // 90% para principal e 10% para juros como estimativa genérica
            // Em uma aplicação real, este cálculo seria muito mais preciso
            principalValue = amountValue * 0.9;
            interestValue = amountValue * 0.1;
          } else {
            principalValue = amountValue;
          }
        }
        
        const principal = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(isNaN(principalValue) ? 0 : principalValue);
        
        const interest = new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(isNaN(interestValue) ? 0 : interestValue);
        
        // Formatar data de forma segura
        let formattedDate = 'N/A';
        try {
          const paymentDate = new Date(payment.date || payment.paymentDate);
          if (!isNaN(paymentDate.getTime())) {
            formattedDate = paymentDate.toLocaleDateString('pt-BR');
          }
        } catch (e) {
          console.warn('Erro ao formatar data de pagamento:', e);
        }
        
        // Criar linha da tabela
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${formattedDate}</td>
          <td>${borrowerName}</td>
          <td>${amount}</td>
          <td>${principal}</td>
          <td>${interest}</td>
        `;
        
        tableBody.appendChild(row);
      } catch (e) {
        console.error('Erro ao processar pagamento para tabela:', e);
      }
    });
  },
  
  // Atualizar métricas do relatório
  updateReportMetrics() {
    // Obter métricas
    const metrics = this.getReportMetrics();
    
    // Atualizar valores na interface
    document.getElementById('report-total-loaned').textContent = metrics.totalLoaned;
    document.getElementById('report-total-interest').textContent = metrics.totalInterest;
    document.getElementById('report-received-month').textContent = metrics.receivedMonth;
  },
  
  // Calcular métricas para o relatório
  getReportMetrics() {
    const loans = DataStore.getLoans();
    const payments = DataStore.getPayments();
    
    // Verificar se os dados estão disponíveis
    if (!Array.isArray(loans) || !Array.isArray(payments)) {
      console.error('Dados de empréstimos ou pagamentos não disponíveis para relatórios');
      // Retornar valores default formatados para evitar NaN
      return {
        totalLoaned: 'R$ 0,00',
        totalInterest: 'R$ 0,00',
        receivedMonth: 'R$ 0,00'
      };
    }
    
    // Total emprestado - usar amount como fallback para principal
    const totalLoaned = loans.reduce((total, loan) => {
      // Usar amount se principal não estiver definido
      const value = loan.principal !== undefined ? loan.principal : loan.amount;
      const amount = parseFloat(value);
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    // Total de juros acumulados - com validação
    const totalInterest = payments.reduce((total, payment) => {
      const interest = parseFloat(payment.interest || 0);
      return total + (isNaN(interest) ? 0 : interest);
    }, 0);
    
    // Total recebido no mês atual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const paymentsThisMonth = payments.filter(payment => {
      try {
        const paymentDate = new Date(payment.date || payment.paymentDate);
        return paymentDate >= firstDayOfMonth && paymentDate <= lastDayOfMonth;
      } catch (e) {
        console.warn('Data de pagamento inválida:', payment);
        return false;
      }
    });
    
    const receivedMonth = paymentsThisMonth.reduce((total, payment) => {
      const amount = parseFloat(payment.amount);
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    // Formatar valores
    const formatter = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
    
    return {
      totalLoaned: formatter.format(totalLoaned),
      totalInterest: formatter.format(totalInterest),
      receivedMonth: formatter.format(receivedMonth)
    };
  },
  
  // Atualizar todas as labels de período
  updatePeriodLabels() {
    const periodLabels = document.querySelectorAll('.report-period');
    
    let periodText = '';
    switch(this.currentPeriod) {
      case 'month':
        periodText = 'Último mês';
        break;
      case 'quarter':
        periodText = 'Últimos 3 meses';
        break;
      case 'year':
        periodText = 'Último ano';
        break;
      case 'all':
        periodText = 'Todo o período';
        break;
    }
    
    periodLabels.forEach(label => {
      label.textContent = `Período: ${periodText}`;
    });
  },
  
  // Carregar todos os dados do relatório
  loadReportData() {
    // Atualizar métricas
    this.updateReportMetrics();
    
    // Atualizar período
    this.updatePeriodLabels();
    
    // Atualizar tabelas
    this.loadLoansTable();
    this.loadPaymentsTable();
    
    // Atualizar gráficos
    if (this.paymentsTrendChart) {
      // Obter pagamentos filtrados
      const payments = this.getFilteredPayments();
      
      // Processar dados
      const chartData = this.processPaymentsChartData(payments);
      
      // Atualizar gráfico
      this.paymentsTrendChart.data.labels = chartData.labels;
      this.paymentsTrendChart.data.datasets[0].data = chartData.principal;
      this.paymentsTrendChart.data.datasets[1].data = chartData.interest;
      this.paymentsTrendChart.update();
    }
  },
  
  // Imprimir relatório atual
  printReport() {
    window.print();
  },
  
  // Exportar relatório para PDF
  exportToPDF() {
    // Simulação de exportação para PDF
    showToast('Exportando relatório para PDF...', 'info');
    
    // Simulação de processamento
    setTimeout(() => {
      showToast('Relatório exportado com sucesso!', 'success');
    }, 1500);
  },
  
  // Atualizar tema dos gráficos
  updateChartsTheme(theme) {
    try {
      console.log(`Tentando atualizar tema dos gráficos de relatórios para: ${theme}`);
      
      // Validar se os gráficos existem
      if (!this.loanStatusChart && !this.paymentsTrendChart) {
        console.log('Nenhum gráfico de relatório inicializado ainda para atualizar o tema');
        return;
      }
      
      // Configurações de cores baseadas no tema
      const isDark = theme === 'dark';
      const textColor = isDark ? '#e0e0e0' : '#333333';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
      
      // Atualizar gráfico de status de empréstimos se existir
      if (this.loanStatusChart) {
        // Verificar se as propriedades específicas existem
        if (!this.loanStatusChart.options.plugins) {
          this.loanStatusChart.options.plugins = {};
        }
        
        if (!this.loanStatusChart.options.plugins.legend) {
          this.loanStatusChart.options.plugins.legend = {};
        }
        
        if (!this.loanStatusChart.options.plugins.legend.labels) {
          this.loanStatusChart.options.plugins.legend.labels = {};
        }
        
        if (!this.loanStatusChart.options.plugins.tooltip) {
          this.loanStatusChart.options.plugins.tooltip = {};
        }
        
        // Configurar as propriedades
        this.loanStatusChart.options.plugins.legend.labels.color = textColor;
        this.loanStatusChart.options.plugins.tooltip.bodyColor = textColor;
        this.loanStatusChart.options.plugins.tooltip.titleColor = textColor;
        
        // Atualizar o gráfico
        this.loanStatusChart.update();
        console.log('Gráfico de status de empréstimos do relatório atualizado para o tema', theme);
      }
      
      // Atualizar gráfico de tendências de pagamentos se existir
      if (this.paymentsTrendChart) {
        // Verificar se as escalas existem
        if (!this.paymentsTrendChart.options.scales) {
          console.warn('Gráfico de tendências de pagamentos não tem escalas definidas');
          this.paymentsTrendChart.options.scales = { x: {}, y: {} };
        }
        
        // Verificar se as propriedades específicas existem
        if (!this.paymentsTrendChart.options.scales.x) {
          this.paymentsTrendChart.options.scales.x = {};
        }
        
        if (!this.paymentsTrendChart.options.scales.y) {
          this.paymentsTrendChart.options.scales.y = {};
        }
        
        if (!this.paymentsTrendChart.options.plugins) {
          this.paymentsTrendChart.options.plugins = {};
        }
        
        if (!this.paymentsTrendChart.options.plugins.legend) {
          this.paymentsTrendChart.options.plugins.legend = {};
        }
        
        if (!this.paymentsTrendChart.options.plugins.legend.labels) {
          this.paymentsTrendChart.options.plugins.legend.labels = {};
        }
        
        if (!this.paymentsTrendChart.options.plugins.tooltip) {
          this.paymentsTrendChart.options.plugins.tooltip = {};
        }
        
        // Configurar grid e ticks
        this.paymentsTrendChart.options.scales.x.grid = { 
          ...this.paymentsTrendChart.options.scales.x.grid,
          color: gridColor 
        };
        
        this.paymentsTrendChart.options.scales.y.grid = { 
          ...this.paymentsTrendChart.options.scales.y.grid,
          color: gridColor 
        };
        
        this.paymentsTrendChart.options.scales.x.ticks = { 
          ...this.paymentsTrendChart.options.scales.x.ticks,
          color: textColor 
        };
        
        this.paymentsTrendChart.options.scales.y.ticks = { 
          ...this.paymentsTrendChart.options.scales.y.ticks,
          color: textColor 
        };
        
        // Configurar propriedades de legenda e tooltip
        this.paymentsTrendChart.options.plugins.legend.labels.color = textColor;
        this.paymentsTrendChart.options.plugins.tooltip.bodyColor = textColor;
        this.paymentsTrendChart.options.plugins.tooltip.titleColor = textColor;
        
        // Atualizar o gráfico
        this.paymentsTrendChart.update();
        console.log('Gráfico de tendências de pagamentos do relatório atualizado para o tema', theme);
      }
      
      console.log('Tema dos gráficos de relatórios atualizado com sucesso para:', theme);
    } catch (error) {
      console.error('Erro ao atualizar tema dos gráficos de relatórios:', error);
      console.error('Detalhes do erro:', error.message);
      console.error('Stack trace:', error.stack);
    }
  },
  
  // Gerar relatório especial
  generateSpecialReport(reportType) {
    // Simulação de geração de relatório especial
    let reportName = '';
    
    switch(reportType) {
      case 'overdue':
        reportName = 'Empréstimos em Atraso';
        break;
      case 'borrowers':
        reportName = 'Análise de Mutuários';
        break;
      case 'financial':
        reportName = 'Demonstração de Resultados';
        break;
      case 'export':
        reportName = 'Exportação de Dados';
        break;
    }
    
    showToast(`Gerando relatório: ${reportName}...`, 'info');
    
    // Simulação de processamento
    setTimeout(() => {
      showToast(`Relatório "${reportName}" gerado com sucesso!`, 'success');
    }, 1500);
  },
  
  // Função mantida apenas para compatibilidade
  updateTheme(theme) {
    this.updateChartsTheme(theme);
  }
};