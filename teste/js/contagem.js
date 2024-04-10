

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

// Função para criar um cookie
function setCookie(nome, valor, duracaoHoras) {
  var dataExpiracao = new Date();
  dataExpiracao.setTime(dataExpiracao.getTime() + (duracaoHoras * 60 * 60 * 1000));
  var cookie = nome + "=" + valor + ";expires=" + dataExpiracao.toUTCString() + ";path=/";
  document.cookie = cookie;
}

// Função para obter o valor de um cookie
function getCookie(nome) {
  var name = nome + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var partesCookie = decodedCookie.split(';');
  for(var i = 0; i < partesCookie.length; i++) {
    var parte = partesCookie[i];
    while (parte.charAt(0) == ' ') {
      parte = parte.substring(1);
    }
    if (parte.indexOf(name) == 0) {
      return parte.substring(name.length, parte.length);
    }
  }
  return "";
}