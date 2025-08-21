const typingText = document.querySelector(".typing-text p"),

inpField = document.querySelector(".wrapper .input-field"),
tryAgainBtn = document.querySelector(".content button"),
timeTag = document.querySelector(".time span b"),
mistakeTag = document.querySelector(".mistake span"),
wpmTag = document.querySelector(".wpm span"),
cpmTag = document.querySelector(".cpm span");
let timer,
maxTime = 120,
timeLeft = maxTime,
charIndex = mistakes = isTyping = 0;
//pega um parágrafo de uma lista pré-existente (paragraphs), o divide em letras e coloca cada letra dentro de uma tag <span> para que possa ser facilmente estilizada ou manipulada depois.
function loadParagraph() {
    const ranIndex = Math.floor(Math.random() * paragraphs.length);
    typingText.innerHTML = "";
    paragraphs[ranIndex].split("").forEach(char => {
        let span = `<span>${char}</span>`
        typingText.innerHTML += span;
    });
    typingText.querySelectorAll("span")[0].classList.add("active");
// campo de entrada (inpField) esteja sempre ativo e pronto para receber a digitação, seja através de um clique na área de texto ou de qualquer pressionamento de tecla na página.
    document.addEventListener("keydown", () => inpField.focus());
    typingText.addEventListener("click", () => inpField.focus());
}
function initTyping() {
    let characters = typingText.querySelectorAll("span");
    let typedChar = inpField.value.split("")[charIndex];
    if(charIndex < characters.length - 1 && timeLeft > 0) {
        if(!isTyping) {
//Começado o contador ele não vai reiniciar a cada palavra digitada 
            timer = setInterval(initTimer, 1000);
            isTyping = true;
        }
//Se o usuário não digitou nada ou apertou o botão de voltar, remove a classe correta 
//ou incorreta da palavra, e se estiver incorreta, remove os erros
        if(typedChar == null) {
            if(charIndex > 0) {
                charIndex--;
//somente se a classe do charIndex for incorreta
                if(characters[charIndex].classList.contains("incorrect")) {
                    mistakes--;
                }
                characters[charIndex].classList.remove("correct", "incorrect");
            }
        } else {
//se o usuário digitar a palavra correspondente, adiciona a class= correto
            if(characters[charIndex].innerText == typedChar) {
                characters[charIndex].classList.add("correct");
//caso contrário adiciona 1 aos erros e muda a classe para incorreto
            } else {
                mistakes++;
                characters[charIndex].classList.add("incorrect");
            }
            charIndex++;
        }
        characters.forEach(span => span.classList.remove("active"));
        characters[charIndex].classList.add("active");
        let wpm = Math.round(((charIndex - mistakes)  / 5) / (maxTime - timeLeft) * 120);
//Se as palavras por minuto for 0, vazio ou infinito coloca seu valor para 0
        wpm = wpm < 0 || !wpm || wpm === Infinity ? 0 : wpm;
        
        wpmTag.innerText = wpm;
        mistakeTag.innerText = mistakes;
        cpmTag.innerText = charIndex - mistakes;
    } else {
        clearInterval(timer);
        inpField.value = "";
    }   
}
function initTimer() {
    if(timeLeft > 0) {
        timeLeft--;
        timeTag.innerText = timeLeft;
        //Cálculo das letras por minuto
        let wpm = Math.round(((charIndex - mistakes)  / 5) / (maxTime - timeLeft) * 120);
        wpmTag.innerText = wpm;
    } else {
        clearInterval(timer);
    }
}
//Reset do jogo, chama a função loadparagrafh e reseta cada 
//variável e demais elenentos para zero
function resetGame() {
    loadParagraph();
    clearInterval(timer);
    timeLeft = maxTime;
    charIndex = mistakes = isTyping = 0;
    inpField.value = "";
    timeTag.innerText = timeLeft;
    wpmTag.innerText = 0;
    mistakeTag.innerText = 0;
    cpmTag.innerText = 0;
}
loadParagraph();
inpField.addEventListener("input", initTyping);
tryAgainBtn.addEventListener("click", resetGame);
