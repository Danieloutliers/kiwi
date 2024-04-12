// Obtém a referência para o elemento do subtítulo
var subtitulo = document.getElementById("subtitulo");

// Define o número inicial de vagas disponíveis
var vagasDisponiveis = getCookie("vagasDisponiveis");
if (!vagasDisponiveis) {
  vagasDisponiveis = 90;
}
vagasDisponiveis = parseInt(vagasDisponiveis);

// Função que atualiza o texto do subtítulo com o número de vagas restantes
function atualizarVagas() {
  // Calcula o número de vagas restantes
  vagasDisponiveis--;
  var vagasRestantes = Math.max(0, vagasDisponiveis - 10);

  // Atualiza o texto do subtítulo de acordo com o número de vagas restantes
  if (vagasRestantes == 0) {
    subtitulo.textContent = "As vagas se esgotaram!";
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
setInterval(atualizarVagas, 10000); // chama a função atualizarVagas a cada segundo (1000 ms)

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

function loadMore() {
    $('#more').show()
    $('.fb-comments-loadmore').hide().remove()
}
$(document).ready(function() {
    $('date').each(function() {
        if ($(this).attr('data-date-minus')) {
            $(this).html(dateMinus($(this).attr('data-date-minus')))
        }
    })
})

function dateMinus(what) {
    var today = Date.now()
    var nw = today - what * 10000
    var newd = new Date()
    newd.setTime(nw)
    var mthName = ['Janeiro', 'Fevereiro', 'MarÃ§o', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    var mthNm = mthName[newd.getMonth()]
    return (newd.getDate() +
        ' de ' +
        mthNm +
        ' de ' +
        newd.getFullYear() +
        ' ' +
        newd.getHours() +
        ':' +
        round(newd.getMinutes()))
}

function round(what) {
    if (what < 10) {
        return '0' + what
    } else {
        return what
    }
}
$('like').on('click', function() {
    if ($(this).hasClass('liked')) {
        $(this).parents('.fb-comments-wrapper, .fb-comments-reply-wrapper').find('likes').text(parseInt($(this).parents('.fb-comments-wrapper, .fb-comments-reply-wrapper').find('likes').text()) - 1)
        $(this).removeClass('liked')
        $(this).text('Curtir')
    } else {
        $(this).parents('.fb-comments-wrapper, .fb-comments-reply-wrapper').find('likes').text(parseInt($(this).parents('.fb-comments-wrapper, .fb-comments-reply-wrapper').find('likes').text()) + 1)
        $(this).addClass('liked')
        $(this).text('Descurtir')
    }
})
$('reply').on('click', function() {
    if (fbobj != null) {
        handleReply($(this).parents('.fb-comments-wrapper, .fb-comments-reply-wrapper').attr('id'))
    } else {
        logInWithFacebook(handleReply, $(this).parents('.fb-comments-wrapper, .fb-comments-reply-wrapper').attr('id'))
    }
})

function handleReply(id) {
    var text = ''
    var obj = $('#' + id)
    if (obj.hasClass('fb-comments-reply-wrapper')) {
        text = '@' + obj.find('name').text()
        obj = $('#' + id.split('-')[0])
    }
    obj.find('.row.reply-box').remove()
    obj.append('<div class="row reply-box" id="reply-' +
        obj.attr('id') +
        '"><div class="col-xs-10"><input type="text" value="' +
        text +
        '" placeholder="AÃ±ade una respuesta..." class="fb-reply-input" /></div><div class="col-xs-2"><button class="fb-reply-button" onclick="javascript:postReply(' +
        obj.attr('id') +
        ');">Responder</button></div></div>')
}

function postReply(id) {
    var obj = $('#reply-' + id)
    if (obj && obj.find('.fb-reply-input').val()) {
        var date = new Date()
        var fbreply = {
            forid: id,
            date: date,
            text: obj.find('.fb-reply-input').val()
        }
        fbreplies.push(fbreply)
        var replyc = reply.clone()
        replyc.attr('id', id + '-' + Math.floor(Math.random() * 100 + 10))
        replyc.find('name').text(fbobj.name)
        replyc.find('.fb-comments-comment-img').find('img').attr('src', fbobj.pictureURL)
        replyc.find('.fb-comments-comment-text').text(obj.find('.fb-reply-input').val())
        replyc.find('date').each(function() {
            if ($(this).attr('data-date-minus')) {
                $(this).html(dateMinus($(this).attr('data-date-minus')))
            }
        })
        $('#' + id).after(replyc)
        obj.remove()
        var today = new Date()
        today.setDate(today.getFullYear() + 1)
        setCookie('fbreplies', JSON.stringify(fbreplies), today)
    }
}
setTimeout(function() {
    $('#add-to-cart').show()
}, 20000)
var today = new Date()
today.setDate(today.getFullYear() + 1)
setCookie('returningVisitor', 'yes', today)

