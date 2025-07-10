/**
 * LoanBuddy - Módulo de Gráficos
 * Responsável por criar e atualizar os gráficos da aplicação
 */

// Namespace para funções de gráficos
const Charts = {
  // Referências aos objetos de gráficos
  loanStatusChart: null,
  paymentTrendsChart: null,
  
  // Inicializar todos os gráficos
  initializeCharts() {
    console.log('Inicializando gráficos...');
    
    // Inicializar gráficos individuais
    this.initLoanStatusChart();
    this.initPaymentTrendsChart();
  },
  
  // Atualizar todos os gráficos
  updateCharts() {
    this.updateLoanStatusChart();
    this.updatePaymentTrendsChart();
  },
  
  // Inicializar gráfico de status de empréstimos (gráfico de pizza)
  initLoanStatusChart() {
    const ctx = document.getElementById('loanStatusChart')?.getContext('2d');
    if (!ctx) return;
    
    // Obter dados para o gráfico
    const loans = DataStore.getLoans();
    
    // Contar empréstimos por status
    const statusCounts = {
      active: loans.filter(loan => loan.status === 'active').length,
      overdue: loans.filter(loan => loan.status === 'overdue').length,
      paid: loans.filter(loan => loan.status === 'paid').length,
      defaulted: loans.filter(loan => loan.status === 'defaulted').length
    };
    
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
    
    console.log('Gráfico de status de empréstimos inicializado');
  },
  
  // Atualizar gráfico de status de empréstimos
  updateLoanStatusChart() {
    if (!this.loanStatusChart) return;
    
    // Obter dados atualizados
    const loans = DataStore.getLoans();
    
    // Contar empréstimos por status
    const statusCounts = {
      active: loans.filter(loan => loan.status === 'active').length,
      overdue: loans.filter(loan => loan.status === 'overdue').length,
      paid: loans.filter(loan => loan.status === 'paid').length,
      defaulted: loans.filter(loan => loan.status === 'defaulted').length
    };
    
    // Atualizar dados do gráfico
    this.loanStatusChart.data.datasets[0].data = [
      statusCounts.active,
      statusCounts.overdue,
      statusCounts.paid,
      statusCounts.defaulted
    ];
    
    // Atualizar gráfico
    this.loanStatusChart.update();
    
    console.log('Gráfico de status de empréstimos atualizado');
  },
  
  // Inicializar gráfico de tendências de pagamentos (gráfico de linha)
  initPaymentTrendsChart() {
    const ctx = document.getElementById('paymentTrendsChart')?.getContext('2d');
    if (!ctx) return;
    
    // Obter dados para o gráfico
    const payments = DataStore.getPayments();
    
    // Processar dados para o gráfico
    const { months, totals } = this.processPaymentData(payments);
    
    // Definir configuração do gráfico
    const config = {
      type: 'line',
      data: {
        labels: months,
        datasets: [{
          label: 'Total de Pagamentos',
          data: totals,
          backgroundColor: 'rgba(91, 33, 182, 0.1)',
          borderColor: '#7c3aed',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#7c3aed',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
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
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw || 0;
                return `Total: ${new Intl.NumberFormat('pt-BR', {
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
    this.paymentTrendsChart = new Chart(ctx, config);
    
    console.log('Gráfico de tendências de pagamentos inicializado');
  },
  
  // Atualizar gráfico de tendências de pagamentos
  updatePaymentTrendsChart() {
    if (!this.paymentTrendsChart) return;
    
    // Obter dados atualizados
    const payments = DataStore.getPayments();
    
    // Processar dados para o gráfico
    const { months, totals } = this.processPaymentData(payments);
    
    // Atualizar dados do gráfico
    this.paymentTrendsChart.data.labels = months;
    this.paymentTrendsChart.data.datasets[0].data = totals;
    
    // Atualizar gráfico
    this.paymentTrendsChart.update();
    
    console.log('Gráfico de tendências de pagamentos atualizado');
  },
  
  // Processar dados de pagamentos para o gráfico de tendências
  processPaymentData(payments) {
    // Ordenar pagamentos por data
    payments.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Obter últimos 6 meses
    const today = new Date();
    const months = [];
    const monthTotals = {};
    
    // Adicionar os últimos 6 meses ao array e inicializar totais
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${month.getFullYear()}-${month.getMonth() + 1}`;
      const monthName = month.toLocaleString('pt-BR', { month: 'short' });
      
      months.push(monthName);
      monthTotals[monthKey] = 0;
    }
    
    // Calcular totais por mês
    payments.forEach(payment => {
      const date = new Date(payment.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (monthTotals[monthKey] !== undefined) {
        monthTotals[monthKey] += payment.amount;
      }
    });
    
    // Converter totais para array na ordem correta
    const totals = Object.values(monthTotals);
    
    return { months, totals };
  },
  
  // Verificar tema e atualizar cores dos gráficos
  updateChartsTheme(theme) {
    try {
      console.log(`Tentando atualizar tema dos gráficos para: ${theme}`);
      
      // Validar se os gráficos existem
      if (!this.loanStatusChart && !this.paymentTrendsChart) {
        console.log('Nenhum gráfico inicializado ainda para atualizar o tema');
        return;
      }
      
      const isDark = theme === 'dark';
      const textColor = isDark ? '#cbd5e1' : '#64748b';
      const gridColor = isDark ? '#334155' : '#e2e8f0';
      
      // Atualizar cores do gráfico de tendências de pagamentos
      if (this.paymentTrendsChart) {
        // Verificar se as escalas existem
        if (!this.paymentTrendsChart.options.scales) {
          console.warn('Gráfico de tendências não tem escalas definidas');
          this.paymentTrendsChart.options.scales = { x: {}, y: {} };
        }
        
        // Verificar se as propriedades específicas existem
        if (!this.paymentTrendsChart.options.scales.x) {
          this.paymentTrendsChart.options.scales.x = {};
        }
        
        if (!this.paymentTrendsChart.options.scales.y) {
          this.paymentTrendsChart.options.scales.y = {};
        }
        
        // Configurar as propriedades
        this.paymentTrendsChart.options.scales.x.grid = { color: gridColor };
        this.paymentTrendsChart.options.scales.y.grid = { color: gridColor };
        this.paymentTrendsChart.options.scales.x.ticks = { color: textColor };
        this.paymentTrendsChart.options.scales.y.ticks = { color: textColor };
        
        // Atualizar o gráfico
        this.paymentTrendsChart.update();
        console.log('Gráfico de tendências de pagamentos atualizado para o tema', theme);
      }
      
      // Atualizar cores do gráfico de status de empréstimos
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
        
        // Configurar as propriedades
        this.loanStatusChart.options.plugins.legend.labels.color = textColor;
        
        // Atualizar o gráfico
        this.loanStatusChart.update();
        console.log('Gráfico de status de empréstimos atualizado para o tema', theme);
      }
      
      console.log(`Tema dos gráficos atualizado com sucesso para: ${theme}`);
    } catch (error) {
      console.error('Erro ao atualizar tema dos gráficos:', error);
    }
  }
};