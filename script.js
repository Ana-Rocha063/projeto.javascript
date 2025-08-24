// textoDigitando seleciona o texto que deve ser digitado para interagir com o script
const textoDigitando = document.querySelector(".typing-text p")

// campoEntrada seleciona o campo onde o texto será escrito para interagir com o script
const campoEntrada = document.querySelector(".wrapper .input-field")

// Seletores dos elementos visuais de estatísticas
const botaoTentarNovamente = document.querySelector(".content button")


const tempoTag = document.querySelector(".time span b")


const errosTag = document.querySelector(".mistake span")


const lpmTag = document.querySelector(".wpm span")


const cpmTag = document.querySelector(".cpm span")

// Tempo máximo para o jogo (120 segundos)
const tempoMaximo = 120

// Seleciona um parágrafo aleatório da lista 'paragrafos'
const obterParagrafoAleatorio = () =>
  paragrafos[Math.floor(Math.random() * paragrafos.length)]

// Envolve cada caractere com <span>
const envolverCaracteres = texto =>
  texto.split("").map(letra => `<span>${letra}</span>`).join("")

// Garante que o campo de digitação esteja sempre focado
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
  const lpmCalculado = tempoRestante < tempoMaximo
    ? Math.round(((indiceChar - erros) / 5) / ((tempoMaximo - tempoRestante) / 60))
    : 0

  const lpm = lpmCalculado > 0 && isFinite(lpmCalculado) ? lpmCalculado : 0

  lpmTag.innerText = lpm
  errosTag.innerText = erros
  cpmTag.innerText = indiceChar - erros
}

// Estado inicial do jogo
const estadoInicial = () => ({
  tempoRestante: tempoMaximo,
  indiceChar: 0,
  erros: 0,
  digitando: false
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

  if (estado.tempoRestante > 0) {
    const novoTempo = estado.tempoRestante - 1
    estadoJogo.definir({ tempoRestante: novoTempo })

    tempoTag.innerText = novoTempo
    atualizarEstatisticas(estado.indiceChar, estado.erros, novoTempo)
    atualizarBarraDeVida(novoTempo)

    setTimeout(iniciarContagemRegressiva, 1000)
  } else {
    campoEntrada.value = ""
    atualizarBarraDeVida(0)
  }
}

// Aplica estilo correto/incorreto
const atualizarClasses = (indice, letraDigitada, caracteres) => {
  const caractereAtual = caracteres[indice]
  const correto = caractereAtual?.innerText === letraDigitada

  caractereAtual?.classList.remove("correct", "incorrect")
  caractereAtual?.classList.add(correto ? "correct" : "incorrect")

  return correto ? 0 : 1
}

// Lida com backspace
const tratarBackspace = (estado, caracteres) => {
  const indiceAnterior = estado.indiceChar - 1
  const anterior = caracteres[indiceAnterior]

  if (!anterior) return { ...estado }

  const estavaErrado = anterior.classList.contains("incorrect")

  anterior.classList.remove("correct", "incorrect")

  return {
    ...estado,
    indiceChar: indiceAnterior,
    erros: estado.erros - (estavaErrado ? 1 : 0)
  }
}

// Quando digita algo
const iniciarDigitacao = () => {
  const caracteres = Array.from(textoDigitando.querySelectorAll("span"))
  const estado = estadoJogo.obter()
  const letraDigitada = campoEntrada.value.charAt(estado.indiceChar)

  if (!estado.digitando) {
    estadoJogo.definir({ digitando: true })
    iniciarContagemRegressiva()
  }

  if (!letraDigitada) {
    const novoEstado = tratarBackspace(estado, caracteres)
    estadoJogo.definir(novoEstado)
  } else {
    const novosErros = estado.erros + atualizarClasses(estado.indiceChar, letraDigitada, caracteres)
    const novoIndice = estado.indiceChar + 1
    estadoJogo.definir({ indiceChar: novoIndice, erros: novosErros })
  }

  const novoEstado = estadoJogo.obter()

  ativarCaractere(novoEstado.indiceChar)
  atualizarEstatisticas(novoEstado.indiceChar, novoEstado.erros, novoEstado.tempoRestante)

  // Se a frase acabou
  if (novoEstado.indiceChar >= caracteres.length) {
    const tempoExtra = Math.min(novoEstado.tempoRestante + 5, tempoMaximo)

    estadoJogo.definir({
      ...estadoInicial(),
      tempoRestante: tempoExtra,
      digitando: true
    })

    campoEntrada.value = ""
    tempoTag.innerText = tempoExtra
    atualizarBarraDeVida(tempoExtra)
    carregarParagrafo()
    iniciarContagemRegressiva()
  }
}

// Reiniciar
const reiniciarJogo = () => {
  carregarParagrafo()
  estadoJogo.definir(estadoInicial())
  campoEntrada.value = ""
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
