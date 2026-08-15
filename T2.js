(function () {
  // ===================== CONFIG =====================
  const SPEED_MULTIPLIERS = [1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6];
  const BASE_RATE = 1.0; // Web Speech API rate is around 1.0 = normal
  const MAX_CHUNK_LEN = 220;

  const LANG_CONFIG = {
    vi: { code: 'vi-VN', name: 'Tiếng Việt', keywords: ['south', 'nam', 'saigon', 'linh', 'mai', 'female', 'nữ'] },
    en: { code: 'en-US', name: 'English', keywords: ['enhanced', 'premium', 'neural', 'natural', 'samantha', 'google'] },
    ja: { code: 'ja-JP', name: '日本語', keywords: ['enhanced', 'neural', 'kyoko', 'otoya', 'female'] },
    zh: { code: 'zh-CN', name: '中文', keywords: ['enhanced', 'neural', 'ting-ting', 'female', 'natural'] },
    ko: { code: 'ko-KR', name: '한국어', keywords: ['enhanced', 'neural', 'yuna', 'sora', 'female'] },
    fr: { code: 'fr-FR', name: 'Français', keywords: ['enhanced', 'neural', 'thomas', 'audrey', 'female'] },
    de: { code: 'de-DE', name: 'Deutsch', keywords: ['enhanced', 'neural', 'anna', 'marlene', 'female'] },
    es: { code: 'es-ES', name: 'Español', keywords: ['enhanced', 'neural', 'monica', 'jorge', 'female'] },
    ru: { code: 'ru-RU', name: 'Русский', keywords: ['enhanced', 'neural', 'tatyana', 'pavel', 'female'] },
    th: { code: 'th-TH', name: 'ไทย', keywords: ['enhanced', 'neural', 'kanya', 'female'] },
    id: { code: 'id-ID', name: 'Bahasa Indonesia', keywords: ['enhanced', 'neural', 'andika', 'female'] },
  };

  // ===================== STATE =====================
  let rawText = '';
  let textChunks = [];
  let currentChunkIndex = 0;
  let ttsState = 'stopped'; // stopped | playing | paused
  let selectedSpeedIndex = 0;
  let detectedLang = 'vi';
  let fontSize = 16;
  let voices = [];
  let currentUtterance = null;
  let isProcessing = false;

  // ===================== DOM =====================
  const $ = (id) => document.getElementById(id);
  const textInput = $('textInput');
  const urlInput = $('urlInput');
  const contentDisplay = $('contentDisplay');
  const sentenceInfo = $('sentenceInfo');
  const langBadge = $('langBadge');
  const playLabel = $('playLabel');
  const playIcon = $('playIcon');
  const btnStop = $('btnStop');
  const ttsStatus = $('ttsStatus');
  const loadStatus = $('loadStatus');
  const voiceSelect = $('voiceSelect');
  const jumpInput = $('jumpInput');
  const btnSpeed = $('btnSpeed');

  // Tabs
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const isUrl = tab.dataset.tab === 'url';
      $('panel-text').style.display = isUrl ? 'none' : 'block';
      $('panel-url').style.display = isUrl ? 'block' : 'none';
    });
  });

  $('advToggle').addEventListener('click', () => {
    $('advancedBox').classList.toggle('show');
  });

  // ===================== LANGUAGE DETECT =====================
  function detectLanguageCode(text) {
    if (!text || !text.trim()) return 'vi';
    const sample = text.length > 1000 ? text.substring(0, 1000) : text;

    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(sample)) return 'ja';
    if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(sample)) return 'ko';
    if (/[\u0E00-\u0E7F]/.test(sample)) return 'th';
    if (/[\u0400-\u04FF]/.test(sample)) return 'ru';
    if (/[\u4E00-\u9FFF]/.test(sample)) return 'zh';

    // Vietnamese unique chars
    if (/[ăắằẳẵặơớờởỡợưứừửữựđĂẮẰẲẴẶƠỚỜỞỠỢƯỨỪỬỮỰĐ]/i.test(sample)) return 'vi';

    const lower = sample.toLowerCase();
    const score = (re) => (lower.match(re) || []).length;

    let scores = {
      en: score(/\b(the|and|is|you|that|it|he|was|for|on|are|as|with|his|they|at|be|this|from|or|an|will|my|would|there|their)\b/g),
      fr: score(/\b(le|la|les|un|une|des|et|est|dans|en|du|que|qui|pour|pas|sur|ce|avec|ne|se|plus|par|sont|mais|ou|donc|car|je|tu|il|elle|nous|vous|ils|elles)\b/g),
      de: score(/\b(der|die|das|und|ist|in|den|von|zu|mit|sich|des|auf|für|im|dem|nicht|ein|eine|als|auch|es|an|ich|du|er|sie|wir|ihr)\b/g),
      es: score(/\b(el|la|los|las|un|una|unos|unas|y|en|que|es|por|con|para|su|del|como|más|pero|sus|le|ya|o|yo|tú|él|ella|nosotros)\b/g),
      id: score(/\b(yang|dan|di|dari|untuk|pada|ke|dengan|ini|itu|atau|adalah|tidak|akan|juga|sebagai|oleh|ada)\b/g),
    };

    let max = 0, detected = 'en';
    for (const [k, v] of Object.entries(scores)) {
      if (v > max) { max = v; detected = k; }
    }
    return max >= 2 ? detected : 'en';
  }

  // ===================== ROMAN NUMERALS =====================
  const romanRegex = /(?<=^|[\s\(\[\{,.:;\-])(?=[MDCLXVI])(M{0,3}(?:CM|CD|D?C{0,3})(?:XC|XL|L?X{0,3})(?:IX|IV|V?I{0,3}))(\.?)(?=[\s\)\}\],.:;!?]|$)/g;
  const contextVi = /\b(chương|phần|mục|tập|điều|bảng|thế kỷ|bước|kỳ|mệnh|đại|bài|đoạn|hình|sơ đồ|cột|ví dụ|số|hạng|phụ lục)\s*$/i;
  const contextEn = /\b(chapter|part|section|volume|article|table|century|step|phase|figure|diagram|column|example|number|appendix)\s*$/i;

  function parseRoman(roman) {
    const values = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
    let total = 0, prev = 0;
    for (let i = roman.length - 1; i >= 0; i--) {
      const cur = values[roman[i]] || 0;
      total += cur < prev ? -cur : cur;
      prev = cur;
    }
    return total;
  }

  function numberToVietnamese(n) {
    if (n <= 0) return '';
    if (n > 3999) return String(n);
    const units = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
    if (n < 10) return units[n];
    const thousands = Math.floor(n / 1000);
    const rem1000 = n % 1000;
    const hundreds = Math.floor(rem1000 / 100);
    const rem100 = rem1000 % 100;
    const tens = Math.floor(rem100 / 10);
    const ones = rem100 % 10;
    const res = [];
    if (thousands) res.push(units[thousands] + ' nghìn');
    if (hundreds) res.push(units[hundreds] + ' trăm');
    else if (thousands && rem100) res.push('không trăm');
    if (tens > 1) {
      res.push(units[tens] + ' mươi');
      if (ones === 1) res.push('mốt');
      else if (ones === 4) res.push('tư');
      else if (ones === 5) res.push('lăm');
      else if (ones) res.push(units[ones]);
    } else if (tens === 1) {
      res.push('mười');
      if (ones === 5) res.push('lăm');
      else if (ones) res.push(units[ones]);
    } else if (ones) {
      if (thousands || hundreds) res.push('linh');
      res.push(ones === 4 && (thousands || hundreds) ? 'tư' : units[ones]);
    }
    return res.join(' ');
  }

  function convertRomanByLanguage(text, langKey) {
    return text.replace(romanRegex, (match, romanStr, hasDot, offset, full) => {
      if (!romanStr) return match;
      if (romanStr === 'I') {
        const prefix = full.substring(0, offset);
        const suffix = full.substring(offset + match.length);
        let isRoman = false;
        if (langKey === 'vi') {
          const hasCtx = contextVi.test(prefix);
          const followedByNum = /^\s*[\.\-\:]?\s*\d+/.test(suffix);
          const clean = prefix.replace(/[\s\(\[\{\*\#-]+$/, '');
          const atStart = !clean || clean.endsWith('\n');
          const inBrackets = prefix.endsWith('(') || prefix.endsWith('[');
          isRoman = !!hasDot || followedByNum || hasCtx || atStart || inBrackets;
        } else {
          const hasCtx = contextEn.test(prefix);
          const clean = prefix.replace(/[\s\(\[\{\*\#-]+$/, '');
          const atStart = !clean || clean.endsWith('\n');
          const inBrackets = prefix.endsWith('(') || prefix.endsWith('[');
          isRoman = hasCtx || (atStart && !!hasDot) || (atStart && inBrackets);
        }
        if (!isRoman) return match;
      }
      const num = parseRoman(romanStr);
      if (!num) return match;
      const pause = hasDot ? ',' : '';
      if (langKey === 'vi') return numberToVietnamese(num) + ' la mã' + pause;
      return num + pause;
    });
  }

  // ===================== PREPARE TEXT =====================
  function prepareTextForTts(text, langKey) {
    let result = text;
    // Remove code, links, markdown
    result = result
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`.*?`/g, '')
      .replace(/https?:\/\/\S+|www\.\S+/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Emoji & special
    result = result.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    result = result.replace(/["“”„‟«»]/g, ' ');
    result = result.replace(/['‘’‚‛]/g, ' ');
    result = result.replace(/[\u200B-\u200D\uFEFF]/g, '');
    result = result.replace(/\.{2,}/g, '.');
    result = result.replace(/[\(\)\[\]\{\}]/g, ' ');
    result = result.replace(/\s*\.\s*\./g, '.');
    result = result.replace(/\s+/g, ' ');

    if (langKey === 'en') {
      const abbr = {
        '\\be\\.g\\.\\b': 'for example',
        '\\bi\\.e\\.\\b': 'that is',
        '\\betc\\.\\b': 'et cetera',
        '\\bvs\\.\\b': 'versus',
        '\\bDr\\.\\b': 'Doctor',
        '\\bMr\\.\\b': 'Mister',
        '\\bMrs\\.\\b': 'Missus',
        '\\bMs\\.\\b': 'Miss',
        '\\bProf\\.\\b': 'Professor',
        '\\bapprox\\.\\b': 'approximately',
      };
      for (const [p, r] of Object.entries(abbr)) {
        result = result.replace(new RegExp(p, 'gi'), r);
      }
      const months = ['', 'January','February','March','April','May','June','July','August','September','October','November','December'];
      result = result.replace(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/g, (m, a, b, c) => {
        let day = +a, month = +b, year = +c;
        if (year > 0 && year < 100) year = year >= 50 ? 1900 + year : 2000 + year;
        if (a <= 12 && b > 12) { month = +a; day = +b; }
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
          return `${months[month]} ${day}, ${year}`;
        }
        return m;
      });
    }

    if (langKey === 'vi') {
      result = result.replace(/\b[Mm]\.?\s*[Uu]\.?\s*bàn\s+tay\b/gi, 'muu bàn tay');
      result = result.replace(/\b[Mm]u\s+bàn\s+tay\b/g, 'muu bàn tay');
      result = result.replace(/\b([Nn]gày|[Nn]gay)\s*[:\-]?\s*(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/g, (m, w, d, mo, y) => {
        let year = +y;
        if (year > 0 && year < 100) year = year >= 50 ? 1900 + year : 2000 + year;
        if (+d >= 1 && +d <= 31 && +mo >= 1 && +mo <= 12 && year >= 1900 && year <= 2100) {
          return `ngày ${d} tháng ${mo} năm ${year}`;
        }
        return m;
      });
      result = result.replace(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})\b/g, (m, d, mo, y) => {
        let year = +y;
        if (year > 0 && year < 100) year = year >= 50 ? 1900 + year : 2000 + year;
        if (+d >= 1 && +d <= 31 && +mo >= 1 && +mo <= 12 && year >= 1900 && year <= 2100) {
          return `ngày ${d} tháng ${mo} năm ${year}`;
        }
        return m;
      });
      result = result.replace(/\b(\d{1,2}):(\d{2})\b/g, '$1 giờ $2 phút');
      const abbrVi = {
        '\\bTP\\.?\\s*HCM\\b': 'Thành phố Hồ Chí Minh',
        '\\bTP\\.?\\b': 'Thành phố',
        '\\bSĐT\\b': 'Số điện thoại',
        '\\bBL\\b': 'Luận giải',
        '\\bkg\\b': 'ki-lô-gam',
        '\\bvnđ\\b': 'Việt Nam đồng',
        '\\bđ\\b': 'đồng',
      };
      for (const [p, r] of Object.entries(abbrVi)) {
        result = result.replace(new RegExp(p, 'gi'), r);
      }
    }

    // Common symbols
    result = result.replace(/^[ \t]*[\*\-\•\+]\s+/gm, '');
    if (langKey === 'vi') {
      result = result.replace(/&/g, ' và ').replace(/%/g, ' phần trăm ').replace(/\+/g, ' cộng ');
    } else if (langKey === 'en') {
      result = result.replace(/&/g, ' and ').replace(/%/g, ' percent ').replace(/\+/g, ' plus ');
    }
    result = result.replace(/@/g, ' at ');
    result = result.replace(/(\d+)\s*\/\s*(\d+)/g, '$1 / $2');

    result = convertRomanByLanguage(result, langKey);

    result = result.replace(/[*#_`~>=]+/g, ' ');
    result = result.replace(/:/g, ', ');
    result = result.replace(/\n+/g, ' ');
    result = result.replace(/\s+/g, ' ').trim();
    return result;
  }

  // ===================== SPLIT CHUNKS =====================
  function splitTextIntoChunks(text, langKey) {
    const clean = prepareTextForTts(text, langKey);
    if (!clean) return [];
    const rawSentences = clean.split(/(?<=[.!?;…])\s+/);
    const chunks = [];
    let current = '';

    function flushLong(sentence) {
      const parts = sentence.split(/(?<=[,;])\s+/);
      let buf = '';
      for (let part of parts) {
        part = part.trim();
        if (!part) continue;
        if (part.length >= MAX_CHUNK_LEN) {
          if (buf) { chunks.push(buf); buf = ''; }
          const words = part.split(/\s+/);
          let wbuf = '';
          for (const w of words) {
            if (!w) continue;
            if ((wbuf.length + w.length + 1) < MAX_CHUNK_LEN) {
              wbuf += (wbuf ? ' ' : '') + w;
            } else {
              if (wbuf) chunks.push(wbuf);
              wbuf = w;
            }
          }
          if (wbuf) buf = wbuf;
        } else if ((buf.length + part.length + 1) < MAX_CHUNK_LEN) {
          buf += (buf ? ' ' : '') + part;
        } else {
          if (buf) chunks.push(buf);
          buf = part;
        }
      }
      if (buf) current = buf;
    }

    for (let sentence of rawSentences) {
      sentence = sentence.trim();
      if (!sentence) continue;
      if ((current.length + sentence.length) < MAX_CHUNK_LEN) {
        current += (current ? ' ' : '') + sentence;
      } else {
        if (current) chunks.push(current);
        current = '';
        if (sentence.length >= MAX_CHUNK_LEN) flushLong(sentence);
        else current = sentence;
      }
    }
    if (current) chunks.push(current);
    return chunks;
  }

  // ===================== VOICES =====================
  function loadVoices() {
    voices = speechSynthesis.getVoices();
    populateVoiceSelect();
  }
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }
  loadVoices();

  function scoreVoice(voice, langKey) {
    const cfg = LANG_CONFIG[langKey] || LANG_CONFIG.vi;
    const name = (voice.name || '').toLowerCase();
    const lang = (voice.lang || '').toLowerCase();
    const codeShort = cfg.code.toLowerCase().slice(0, 2); // vi, en, ja...
    let score = 0;

    // Ưu tiên khớp locale chính xác
    if (lang === cfg.code.toLowerCase() || lang === cfg.code.toLowerCase().replace('-', '_')) score += 80;
    else if (lang.startsWith(codeShort + '-') || lang.startsWith(codeShort + '_')) score += 55;
    else if (lang.startsWith(codeShort)) score += 35;

    // Chất lượng giọng
    if (name.includes('neural') || name.includes('wavenet') || name.includes('enhanced') || name.includes('premium')) score += 30;
    if (name.includes('natural') || name.includes('google')) score += 18;
    if (name.includes('siri') || name.includes('samantha') || name.includes('ava')) score += 15;

    cfg.keywords.forEach((kw, i) => {
      if (name.includes(kw)) score += (cfg.keywords.length - i) * 4;
    });

    // Phạt giọng kém
    if (name.includes('compact') || name.includes('online') || name.includes('eloquence')) score -= 25;
    if (name.includes('male') && (langKey === 'vi' || langKey === 'th')) score -= 5; // ưu nữ một chút

    return score;
  }

  function populateVoiceSelect() {
    const langKey = detectedLang;
    const cfg = LANG_CONFIG[langKey] || LANG_CONFIG.vi;
    voiceSelect.innerHTML = '';

    const scored = voices
      .map(v => ({ v, s: scoreVoice(v, langKey) }))
      .sort((a, b) => b.s - a.s);

    const matched = scored.filter(x => x.s > 10 || (x.v.lang || '').toLowerCase().startsWith(langKey));

    // Kiểm tra máy có giọng Việt không
    const hasVietnamese = voices.some(v => {
      const l = (v.lang || '').toLowerCase();
      return l.startsWith('vi') || l.includes('vietnam');
    });

    if (matched.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '⚠️ Không có giọng ' + cfg.name + ' trên máy này';
      voiceSelect.appendChild(opt);

      // Hiện thêm danh sách giọng đang có để bạn kiểm tra
      const sep = document.createElement('option');
      sep.disabled = true;
      sep.textContent = '── Các giọng đang có trên máy ──';
      voiceSelect.appendChild(sep);

      scored.slice(0, 25).forEach(({ v }) => {
        const o = document.createElement('option');
        o.value = voices.indexOf(v);
        o.textContent = `${v.name} (${v.lang})`;
        voiceSelect.appendChild(o);
      });

      if (langKey === 'vi' && !hasVietnamese) {
        ttsStatus.innerHTML = '❌ <b>Máy chưa cài giọng Tiếng Việt (vi-VN)</b>. Các ngôn ngữ khác hiện ra vì máy đã có sẵn.<br>' +
          '→ <b>Windows</b>: Cài đặt → Thời gian & ngôn ngữ → Giọng nói → Thêm giọng → chọn <b>Tiếng Việt</b><br>' +
          '→ Sau khi cài xong nhấn <b>F5</b> tải lại trang.';
      } else {
        ttsStatus.textContent = 'Máy chưa có giọng ' + cfg.name + '. Hãy cài trong Cài đặt hệ thống.';
      }
      return;
    }

    matched.forEach(({ v, s }, i) => {
      const opt = document.createElement('option');
      opt.value = voices.indexOf(v);
      const star = i === 0 ? ' ★' : '';
      opt.textContent = `${v.name} (${v.lang})${star}`;
      voiceSelect.appendChild(opt);
    });

    if (matched[0].s < 40) {
      ttsStatus.textContent = 'Giọng hiện tại có thể không chuẩn ' + cfg.name + '. Nên cài thêm giọng hệ thống.';
    } else {
      ttsStatus.textContent = '';
    }
  }

  function getSelectedVoice() {
    const idx = parseInt(voiceSelect.value, 10);
    if (!isNaN(idx) && voices[idx]) return voices[idx];
    // fallback best
    const sorted = voices
      .map(v => ({ v, s: scoreVoice(v, detectedLang) }))
      .sort((a, b) => b.s - a.s);
    return sorted[0]?.v || null;
  }

  // ===================== TTS ENGINE =====================
  function updateUI() {
    sentenceInfo.textContent = `Câu: ${textChunks.length ? currentChunkIndex + 1 : 0} / ${textChunks.length}`;
    if (ttsState === 'playing') {
      playLabel.textContent = 'TẠM DỪNG';
      playIcon.textContent = '⏸';
      btnStop.style.display = 'inline-flex';
    } else if (ttsState === 'paused') {
      playLabel.textContent = 'ĐỌC TIẾP';
      playIcon.textContent = '▶';
      btnStop.style.display = 'inline-flex';
    } else {
      playLabel.textContent = 'ĐỌC GIỌNG MÁY';
      playIcon.textContent = '▶';
      btnStop.style.display = 'none';
    }
    btnSpeed.textContent = SPEED_MULTIPLIERS[selectedSpeedIndex] === 1
      ? '1x'
      : SPEED_MULTIPLIERS[selectedSpeedIndex] + 'x';
  }

  function speakChunk(index) {
    if (ttsState !== 'playing' || index >= textChunks.length) {
      ttsState = 'stopped';
      isProcessing = false;
      updateUI();
      ttsStatus.textContent = index >= textChunks.length ? 'Đã đọc xong.' : '';
      return;
    }
    if (isProcessing) return;
    isProcessing = true;
    currentChunkIndex = index;
    updateUI();

    const text = textChunks[index];
    const utter = new SpeechSynthesisUtterance(text);
    const voice = getSelectedVoice();
    const langCode = (LANG_CONFIG[detectedLang] || LANG_CONFIG.vi).code;

    // Quan trọng: phải set cả voice + lang
    if (voice) {
      utter.voice = voice;
      // Một số trình duyệt bỏ qua voice.lang → ép lại
      utter.lang = voice.lang || langCode;
    } else {
      utter.lang = langCode;
    }

    // Tốc độ: tiếng Việt nên chậm hơn một chút để rõ
    let rate = BASE_RATE * SPEED_MULTIPLIERS[selectedSpeedIndex];
    if (detectedLang === 'vi') rate = Math.min(rate * 0.92, 1.8);
    if (detectedLang === 'en') rate = Math.min(rate * 0.95, 1.9);
    utter.rate = Math.max(0.5, Math.min(rate, 2));
    utter.pitch = 1;
    utter.volume = 1;

    utter.onend = () => {
      isProcessing = false;
      if (ttsState === 'playing') {
        currentChunkIndex++;
        // Nghỉ ngắn giữa các câu để giọng tự nhiên hơn (tránh nuốt chữ)
        const pause = detectedLang === 'en' ? 180 : 120;
        setTimeout(() => speakChunk(currentChunkIndex), pause);
      }
    };
    utter.onerror = (e) => {
      console.warn('TTS error', e);
      isProcessing = false;
      if (e.error === 'language-unavailable' || e.error === 'voice-unavailable') {
        ttsStatus.textContent = '⚠️ Máy chưa có giọng ngôn ngữ này. Hãy cài thêm giọng trong Cài đặt hệ thống.';
        ttsState = 'stopped';
        updateUI();
        return;
      }
      if (ttsState === 'playing') {
        currentChunkIndex++;
        setTimeout(() => speakChunk(currentChunkIndex), 80);
      }
    };

    currentUtterance = utter;
    // Hủy hàng đợi cũ trước khi nói (tránh chồng chéo)
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
    }
    speechSynthesis.speak(utter);
    ttsStatus.textContent = `Đang đọc câu ${index + 1}/${textChunks.length} · ${langCode}`;
  }

  function togglePlay() {
    if (!textChunks.length) {
      ttsStatus.textContent = 'Chưa có nội dung. Hãy nhấn "Xử lý & Chuẩn bị đọc" trước.';
      return;
    }
    if (ttsState === 'playing') {
      speechSynthesis.pause();
      ttsState = 'paused';
      ttsStatus.textContent = 'Đã tạm dừng.';
      updateUI();
    } else if (ttsState === 'paused') {
      speechSynthesis.resume();
      ttsState = 'playing';
      ttsStatus.textContent = 'Đang đọc tiếp...';
      updateUI();
      // Some browsers need re-trigger
      if (!speechSynthesis.speaking) {
        speakChunk(currentChunkIndex);
      }
    } else {
      speechSynthesis.cancel();
      ttsState = 'playing';
      isProcessing = false;
      if (currentChunkIndex >= textChunks.length) currentChunkIndex = 0;
      updateUI();
      speakChunk(currentChunkIndex);
    }
  }

  function stopTts() {
    speechSynthesis.cancel();
    ttsState = 'stopped';
    isProcessing = false;
    currentChunkIndex = 0;
    selectedSpeedIndex = 0;
    updateUI();
    ttsStatus.textContent = 'Đã dừng.';
  }

  function cycleSpeed() {
    selectedSpeedIndex = (selectedSpeedIndex + 1) % SPEED_MULTIPLIERS.length;
    updateUI();
    if (ttsState === 'playing') {
      // Restart current chunk with new rate
      speechSynthesis.cancel();
      isProcessing = false;
      setTimeout(() => speakChunk(currentChunkIndex), 50);
    }
  }

  function jumpToSentence(n) {
    if (!textChunks.length) return;
    const idx = Math.max(0, Math.min(textChunks.length - 1, n - 1));
    currentChunkIndex = idx;
    jumpInput.value = idx + 1;
    updateUI();
    if (ttsState === 'playing') {
      speechSynthesis.cancel();
      isProcessing = false;
      setTimeout(() => speakChunk(currentChunkIndex), 50);
    }
  }

  // ===================== LOAD CONTENT =====================
  async function processText(text) {
    rawText = text.trim();
    if (!rawText) {
      loadStatus.textContent = 'Không có nội dung.';
      return;
    }
    detectedLang = detectLanguageCode(rawText);
    const cfg = LANG_CONFIG[detectedLang] || LANG_CONFIG.vi;
    langBadge.textContent = `${detectedLang} · ${cfg.name}`;
    textChunks = splitTextIntoChunks(rawText, detectedLang);
    contentDisplay.textContent = rawText;
    contentDisplay.style.fontSize = fontSize + 'px';
    currentChunkIndex = 0;
    updateUI();
    populateVoiceSelect();
    loadStatus.textContent = `Đã xử lý ${textChunks.length} câu · Ngôn ngữ: ${cfg.name}`;
    ttsStatus.textContent = '';
  }

  async function fetchUrlContent(url) {
    loadStatus.innerHTML = '<span class="loading"></span> Đang lấy nội dung trang...';
    const proxies = [
      (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
      (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
      (u) => `https://cors.x2u.in/${u}`,
    ];
    let html = null;
    let lastErr = null;
    for (const make of proxies) {
      try {
        const res = await fetch(make(url), { signal: AbortSignal.timeout(12000) });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        html = await res.text();
        if (html && html.length > 200) break;
      } catch (e) {
        lastErr = e;
      }
    }
    if (!html) throw lastErr || new Error('Không lấy được nội dung');

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove unwanted
    const excludeKeywords = ($('excludeInput').value || 'nav,sidebar,footer,ads,comment,menu')
      .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

    doc.querySelectorAll('script, style, noscript, iframe, svg').forEach(el => el.remove());
    doc.querySelectorAll('nav, header, footer, aside').forEach(el => el.remove());

    // Remove by class/id keywords
    doc.querySelectorAll('[class], [id]').forEach(el => {
      const cls = (el.className || '').toString().toLowerCase();
      const id = (el.id || '').toLowerCase();
      if (excludeKeywords.some(k => cls.includes(k) || id.includes(k))) {
        el.remove();
      }
    });

    let mainText = '';
    const customSel = $('selectorInput').value.trim();
    if (customSel) {
      const el = doc.querySelector(customSel);
      if (el) mainText = el.innerText || el.textContent || '';
    }
    if (!mainText) {
      const candidates = doc.querySelectorAll('article, main, [role="main"], .post-content, .entry-content, .content, .article-body, #content, #main');
      let best = null, bestLen = 0;
      candidates.forEach(el => {
        const t = (el.innerText || '').trim();
        if (t.length > bestLen) { bestLen = t.length; best = el; }
      });
      if (best) mainText = best.innerText;
      else mainText = doc.body ? doc.body.innerText : '';
    }

    // Clean excess whitespace
    mainText = mainText
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+\n/g, '\n')
      .trim();

    if (mainText.length < 80) throw new Error('Nội dung quá ngắn hoặc trang chống lấy dữ liệu.');
    return mainText;
  }

  $('btnLoad').addEventListener('click', async () => {
    const isUrl = document.querySelector('.tab.active').dataset.tab === 'url';
    try {
      if (isUrl) {
        const url = urlInput.value.trim();
        if (!url) {
          loadStatus.textContent = 'Vui lòng nhập URL.';
          return;
        }
        const text = await fetchUrlContent(url);
        textInput.value = text; // also fill textarea
        await processText(text);
      } else {
        await processText(textInput.value);
      }
    } catch (e) {
      console.error(e);
      loadStatus.textContent = 'Lỗi: ' + (e.message || e);
    }
  });

  $('btnClear').addEventListener('click', () => {
    stopTts();
    textInput.value = '';
    urlInput.value = '';
    contentDisplay.textContent = '';
    textChunks = [];
    rawText = '';
    currentChunkIndex = 0;
    updateUI();
    loadStatus.textContent = '';
    ttsStatus.textContent = '';
  });

  // ===================== CONTROLS EVENTS =====================
  $('btnPlay').addEventListener('click', togglePlay);
  $('btnStop').addEventListener('click', stopTts);
  btnSpeed.addEventListener('click', cycleSpeed);
  $('btnJump').addEventListener('click', () => {
    const n = parseInt(jumpInput.value, 10);
    if (!isNaN(n)) jumpToSentence(n);
  });
  jumpInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const n = parseInt(jumpInput.value, 10);
      if (!isNaN(n)) jumpToSentence(n);
    }
  });

  $('fontDown').addEventListener('click', () => {
    if (fontSize > 12) {
      fontSize -= 2;
      contentDisplay.style.fontSize = fontSize + 'px';
      $('fontSizeLabel').textContent = fontSize;
    }
  });
  $('fontUp').addEventListener('click', () => {
    if (fontSize < 32) {
      fontSize += 2;
      contentDisplay.style.fontSize = fontSize + 'px';
      $('fontSizeLabel').textContent = fontSize;
    }
  });

  // ===================== PDF =====================
  $('btnPdf').addEventListener('click', async () => {
    if (!rawText) {
      ttsStatus.textContent = 'Chưa có nội dung để xuất PDF.';
      return;
    }
    ttsStatus.textContent = 'Đang tạo PDF...';
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxWidth = pageWidth - margin * 2;
      let y = margin;

      doc.setFontSize(16);
      doc.setTextColor(180, 130, 40);
      doc.text('BẢN LUẬN GIẢI CHI TIẾT', margin, y);
      y += 24;
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text('ĐẠI LUẬN 16 ĐẠI THUẬT - VẬN MỆNH', margin, y);
      y += 20;
      doc.setDrawColor(200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 16;

      doc.setFontSize(11);
      doc.setTextColor(30);
      const lines = doc.splitTextToSize(rawText, maxWidth);
      const lineHeight = 16;

      for (const line of lines) {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += lineHeight;
      }

      // Note about fonts
      doc.setFontSize(8);
      doc.setTextColor(120);
      const noteY = doc.internal.pageSize.getHeight() - 20;
      doc.text('Lưu ý: PDF dùng font mặc định. Tiếng Việt/Nhật/Trung có thể thiếu dấu nếu hệ thống không hỗ trợ.', margin, noteY);

      doc.save(`Luan_Giai_${Date.now()}.pdf`);
      ttsStatus.textContent = 'Đã xuất PDF.';
    } catch (e) {
      console.error(e);
      ttsStatus.textContent = 'Lỗi xuất PDF: ' + e.message;
    }
  });

  // Init
  updateUI();
  // Preload voices
  setTimeout(loadVoices, 300);
})();
