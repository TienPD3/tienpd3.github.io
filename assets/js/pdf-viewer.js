(function () {
  const canvas = document.getElementById('pdfCanvas');
  const ctx = canvas.getContext('2d');
  const textLayerDiv = document.getElementById('textLayer');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const pageNumberInput = document.getElementById('pageNumber');
  const pageCountEl = document.getElementById('pageCount');
  const zoomInput = document.getElementById('zoomInput');
  const lessonSelect = document.getElementById('lessonSelect');
  const guideBand = document.getElementById('guideBand');
  const guideFromLine = document.getElementById('guideFromLine');
  const guideToLine = document.getElementById('guideToLine');
  const rangeSelect = document.getElementById('rangeSelect');
  const randomCheckbox = document.getElementById('randomCheckbox');
  const bookmarkBtn = document.getElementById('bookmarkBtn');
  const bookmarkListBtn = document.getElementById('bookmarkListBtn');
  const bookmarkMenu = document.getElementById('bookmarkMenu');
  const bookmarkList = document.getElementById('bookmarkList');
  const bookmarkIndicator = document.getElementById('bookmarkIndicator');
  const audioPlayer = document.getElementById('audioPlayer');
  const audioMuteBtn = document.getElementById('audioMuteBtn');

  let pdfDoc = null;
  let currentPageNumber = 1;
  let totalPages = 0;
  let zoom = 1;
  let renderingInProgress = false;
  let pendingPageNumber = null;
  let currentFilePath = '';
  let scrollSaveTimer = null;
  let bookmarkRenderTimer = null;
  let vocabularyData = null;
  let currentAudio = null;
  let isMuted = false;
  let userHasInteracted = false;
  
  // localStorage cache to reduce repeated reads
  const localStorageCache = new Map();

  // Storage keys
  const ZOOM_STORAGE_KEY = 'pdf_viewer_zoom_percent';
  const LAST_FILE_KEY = 'pdf_viewer_last_file';
  const RANGE_SELECT_KEY = 'pdf_range_select_value';
  const RANDOM_CHECKBOX_KEY = 'pdf_random_checkbox_enabled';
  const BOOKMARKS_KEY = 'pdf_bookmarks';
  const LESSON_SELECT_KEY = 'pdf_lesson_select_value';
  const MUTE_KEY = 'pdf_audio_muted';

  function clampPercent(v) { return Math.max(0, Math.min(100, v)); }

  // Audio and vocabulary functions
  async function loadVocabularyData() {
    if (vocabularyData) return vocabularyData;
    
    try {
      const response = await fetch('/assets/storage/japan/n4/minnao-n4.json');
      if (!response.ok) throw new Error('Failed to load vocabulary data');
      vocabularyData = await response.json();
      return vocabularyData;
    } catch (error) {
      console.error('Error loading vocabulary data:', error);
      return null;
    }
  }

  function findAudioForPage(pageNumber, targetLesson = null) {
    if (!vocabularyData) return null;
    
    // Use provided targetLesson or get from lessonSelect
    let lessonNumber = targetLesson;
    
    if (!lessonNumber) {
      const currentLesson = lessonSelect ? lessonSelect.value : null;
      if (!currentLesson || currentLesson === 'bookmarks') return null;
      
      // Extract lesson number from currentLesson (e.g., "minnao-26" -> "26")
      const lessonMatch = currentLesson.match(/(\d+)$/);
      if (!lessonMatch) return null;
      
      lessonNumber = lessonMatch[1];
    }
    
    // Find vocabulary items that match both lesson and page
    const pageItems = vocabularyData.filter(item => 
      item.lesson === lessonNumber && 
      item.page === pageNumber
    );
    
    if (pageItems.length === 0) return null;
    
    // Return the first item (with or without audio)
    return pageItems[0];
  }

  // TTS fallback function
  function fnPlayTTS(strText, strLang = 'ja', forceUnmute = false) {
    let elAudioElement = document.getElementById('tts-audio');
    if (!elAudioElement) {
      elAudioElement = document.createElement('audio');
      elAudioElement.id = 'tts-audio';
      document.body.appendChild(elAudioElement);
      
      // Add event listener to restore mute state after TTS ends
      elAudioElement.addEventListener('ended', () => {
        if (isMuted) {
          elAudioElement.muted = true;
        }
      });
    }
    const strUrl = `https://proxy.junookyo.workers.dev/?language=${strLang}&text=${encodeURIComponent(strText || '')}&speed=1`;
    elAudioElement.src = strUrl;
    elAudioElement.muted = forceUnmute ? false : isMuted;
    elAudioElement.play().catch(err => {
      console.error('Lỗi khi phát TTS:', err);
    });
  }

  function playAudio(audioUrl, word) {
    if (!audioPlayer) return;
    
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    
    // Only play audio if user has interacted and not muted
    if (!userHasInteracted || isMuted) {
      return;
    }
    
    if (audioUrl && audioUrl.trim() !== '') {
      // Use original audio if available
      audioPlayer.src = audioUrl;
      currentAudio = audioPlayer;
      
      audioPlayer.play().catch(err => {
        console.log('Autoplay prevented:', err);
      });
    } else if (word) {
      // Use TTS as fallback
      fnPlayTTS(word, 'ja');
    }
    
    updateMuteButton();
  }

  function updateMuteButton() {
    if (!audioMuteBtn) return;
    
    if (isMuted) {
      audioMuteBtn.textContent = '🔇';
      audioMuteBtn.title = 'Bật tiếng';
    } else {
      audioMuteBtn.textContent = '🔊';
      audioMuteBtn.title = 'Tắt tiếng';
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    setCachedItem(MUTE_KEY, isMuted ? 'true' : 'false');
    
    if (audioPlayer) {
      audioPlayer.muted = isMuted;
      
      // If unmuting and audio is loaded, try to play
      if (!isMuted && audioPlayer.src && userHasInteracted) {
        audioPlayer.play().catch(err => {
          console.log('Autoplay prevented:', err);
        });
      }
    }
    
    // Also control TTS audio
    const ttsAudio = document.getElementById('tts-audio');
    if (ttsAudio) {
      ttsAudio.muted = isMuted;
    }
    
    updateMuteButton();
  }

  function stopAudio() {
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.currentTime = 0;
    }
    
    // Also stop TTS audio
    const ttsAudio = document.getElementById('tts-audio');
    if (ttsAudio) {
      ttsAudio.pause();
      ttsAudio.currentTime = 0;
    }
  }

  function tryPlayCurrentAudio(forcePlay = false) {
    // If forcePlay is true (Q key), ignore mute state
    if (!forcePlay && isMuted) return;
    
    // For Q key, always reload audio for current page to ensure correct content
    if (forcePlay) {
      loadAudioForPage(currentPageNumber, true);
      return;
    }
    
    // Try to play current audio if available
    if (audioPlayer && audioPlayer.src) {
      audioPlayer.play().catch(err => {
        console.log('Autoplay prevented:', err);
      });
    } else if (currentAudio && currentAudio.isTTS) {
      // Play TTS if that's what we have
      fnPlayTTS(currentAudio.word, 'ja', forcePlay);
    } else {
      // If no current audio, try to load audio for current page
      loadAudioForPage(currentPageNumber);
    }
  }

  function getGuidePercents() {
    const selection = (rangeSelect && rangeSelect.value) || 'study';
    switch (selection) {
      case 'easy':
        return { start: 86, end: 100 };
      case 'normal':
        return { start: 57, end: 85 };
      case 'hard':
        return { start: 57, end: 100 };
      case 'very.hard':
        return { start: 57, end: 75 };
      case 'study':
      default:
        return { start: 0, end: 0 };
    }
  }

  // Optimized localStorage functions with caching
  function getCachedItem(key, defaultValue = null) {
    if (localStorageCache.has(key)) {
      return localStorageCache.get(key);
    }
    try {
      const value = localStorage.getItem(key) || defaultValue;
      localStorageCache.set(key, value);
      return value;
    } catch {
      return defaultValue;
    }
  }

  function setCachedItem(key, value) {
    try {
      localStorage.setItem(key, value);
      localStorageCache.set(key, value);
    } catch {}
  }

  function saveRangeSelection() {
    if (!rangeSelect) return;
    setCachedItem(RANGE_SELECT_KEY, rangeSelect.value);
  }

  function restoreRangeSelection() {
    const val = getCachedItem(RANGE_SELECT_KEY, 'study');
    if (rangeSelect) rangeSelect.value = val;
  }

  function saveRandomCheckbox() {
    if (!randomCheckbox) return;
    setCachedItem(RANDOM_CHECKBOX_KEY, randomCheckbox.checked ? 'true' : 'false');
  }

  function restoreRandomCheckbox() {
    const val = getCachedItem(RANDOM_CHECKBOX_KEY, 'false') === 'true';
    if (randomCheckbox) randomCheckbox.checked = val;
  }

  // Bookmark functions with caching
  function getBookmarks() {
    const cached = localStorageCache.get(BOOKMARKS_KEY);
    if (cached !== undefined) {
      return cached;
    }
    try {
      const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
      const parsed = bookmarks ? JSON.parse(bookmarks) : {};
      localStorageCache.set(BOOKMARKS_KEY, parsed);
      return parsed;
    } catch {
      const empty = {};
      localStorageCache.set(BOOKMARKS_KEY, empty);
      return empty;
    }
  }

  function saveBookmarks(bookmarks) {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      localStorageCache.set(BOOKMARKS_KEY, bookmarks);
    } catch (err) {
      // Could not save bookmarks
    }
  }

  function getCurrentFileKey() {
    return currentFilePath || 'unknown';
  }

  function addBookmark(pageNumber) {
    const bookmarks = getBookmarks();
    const fileKey = getCurrentFileKey();
    const bookmarkKey = `${fileKey}:${pageNumber}`;
    
    if (!bookmarks[bookmarkKey]) {
      bookmarks[bookmarkKey] = {
        file: fileKey,
        page: pageNumber,
        timestamp: Date.now()
      };
      saveBookmarks(bookmarks);
      updateBookmarkUI();
      
      if (bookmarkMenu && bookmarkMenu.style.display !== 'none') {
        renderBookmarkList();
      }
      
      if (lessonSelect && lessonSelect.value === 'bookmarks') {
        loadBookmarksLesson();
      }
    }
  }

  function removeBookmark(pageNumber) {
    const bookmarks = getBookmarks();
    const fileKey = getCurrentFileKey();
    const bookmarkKey = `${fileKey}:${pageNumber}`;
    
    if (bookmarks[bookmarkKey]) {
      delete bookmarks[bookmarkKey];
      saveBookmarks(bookmarks);
      updateBookmarkUI();
      
      if (bookmarkMenu && bookmarkMenu.style.display !== 'none') {
        renderBookmarkList();
      }
      
      if (lessonSelect && lessonSelect.value === 'bookmarks') {
        loadBookmarksLesson();
      }
    }
  }

  function isBookmarked(pageNumber) {
    const bookmarks = getBookmarks();
    const fileKey = getCurrentFileKey();
    const bookmarkKey = `${fileKey}:${pageNumber}`;
    return !!bookmarks[bookmarkKey];
  }

  function updateBookmarkUI() {
    if (!bookmarkBtn) return;
    const isCurrentBookmarked = isBookmarked(currentPageNumber);
    bookmarkBtn.textContent = isCurrentBookmarked ? '🔖' : '📖';
    bookmarkBtn.title = isCurrentBookmarked ? 'Bỏ đánh dấu trang này' : 'Đánh dấu trang này';
    
    if (bookmarkIndicator) {
      bookmarkIndicator.style.display = isCurrentBookmarked ? 'block' : 'none';
    }
  }

  function renderBookmarkList() {
    if (!bookmarkList) return;
    
    // Debounce bookmark rendering for better performance
    if (bookmarkRenderTimer) {
      clearTimeout(bookmarkRenderTimer);
    }
    
    bookmarkRenderTimer = setTimeout(() => {
      const bookmarks = getBookmarks();
      bookmarkList.innerHTML = '';
      
      const bookmarkArray = Object.values(bookmarks).sort((a, b) => a.timestamp - b.timestamp);
    
    if (bookmarkArray.length === 0) {
      const emptyItem = document.createElement('div');
      emptyItem.className = 'px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-sm';
      emptyItem.textContent = 'Chưa có bookmark nào';
      bookmarkList.appendChild(emptyItem);
      return;
    }

    bookmarkArray.forEach(bookmark => {
      const item = document.createElement('div');
      item.className = 'flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-b-0';
      
      const bookmarkInfo = document.createElement('div');
      bookmarkInfo.className = 'flex flex-col gap-1';
      
      const fileName = document.createElement('span');
      fileName.className = 'text-xs text-slate-500 dark:text-slate-400';
      fileName.textContent = bookmark.file.replace('storage/japan/', '').replace('.pdf', '');
      
      const pageInfo = document.createElement('span');
      pageInfo.className = 'text-sm font-medium';
      pageInfo.textContent = `Trang ${bookmark.page}`;
      if (bookmark.file === getCurrentFileKey() && bookmark.page === currentPageNumber) {
        pageInfo.className += ' text-brand-600 dark:text-brand-400';
      }
      
      bookmarkInfo.appendChild(fileName);
      bookmarkInfo.appendChild(pageInfo);
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors';
      removeBtn.innerHTML = '×';
      removeBtn.title = 'Xóa bookmark';
      
      item.appendChild(bookmarkInfo);
      item.appendChild(removeBtn);
      
      item.addEventListener('click', (e) => {
        if (e.target !== removeBtn) {
          if (lessonSelect && lessonSelect.value === 'bookmarks') {
            const targetIndex = bookmarkLessonData.findIndex(b => 
              b.file === bookmark.file && b.page === bookmark.page
            );
            if (targetIndex !== -1) {
              currentBookmarkIndex = targetIndex;
              loadCurrentBookmark();
              bookmarkMenu.classList.add('hidden');
            }
          } else {
            if (bookmark.file !== getCurrentFileKey()) {
              loadPdf(bookmark.file, true).then(() => {
                goToPage(bookmark.page);
                bookmarkMenu.classList.add('hidden');
              }).catch(() => {
                // Could not load file
              });
            } else {
              goToPage(bookmark.page);
              bookmarkMenu.classList.add('hidden');
            }
          }
        }
      });
      
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeBookmark(bookmark.page);
      });
      
      bookmarkList.appendChild(item);
    });
    }, 50); // 50ms debounce
  }

  // Bookmark lesson functionality
  let bookmarkLessonData = [];
  let currentBookmarkIndex = 0;

  function saveLessonSelection() {
    if (!lessonSelect) return;
    setCachedItem(LESSON_SELECT_KEY, lessonSelect.value);
  }

  function restoreLessonSelection() {
    if (!lessonSelect) return;
    const saved = getCachedItem(LESSON_SELECT_KEY);
    if (saved) {
      lessonSelect.value = saved;
      if (saved === 'bookmarks') {
        loadBookmarksLesson();
      }
    }
  }

  function loadBookmarksLesson() {
    const bookmarks = getBookmarks();
    bookmarkLessonData = Object.values(bookmarks).sort((a, b) => a.timestamp - b.timestamp);
    currentBookmarkIndex = 0;
    
    if (bookmarkLessonData.length === 0) {
      showBookmarkEmptyState();
      return;
    }
    
    loadCurrentBookmark();
  }

  function showBookmarkEmptyState() {
    canvas.width = 900;
    canvas.height = 200;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111';
    ctx.font = '20px Inter, system-ui, sans-serif';
    ctx.fillText('Chưa có bookmark nào để học', 20, 80);
    ctx.font = '14px Inter, system-ui, sans-serif';
    ctx.fillText('Hãy đánh dấu một số trang để tạo bài học bookmark', 20, 110);
    
    totalPages = 0;
    pageCountEl.textContent = '0';
    pageNumberInput.value = '0';
    updateButtons();
    updateBookmarkUI();
  }

  function loadCurrentBookmark() {
    if (bookmarkLessonData.length === 0) return;
    
    const bookmark = bookmarkLessonData[currentBookmarkIndex];
    currentFilePath = bookmark.file;
    
    loadPdf(bookmark.file, true).then(() => {
      totalPages = bookmarkLessonData.length;
      pageCountEl.textContent = String(totalPages);
      pageNumberInput.value = String(currentBookmarkIndex + 1);
      currentPageNumber = bookmark.page;
      queueRender(bookmark.page);
      updateButtons();
      updateBookmarkUI();
      
      // Load audio for the bookmark page
      loadAudioForPage(bookmark.page);
    }).catch((err) => {
      // Could not load bookmark file
    });
  }

  function goToNextBookmark() {
    if (bookmarkLessonData.length === 0) return;
    
    if (currentBookmarkIndex < bookmarkLessonData.length - 1) {
      currentBookmarkIndex++;
    } else {
      currentBookmarkIndex = 0;
    }
    
    loadCurrentBookmark();
  }

  function goToPrevBookmark() {
    if (bookmarkLessonData.length === 0) return;
    
    if (currentBookmarkIndex > 0) {
      currentBookmarkIndex--;
      loadCurrentBookmark();
    }
  }

  function updateGuideOverlay(viewportWidth, viewportHeight) {
    const { start, end } = getGuidePercents();
    const thickness = 4;
    if (guideFromLine && guideToLine && guideBand) {
      guideFromLine.style.display = 'block';
      guideToLine.style.display = 'block';
      guideBand.style.display = 'block';
      guideFromLine.style.width = viewportWidth + 'px';
      guideToLine.style.width = viewportWidth + 'px';
      guideFromLine.style.height = thickness + 'px';
      guideToLine.style.height = thickness + 'px';
      const y1 = Math.round(viewportHeight * (start / 100));
      const y2 = Math.round(viewportHeight * (end / 100));
      guideFromLine.style.top = Math.max(0, y1 - Math.floor(thickness / 2)) + 'px';
      guideToLine.style.top = Math.max(0, y2 - Math.floor(thickness / 2)) + 'px';
      guideBand.style.top = Math.min(y1, y2) + 'px';
      guideBand.style.height = Math.max(0, Math.abs(y2 - y1)) + 'px';
      guideBand.style.width = viewportWidth + 'px';
    }
  }

  function makeScrollKey() {
    return 'pdf_scroll_position';
  }

  function saveScrollPosition() {
    if (!container) return;
    const maxScroll = Math.max(1, container.scrollHeight - container.clientHeight);
    const ratio = container.scrollTop / maxScroll;
    setCachedItem(makeScrollKey(), String(ratio));
  }

  function restoreScrollPosition() {
    if (!container) return;
    const saved = getCachedItem(makeScrollKey());
    const ratio = saved ? parseFloat(saved) : 0;
    if (Number.isFinite(ratio)) {
      const maxScroll = Math.max(1, container.scrollHeight - container.clientHeight);
      container.scrollTop = Math.round(maxScroll * Math.max(0, Math.min(ratio, 1)));
    }
  }

  function updateButtons() {
    if (lessonSelect && lessonSelect.value === 'bookmarks') {
      prevBtn.disabled = !pdfDoc || currentBookmarkIndex <= 0;
      nextBtn.disabled = !pdfDoc || currentBookmarkIndex >= bookmarkLessonData.length - 1;
      pageNumberInput.disabled = !pdfDoc || renderingInProgress;
      zoomInput.disabled = !pdfDoc || renderingInProgress;
    } else {
      // Never disable prev/next buttons - allow wrap around
      prevBtn.disabled = !pdfDoc || renderingInProgress;
      nextBtn.disabled = !pdfDoc || renderingInProgress;
      pageNumberInput.disabled = !pdfDoc || renderingInProgress;
      zoomInput.disabled = !pdfDoc || renderingInProgress;
    }
  }

  async function renderPage(pageNum) {
    renderingInProgress = true;
    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: zoom });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      textLayerDiv.style.width = viewport.width + 'px';
      textLayerDiv.style.height = viewport.height + 'px';
      textLayerDiv.innerHTML = '';
      updateGuideOverlay(viewport.width, viewport.height);
      const renderContext = { canvasContext: ctx, viewport };
      await page.render(renderContext).promise;
      requestAnimationFrame(() => { restoreScrollPosition(); });
    } finally {
      renderingInProgress = false;
      
      if (lessonSelect && lessonSelect.value === 'bookmarks') {
        totalPages = bookmarkLessonData.length;
        pageCountEl.textContent = String(totalPages);
        pageNumberInput.value = String(currentBookmarkIndex + 1);
      }
      
      updateButtons();
      
      if (pendingPageNumber !== null) {
        const next = pendingPageNumber;
        pendingPageNumber = null;
        renderPage(next);
      }
    }
  }

  function queueRender(pageNum) {
    if (renderingInProgress) {
      pendingPageNumber = pageNum;
    } else {
      renderPage(pageNum);
    }
  }

  async function loadAudioForPage(pageNum, forcePlay = false) {
    // For bookmark mode, we need to get the lesson from the current bookmark
    let targetLesson = null;
    
    if (lessonSelect && lessonSelect.value === 'bookmarks') {
      // In bookmark mode, get lesson from current bookmark
      if (bookmarkLessonData && bookmarkLessonData.length > 0 && currentBookmarkIndex < bookmarkLessonData.length) {
        const currentBookmark = bookmarkLessonData[currentBookmarkIndex];
        
        if (currentBookmark && currentBookmark.file) {
          // Extract lesson number from bookmark file path
          // Try both patterns: bai39 and minnao-39
          let lessonMatch = currentBookmark.file.match(/bai(\d+)/);
          if (!lessonMatch) {
            lessonMatch = currentBookmark.file.match(/minnao-(\d+)/);
          }
          
          if (lessonMatch) {
            targetLesson = lessonMatch[1];
          }
        }
      }
      
      if (!targetLesson) {
        stopAudio();
        return;
      }
    } else if (!lessonSelect || !lessonSelect.value) {
      stopAudio();
      return;
    } else {
      // Normal lesson mode
      const lessonMatch = lessonSelect.value.match(/(\d+)$/);
      if (lessonMatch) {
        targetLesson = lessonMatch[1];
      } else {
        stopAudio();
        return;
      }
    }
    
    // Load vocabulary data if not already loaded
    await loadVocabularyData();
    
    // Find audio for current page
    const audioItem = findAudioForPage(pageNum, targetLesson);
    
    if (audioItem) {
      // Load audio (original or TTS)
      if (audioItem.audio && audioItem.audio.trim() !== '') {
        // Load original audio
        if (audioPlayer) {
          audioPlayer.src = audioItem.audio;
          currentAudio = audioPlayer;
        }
      } else if (audioItem.word) {
        // Prepare TTS
        currentAudio = { isTTS: true, word: audioItem.word };
      }
      
      // Always load audio, but only play if conditions are met
      const shouldPlay = forcePlay || (userHasInteracted && !isMuted);
      
      if (shouldPlay) {
        if (audioItem.audio && audioItem.audio.trim() !== '') {
          if (forcePlay) {
            // For Q key, temporarily unmute and play
            audioPlayer.muted = false;
            audioPlayer.play().catch(err => {
              console.log('Autoplay prevented:', err);
            });
            // Don't restore mute immediately, let it play
          } else {
            audioPlayer.play().catch(err => {
              console.log('Autoplay prevented:', err);
            });
          }
        } else if (audioItem.word) {
          fnPlayTTS(audioItem.word, 'ja', forcePlay);
        }
      } else {
        // Even when muted, ensure audio is loaded for Q key
        if (audioItem.audio && audioItem.audio.trim() !== '') {
          // Audio is already loaded above, just don't play
          if (audioPlayer) {
            audioPlayer.muted = isMuted; // Set mute state
          }
        }
        // For TTS, we don't need to preload since it's generated on demand
      }
    } else {
      // Stop audio if no audio found for this page
      stopAudio();
    }
  }

  function goToPage(pageNum) {
    if (!pdfDoc) return;
    saveScrollPosition();
    const clamped = Math.max(1, Math.min(pageNum, totalPages));
    currentPageNumber = clamped;
    setCachedItem('pdf_last_page', String(clamped));
    pageNumberInput.value = String(clamped);
    updateBookmarkUI();
    queueRender(clamped);
    
    // Load audio for the new page
    loadAudioForPage(clamped);
  }

  function goToNextPage() {
    if (!pdfDoc) return;
    
    if (lessonSelect && lessonSelect.value === 'bookmarks') {
      goToNextBookmark();
      return;
    }
    
    if (randomCheckbox && randomCheckbox.checked && totalPages > 0) {
      const randomPage = Math.floor(Math.random() * totalPages) + 1;
      goToPage(randomPage);
    } else {
      // Wrap around to page 1 if at last page
      const nextPage = currentPageNumber >= totalPages ? 1 : currentPageNumber + 1;
      goToPage(nextPage);
    }
  }

  async function loadPdf(src, resetToPage1 = false) {
    try {
      // Add CORS and other options for PDF.js
      const loadingTask = pdfjsLib.getDocument({
        url: src,
        cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/cmaps/',
        cMapPacked: true,
        withCredentials: false,
        httpHeaders: {
          'Access-Control-Allow-Origin': '*'
        }
      });
      
      pdfDoc = await loadingTask.promise;
      
      totalPages = pdfDoc.numPages;
      pageCountEl.textContent = String(totalPages);
      currentFilePath = typeof src === 'string' ? src : (src && src.url) || (src && src.filename) || 'blob';
      
      if (typeof src === 'string') {
        saveLastFile(src);
      }
      
      let startPage = 1;
      if (!resetToPage1) {
        const savedPage = getCachedItem('pdf_last_page');
        startPage = savedPage ? Math.max(1, Math.min(parseInt(savedPage, 10) || 1, pdfDoc.numPages)) : 1;
      }
      
      currentPageNumber = startPage;
      pageNumberInput.value = String(startPage);
      updateButtons();
      updateBookmarkUI();
      await renderPage(startPage);
      
      // Load audio for the initial page
      loadAudioForPage(startPage);
    } catch (error) {
      console.error('Error loading PDF:', error);
      // Show error message on canvas
      canvas.width = 900;
      canvas.height = 200;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#dc2626';
      ctx.font = '18px Inter, system-ui, sans-serif';
      ctx.fillText('Lỗi tải PDF:', 20, 60);
      ctx.fillStyle = '#111';
      ctx.font = '14px Inter, system-ui, sans-serif';
      ctx.fillText(error.message || 'Không thể tải file PDF', 20, 90);
      ctx.fillText('URL: ' + src, 20, 120);
    }
  }

  function saveLastFile(path) {
    setCachedItem(LAST_FILE_KEY, path);
  }

  function getLastFile() {
    return getCachedItem(LAST_FILE_KEY, null);
  }

  // Event listeners
  prevBtn.onclick = function() {
    if (lessonSelect && lessonSelect.value === 'bookmarks') {
      goToPrevBookmark();
    } else {
      // Wrap around to last page if at page 1
      const prevPage = currentPageNumber <= 1 ? totalPages : currentPageNumber - 1;
      goToPage(prevPage);
    }
  };

  nextBtn.onclick = function() {
    if (lessonSelect && lessonSelect.value === 'bookmarks') {
      goToNextBookmark();
    } else {
      if (randomCheckbox && randomCheckbox.checked && totalPages > 0) {
        const randomPage = Math.floor(Math.random() * totalPages) + 1;
        goToPage(randomPage);
      } else {
        // Wrap around to page 1 if at last page
        const nextPage = currentPageNumber >= totalPages ? 1 : currentPageNumber + 1;
        goToPage(nextPage);
      }
    }
  };

  pageNumberInput.addEventListener('change', () => {
    const val = parseInt(pageNumberInput.value, 10);
    if (!Number.isNaN(val)) {
      if (lessonSelect && lessonSelect.value === 'bookmarks') {
        if (val >= 1 && val <= bookmarkLessonData.length) {
          currentBookmarkIndex = val - 1;
          loadCurrentBookmark();
        }
      } else {
        goToPage(val);
      }
    }
  });

  function setZoomPercent(percent) {
    saveScrollPosition();
    const clamped = Math.max(25, Math.min(percent, 400));
    zoomInput.value = String(clamped);
    zoom = clamped / 100;
    setCachedItem(ZOOM_STORAGE_KEY, String(clamped));
    queueRender(currentPageNumber);
  }

  zoomInput.addEventListener('change', () => {
    const val = parseInt(zoomInput.value, 10);
    if (!Number.isNaN(val)) setZoomPercent(val);
  });

  if (rangeSelect) {
    rangeSelect.addEventListener('change', () => { saveRangeSelection(); queueRender(currentPageNumber); });
  }

  if (randomCheckbox) {
    randomCheckbox.addEventListener('change', saveRandomCheckbox);
  }

  if (bookmarkBtn) {
    bookmarkBtn.addEventListener('click', () => {
      if (isBookmarked(currentPageNumber)) {
        removeBookmark(currentPageNumber);
      } else {
        addBookmark(currentPageNumber);
      }
    });
  }

  if (bookmarkListBtn && bookmarkMenu) {
    bookmarkListBtn.addEventListener('click', () => {
      const isVisible = !bookmarkMenu.classList.contains('hidden');
      if (isVisible) {
        bookmarkMenu.classList.add('hidden');
      } else {
        bookmarkMenu.classList.remove('hidden');
        renderBookmarkList();
      }
    });

    document.addEventListener('click', (e) => {
      if (!bookmarkListBtn.contains(e.target) && !bookmarkMenu.contains(e.target)) {
        bookmarkMenu.classList.add('hidden');
      }
    });
  }

  if (lessonSelect) {
    lessonSelect.addEventListener('change', saveLessonSelection);
  }

  // Audio control event listeners
  if (audioMuteBtn) {
    audioMuteBtn.addEventListener('click', () => {
      userHasInteracted = true;
      toggleMute();
    });
  }

  // Restore mute state after audio ends
  if (audioPlayer) {
    audioPlayer.addEventListener('ended', () => {
      // Restore mute state after audio finishes
      if (isMuted) {
        audioPlayer.muted = true;
      }
    });
    
    // Also handle pause event
    audioPlayer.addEventListener('pause', () => {
      // Restore mute state when paused
      if (isMuted) {
        audioPlayer.muted = true;
      }
    });
  }

  // Track user interaction for autoplay
  document.addEventListener('click', () => {
    userHasInteracted = true;
    tryPlayCurrentAudio();
  }, { once: true });

  document.addEventListener('keydown', () => {
    userHasInteracted = true;
    tryPlayCurrentAudio();
  }, { once: true });

  zoomInput.addEventListener('focus', () => { saveScrollPosition(); });

  document.addEventListener('keydown', (e) => {
    if (!pdfDoc) return;
    
    // Handle Q key for audio playback
    if (e.key === 'q' || e.key === 'Q') {
      e.preventDefault();
      userHasInteracted = true;
      tryPlayCurrentAudio(true); // Force play regardless of mute state
      return;
    }
    
    if (e.key === 'ArrowRight') {
      if (lessonSelect && lessonSelect.value === 'bookmarks') {
        goToNextBookmark();
      } else {
        goToNextPage();
      }
    } else if (e.key === 'ArrowLeft') {
      if (lessonSelect && lessonSelect.value === 'bookmarks') {
        goToPrevBookmark();
      } else {
        if (currentPageNumber <= 1) {
          goToPage(totalPages);
        } else {
          goToPage(currentPageNumber - 1);
        }
      }
    }
  });


  // Load lesson manifest and initialize selector
  let lessonManifest = null;
  const MANIFEST_URL = '/assets/storage/github.json';
  const STORAGE_BASE = '/assets/storage';
  
  // Manifest cache to avoid repeated fetches
  let manifestCache = null;
  let manifestLoadPromise = null;

  async function loadLessonManifest() {
    // Return cached manifest if available
    if (manifestCache) {
      lessonManifest = manifestCache;
      return lessonManifest;
    }
    
    // Return existing promise if already loading
    if (manifestLoadPromise) {
      return manifestLoadPromise;
    }
    
    // Create new load promise
    manifestLoadPromise = (async () => {
      try {
        const response = await fetch(MANIFEST_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load manifest');
        lessonManifest = await response.json();
        manifestCache = lessonManifest;
        return lessonManifest;
      } catch (err) {
        console.error('Could not load lesson manifest:', err);
        return null;
      }
    })();
    
    return manifestLoadPromise;
  }

  function buildPdfUrl(lesson, index) {
    if (!lessonManifest) {
      return null;
    }
    const entry = lessonManifest.find(x => x.lession === lesson);
    if (!entry) return null;
    const { folder, file } = entry;
    const filename = `${file.prefix}/${file.midfix}${index}${file.extension}`;
    
    const directUrl = `${STORAGE_BASE}/${folder}/${filename}`;
    
    return directUrl;
  }

  // Initialize lesson select
  (async function initLessonSelect() {
    const bookmarksOption = document.createElement('option');
    bookmarksOption.value = 'bookmarks';
    bookmarksOption.textContent = '📚 Bookmarks';
    lessonSelect.appendChild(bookmarksOption);
    
    // Load manifest first
    await loadLessonManifest();
    
    if (lessonManifest) {
      // Add lesson groups
      lessonManifest.forEach(lesson => {
        const group = document.createElement('optgroup');
        group.label = lesson.lession.toUpperCase();
        
        // Add individual files for this lesson
        lesson.file.suffix.forEach(index => {
          const option = document.createElement('option');
          option.value = `${lesson.file.midfix}${index}`;
          option.textContent = `${lesson.lession} ${lesson.file.midfix}${index}`;
          group.appendChild(option);
        });
        
        lessonSelect.appendChild(group);
      });
      
    }
    
    // Now sync lesson selection after manifest is loaded
    (function syncLessonFromInitial(path) {
      const saved = getCachedItem(LESSON_SELECT_KEY);
      
      if (saved && saved !== 'bookmarks') {
        // Use saved value if it's not bookmarks
        lessonSelect.value = saved;
      } else if (!saved) {
        // Check for manifest format using dynamic pattern from manifest
        if (path && lessonManifest) {
          for (const entry of lessonManifest) {
            const { folder, file } = entry;
            const pattern = new RegExp(`${folder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/${file.prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/${file.midfix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\d+)${file.extension.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
            const match = pattern.exec(path);
            if (match) {
              const [, index] = match;
              lessonSelect.value = `${file.midfix}${index}`;
              break;
            }
          }
        }
        else if (path === 'bookmarks') {
          lessonSelect.value = 'bookmarks';
        }
      }
    })(initial);
    
    // Now restore lesson selection after everything is set up
    restoreLessonSelection();
    
    // Auto-load PDF after manifest is loaded and lesson selection is restored
    setTimeout(() => {
      if (lessonSelect.value && lessonSelect.value !== 'bookmarks') {
        lessonSelect.dispatchEvent(new Event('change'));
      }
    }, 100);
    
    lessonSelect.addEventListener('change', async () => {
      const value = lessonSelect.value;
      
      if (value === 'bookmarks') {
        loadBookmarksLesson();
        // Stop audio when switching to bookmarks
        stopAudio();
      } else {
        // Dynamic format based on manifest
        // Find the lesson that contains this file by checking all entries
        const entry = lessonManifest?.find(lesson => {
          const { midfix, suffix } = lesson.file;
          // Extract the number from value (e.g., "minnao-1" -> "1")
          const valueNumber = value.replace(midfix, '');
          return suffix.includes(parseInt(valueNumber));
        });
        
        if (!entry) {
          return;
        }
        
        const lesson = entry.lession;
        
        const { folder, file } = entry;
        const { midfix, suffix } = file;
        const valueNumber = value.replace(midfix, '');
        const filename = `${file.prefix}/${file.midfix}${valueNumber}${file.extension}`;
        
        // Try GitHub raw URL
        const urls = [
          `${STORAGE_BASE}/${folder}/${filename}`
        ];
        
        let loaded = false;
        for (const url of urls) {
          try {
            saveLastFile(url);
            await loadPdf(url, false);
            if (randomCheckbox && randomCheckbox.checked && totalPages > 0) {
              const randomPage = Math.floor(Math.random() * totalPages) + 1;
              setCachedItem('pdf_last_page', String(randomPage));
              goToPage(randomPage);
            } else {
              // Load audio for the current page after PDF is loaded
              loadAudioForPage(currentPageNumber);
            }
            loaded = true;
            break;
          } catch (err) {
            continue;
          }
        }
      }
    });
  })();

  // Auto load from localStorage or default
  const lastFile = getLastFile();
  const defaultFile = null; // Don't auto-load any PDF by default
  const initial = lastFile || defaultFile;

  // Load vocabulary data on page load
  loadVocabularyData();

  // Restore settings
  (function restoreZoom() {
    const saved = getCachedItem(ZOOM_STORAGE_KEY);
    const percent = saved ? parseInt(saved, 10) : 100;
    if (!Number.isNaN(percent)) {
      zoomInput.value = String(percent);
      zoom = percent / 100;
    }
  })();

  restoreRangeSelection();
  restoreRandomCheckbox();
  
  // Restore mute state
  (function restoreMuteState() {
    const saved = getCachedItem(MUTE_KEY);
    isMuted = saved === 'true';
    if (audioPlayer) {
      audioPlayer.muted = isMuted;
    }
    // Also set TTS audio muted state
    const ttsAudio = document.getElementById('tts-audio');
    if (ttsAudio) {
      ttsAudio.muted = isMuted;
    }
    updateMuteButton();
  })();

  // Cache container element
  const container = document.querySelector('.overflow-auto');
  
  // Save scroll position on scroll with passive listener for better performance
  if (container) {
    container.addEventListener('scroll', () => {
      if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
      scrollSaveTimer = setTimeout(() => { saveScrollPosition(); }, 200);
    }, { passive: true });
  }

  window.addEventListener('beforeunload', () => { saveScrollPosition(); });
})();

