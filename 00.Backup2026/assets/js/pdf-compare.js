(function () {
  const $ = (id) => document.getElementById(id);
  const resultEl = $('result');
  const btn = $('compare');
  const resetBtn = $('reset');
  const fileA = $('pdfA');
  const fileB = $('pdfB');
  const resultsBody = document.getElementById('resultsBody');
  const MANIFEST_EDUBIT_URL = 'https://raw.githubusercontent.com/TienPD3/store.tienpd3.github.io/refs/heads/main/storage/edubit.json';
  const MANIFEST_GITHUB_URL = 'https://raw.githubusercontent.com/TienPD3/store.tienpd3.github.io/refs/heads/main/storage/github.json';
  const STORAGE_GITHUB_BASE = 'https://raw.githubusercontent.com/TienPD3/store.tienpd3.github.io/refs/heads/main';
  const STORAGE_EDUBIT_BASE = 'https://file.edubit.vn/storage';
  async function sha256(arrayBuffer) {
    const hash = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const bytes = new Uint8Array(hash);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function print(msg) {
    resultEl.textContent += msg + "\n";
  }

  function clearResult() {
    resultEl.textContent = '';
  }

  function addRow({ label, status }) {
    if (!resultsBody) return;
    const tr = document.createElement('tr');
    const td = (t) => { const d = document.createElement('td'); d.className = 'px-3 py-2 align-top'; d.textContent = t; return d; };
    tr.appendChild(td(label));
    const statusTd = document.createElement('td');
    statusTd.className = 'px-3 py-2 align-top';
    statusTd.textContent = status;
    tr.appendChild(statusTd);
    resultsBody.appendChild(tr);
  }

  function readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  // No text extraction is needed for hash-only compare

  async function compare() {
    clearResult();
    if (!fileA.files[0] || !fileB.files[0]) {
      print('Vui lòng chọn 2 file PDF.');
      return;
    }

    try {
      const [bufA, bufB] = await Promise.all([
        readAsArrayBuffer(fileA.files[0]),
        readAsArrayBuffer(fileB.files[0])
      ]);

      const [hashA, hashB] = await Promise.all([
        sha256(bufA),
        sha256(bufB)
      ]);

      print(`SHA-256 A: ${hashA}`);
      print(`SHA-256 B: ${hashB}`);

      if (hashA === hashB) {
        print('✅ Hai file giống hệt nhau (hash khớp).');
      } else {
        print('❌ Hash khác nhau.');
      }
    } catch (err) {
      console.error(err);
      print('Đã xảy ra lỗi khi so sánh PDF.');
    }
  }

  function reset() {
    fileA.value = '';
    fileB.value = '';
    clearResult();
  }

  btn.addEventListener('click', compare);
  resetBtn.addEventListener('click', reset);
  // Helpers
  async function fetchArrayBufferFromUrl(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Fetch thất bại: ' + url);
    return await res.arrayBuffer();
  }

  async function loadJson(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Không tải được: ' + url);
    return await res.json();
  }

  function getQueryParams() {
    const sp = new URLSearchParams(location.search);
    return {
      lession: sp.get('lession') || 'n5',
      index: parseInt(sp.get('index') || '1', 10)
    };
  }

  function buildUrlFromEdubit(manifest, lession, index) {
    const entry = (manifest || []).find(x => x.lession === lession);
    if (!entry) throw new Error('Không tìm thấy lession trong edubit.json');
    const { folder, file } = entry;
    const desired = Number(index);
    const allowed = Array.isArray(file.suffix) ? file.suffix : [];
    const resolved = allowed.includes(desired) ? desired : (allowed[0] ?? desired);
    const filename = `${file.prefix}${file.midfix}${resolved}${file.extension}`;
    return `${STORAGE_EDUBIT_BASE}/${folder}/${filename}`;
  }

  function buildUrlFromGithub(manifest, lession, index) {
    const entry = (manifest || []).find(x => x.lession === lession);
    if (!entry) throw new Error('Không tìm thấy lession trong github.json');
    const { folder, file } = entry;
    const desired = Number(index);
    const allowed = Array.isArray(file.suffix) ? file.suffix : [];
    const resolved = allowed.includes(desired) ? desired : (allowed[0] ?? desired);
    const filename = `${file.prefix}/${file.midfix}${resolved}${file.extension}`; // e.g. n5/minnao-1.pdf
    return `${STORAGE_GITHUB_BASE}/${folder}/${filename}`; // e.g. .../storage/japan/n5/minnao-1.pdf
  }

  function getSuffixList(manifest, lession) {
    const entry = (manifest || []).find(x => x.lession === lession);
    return entry && Array.isArray(entry.file?.suffix) ? entry.file.suffix.slice() : [];
  }

  function intersectNumeric(a, b) {
    const setB = new Set(b);
    return a.filter(x => setB.has(x));
  }

  async function autoCompareFromManifests() {
    try {
      print('Tự động so sánh (hash-only) tất cả chỉ số theo suffix...');
      const { lession, index } = getQueryParams();
      const [edubit, github] = await Promise.all([
        loadJson(MANIFEST_EDUBIT_URL),
        loadJson(MANIFEST_GITHUB_URL)
      ]);
      const entryEdubit = (edubit || []).find(x => x.lession === lession);
      // Determine suffix indices to compare
      const suffixA = getSuffixList(edubit, lession);
      const suffixB = getSuffixList(github, lession);
      let indices = suffixA.length && suffixB.length ? intersectNumeric(suffixA, suffixB) : (suffixA.length ? suffixA : suffixB);
      if (!indices || indices.length === 0) {
        // fallback: use provided index or 1..25
        indices = Number.isFinite(index) ? [Number(index)] : Array.from({length:25}, (_,i)=>i+1);
      }
      indices = Array.from(new Set(indices)).sort((a,b)=>a-b);

      for (const idx of indices) {
        try {
          const urlA = buildUrlFromEdubit(edubit, lession, idx);
          const urlB = buildUrlFromGithub(github, lession, idx);
          print(`\n=== Index ${idx} ===`);
          print(`A: ${urlA}`);
          print(`B: ${urlB}`);
          const [bufA, bufB] = await Promise.all([
            fetchArrayBufferFromUrl(urlA),
            fetchArrayBufferFromUrl(urlB)
          ]);
          const [hashA, hashB] = await Promise.all([
            sha256(bufA),
            sha256(bufB)
          ]);
          print(`SHA-256 A: ${hashA}`);
          print(`SHA-256 B: ${hashB}`);
          const label = entryEdubit && entryEdubit.file && entryEdubit.file.midfix ? `${entryEdubit.file.midfix}${idx}` : String(idx);
          if (hashA === hashB) {
            addRow({ label, status: '✅ Khớp' });
            print('✅ Khớp');
          } else {
            addRow({ label, status: '❌ Khác' });
            print('❌ Khác');
          }
        } catch (inner) {
          console.error(inner);
          print(`⚠️ Lỗi ở index ${idx}: ${inner && inner.message ? inner.message : 'unknown'}`);
          addRow({ label: '-', status: '⚠️ Lỗi' });
        }
      }
    } catch (e) {
      console.error(e);
      print('Tự động so sánh thất bại.');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { autoCompareFromManifests(); }, 0);
  });
})();
