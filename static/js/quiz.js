let questionIndex = 0;
let questions = [];
let results = null;

const choicesContainer = document.getElementById("quizz-choices");
const choiceTemplate = document.getElementById("template-choices-item");

const correctionBtnContainer = document.getElementById("result-correction");
const correctionBtnTemplate = document.getElementById("template-correction-item");
const correctionBtnTemplateWrong = document.getElementById("template-correction-item-wrong");

const correctionEnonce = document.getElementById("correction-enonce");
const correctionQuestionContainer = document.getElementById("correction-question-container");

startQuizz();

async function startQuizz() {
  const response = await fetch('/questions/index.json');
  questions =  (await response.json()).data;

  document.getElementById("quizz-go-next-question-btn").addEventListener("click", nextQuestion);
  loadActualQuestion();
}


// CORRECTION

function showResults(){
  let sentenceLevel = "";
  calculateResults();

  document.querySelector("#quizz-ingame").classList.add("hidden");
  document.querySelector("#results").classList.remove("hidden");

  document.getElementById("result-score").innerText = `${results.score}%`;
  document.getElementById("result-sentence").innerText = results.sentence;

  if(results.score <= 25){
    sentenceLevel = "Vos appareils et vos données sont un trésor pour les pirates. Attention, ils sont parés à l’abordage !";
  }
  else if (results.score > 25 && results.score <= 50){
    sentenceLevel = "Vous y êtes presque ! Mais pour les pirates, c’est comme si vous aviez fermé votre maison à clef, et laissé une fenêtre ouverte.";
  }
  else if (results.score > 50 && results.score <= 75){
    sentenceLevel = "Vous êtes sur la bonne voie, mais votre ennemi est mieux équipé.";
  }
  else{
    sentenceLevel = "Vous êtes la terreur des pirates ! Ne changez rien, restez vigilant.";
  }

  document.getElementById("sentence-level").innerText = sentenceLevel;

  createCorrection();
}

function calculateResults() {
  questions.forEach(question=>{
    question.isUserAnswerCorrect = false;

    question.choices.forEach(choice=>{
      if(!choice.isCorrect) {
        return
      }

      if(choice.text === question.userAnswer) {
        question.isUserAnswerCorrect = true
      }
    })
  })

  const numberCorrect = questions.filter(question=>question.isCorrect).length,
          score = Math.trunc(numberCorrect * 100 / (questions.length));
  let sentence = "";
  if(score <= 25){
    sentence = "Vous êtes en danger";
  }
  else if (score > 25 && score <= 50){
    sentence = "Vous êtes vulnérable.";
  }
  else if (score > 50 && score <= 75){
    sentence = "Vous êtes bon.";
  }
  else{
    sentence = "Vous êtes parfait (ou presque) !";
  }
  results = {
    numberCorrect,
    score,
    sentence: score > 80 ? 'Vous êtes parfait (ou presque)' : 'Vous êtes vulnérable',
    image: ''
  }
}

function createCorrection(){
  questions.forEach((question, index) => {
    createElCorrection(question, index);
  });
}

function createElCorrection(question, questionIndex){
  const newCorrectionBtn = question.isUserAnswerCorrect?
      correctionBtnTemplate.content.firstElementChild.cloneNode(true)
          : correctionBtnTemplateWrong.content.firstElementChild.cloneNode(true);

  newCorrectionBtn.dataset.questionIndex = questionIndex;
  newCorrectionBtn.querySelector(".correct-btn-text").innerText = questionIndex+1;
  newCorrectionBtn.addEventListener("click", ()=>{
    showCorrectionOfQuestion(question);
  });
  correctionBtnContainer.appendChild(newCorrectionBtn);
}

function loadCreateElChoiceCorrection(question){
  question.choices.forEach(choice => {
    createElChoiceCorrection(choice, question);
  });
}
function createElChoiceCorrection(choice, question) {
  const newChoiceCorrection = choiceTemplate.content.firstElementChild.cloneNode(true);
  newChoiceCorrection.querySelector(".choice-text").innerText = choice.text;

  if(choice.text === question.userAnswer) {
    newChoiceCorrection.dataset.selected = false;
  }
  // if (choice.isCorrect) {
  //   newChoiceCorrection.dataset.wrong = true;
  //   newChoiceCorrection.dataset.selected = false;
  //   newChoiceCorrection.dataset.wrongSelected = false;
  // }

  correctionQuestionContainer.appendChild(newChoiceCorrection);
}
function clearQuestionCorrection() {
  while (correctionQuestionContainer.firstChild) {
    correctionQuestionContainer.removeChild(correctionQuestionContainer.firstChild);
  }
}

function showCorrectionOfQuestion(question) {
  correctionEnonce.innerText = question.text;
  clearQuestionCorrection();
  loadCreateElChoiceCorrection(question);
}









// QUESTIONS

function nextQuestion() {
  if (questions.userAnswer === null) {
    return;
  }

  questionIndex++;

  if (questionIndex === questions.length){
    showResults();
    return;
  }

  loadActualQuestion();
}

function handleAnswerSelected(questionSelected){
  resetQuestionAnswers();
  questionSelected.dataset.selected = true;

  questions[questionIndex].userAnswer = questionSelected.dataset.text;

  document.getElementById("quizz-go-next-question-btn").removeAttribute('disabled');
}

function clearQuestionAnswers() {
  while (choicesContainer.firstChild) {
    choicesContainer.removeChild(choicesContainer.firstChild);
  }
}
function resetQuestionAnswers() {
  Array.from(choicesContainer.children).forEach(child=>{
    child.dataset.selected = false;
  })
}

function loadActualQuestion() {
  window.scrollTo(0,0);
  document.getElementById("quizz-progression-text").innerText = `Question ${questionIndex+1}/${questions.length}`;
  document.getElementById("quizz-progression-bar-inner").style.width = `${(questionIndex+1) * 100 / (questions.length+1)}%`;
  document.getElementById("quizz-question-text").innerText = questions[questionIndex].text;

  clearQuestionAnswers();
  questions[questionIndex].choices.forEach(choice => {
    createElChoice(choice);
  });
}

function createElChoice(choice) {
  const newChoice = choiceTemplate.content.firstElementChild.cloneNode(true);

  newChoice.dataset.text = choice.text;
  newChoice.querySelector(".choice-text").innerText = choice.text;
  newChoice.addEventListener("click", ()=>{
    handleAnswerSelected(newChoice);
  });

  choicesContainer.appendChild(newChoice);
}
