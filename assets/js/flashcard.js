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
  const audioBtn = document.getElementById('audioBtn');
  const flipBtn = document.getElementById('flipBtn');
  const nextBtn = document.getElementById('nextBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const restartBtn = document.getElementById('restartBtn');
  const flashcardSets = document.getElementById('flashcardSets');

  // Check if all DOM elements exist
  if (!cardContainer || !cardQuestion || !cardAnswer || !cardHint || !cardExplanation || !cardEmoji || 
      !currentCardEl || !totalCardsEl || !progressBar || !audioBtn || !flipBtn || !nextBtn || 
      !shuffleBtn || !restartBtn || !flashcardSets) {
    console.error('Some DOM elements not found!');
    return;
  }

  // State
  let currentSet = null;
  let currentIndex = 0;
  let isFlipped = false;
  let studyMode = 'question'; // 'question' or 'answer'
  let studyStartTime = null;
  let studyTimer = null;

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
          emoji: '👋',
          audio: 'https://www.vnjpclub.com/Audio/minnamoi/bai01/00010101100000001.mp3'
        },
        {
          question: 'ありがとう',
          answer: 'Cảm ơn',
          explanation: 'Cách nói cảm ơn trong tiếng Nhật',
          emoji: '🙏',
          audio: 'https://www.vnjpclub.com/Audio/minnamoi/bai01/00010101100000002.mp3'
        },
        {
          question: 'すみません',
          answer: 'Xin lỗi',
          explanation: 'Cách xin lỗi hoặc thu hút sự chú ý',
          emoji: '😅',
          audio: 'https://www.vnjpclub.com/Audio/minnamoi/bai01/00010101100000003.mp3'
        },
        {
          question: 'はい',
          answer: 'Có / Vâng',
          explanation: 'Cách trả lời khẳng định',
          emoji: '✅',
          audio: 'https://www.vnjpclub.com/Audio/minnamoi/bai01/00010101100000004.mp3'
        },
        {
          question: 'いいえ',
          answer: 'Không',
          explanation: 'Cách trả lời phủ định',
          emoji: '❌',
          audio: 'https://www.vnjpclub.com/Audio/minnamoi/bai01/00010101100000005.mp3'
        },
        {
          question: 'おはよう',
          answer: 'Chào buổi sáng',
          explanation: 'Lời chào buổi sáng',
          emoji: '🌅',
          audio: 'https://www.vnjpclub.com/Audio/minnamoi/bai01/00010101100000006.mp3'
        },
        {
          question: 'こんばんは',
          answer: 'Chào buổi tối',
          explanation: 'Lời chào buổi tối',
          emoji: '🌙',
          audio: 'https://www.vnjpclub.com/Audio/minnamoi/bai01/00010101100000007.mp3'
        },
        {
          question: 'さようなら',
          answer: 'Tạm biệt',
          explanation: 'Lời chào tạm biệt',
          emoji: '👋',
          audio: 'https://www.vnjpclub.com/Audio/minnamoi/bai01/00010101100000008.mp3'
        }
      ]
    },
    'japanese-n4': {
      title: 'Tiếng Nhật N4',
      emoji: '🇯🇵',
      color: 'from-indigo-500 to-purple-500',
      cards: [
        {
          question: 'みます',
          answer: 'xem, khám bệnh',
          explanation: '見ます, 診ます - KIẾN, CHẨN',
          emoji: '👀',
          audio: 'https://www.vnjpclub.com/Audio/minnamoi/bai26/00010101100101101.mp3'
        },
        {
          question: 'さがします',
          answer: 'tìm, tìm kiếm',
          explanation: '探します,捜します - THÁM、SƯU',
          emoji: '🔍',
          audio: 'https://www.vnjpclub.com/Audio/minnamoi/bai26/00010101100101110.mp3'
        },
        {
          question: 'おくれます[じかんに～]',
          answer: 'chậm, muộn [giờ]',
          explanation: '遅れます[時間に～] - TRÌ THỜI GIAN',
          emoji: '⏰',
          audio: 'https://www.vnjpclub.com/Audio/minnamoi/bai26/00010101100101111.mp3'
        },
        {
          question: 'まにあいます[じかんに～]',
          answer: 'kịp [giờ]',
          explanation: '間に合います[時間に～] - GIAN HỢP THỜI GIAN',
          emoji: '⏱️',
          audio: 'https://www.vnjpclub.com/Audio/minnamoi/bai26/00010101100110000.mp3'
        },
        {
          question: 'やります',
          answer: 'làm',
          explanation: 'Làm việc, thực hiện',
          emoji: '🔨',
          audio: 'https://www.vnjpclub.com/Audio/minnamoi/bai26/00010101100110001.mp3'
        },
        {
          question: 'ひろいます',
          answer: 'nhặt, thu thập',
          explanation: '拾います - THẬP',
          emoji: '🤲',
          audio: 'https://www.vnjpclub.com/Audio/minnamoi/bai26/00010101100110010.mp3'
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
    },
    'programming': {
      title: 'Lập Trình',
      emoji: '💻',
      color: 'from-orange-500 to-red-500',
      cards: [
        {
          question: 'JavaScript là gì?',
          answer: 'Ngôn ngữ lập trình web',
          explanation: 'JavaScript là ngôn ngữ lập trình chủ yếu dùng cho web development',
          emoji: '🟨'
        },
        {
          question: 'HTML là viết tắt của gì?',
          answer: 'HyperText Markup Language',
          explanation: 'HTML là ngôn ngữ đánh dấu siêu văn bản',
          emoji: '🌐'
        },
        {
          question: 'CSS là viết tắt của gì?',
          answer: 'Cascading Style Sheets',
          explanation: 'CSS dùng để tạo kiểu cho trang web',
          emoji: '🎨'
        },
        {
          question: 'API là viết tắt của gì?',
          answer: 'Application Programming Interface',
          explanation: 'API là giao diện lập trình ứng dụng',
          emoji: '🔌'
        },
        {
          question: 'SQL là viết tắt của gì?',
          answer: 'Structured Query Language',
          explanation: 'SQL là ngôn ngữ truy vấn cơ sở dữ liệu',
          emoji: '🗄️'
        }
      ]
    },
    'science': {
      title: 'Khoa Học',
      emoji: '🔬',
      color: 'from-teal-500 to-cyan-500',
      cards: [
        {
          question: 'H2O là công thức của gì?',
          answer: 'Nước',
          explanation: 'H2O là công thức hóa học của nước',
          emoji: '💧'
        },
        {
          question: 'O2 là công thức của gì?',
          answer: 'Khí oxy',
          explanation: 'O2 là công thức hóa học của khí oxy',
          emoji: '🫁'
        },
        {
          question: 'CO2 là công thức của gì?',
          answer: 'Khí cacbonic',
          explanation: 'CO2 là công thức hóa học của khí cacbonic',
          emoji: '🌍'
        },
        {
          question: 'Trái đất quay quanh gì?',
          answer: 'Mặt trời',
          explanation: 'Trái đất quay quanh mặt trời trong 365 ngày',
          emoji: '🌞'
        },
        {
          question: 'Mặt trăng quay quanh gì?',
          answer: 'Trái đất',
          explanation: 'Mặt trăng là vệ tinh tự nhiên của trái đất',
          emoji: '🌙'
        }
      ]
    },
    'history': {
      title: 'Lịch Sử Việt Nam',
      emoji: '🏛️',
      color: 'from-amber-500 to-yellow-500',
      cards: [
        {
          question: 'Ai là vị vua đầu tiên của Việt Nam?',
          answer: 'Hùng Vương',
          explanation: 'Hùng Vương là vị vua đầu tiên trong lịch sử Việt Nam',
          emoji: '👑'
        },
        {
          question: 'Triều đại nào kéo dài nhất trong lịch sử Việt Nam?',
          answer: 'Nhà Lý',
          explanation: 'Nhà Lý kéo dài từ 1009-1225, hơn 200 năm',
          emoji: '🏰'
        },
        {
          question: 'Ai là người sáng lập ra Đảng Cộng sản Việt Nam?',
          answer: 'Nguyễn Ái Quốc (Hồ Chí Minh)',
          explanation: 'Nguyễn Ái Quốc (Hồ Chí Minh) sáng lập Đảng Cộng sản Việt Nam năm 1930',
          emoji: '🇻🇳'
        },
        {
          question: 'Cuộc khởi nghĩa nào kết thúc thời kỳ Bắc thuộc lần thứ 3?',
          answer: 'Khởi nghĩa Hai Bà Trưng',
          explanation: 'Khởi nghĩa Hai Bà Trưng năm 40-43 sau Công nguyên',
          emoji: '⚔️'
        },
        {
          question: 'Ai là người đánh bại quân Mông Cổ?',
          answer: 'Trần Hưng Đạo',
          explanation: 'Trần Hưng Đạo đánh bại quân Mông Cổ trong 3 lần xâm lược',
          emoji: '🛡️'
        }
      ]
    },
    'geography': {
      title: 'Địa Lý Thế Giới',
      emoji: '🌍',
      color: 'from-emerald-500 to-green-500',
      cards: [
        {
          question: 'Thủ đô của Nhật Bản là gì?',
          answer: 'Tokyo',
          explanation: 'Tokyo là thủ đô và thành phố lớn nhất của Nhật Bản',
          emoji: '🗼'
        },
        {
          question: 'Sông nào dài nhất thế giới?',
          answer: 'Sông Nile',
          explanation: 'Sông Nile ở châu Phi dài khoảng 6.650 km',
          emoji: '🌊'
        },
        {
          question: 'Núi nào cao nhất thế giới?',
          answer: 'Everest',
          explanation: 'Núi Everest cao 8.848 mét so với mực nước biển',
          emoji: '🏔️'
        },
        {
          question: 'Đại dương nào lớn nhất?',
          answer: 'Thái Bình Dương',
          explanation: 'Thái Bình Dương chiếm 1/3 diện tích Trái Đất',
          emoji: '🌊'
        },
        {
          question: 'Châu lục nào nhỏ nhất?',
          answer: 'Châu Đại Dương',
          explanation: 'Châu Đại Dương (Oceania) là châu lục nhỏ nhất',
          emoji: '🏝️'
        }
      ]
    }
  };

  // Initialize
  function init() {
    try {
      renderFlashcardSets();
      setupEventListeners();
      console.log('Flashcard app initialized successfully');
    } catch (error) {
      console.error('Error initializing flashcard app:', error);
    }
  }

  // Render flashcard sets
  function renderFlashcardSets() {
    flashcardSets.innerHTML = '';
    
    Object.entries(flashcardData).forEach(([key, set]) => {
      const setElement = document.createElement('div');
      setElement.className = `btn-modern bg-gradient-to-br ${set.color} p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-110 hover:-translate-y-2 cursor-pointer group`;
      setElement.innerHTML = `
        <div class="text-center text-white">
          <div class="text-6xl mb-6 floating group-hover:scale-110 transition-transform duration-300">${set.emoji}</div>
          <h4 class="text-2xl font-bold mb-4 drop-shadow-lg">${set.title}</h4>
          <div class="glass-effect px-4 py-2 rounded-full inline-block">
            <p class="text-sm font-medium opacity-90">📖 ${set.cards.length} thẻ</p>
          </div>
          <div class="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <p class="text-sm font-medium">👆 Nhấn để bắt đầu</p>
          </div>
        </div>
      `;
      
      setElement.addEventListener('click', () => startFlashcardSet(key));
      flashcardSets.appendChild(setElement);
    });
  }

  // Start a flashcard set
  function startFlashcardSet(setKey) {
    try {
      currentSet = flashcardData[setKey];
      if (!currentSet) {
        console.error('Flashcard set not found:', setKey);
        return;
      }
      
      currentIndex = 0;
      isFlipped = false;
      studyMode = 'question';
      
      // Hide sets, show controls
      flashcardSets.style.display = 'none';
      audioBtn.classList.remove('hidden');
      flipBtn.classList.remove('hidden');
      nextBtn.classList.remove('hidden');
      shuffleBtn.classList.remove('hidden');
      restartBtn.classList.remove('hidden');
      
      // Update UI
      updateCard();
      updateProgress();
      startStudyTimer();
      
      console.log('Started flashcard set:', setKey);
    } catch (error) {
      console.error('Error starting flashcard set:', error);
    }
  }

  // Shuffle cards
  function shuffleCards() {
    if (!currentSet) return;
    
    // Fisher-Yates shuffle algorithm
    for (let i = currentSet.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentSet.cards[i], currentSet.cards[j]] = [currentSet.cards[j], currentSet.cards[i]];
    }
    
    // Reset to first card
    currentIndex = 0;
    isFlipped = false;
    studyMode = 'question';
    updateCard();
    updateProgress();
  }

  // Update card display
  function updateCard() {
    try {
      if (!currentSet) {
        console.warn('No current set available');
        return;
      }
      
      const card = currentSet.cards[currentIndex];
      if (!card) {
        console.error('Card not found at index:', currentIndex);
        return;
      }
      
      if (studyMode === 'question') {
        cardQuestion.textContent = card.question;
        cardHint.textContent = '👆 Click vào thẻ để xem đáp án';
        cardEmoji.textContent = card.emoji;
        cardContainer.classList.remove('flipped');
        
        // Play audio if available
        if (card.audio) {
          playAudio(card.audio);
        }
      } else {
        cardAnswer.textContent = card.answer;
        cardExplanation.textContent = card.explanation;
        cardEmoji.textContent = card.emoji;
        cardContainer.classList.add('flipped');
      }
      
      console.log('Updated card:', studyMode, card.question);
    } catch (error) {
      console.error('Error updating card:', error);
    }
  }

  // Play audio function
  function playAudio(audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      audio.play().catch(e => {
        console.log('Audio play failed:', e);
      });
    } catch (e) {
      console.log('Audio creation failed:', e);
    }
  }

  // Study timer functions
  function startStudyTimer() {
    studyStartTime = Date.now();
    studyTimer = setInterval(updateStudyTime, 1000);
    document.getElementById('studyStats').classList.remove('hidden');
  }

  function stopStudyTimer() {
    if (studyTimer) {
      clearInterval(studyTimer);
      studyTimer = null;
    }
  }

  function updateStudyTime() {
    if (studyStartTime) {
      const elapsed = Math.floor((Date.now() - studyStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      document.getElementById('studyTime').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
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
    try {
      if (!currentSet) {
        console.warn('No current set available for flipping');
        return;
      }
      
      console.log('Before flip - isFlipped:', isFlipped, 'studyMode:', studyMode);
      
      // Toggle the flipped state
      isFlipped = !isFlipped;
      studyMode = isFlipped ? 'answer' : 'question';
      
      console.log('After flip - isFlipped:', isFlipped, 'studyMode:', studyMode);
      
      // Update the CSS class for animation
      if (isFlipped) {
        cardContainer.classList.add('flipped');
      } else {
        cardContainer.classList.remove('flipped');
      }
      
      // Update content immediately
      const card = currentSet.cards[currentIndex];
      if (!card) {
        console.error('Card not found at index:', currentIndex);
        return;
      }
      
      if (studyMode === 'question') {
        cardQuestion.textContent = card.question;
        cardHint.textContent = '👆 Click vào thẻ để xem đáp án';
        cardEmoji.textContent = card.emoji;
        console.log('Showing question:', card.question);
      } else {
        cardAnswer.textContent = card.answer;
        cardExplanation.textContent = card.explanation;
        cardEmoji.textContent = card.emoji;
        console.log('Showing answer:', card.answer);
      }
      
    } catch (error) {
      console.error('Error flipping card:', error);
    }
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
    stopStudyTimer();
    cardContainer.innerHTML = `
      <div class="bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-xl rounded-xl p-8 text-center">
        <div class="text-6xl mb-4">🎉</div>
        <h2 class="text-3xl font-bold mb-4">Hoàn thành!</h2>
        <p class="text-lg opacity-90">Bạn đã học xong tất cả ${currentSet.cards.length} thẻ</p>
        <p class="text-sm opacity-75 mt-2">Thời gian học: <span id="finalTime"></span></p>
      </div>
    `;
    
    // Show final study time
    if (studyStartTime) {
      const elapsed = Math.floor((Date.now() - studyStartTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      document.getElementById('finalTime').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    audioBtn.classList.add('hidden');
    flipBtn.classList.add('hidden');
    nextBtn.classList.add('hidden');
    shuffleBtn.classList.add('hidden');
  }

  // Restart
  function restart() {
    currentIndex = 0;
    isFlipped = false;
    studyMode = 'question';
    stopStudyTimer();
    
    // Show sets again
    flashcardSets.style.display = 'grid';
    audioBtn.classList.add('hidden');
    flipBtn.classList.add('hidden');
    nextBtn.classList.add('hidden');
    shuffleBtn.classList.add('hidden');
    restartBtn.classList.add('hidden');
    
    // Reset card display
    cardContainer.innerHTML = `
      <div class="card-inner">
        <div class="card-front card-clickable">
          <div class="text-center">
            <div class="text-8xl mb-8 floating">📚</div>
            <h2 class="text-4xl font-bold mb-6 text-white drop-shadow-lg">Chọn bộ flashcard để bắt đầu</h2>
            <p class="text-xl opacity-90 text-white drop-shadow">Nhấn vào bộ flashcard bên dưới để bắt đầu học</p>
          </div>
        </div>
      </div>
    `;
    
    updateProgress();
  }

  // Setup event listeners
  function setupEventListeners() {
    // Remove any existing event listeners first
    cardContainer.removeEventListener('click', handleCardClick);
    
    audioBtn.addEventListener('click', () => {
      if (currentSet && currentSet.cards[currentIndex].audio) {
        playAudio(currentSet.cards[currentIndex].audio);
      }
    });
    flipBtn.addEventListener('click', flipCard);
    nextBtn.addEventListener('click', nextCard);
    shuffleBtn.addEventListener('click', shuffleCards);
    restartBtn.addEventListener('click', restart);
    
    // Keyboard shortcuts - REMOVED to avoid conflicts
    // document.addEventListener('keydown', ...);
    
    // Card click to flip - use named function to avoid duplicates
    cardContainer.addEventListener('click', handleCardClick);
  }

  // Named function for card click to avoid duplicate listeners
  function handleCardClick(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('Card clicked, studyMode:', studyMode);
    
    if (currentSet) {
      flipCard();
    }
  }

  // Start the app
  init();
})();

