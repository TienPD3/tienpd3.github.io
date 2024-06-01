const API =
  "https://script.google.com/macros/s/AKfycbweHt361_6IWuZZnwvkDbxBtFnripH84vNOHV_0-klGeE-Bc6qJRYStIcGkUewAzd8g/exec";
// ________FAKE_DATA_______________
let questions;
// ________QUIZ_APP________________
const quizTimer = document.querySelector("#timer");
const quizProgress = document.querySelector("#progress");
const quizProgressText = document.querySelector("#progress_text");
const quizSubmit = document.querySelector("#quiz_submit");
const quizPrev = document.querySelector("#quiz_prev");
const quizNext = document.querySelector("#quiz_next");
const quizCount = document.querySelector(".quiz_question h5");
const quizAnswers = document.querySelectorAll(".quiz_question ul li");
let quizQuestions = document.querySelectorAll(".quiz_numbers ul li");
const quizQuestionList = document.querySelector(".quiz_numbers ul");
const quizAnswersItem = document.querySelectorAll(".quiz_answer_item");
const quizTitle = document.querySelector("#quiz_title");
const elmLession = document.querySelector("#txtLesson");
let currentIndex = null;
let listSubmit = []; // Lưu index đáp án đã chọn
let listResults = []; // Lưu index kết quả đúng, theo mảng đã random
let isSubmit = false;
let isReset = false;
function randomArray(array) {
  return (array = array.sort(() => Math.random() - Math.random()));
}
const quiz = {
  randomQuestions: function () {
    questions = randomArray(questions);
    questions.forEach((q) => {
      q.answers = randomArray(q.answers);
    });
  },

  getQuestions: async function () {
    try {
      const lesson = elmLession.value;

      const response = await fetch(`${API}?category=japanese&lesson=${lesson}`);
      const data = await response.json();
      questions = data;
      console.log(data);
    } catch (error) {
      alert("Da xay ra loi");
    }
  },
  getResults: async function () {
    quizSubmit.innerText = "Đang nộp bài";
    const postData = {
      category: "japanese",
      questions: questions,
    };
    try {
      const response = await fetch(API, {
        method: "POST",
        body: JSON.stringify(postData),
      });
      const results = await response.json();
      console.log(results);
      this.handleCheckResults(results);
      quizSubmit.innerText = "Kết quả";
      quizSubmit.style = "pointer-events:none";
    } catch (error) {
      alert("Da xay ra loi");
    }
  },
  renderQuestionList: function () {
    let render = "";
    questions.forEach((question, index) => {
      render += `<li>${index + 1}</li>`;
    });
    quizQuestionList.innerHTML = render;
    quizQuestions = document.querySelectorAll(".quiz_numbers ul li");
  },
  renderCurrentQuestion: function () {
    quizCount.innerText = `Question ${currentIndex + 1} of ${questions.length}`;
    quizTitle.innerText = questions[currentIndex].question;
    quizAnswersItem.forEach((answer, index) => {
      answer.innerText = questions[currentIndex].answers[index];
    });
  },
  renderProgress: function () {
    quizProgress.style = `stroke-dasharray: 0 9999;`;
    quizProgressText.innerText = `0/${questions.length}`;
  },
  renderTimer: function () {
    var timer = 60 * 15;
    let _this = this;
    // Lấy thẻ p có id là "timer"
    var countdownElement = document.getElementById("timer");

    // Hàm cập nhật thời gian
    function updateTimer() {
      var minutes = Math.floor(timer / 60);
      var seconds = timer % 60;

      // Định dạng thời gian thành chuỗi HH:MM:SS
      var timerString =
        (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

      // Gán thời gian đã định dạng vào thẻ p
      countdownElement.innerHTML = timerString;

      // Giảm thời gian mỗi giây
      timer--;
      // Kiểm tra nếu hết thời gian
      if (timer < 0) {
        countdownElement.innerHTML = "Hết thời gian!";
        _this.getResults();
      }
      if (isSubmit) {
        clearInterval(intervalId);
      }

      if (isReset) {
        clearInterval(intervalId);
      }
    }

    // Gọi hàm updateTimer mỗi giây
    var intervalId = setInterval(updateTimer, 1000);
  },
  renderResults: function () {
    if (listResults[currentIndex] === listSubmit[currentIndex]) {
      quizAnswers.forEach((item) => {
        item.classList.remove("incorrect");
      });
      quizAnswers[listResults[currentIndex]].classList.add("active");
    } else {
      quizAnswers.forEach((item) => {
        item.classList.remove("active");
        item.classList.remove("incorrect");
      });
      quizAnswers[listResults[currentIndex]].classList.add("active");
      quizAnswers[listSubmit[currentIndex]].classList.add("incorrect");
    }
  },
  handleProgress: function (correct) {
    const r = quizProgress.getAttribute("r");
    if (!isSubmit) {
      const progressLen = listSubmit.filter((item) => item >= 0);
      quizProgress.style = `stroke-dasharray: ${
        (2 * Math.PI * r * progressLen.length) / questions.length
      } 9999;`;
      quizProgressText.innerText = `${progressLen.length}/${questions.length}`;
    } else {
      quizProgress.style = `stroke-dasharray: ${
        (2 * Math.PI * r * correct) / questions.length
      } 9999;`;
      quizProgressText.innerText = `${correct}/${questions.length}`;
    }
  },
  handleQuestionList: function () {
    quizQuestions.forEach((item, index) => {
      item.addEventListener("click", () => {
        item.scrollIntoView({
          behavior: "smooth",
          inline: "center",
        });
        quizQuestions.forEach((item) => item.classList.remove("active"));
        item.classList.add("active");
        currentIndex = index;
        this.renderCurrentQuestion();
        quizAnswers.forEach((item) => item.classList.remove("active"));
        const selected = listSubmit[currentIndex];
        selected >= 0 && quizAnswers[selected].click();
        if (isSubmit) {
          this.renderResults();
        }
      });
    });
    quizQuestions[0].click();
  },
  handleAnswer: function () {
    quizAnswers.forEach((answer, index) => {
      answer.addEventListener("click", () => {
        if (!isSubmit) {
          quizAnswers.forEach((item) => item.classList.remove("active"));
          answer.classList.add("active");
          quizQuestions[currentIndex].classList.add("selected");
          listSubmit[currentIndex] = index;
          this.handleProgress();
          if (questions.length !== (currentIndex + 1)) {
            quizNext.click();
          }
        } else {
          return;
        }
      });
    });
  },
  handleNext: function () {
    quizNext.addEventListener("click", () => {
      ++currentIndex;
      if (currentIndex > questions.length - 1) {
        currentIndex = 0;
      }
      quizQuestions[currentIndex].click();
    });
  },
  handlePrev: function () {
    quizPrev.addEventListener("click", () => {
      --currentIndex;
      if (currentIndex < 0) {
        currentIndex = questions.length - 1;
      }
      quizQuestions[currentIndex].click();
    });
  },
  handleSubmit: function () {
    quizSubmit.addEventListener("click", () => {
      const progressLen = listSubmit.filter((item) => item >= 0);
      if (progressLen.length === questions.length) {
        this.getResults();
      } else {
        this.getResults();
        // alert("Bạn chưa chọn hết đáp án");
      }
    });
  },
  handleCheckResults: function (results) {
    let correct = 0;
    questions.forEach((item, index) => {
      const result = results.find((r) => r.quiz_id === item.quiz_id);
      if (item.answers[listSubmit[index]] === result.answer) {
        listResults[index] = listSubmit[index];
        correct++;
      } else {
        quizQuestions[index].classList.add("incorrect");
        listResults[index] = item.answers.indexOf(result.answer);
      }
    });
    isSubmit = true;
    this.handleProgress(correct);
    quizQuestions[0].click();
  },
  handleOnFocusoutLesson: function() {
    elmLession.addEventListener("focusout", () => {
      isReset = true;
      quiz.reset();
    });
  },
  handleKeyDown: function () {
    document.addEventListener("keydown", (e) => {
      console.log(e.key);
      switch (e.key) {
        case "ArrowRight":
          return quizNext.click();
        case "ArrowLeft":
          return quizPrev.click();
        default:
          return false;
      }
    });
  },
  render: function () {
    this.renderQuestionList();
    this.renderProgress();
    this.renderTimer();
  },
  handle: function () {
    this.handleQuestionList();
    this.handleAnswer();
    this.handleNext();
    this.handlePrev();
    this.handleKeyDown();
    this.handleSubmit();
    this.handleOnFocusoutLesson();
  },

  handleReset: function () {
    this.handleQuestionList();
    this.handleAnswer();
    this.handleNext();
    this.handlePrev();
    this.handleKeyDown();
    this.handleSubmit();
  },

  start: async function () {
    await this.getQuestions();
    this.randomQuestions();
    this.render();
    this.handle();
  },

  reset: async function () {
    await this.getQuestions();
    this.randomQuestions();
    this.render();
    this.handleReset();
    isReset = false;
  },
};
quiz.start();