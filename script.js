//Todo o código foi criado e adaptado pelo jogo do vídeo https://youtu.be/Hg80AjDNnJk?si=XYdkr7F9sEAVD_WS
// O código inteiro foi modificado, e poucas funções estavam de acordo com o paradigma funcional
// como a que se encontra em paragraphs.js, de resto tudo alterado

// textoDigitando seleciona o texto que deve ser digitado para interagir com o script
const textoDigitando = document.querySelector(".typing-text p")

// campoEntrada seleciona o campo onde o texto será escrito para interagir com o script
const campoEntrada = document.querySelector(".wrapper .input-field")

// Seletores dos elementos visuais de estatísticas
const botaoTentarNovamente = document.querySelector(".content button")

//Contador de tempo
const tempoTag = document.querySelector(".time span b")

//Contador de erros
const errosTag = document.querySelector(".mistake span")

//Contador de Letras por minuto (lpm)
const lpmTag = document.querySelector(".wpm span")

//Contador de precisão
const cpmTag = document.querySelector(".cpm span")

// Tempo máximo para o jogo (120 segundos)
const tempoMaximo = 120
let frasesCompletas = 0
// Seleciona um parágrafo aleatório da lista 'paragrafos'
const obterParagrafoAleatorio = () =>
  paragrafos[Math.floor(Math.random() * paragrafos.length)]

// Envolve cada caractere com <span>
const envolverCaracteres = texto =>
  texto.split("").map(letra => `<span>${letra}</span>`).join("") //Junta todos os strings cortados pelo split em uma uníca string

// Garante que o campo de digitação esteja sempre focado, ou seja
// pronto para receber texto
const definirFoco = () => {
  document.addEventListener("keydown", () => campoEntrada.focus())
  textoDigitando.addEventListener("click", () => campoEntrada.focus())
}

// Define qual caractere está "ativo" 
const ativarCaractere = (indice = 0) =>
  Array.from(textoDigitando.querySelectorAll("span")).forEach((span, i) =>
    span.classList.toggle("active", i === indice)
  )

// Atualiza LPM, CPM e erros
const atualizarEstatisticas = (indiceChar, erros, tempoRestante) => {
  const lpmCalculado = tempoRestante < tempoMaximo // Garante que o lpm seja calculado somente quando o jogo começar
    ? Math.round(((indiceChar - erros) / 5) / ((tempoMaximo - tempoRestante) / 60)) // Fórmula para calcular o lpm, caso o jogo não tenha começado
                                                                                    // Ele define o tempo como 0
    : 0

  const lpm = lpmCalculado > 0 && isFinite(lpmCalculado) ? lpmCalculado : 0 //Sistema que valida se o lpm é um valor positivo e finito
                                                                            //Tudo fora disso ele define como 0 

  lpmTag.innerText = lpm //Mostra o valor calculado de LPM na tela do jogo.
  errosTag.innerText = erros // Mostra o valor calculado de erros na tela do jogo
  cpmTag.innerText = indiceChar - erros //Mostra a quantidade de caracteres corretos na tela (precisão)
                                        // Diminui a quantidade de caracteres pelos erros
}

// Estado inicial do jogo
const estadoInicial = () => ({
  tempoRestante: tempoMaximo,
  indiceChar: 0,
  erros: 0,
  digitando: false,
  frasesCompletas: 0
})

// Encapsulamento funcional do estado
const estadoJogo = (() => {
  let estado = estadoInicial()
  return {
    obter: () => estado,
    definir: novo => (estado = { ...estado, ...novo })
  }
})()

// Atualiza a barra de vida visualmente
const atualizarBarraDeVida = tempo => {
  const porcentagem = (tempo / tempoMaximo) * 100
  document.querySelector(".vida").style.width = `${porcentagem}%`
}

// Contador de tempo recursivo
const iniciarContagemRegressiva = () => {
  const estado = estadoJogo.obter()

  if (estado.tempoRestante > 0) { // A chamada do tempo só continua se o tempo for maior que 0 
    const novoTempo = estado.tempoRestante - 1 
    estadoJogo.definir({ tempoRestante: novoTempo })

    tempoTag.innerText = novoTempo //Mostra o tempo visualmente na tela
    atualizarEstatisticas(estado.indiceChar, estado.erros, novoTempo, frasesCompletas) //Atualiza as estatisticas em tempo real
    atualizarBarraDeVida(novoTempo)

    setTimeout(iniciarContagemRegressiva, 1000) // \Chama a função novamente a cada 1000 milissegundos
  } else {
  campoEntrada.value = "" //Limpa o campo de texto onde o jogador estava digitando.
  atualizarBarraDeVida(0) //Garante que a barra de vida fique zerada

  // Função para salvar a pontuação com nome do jogador
const salvarPontuacao = () => {
  // Pega o nome do jogador do localStorage, ou usa "Anônimo" caso vazio
  const nome = localStorage.getItem("nomeDoJogador") || "Anônimo"

  const pontuacoes = JSON.parse(localStorage.getItem("rankingPontuacoes") || "[]")

  // Pega o estado atual do jogo
  const estado = estadoJogo.obter()

  const novaPontuacao = {
    nome,
    lpm: parseInt(lpmTag.innerText), //A parse int serve para transformar as strings coletadas em inteiros
    cpm: parseInt(cpmTag.innerText),
    erros: parseInt(errosTag.innerText),
    tempo: estado.tempoRestante,
    fases: Math.floor(parseInt(cpmTag.innerText) / 5), //Calcula de forma mediana a quantidade de frases completadas 
    frases: estado.frasesCompletas,  //  agora pega do estado centralizado
    data: new Date().toLocaleString("pt-BR")
  }

  // Ordena do melhor LPM para o pior e guarda só os top 5
  const rankingAtualizado = [...pontuacoes, novaPontuacao]
    .sort((a, b) => b.lpm - a.lpm) //
    .slice(0, 5)

  localStorage.setItem("rankingPontuacoes", JSON.stringify(rankingAtualizado))
}
  salvarPontuacao()
  window.location.href = "gameover.html" // redireciona para a tela de fim
}
}

// Aplica estilo correto/incorreto se a letra digitada for ou não correspondente
// a letra do texto
const atualizarClasses = (indice, letraDigitada, caracteres) => {
  const caractereAtual = caracteres[indice]
  const correto = caractereAtual?.innerText === letraDigitada

  caractereAtual?.classList.remove("correct", "incorrect")
  caractereAtual?.classList.add(correto ? "correct" : "incorrect")

  return correto ? 0 : 1
}

// Lida com backspace
const tratarBackspace = (estado, caracteres) => {
  const indiceAnterior = estado.indiceChar - 1 //Procura o indice da letra atual e volta 1 caractere pra trás
  const anterior = caracteres[indiceAnterior] // Pega o elemento html que representa o caractere anterior

  if (!anterior) return { ...estado } //Se não houver caractere anterior a função retrona o estado sem nenhuma alteração

  const estavaErrado = anterior.classList.contains("incorrect") //Verifica se o caractere anterior estava marcado como incorreto

  anterior.classList.remove("correct", "incorrect") //Ao voltar para a letra anterior remove a classe correta ou incorreta da letra

  return {
    ...estado,
    indiceChar: indiceAnterior,
    erros: estado.erros - (estavaErrado ? 1 : 0) // Se a letra anterior estava marcada como errada ele diminui 1, senão 0
  }
}

// Quando digita algo
const iniciarDigitacao = () => {
  const caracteres = Array.from(textoDigitando.querySelectorAll("span")) //Transfroma todos os spans em uma lista
  const estado = estadoJogo.obter() // se está digitando, qual caractere está, quantos erros, etc.).
  const letraDigitada = campoEntrada.value.charAt(estado.indiceChar)

  if (!estado.digitando) {
    estadoJogo.definir({ digitando: true })
    iniciarContagemRegressiva() // Chama a função que inicia a contagem regressiva
  }

  if (!letraDigitada) {  //Se o jogador não digitou nada ou seja, se a tecla pressionada foi Backspace ou Delete)
    const novoEstado = tratarBackspace(estado, caracteres)//Chama a função para lidar com a tecla Backspace
    estadoJogo.definir(novoEstado)
  } else if (estado.indiceChar < caracteres.length) { //Se o jogador digitou um caractere e ainda não chegou ao final do texto.
    const novosErros = estado.erros + atualizarClasses(estado.indiceChar, letraDigitada, caracteres) //Chama a função atualizarClasses, que verifica se a letra digitada está correta ou errada, e adiciona a classe CSS correspondente.
                                                                                                     //  A função também retorna 1 se a letra estiver errada e 0 se estiver correta, atualizando a contagem de erros.
    const novoIndice = estado.indiceChar + 1 // Move o para o indice do caractere seguinte
    estadoJogo.definir({ indiceChar: novoIndice, erros: novosErros }) //Salva o novo índice do cursor e a nova contagem de erros no estado do jogo.


  }
 
  const novoEstado = estadoJogo.obter()

  ativarCaractere(novoEstado.indiceChar)
  atualizarEstatisticas(novoEstado.indiceChar, novoEstado.erros, novoEstado.tempoRestante)

    // Se a frase acabou
  if (novoEstado.indiceChar >= caracteres.length) { //Confere se os erros estão zerados e o indice do cacactere ultrapassou a frase
    if (novoEstado.erros === 0) {
  const frasesFeitas = novoEstado.frasesCompletas + 1 //Salva a informação dde mais uma frase
  const tempoExtra = Math.min(novoEstado.tempoRestante + 20, tempoMaximo) //Acrescenta +20 segundos à vida

  estadoJogo.definir({  // Atualiza as estatisticas novamente para a nova frase
    ...estadoInicial(),
    tempoRestante: tempoExtra,
    digitando: true,
    frasesCompletas: frasesFeitas
  })

  campoEntrada.value = ""         //Chama todas as funções novamente e limpa o campo de entrada
  tempoTag.innerText = tempoExtra
  atualizarBarraDeVida(tempoExtra)
  carregarParagrafo()
  iniciarContagemRegressiva()
    } else {
      campoEntrada.classList.add("sacudir") //Animação de tremor como se estivesse errado
      setTimeout(() => {
        campoEntrada.classList.remove("sacudir")
      }, 300)
    }
  }
}

// Reiniciar o jogo, zerando todas as estatisticas
const reiniciarJogo = () => {
  carregarParagrafo()
  estadoJogo.definir(estadoInicial()) //Define o jogo para o estado inicial 
  campoEntrada.value = "" // O resto dos códigos apenas reinicia todos os atributos do jogo
  tempoTag.innerText = tempoMaximo
  lpmTag.innerText = 0
  errosTag.innerText = 0
  cpmTag.innerText = 0
  atualizarBarraDeVida(tempoMaximo)
}

// Carregar o primeiro parágrafo
const carregarParagrafo = () => {
  const paragrafo = obterParagrafoAleatorio()
  textoDigitando.innerHTML = envolverCaracteres(paragrafo)
  ativarCaractere(0)
  definirFoco()
}

// Início do jogo
carregarParagrafo()
campoEntrada.addEventListener("input", iniciarDigitacao)
botaoTentarNovamente.addEventListener("click", reiniciarJogo)


