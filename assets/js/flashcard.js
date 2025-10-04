// Flashcard App
(function() {
  'use strict';

  // DOM Elements
  const cardContainer = document.getElementById('cardContainer');
  const cardQuestion = document.getElementById('cardQuestion');
  const cardAnswer = document.getElementById('cardAnswer');
  const cardHint = document.getElementById('cardHint');
  const cardExplanation = document.getElementById('cardExplanation');
  const cardEmoji = document.getElementById('cardEmoji');
  const currentCardEl = document.getElementById('currentCard');
  const totalCardsEl = document.getElementById('totalCards');
  const progressBar = document.getElementById('progressBar');
  const flipBtn = document.getElementById('flipBtn');
  const nextBtn = document.getElementById('nextBtn');
  const restartBtn = document.getElementById('restartBtn');
  const flashcardSets = document.getElementById('flashcardSets');

  // State
  let currentSet = null;
  let currentIndex = 0;
  let isFlipped = false;
  let studyMode = 'question'; // 'question' or 'answer'

  // Sample flashcard data
  const flashcardData = {
    'japanese-n5': {
      title: 'Tiếng Nhật N5',
      emoji: '🇯🇵',
      color: 'from-blue-500 to-cyan-500',
      cards: [
        {
          question: 'こんにちは',
          answer: 'Xin chào',
          explanation: 'Cách chào hỏi thông thường trong tiếng Nhật',
          emoji: '👋'
        },
        {
          question: 'ありがとう',
          answer: 'Cảm ơn',
          explanation: 'Cách nói cảm ơn trong tiếng Nhật',
          emoji: '🙏'
        },
        {
          question: 'すみません',
          answer: 'Xin lỗi',
          explanation: 'Cách xin lỗi hoặc thu hút sự chú ý',
          emoji: '😅'
        },
        {
          question: 'はい',
          answer: 'Có / Vâng',
          explanation: 'Cách trả lời khẳng định',
          emoji: '✅'
        },
        {
          question: 'いいえ',
          answer: 'Không',
          explanation: 'Cách trả lời phủ định',
          emoji: '❌'
        }
      ]
    },
    'english-basic': {
      title: 'Tiếng Anh Cơ Bản',
      emoji: '🇺🇸',
      color: 'from-green-500 to-emerald-500',
      cards: [
        {
          question: 'Hello',
          answer: 'Xin chào',
          explanation: 'Lời chào thông thường trong tiếng Anh',
          emoji: '👋'
        },
        {
          question: 'Thank you',
          answer: 'Cảm ơn',
          explanation: 'Cách nói cảm ơn',
          emoji: '🙏'
        },
        {
          question: 'Please',
          answer: 'Làm ơn',
          explanation: 'Từ lịch sự khi yêu cầu',
          emoji: '🙏'
        },
        {
          question: 'Sorry',
          answer: 'Xin lỗi',
          explanation: 'Cách xin lỗi',
          emoji: '😅'
        },
        {
          question: 'Goodbye',
          answer: 'Tạm biệt',
          explanation: 'Lời chào tạm biệt',
          emoji: '👋'
        }
      ]
    },
    'math-basic': {
      title: 'Toán Học Cơ Bản',
      emoji: '🔢',
      color: 'from-purple-500 to-pink-500',
      cards: [
        {
          question: '2 + 2 = ?',
          answer: '4',
          explanation: 'Phép cộng cơ bản: 2 cộng 2 bằng 4',
          emoji: '➕'
        },
        {
          question: '5 × 3 = ?',
          answer: '15',
          explanation: 'Phép nhân: 5 nhân 3 bằng 15',
          emoji: '✖️'
        },
        {
          question: '10 ÷ 2 = ?',
          answer: '5',
          explanation: 'Phép chia: 10 chia 2 bằng 5',
          emoji: '➗'
        },
        {
          question: '3² = ?',
          answer: '9',
          explanation: 'Lũy thừa: 3 mũ 2 bằng 9',
          emoji: '🔢'
        },
        {
          question: '√16 = ?',
          answer: '4',
          explanation: 'Căn bậc hai của 16 bằng 4',
          emoji: '√'
        }
      ]
    }
  };

  // Initialize
  function init() {
    renderFlashcardSets();
    setupEventListeners();
  }

  // Render flashcard sets
  function renderFlashcardSets() {
    flashcardSets.innerHTML = '';
    
    Object.entries(flashcardData).forEach(([key, set]) => {
      const setElement = document.createElement('div');
      setElement.className = `bg-gradient-to-br ${set.color} p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer`;
      setElement.innerHTML = `
        <div class="text-center text-white">
          <div class="text-4xl mb-3">${set.emoji}</div>
          <h4 class="text-xl font-bold mb-2">${set.title}</h4>
          <p class="text-sm opacity-90">${set.cards.length} thẻ</p>
        </div>
      `;
      
      setElement.addEventListener('click', () => startFlashcardSet(key));
      flashcardSets.appendChild(setElement);
    });
  }

  // Start a flashcard set
  function startFlashcardSet(setKey) {
    currentSet = flashcardData[setKey];
    currentIndex = 0;
    isFlipped = false;
    studyMode = 'question';
    
    // Hide sets, show controls
    flashcardSets.style.display = 'none';
    flipBtn.classList.remove('hidden');
    nextBtn.classList.remove('hidden');
    restartBtn.classList.remove('hidden');
    
    // Update UI
    updateCard();
    updateProgress();
  }

  // Update card display
  function updateCard() {
    if (!currentSet) return;
    
    const card = currentSet.cards[currentIndex];
    
    if (studyMode === 'question') {
      cardQuestion.textContent = card.question;
      cardHint.textContent = 'Nhấn "Lật thẻ" để xem đáp án';
      cardEmoji.textContent = card.emoji;
      cardContainer.classList.remove('flipped');
    } else {
      cardAnswer.textContent = card.answer;
      cardExplanation.textContent = card.explanation;
      cardEmoji.textContent = card.emoji;
      cardContainer.classList.add('flipped');
    }
    
    // Add fade-in animation
    cardContainer.classList.add('fade-in');
    setTimeout(() => cardContainer.classList.remove('fade-in'), 500);
  }

  // Update progress
  function updateProgress() {
    if (!currentSet) return;
    
    currentCardEl.textContent = currentIndex + 1;
    totalCardsEl.textContent = currentSet.cards.length;
    
    const progress = ((currentIndex + 1) / currentSet.cards.length) * 100;
    progressBar.style.width = `${progress}%`;
  }

  // Flip card
  function flipCard() {
    isFlipped = !isFlipped;
    studyMode = isFlipped ? 'answer' : 'question';
    updateCard();
  }

  // Next card
  function nextCard() {
    if (currentIndex < currentSet.cards.length - 1) {
      currentIndex++;
      isFlipped = false;
      studyMode = 'question';
      updateCard();
      updateProgress();
    } else {
      // End of set
      showCompletion();
    }
  }

  // Show completion
  function showCompletion() {
    cardContainer.innerHTML = `
      <div class="bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-xl rounded-xl p-8 text-center">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-3xl font-bold mb-4">Hoàn thành!</h2>
        <p class="text-lg opacity-90">Bạn đã học xong tất cả ${currentSet.cards.length} thẻ</p>
      </div>
    `;
    
    flipBtn.classList.add('hidden');
    nextBtn.classList.add('hidden');
  }

  // Restart
  function restart() {
    currentIndex = 0;
    isFlipped = false;
    studyMode = 'question';
    
    // Show sets again
    flashcardSets.style.display = 'grid';
    flipBtn.classList.add('hidden');
    nextBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');
    
    // Reset card display
    cardContainer.innerHTML = `
      <div class="card-inner">
        <div class="card-front bg-white dark:bg-slate-800 shadow-xl card-hover">
          <div class="text-center">
            <div class="text-6xl mb-6">📚</div>
            <h2 class="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">Chọn bộ flashcard để bắt đầu</h2>
            <p class="text-lg text-slate-600 dark:text-slate-400">Nhấn vào bộ flashcard bên dưới để bắt đầu học</p>
          </div>
        </div>
      </div>
    `;
    
    updateProgress();
  }

  // Setup event listeners
  function setupEventListeners() {
    flipBtn.addEventListener('click', flipCard);
    nextBtn.addEventListener('click', nextCard);
    restartBtn.addEventListener('click', restart);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (currentSet) {
        switch(e.key) {
          case ' ':
          case 'Enter':
            e.preventDefault();
            if (studyMode === 'question') {
              flipCard();
            } else {
              nextCard();
            }
            break;
          case 'ArrowRight':
            e.preventDefault();
            if (studyMode === 'answer') {
              nextCard();
            }
            break;
          case 'ArrowLeft':
            e.preventDefault();
            if (studyMode === 'answer') {
              flipCard();
            }
            break;
        }
      }
    });
    
    // Card click to flip
    cardContainer.addEventListener('click', () => {
      if (currentSet && studyMode === 'question') {
        flipCard();
      }
    });
  }

  // Start the app
  init();
})();

