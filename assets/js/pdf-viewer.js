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

  let pdfDoc = null;
  let currentPageNumber = 1;
  let totalPages = 0;
  let zoom = 1;
  let renderingInProgress = false;
  let pendingPageNumber = null;
  let currentFilePath = '';
  let scrollSaveTimer = null;

  // Storage keys
  const ZOOM_STORAGE_KEY = 'pdf_viewer_zoom_percent';
  const LAST_FILE_KEY = 'pdf_viewer_last_file';
  const RANGE_SELECT_KEY = 'pdf_range_select_value';
  const RANDOM_CHECKBOX_KEY = 'pdf_random_checkbox_enabled';
  const BOOKMARKS_KEY = 'pdf_bookmarks';
  const LESSON_SELECT_KEY = 'pdf_lesson_select_value';

  function clampPercent(v) { return Math.max(0, Math.min(100, v)); }

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

  function saveRangeSelection() {
    if (!rangeSelect) return;
    try { localStorage.setItem(RANGE_SELECT_KEY, rangeSelect.value); } catch {}
  }

  function restoreRangeSelection() {
    let val = 'study';
    try { val = localStorage.getItem(RANGE_SELECT_KEY) || 'study'; } catch {}
    if (rangeSelect) rangeSelect.value = val;
  }

  function saveRandomCheckbox() {
    if (!randomCheckbox) return;
    try { localStorage.setItem(RANDOM_CHECKBOX_KEY, randomCheckbox.checked ? 'true' : 'false'); } catch {}
  }

  function restoreRandomCheckbox() {
    let val = false;
    try { val = localStorage.getItem(RANDOM_CHECKBOX_KEY) === 'true'; } catch {}
    if (randomCheckbox) randomCheckbox.checked = val;
  }

  // Bookmark functions
  function getBookmarks() {
    try {
      const bookmarks = localStorage.getItem(BOOKMARKS_KEY);
      return bookmarks ? JSON.parse(bookmarks) : {};
    } catch {
      return {};
    }
  }

  function saveBookmarks(bookmarks) {
    try {
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (err) {
      console.log('Could not save bookmarks:', err);
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
                console.log('Could not load file:', bookmark.file);
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
  }

  // Bookmark lesson functionality
  let bookmarkLessonData = [];
  let currentBookmarkIndex = 0;

  function saveLessonSelection() {
    if (!lessonSelect) return;
    try { 
      localStorage.setItem(LESSON_SELECT_KEY, lessonSelect.value); 
    } catch {}
  }

  function restoreLessonSelection() {
    if (!lessonSelect) return;
    try {
      const saved = localStorage.getItem(LESSON_SELECT_KEY);
      if (saved) {
        lessonSelect.value = saved;
        if (saved === 'bookmarks') {
          loadBookmarksLesson();
        }
      }
    } catch {}
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
    }).catch((err) => {
      console.log('Could not load bookmark file:', bookmark.file, err);
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
    const container = document.querySelector('.overflow-auto');
    if (!container) return;
    const maxScroll = Math.max(1, container.scrollHeight - container.clientHeight);
    const ratio = container.scrollTop / maxScroll;
    try { localStorage.setItem(makeScrollKey(), String(ratio)); } catch {}
  }

  function restoreScrollPosition() {
    const container = document.querySelector('.overflow-auto');
    if (!container) return;
    let saved = null;
    try { saved = localStorage.getItem(makeScrollKey()); } catch {}
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

  function goToPage(pageNum) {
    if (!pdfDoc) return;
    saveScrollPosition();
    const clamped = Math.max(1, Math.min(pageNum, totalPages));
    currentPageNumber = clamped;
    try { localStorage.setItem('pdf_last_page', String(clamped)); } catch {}
    pageNumberInput.value = String(clamped);
    updateBookmarkUI();
    queueRender(clamped);
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
    console.log('loadPdf called with src:', src);
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
      
      console.log('PDF loading task created, waiting for promise...');
      pdfDoc = await loadingTask.promise;
      console.log('PDF loaded successfully, pages:', pdfDoc.numPages);
      
      totalPages = pdfDoc.numPages;
      pageCountEl.textContent = String(totalPages);
      currentFilePath = typeof src === 'string' ? src : (src && src.url) || (src && src.filename) || 'blob';
      
      if (typeof src === 'string') {
        saveLastFile(src);
      }
      
      let startPage = 1;
      if (!resetToPage1) {
        let savedPage = null;
        try { savedPage = localStorage.getItem('pdf_last_page'); } catch {}
        startPage = savedPage ? Math.max(1, Math.min(parseInt(savedPage, 10) || 1, pdfDoc.numPages)) : 1;
      }
      
      currentPageNumber = startPage;
      pageNumberInput.value = String(startPage);
      updateButtons();
      updateBookmarkUI();
      await renderPage(startPage);
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
    try {
      localStorage.setItem(LAST_FILE_KEY, path);
    } catch (err) {
      console.log('Could not save last file to localStorage:', err);
    }
  }

  function getLastFile() {
    try {
      return localStorage.getItem(LAST_FILE_KEY);
    } catch (err) {
      console.log('Could not get last file from localStorage:', err);
      return null;
    }
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
    try { localStorage.setItem(ZOOM_STORAGE_KEY, String(clamped)); } catch {}
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

  zoomInput.addEventListener('focus', () => { saveScrollPosition(); });

  document.addEventListener('keydown', (e) => {
    if (!pdfDoc) return;
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

  async function loadLessonManifest() {
    try {
      console.log('Loading lesson manifest from:', MANIFEST_URL);
      const response = await fetch(MANIFEST_URL, { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load manifest');
      lessonManifest = await response.json();
      console.log('Lesson manifest loaded:', lessonManifest);
      return lessonManifest;
    } catch (err) {
      console.error('Could not load lesson manifest:', err);
      return null;
    }
  }

  function buildPdfUrl(lesson, index) {
    console.log('buildPdfUrl called with lesson:', lesson, 'index:', index);
    if (!lessonManifest) {
      console.log('No lesson manifest available');
      return null;
    }
    const entry = lessonManifest.find(x => x.lession === lesson);
    console.log('Found entry:', entry);
    if (!entry) return null;
    const { folder, file } = entry;
    const filename = `${file.prefix}/${file.midfix}${index}${file.extension}`;
    
    const directUrl = `${STORAGE_BASE}/${folder}/${filename}`;
    
    console.log('Built filename:', filename);
    console.log('Direct URL:', directUrl);
    
    return directUrl;
  }

  // Test if URL is accessible
  async function testUrlAccess(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log('URL test result:', response.status, response.ok);
      return response.ok;
    } catch (err) {
      console.log('URL test failed:', err);
      return false;
    }
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
      
      console.log('Dropdown populated with options:', Array.from(lessonSelect.options).map(o => ({ value: o.value, text: o.textContent })));
    }
    
    // Now sync lesson selection after manifest is loaded
    (function syncLessonFromInitial(path) {
      const saved = localStorage.getItem(LESSON_SELECT_KEY);
      console.log('Saved lesson select value:', saved);
      
      if (saved && saved !== 'bookmarks') {
        // Use saved value if it's not bookmarks
        lessonSelect.value = saved;
        console.log('Restored lesson select to:', saved);
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
              console.log('Set lesson select from path to:', lessonSelect.value);
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
      console.log('Auto-load check - lessonSelect.value:', lessonSelect.value);
      if (lessonSelect.value && lessonSelect.value !== 'bookmarks') {
        console.log('Auto-loading PDF for selected lesson:', lessonSelect.value);
        lessonSelect.dispatchEvent(new Event('change'));
      } else {
        console.log('No auto-load - value is:', lessonSelect.value);
      }
    }, 100);
    
    lessonSelect.addEventListener('change', async () => {
      const value = lessonSelect.value;
      console.log('Lesson selected:', value);
      
      if (value === 'bookmarks') {
        loadBookmarksLesson();
      } else if (value.includes('minnao-')) {
        // New format: minnao-1, minnao-2, etc.
        const index = value.replace('minnao-', '');
        console.log('Parsed value:', value, 'index:', index);
        console.log('Available lessons:', lessonManifest?.map(l => ({ lession: l.lession, midfix: l.file.midfix, suffix: l.file.suffix })));
        console.log('Looking for index:', parseInt(index), 'in lessons');
        
        // Find the lesson that contains this file
        const entry = lessonManifest?.find(lesson => {
          console.log('Checking lesson:', lesson.lession, 'midfix:', lesson.file.midfix, 'suffix:', lesson.file.suffix);
          return lesson.file.midfix === 'minnao-' && lesson.file.suffix.includes(parseInt(index));
        });
        
        if (!entry) {
          console.error('Lesson not found in manifest for:', value);
          return;
        }
        
        const lesson = entry.lession;
        console.log('Found lesson:', lesson);
        
        const { folder, file } = entry;
        const filename = `${file.prefix}/${file.midfix}${index}${file.extension}`;
        
        // Try GitHub raw URL
        const urls = [
          `${STORAGE_BASE}/${folder}/${filename}`
        ];
        
        console.log('Trying multiple URLs:', urls);
        
        let loaded = false;
        for (const url of urls) {
          try {
            console.log('Trying URL:', url);
            saveLastFile(url);
            await loadPdf(url, false);
            console.log('PDF loaded successfully from:', url);
            if (randomCheckbox && randomCheckbox.checked && totalPages > 0) {
              const randomPage = Math.floor(Math.random() * totalPages) + 1;
              try { localStorage.setItem('pdf_last_page', String(randomPage)); } catch {}
              goToPage(randomPage);
            }
            loaded = true;
            break;
          } catch (err) {
            console.log('Failed to load from:', url, err.message);
            continue;
          }
        }
        
        if (!loaded) {
          console.error('All URLs failed to load PDF');
        }
      }
    });
  })();

  // Auto load from localStorage or default
  const lastFile = getLastFile();
  const defaultFile = null; // Don't auto-load any PDF by default
  const initial = lastFile || defaultFile;

  // Restore settings
  (function restoreZoom() {
    let saved = null;
    try { saved = localStorage.getItem(ZOOM_STORAGE_KEY); } catch {}
    const percent = saved ? parseInt(saved, 10) : 100;
    if (!Number.isNaN(percent)) {
      zoomInput.value = String(percent);
      zoom = percent / 100;
    }
  })();

  restoreRangeSelection();
  restoreRandomCheckbox();
  // restoreLessonSelection(); // Moved to after manifest load



  // Save scroll position on scroll
  const container = document.querySelector('.overflow-auto');
  if (container) {
    container.addEventListener('scroll', () => {
      if (scrollSaveTimer) clearTimeout(scrollSaveTimer);
      scrollSaveTimer = setTimeout(() => { saveScrollPosition(); }, 200);
    });
  }

  window.addEventListener('beforeunload', () => { saveScrollPosition(); });
})();

