

// Obtém a referência para o elemento do subtítulo
var subtitulo = document.getElementById("subtitulo");

// Define o número inicial de vagas disponíveis
var vagasDisponiveis;

// Verifica se o cookie existe e define o número de vagas de acordo com o valor armazenado
if (document.cookie.includes("vagasDisponiveis=")) {
  vagasDisponiveis = parseInt(getCookie("vagasDisponiveis"));
} else {
  vagasDisponiveis = 90;
}

// Função que atualiza o texto do subtítulo com o número de vagas restantes
function atualizarVagas() {
  // Calcula o número de vagas restantes
  vagasDisponiveis--;
  var vagasRestantes = Math.max(0, vagasDisponiveis - 10);

  // Armazena o número de vagas restantes em um cookie válido por 24 horas
  setCookie("vagasDisponiveis", vagasDisponiveis, 24);

  // Atualiza o texto do subtítulo de acordo com o número de vagas restantes
  if (vagasRestantes == 0) {
    subtitulo.textContent = "(Atenção: restam apenas 1 vagas)";
  } else if (vagasRestantes == 1) {
    subtitulo.textContent = "Apenas 1 vaga restante";
  } else {
    subtitulo.textContent = "(Atenção: restam apenas " + vagasRestantes + " vagas)";
  }
}

// Inicia a contagem regressiva
atualizarVagas();
setInterval(atualizarVagas, 10000); // chama a função atualizarVagas a cada 10 segundos (10000 ms)


  }
  return "";
}