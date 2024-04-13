// Obtém a referência para o elemento do subtítulo
var subtitulo = document.getElementById("subtitulo");

// Define o número inicial de vagas disponíveis
var vagasDisponiveis = getCookie("vagasDisponiveis");
if (!vagasDisponiveis) {
  vagasDisponiveis = 50;
}
vagasDisponiveis = parseInt(vagasDisponiveis);

// Função que atualiza o texto do subtítulo com o número de vagas restantes
function atualizarVagas() {
  // Calcula o número de vagas restantes
  vagasDisponiveis--;
  var vagasRestantes = Math.max(0, vagasDisponiveis - 10);

  // Atualiza o texto do subtítulo de acordo com o número de vagas restantes
  if (vagasRestantes == 0) {
    subtitulo.textContent = "(Atenção: restam apenas 1 vagas)";
  } else if (vagasRestantes == 1) {
    subtitulo.textContent = "Apenas 1 vaga restante";
  } else {
    subtitulo.textContent = "(Atenção: restam apenas " + vagasRestantes + " vagas)";
  }

  // Define o cookie com o novo número de vagas disponíveis
  setCookie("vagasDisponiveis", vagasDisponiveis);
}

// Inicia a contagem regressiva
atualizarVagas();
setInterval(atualizarVagas, 1000); // chama a função atualizarVagas a cada segundo (1000 ms)

// Funções auxiliares para trabalhar com cookies
function setCookie(nome, valor) {
  document.cookie = nome + "=" + valor + "; path=/";
}

function getCookie(nome) {
  var nomeIgual = nome + "=";
  var cookies = document.cookie.split(';');
  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i].trim();
    if (cookie.indexOf(nomeIgual) == 0) {
      return cookie.substring(nomeIgual.length, cookie.length);
    }
  }
  return null;
}




// Função Cookies do Botão
function mostrarBotao() {
  var divBotao = document.getElementById("div-botao");
  divBotao.style.display = "block";
}

var botaoApareceu = getCookie("botaoApareceu");

if (botaoApareceu == null) {
  setCookie("botaoApareceu", "true", 7);
  setTimeout(mostrarBotao, 0);
} else {
  mostrarBotao();
}



function setCookie(nome, valor, dias) {
  var data = new Date();
  data.setTime(data.getTime() + (dias * 24 * 60 * 60 * 1000));
  var expires = "expires=" + data.toUTCString();
  document.cookie = nome + "=" + valor + ";" + expires + ";path=/";
}

function getCookie(nome) {
  var nomeCookie = nome + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var cookies = decodedCookie.split(';');
  for(var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    while (cookie.charAt(0) == ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(nomeCookie) == 0) {
      return cookie.substring(nomeCookie.length, cookie.length);
    }
  }
  return null;
}

