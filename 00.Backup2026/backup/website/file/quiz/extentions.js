const quizContainer = document.querySelector('.quiz-page-content');
if (!quizContainer) {
  console.error('Không tìm thấy quiz-page-content');
} else {
  const questionBlocks = quizContainer.querySelectorAll('div[class*="result-pane--question-result-pane"]');
  const labels = ['A', 'B', 'C', 'D'];
  const questions = [];

  questionBlocks.forEach(block => {
    const questionElement = block.querySelector('#question-prompt');
    const optionElements = block.querySelectorAll('[data-purpose="answer-body"]');
    const correctBlock = block.querySelector('div[class*="answer-result-pane--answer-correct"]');
    const correctAnswerElement = correctBlock?.querySelector('[data-purpose="answer-body"]');

    if (questionElement && optionElements.length > 0) {
      const questionText = questionElement.innerText.trim();
      const options = {};

      optionElements.forEach((el, idx) => {
        let text = el.innerText.trim();
        text = text.replace("(A)", "").trim();
        text = text.replace("(B)", "").trim();
        text = text.replace("(C)", "").trim();
        text = text.replace("(D)", "").trim();
        options[labels[idx]] = text;
      });

      let correctAnswerLetter = '';
      optionElements.forEach((el, idx) => {
        if (el.innerText.trim() === correctAnswerElement?.innerText.trim()) {
          correctAnswerLetter = labels[idx];
        }
      });

      questions.push({
        question: questionText,
        options: options,
        correct_answer: correctAnswerLetter
      });
    }
  });

  // XÓA DUPLICATE
  const uniqueQuestions = [];
  const questionSet = new Set();
  questions.forEach(q => {
    const key = JSON.stringify({ question: q.question, options: q.options });
    if (!questionSet.has(key)) {
      questionSet.add(key);
      uniqueQuestions.push(q);
    }
  });

  console.log(uniqueQuestions);

  // Tùy chọn: tự động download file JSON (nếu bạn cần luôn)
  const blob = new Blob([JSON.stringify(uniqueQuestions, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'questions.json';
  a.click();
  URL.revokeObjectURL(url);
}
