(function () {
  // ===================== CONFIG =====================
  const SPEED_MULTIPLIERS = [1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6];
  const BASE_RATE = 1.0; // Web Speech API rate is around 1.0 = normal
  const MAX_CHUNK_LEN = 220;

  const LANG_CONFIG = {
    vi: { code: 'vi-VN', name: 'Tiếng Việt', keywords: ['south', 'nam', 'saigon', 'linh', 'mai', 'hoaimy', 'an', 'female', 'nữ'] },
    en: { code: 'en-US', name: 'English', keywords: ['enhanced', 'premium', 'neural', 'natural', 'samantha', 'google', 'aria', 'jenny'] },
    ja: { code: 'ja-JP', name: '日本語', keywords: ['enhanced', 'neural', 'kyoko', 'otoya', 'nanami', 'female'] },
    zh: { code: 'zh-CN', name: '中文', keywords: ['enhanced', 'neural', 'ting-ting', 'xiaoxiao', 'yunxi', 'female', 'natural'] },
    ko: { code: 'ko-KR', name: '한국어', keywords: ['enhanced', 'neural', 'yuna', 'sora', 'sunhi', 'female'] },
    fr: { code: 'fr-FR', name: 'Français', keywords: ['enhanced', 'neural', 'thomas', 'audrey', 'denise', 'female'] },
    de: { code: 'de-DE', name: 'Deutsch', keywords: ['enhanced', 'neural', 'anna', 'marlene', 'katja', 'female'] },
    es: { code: 'es-ES', name: 'Español', keywords: ['enhanced', 'neural', 'monica', 'jorge', 'elvira', 'female'] },
    ru: { code: 'ru-RU', name: 'Русский', keywords: ['enhanced', 'neural', 'tatyana', 'pavel', 'dariya', 'female'] },
    th: { code: 'th-TH', name: 'ไทย', keywords: ['enhanced', 'neural', 'kanya', 'prem', 'female'] },
    id: { code: 'id-ID', name: 'Bahasa Indonesia', keywords: ['enhanced', 'neural', 'andika', 'gadis', 'female'] },
    // Ngôn ngữ bổ sung
    pt: { code: 'pt-BR', name: 'Português', keywords: ['enhanced', 'neural', 'francisca', 'antonio', 'female', 'brasil'] },
    it: { code: 'it-IT', name: 'Italiano', keywords: ['enhanced', 'neural', 'elsa', 'diego', 'female'] },
    hi: { code: 'hi-IN', name: 'हिन्दी', keywords: ['enhanced', 'neural', 'swara', 'madhur', 'female'] },
    ar: { code: 'ar-SA', name: 'العربية', keywords: ['enhanced', 'neural', 'hamed', 'zariyah', 'female'] },
    tr: { code: 'tr-TR', name: 'Türkçe', keywords: ['enhanced', 'neural', 'emel', 'ahmet', 'female'] },
    pl: { code: 'pl-PL', name: 'Polski', keywords: ['enhanced', 'neural', 'zosia', 'marek', 'female'] },
    nl: { code: 'nl-NL', name: 'Nederlands', keywords: ['enhanced', 'neural', 'colette', 'maarten', 'female'] },
    ms: { code: 'ms-MY', name: 'Bahasa Melayu', keywords: ['enhanced', 'neural', 'yasmin', 'osman', 'female'] },
    uk: { code: 'uk-UA', name: 'Українська', keywords: ['enhanced', 'neural', 'polina', 'ostap', 'female'] },
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
    const sample = text.length > 1200 ? text.substring(0, 1200) : text;

    // 1. Script đặc thù (ưu tiên cao nhất)
    if (/[\u3040-\u309F\u30A0-\u30FF]/.test(sample)) return 'ja';
    if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(sample)) return 'ko';
    if (/[\u0E00-\u0E7F]/.test(sample)) return 'th';
    if (/[\u0600-\u06FF]/.test(sample)) return 'ar';           // Arabic
    if (/[\u0900-\u097F]/.test(sample)) return 'hi';           // Devanagari (Hindi)
    if (/[\u0400-\u04FF]/.test(sample)) {
      // Phân biệt Nga / Ukraina đơn giản
      if (/[іїєґІЇЄҐ]/.test(sample)) return 'uk';
      return 'ru';
    }
    if (/[\u4E00-\u9FFF]/.test(sample)) return 'zh';

    // 2. Tiếng Việt – ký tự đặc trưng
    if (/[ăắằẳẵặơớờởỡợưứừửữựđĂẮẰẲẴẶƠỚỜỞỠỢƯỨỪỬỮỰĐ]/i.test(sample)) return 'vi';

    // 3. Điểm số từ vựng cho các ngôn ngữ Latin
    const lower = sample.toLowerCase();
    const score = (re) => (lower.match(re) || []).length;

    const scores = {
      en: score(/\b(the|and|is|you|that|it|he|was|for|on|are|as|with|his|they|at|be|this|from|or|an|will|my|would|there|their|have|has|not|but|what|all|were|when|who|your|said|each|which|she|do|how|if|up|out|about|many)\b/g),
      fr: score(/\b(le|la|les|un|une|des|et|est|dans|en|du|que|qui|pour|pas|sur|ce|avec|ne|se|plus|par|sont|mais|ou|donc|car|je|tu|il|elle|nous|vous|ils|elles|être|avoir|fait|tout|comme)\b/g),
      de: score(/\b(der|die|das|und|ist|in|den|von|zu|mit|sich|des|auf|für|im|dem|nicht|ein|eine|als|auch|es|an|ich|du|er|sie|wir|ihr|werden|haben|wird|nach|bei|noch|nur|einem)\b/g),
      es: score(/\b(el|la|los|las|un|una|unos|unas|y|en|que|es|por|con|para|su|del|como|más|pero|sus|le|ya|o|yo|tú|él|ella|nosotros|está|son|también|muy|hay|sobre)\b/g),
      id: score(/\b(yang|dan|di|dari|untuk|pada|ke|dengan|ini|itu|atau|adalah|tidak|akan|juga|sebagai|oleh|ada|dalam|mereka|dapat|sudah|lebih|karena|saat|jika)\b/g),
      pt: score(/\b(o|a|os|as|um|uma|de|da|do|em|para|com|não|que|se|por|como|mais|mas|foi|são|ele|ela|isso|está|também|quando|muito|seu|sua)\b/g),
      it: score(/\b(il|lo|la|i|gli|le|un|una|di|da|in|per|con|che|è|sono|non|si|del|della|questo|questa|come|più|anche|ma|loro|essere|fare|tutto)\b/g),
      tr: score(/\b(ve|bir|bu|da|de|için|ile|olan|var|yok|daha|çok|gibi|kadar|sonra|ama|veya|ben|sen|o|biz|siz|onlar|ne|nasıl|neden)\b/g),
      pl: score(/\b(i|w|na|z|do|to|się|nie|jest|jak|od|po|za|ale|czy|tak|już|tylko|jego|jej|ich|być|mieć|może|przez|oraz)\b/g),
      nl: score(/\b(de|het|een|van|en|in|is|op|te|dat|die|voor|met|zijn|niet|aan|ook|als|er|om|bij|naar|uit|nog|wel|geen|worden)\b/g),
      ms: score(/\b(yang|dan|di|dari|untuk|pada|ke|dengan|ini|itu|atau|adalah|tidak|akan|juga|sebagai|oleh|ada|dalam|mereka|boleh|sudah|lebih|kerana|jika)\b/g),
    };

    let max = 0, detected = 'en';
    for (const [k, v] of Object.entries(scores)) {
      if (v > max) { max = v; detected = k; }
    }
    // Ngưỡng tối thiểu
    return max >= 3 ? detected : 'en';
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
  function isVietnameseVoice(voice) {
    const lang = (voice.lang || '').toLowerCase().replace('_', '-');
    const name = (voice.name || '').toLowerCase();
    // Bắt mọi biến thể có thể của giọng Việt
    return (
      lang.startsWith('vi') ||
      lang.includes('vietnam') ||
      name.includes('vietnam') ||
      name.includes('vietnamese') ||
      name.includes('an ') ||          // Microsoft An
      name.includes('hoaimy') ||
      name.includes('hoai my') ||
      name.includes('linh') ||
      name.includes('mai ') ||
      name.includes('nam ') ||
      name.includes('saigon') ||
      name.includes('hanoi')
    );
  }

  function loadVoices() {
    voices = speechSynthesis.getVoices() || [];
    console.log('[TTS] Tổng số giọng:', voices.length);
    // In ra tất cả giọng Việt nếu có (để debug)
    const viVoices = voices.filter(isVietnameseVoice);
    if (viVoices.length) {
      console.log('[TTS] Tìm thấy giọng Việt:', viVoices.map(v => v.name + ' (' + v.lang + ')'));
    } else {
      console.log('[TTS] Không thấy giọng Việt nào trong danh sách');
    }
    populateVoiceSelect();
  }

  // Load nhiều lần vì Chrome thường trả về rỗng lần đầu
  if (speechSynthesis.onvoiceschanged !== undefined) {
    speechSynthesis.onvoiceschanged = loadVoices;
  }
  loadVoices();
  setTimeout(loadVoices, 300);
  setTimeout(loadVoices, 800);
  setTimeout(loadVoices, 1500);

  function scoreVoice(voice, langKey) {
    const cfg = LANG_CONFIG[langKey] || LANG_CONFIG.vi;
    const name = (voice.name || '').toLowerCase();
    const lang = (voice.lang || '').toLowerCase().replace('_', '-');
    const codeShort = cfg.code.toLowerCase().slice(0, 2);
    let score = 0;

    // ===== Ưu tiên cực mạnh cho tiếng Việt =====
    if (langKey === 'vi' && isVietnameseVoice(voice)) {
      score += 200; // điểm rất cao để luôn đứng đầu
      if (lang === 'vi-vn' || lang === 'vi') score += 50;
      if (name.includes('neural') || name.includes('natural')) score += 20;
      return score; // trả sớm, không cần tính tiếp
    }

    // Khớp locale thông thường
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
    if (name.includes('male') && (langKey === 'vi' || langKey === 'th')) score -= 5;

    return score;
  }

  function populateVoiceSelect() {
    const langKey = detectedLang;
    const cfg = LANG_CONFIG[langKey] || LANG_CONFIG.vi;
    voiceSelect.innerHTML = '';

    if (!voices.length) {
      const opt = document.createElement('option');
      opt.textContent = 'Đang tải danh sách giọng...';
      voiceSelect.appendChild(opt);
      return;
    }

    const scored = voices
      .map(v => ({ v, s: scoreVoice(v, langKey) }))
      .sort((a, b) => b.s - a.s);

    // Với tiếng Việt: lấy tất cả giọng Việt trước, sau đó mới đến giọng khác
    let matched;
    if (langKey === 'vi') {
      const viList = scored.filter(x => isVietnameseVoice(x.v));
      matched = viList.length > 0 ? viList : scored.filter(x => x.s > 10);
    } else {
      matched = scored.filter(x => x.s > 10 || (x.v.lang || '').toLowerCase().startsWith(langKey));
    }

    const hasVietnamese = voices.some(isVietnameseVoice);

    if (matched.length === 0 || (langKey === 'vi' && !hasVietnamese)) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.textContent = '⚠️ Không tìm thấy giọng ' + cfg.name;
      voiceSelect.appendChild(opt);

      const sep = document.createElement('option');
      sep.disabled = true;
      sep.textContent = '── Tất cả giọng đang có trên máy (' + voices.length + ') ──';
      voiceSelect.appendChild(sep);

      scored.forEach(({ v }) => {
        const o = document.createElement('option');
        o.value = voices.indexOf(v);
        o.textContent = `${v.name} (${v.lang})`;
        voiceSelect.appendChild(o);
      });

      ttsStatus.innerHTML = '❌ <b>Vẫn chưa thấy giọng Tiếng Việt</b>.<br>' +
        '1. Hãy <b>tắt hoàn toàn Chrome</b> (kể cả chạy nền) rồi mở lại.<br>' +
        '2. Vào Cài đặt Windows → Thời gian & ngôn ngữ → <b>Giọng nói</b> → kiểm tra đã có giọng Việt chưa.<br>' +
        '3. Nếu mới cài, đôi khi cần khởi động lại máy.';
      return;
    }

    matched.forEach(({ v, s }, i) => {
      const opt = document.createElement('option');
      opt.value = voices.indexOf(v);
      const star = i === 0 ? ' ★' : '';
      opt.textContent = `${v.name} (${v.lang})${star}`;
      voiceSelect.appendChild(opt);
    });

    // Thêm dòng phân cách + các giọng khác để người dùng chọn thủ công
    if (langKey === 'vi' && matched.length < voices.length) {
      const sep = document.createElement('option');
      sep.disabled = true;
      sep.textContent = '── Giọng khác ──';
      voiceSelect.appendChild(sep);
      scored.filter(x => !isVietnameseVoice(x.v)).slice(0, 15).forEach(({ v }) => {
        const o = document.createElement('option');
        o.value = voices.indexOf(v);
        o.textContent = `${v.name} (${v.lang})`;
        voiceSelect.appendChild(o);
      });
    }

    ttsStatus.textContent = hasVietnamese ? '✓ Đã tìm thấy giọng Tiếng Việt' : '';
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

    // Chuẩn hóa URL
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    // ========== Cách 1: Jina Reader (mạnh nhất, trả về nội dung sạch) ==========
    try {
      loadStatus.innerHTML = '<span class="loading"></span> Đang lấy nội dung (Jina Reader)...';
      const jinaUrl = 'https://r.jina.ai/' + url;
      const res = await fetch(jinaUrl, {
        signal: AbortSignal.timeout(18000),
        headers: { 'Accept': 'text/plain' }
      });
      if (res.ok) {
        let text = await res.text();
        // Jina thường trả markdown + meta
        text = text
          .replace(/^Title:.*$/im, '')
          .replace(/^URL Source:.*$/im, '')
          .replace(/^Published Time:.*$/im, '')
          .replace(/^Markdown Content:.*$/im, '')
          .replace(/^#{1,6}\s+/gm, '')
          .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
          .replace(/!\[.*?\]\(.*?\)/g, '')
          .replace(/```[\s\S]*?```/g, '')
          .replace(/`[^`]+`/g, '');

        // Loại bỏ mục lục / related / rating thường gặp ở web VN
        text = text
          .replace(/Mục lục[\s\S]*?(?=\n\s*\d+\.\s|$)/i, '')
          .replace(/Có thể bạn quan tâm[\s\S]*?(?=\n\s*\d+\.|\n\s*[A-ZÀ-ỹ]|$)/gi, '')
          .replace(/Bài đăng này hữu ích[\s\S]*$/i, '')
          .replace(/Đánh giá trung bình[\s\S]*$/i, '')
          .replace(/Hãy là người đầu tiên đánh giá[\s\S]*$/i, '')
          .replace(/Toggle Table of Content[\s\S]*?(?=\n)/gi, '')
          .replace(/Bấm vào một ngôi sao[\s\S]*$/i, '')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

        if (text.length > 120) {
          loadStatus.textContent = 'Đã lấy nội dung thành công (Jina).';
          return text;
        }
      }
    } catch (e) {
      console.warn('Jina failed:', e);
    }

    // ========== Cách 2: Các CORS proxy thông thường ==========
    loadStatus.innerHTML = '<span class="loading"></span> Thử proxy khác...';
    const proxies = [
      (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
      (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
      (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
      (u) => `https://cors.x2u.in/${u}`,
    ];

    let html = null;
    let lastErr = null;
    for (const make of proxies) {
      try {
        const res = await fetch(make(url), { signal: AbortSignal.timeout(12000) });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        let body = await res.text();

        // allorigins /get trả JSON
        if (body.trim().startsWith('{')) {
          try {
            const json = JSON.parse(body);
            body = json.contents || json.content || body;
          } catch (_) {}
        }
        if (body && body.length > 400) {
          html = body;
          break;
        }
      } catch (e) {
        lastErr = e;
      }
    }

    if (!html) {
      throw lastErr || new Error('Không lấy được nội dung. Trang có thể chống scrape hoặc proxy bị chặn.');
    }

    // Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const excludeKeywords = ($('excludeInput').value || 'nav,sidebar,footer,ads,advert,comment,menu,related,share,social,cookie,popup,banner,widget')
      .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);

    const removeSelectors = [
      'script', 'style', 'noscript', 'iframe', 'svg', 'canvas', 'form',
      'nav', 'header', 'footer', 'aside',
      '[role="navigation"]', '[role="banner"]', '[role="complementary"]',
      '.ads', '.advertisement', '.ad-container', '.sidebar', '.comments',
      '#comments', '#sidebar', '#footer', '#header', '#nav', '#menu',
      // Mục lục + widget phổ biến
      '#ez-toc-container', '.ez-toc-container', '.ez-toc-title-container',
      '.ez-toc-list', '.rmp-widgets-container', '.rmp-rating-widget',
      '.post-share', '.share-box', '.related-posts', '.jp-relatedposts'
    ];
    removeSelectors.forEach(sel => {
      try { doc.querySelectorAll(sel).forEach(el => el.remove()); } catch (_) {}
    });

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
      try {
        const el = doc.querySelector(customSel);
        if (el) mainText = el.innerText || el.textContent || '';
      } catch (_) {}
    }

    if (!mainText || mainText.length < 80) {
      const candidates = [
        // Ưu tiên cao cho WordPress / blog VN
        '.entry-content', '.singlepost-content', '.td-post-content',
        'article', 'main', '[role="main"]',
        '.post-content', '.article-content', '.article-body',
        '.content-body', '.post-body', '.story-body',
        '#content', '#main-content', '#article', '#post',
        '.content', '.main-content', '.page-content', '.detail-content'
      ];
      let best = null, bestScore = 0;
      for (const sel of candidates) {
        try {
          doc.querySelectorAll(sel).forEach(el => {
            const t = (el.innerText || '').trim();
            const score = t.length + (t.match(/[.!?。]/g) || []).length * 50;
            if (score > bestScore) {
              bestScore = score;
              best = el;
            }
          });
        } catch (_) {}
      }
      if (best) mainText = best.innerText;
      else mainText = doc.body ? (doc.body.innerText || '') : '';
    }

    mainText = mainText
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();

    // Nới lỏng ngưỡng: nếu vẫn ngắn thì vẫn trả về nếu > 40 ký tự (để user thấy)
    if (mainText.length < 40) {
      throw new Error('Nội dung quá ngắn hoặc trang chống lấy dữ liệu. Thử dùng CSS Selector ở phần nâng cao, hoặc copy thủ công.');
    }
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

    // ===================== PDF (hỗ trợ tiếng Việt) =====================
  $('btnPdf').addEventListener('click', async () => {
    const text = (rawText || contentDisplay.innerText || '').trim();
    if (!text) {
      ttsStatus.textContent = 'Chưa có nội dung để xuất PDF.';
      return;
    }

    ttsStatus.textContent = 'Đang tạo PDF (hỗ trợ tiếng Việt)...';

    try {
      const { jsPDF } = window.jspdf;

      // Tạo khung tạm để render đẹp, giữ font hệ thống (có tiếng Việt)
      const temp = document.createElement('div');
      temp.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: 794px;
        padding: 40px;
        background: #fff;
        color: #111;
        font-family: "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 14px;
        line-height: 1.65;
        white-space: pre-wrap;
        word-break: break-word;
      `;
     temp.innerHTML = `
  <div style="font-size:18px;font-weight:700;color:#b8860b;margin-bottom:2px;line-height:1.2;">
    Thai Thong · TTS Đa Ngôn Ngữ
  </div>
  <div style="font-size:11px;color:#666;margin-bottom:14px;margin-top:0;border-bottom:1px solid #ddd;padding-bottom:8px;line-height:1.2;">
    ❤️ ThaiThongSj@gmail.com
  </div>
  <div>${text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')}</div>
`;
      document.body.appendChild(temp);

      const canvas = await html2canvas(temp, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      document.body.removeChild(temp);

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const usableWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * usableWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;

      // Trang đầu
      pdf.addImage(imgData, 'JPEG', margin, position, usableWidth, imgHeight);
      heightLeft -= (pageHeight - margin * 2);

      // Các trang tiếp theo nếu nội dung dài
      while (heightLeft > 0) {
        position = margin - (imgHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, usableWidth, imgHeight);
        heightLeft -= (pageHeight - margin * 2);
      }

      pdf.save(`Luan_Giai_${Date.now()}.pdf`);
      ttsStatus.textContent = 'Đã xuất PDF (có tiếng Việt).';
    } catch (e) {
      console.error(e);
      ttsStatus.textContent = 'Lỗi xuất PDF: ' + (e.message || e);
    }
  });
    // ===================== TỰ ĐỘNG XỬ LÝ + SỬA NỘI DUNG =====================

  // A. Tự xử lý khi dán hoặc ngừng gõ ~0.9 giây
  let autoProcessTimer = null;
  textInput.addEventListener('input', () => {
    clearTimeout(autoProcessTimer);
    autoProcessTimer = setTimeout(() => {
      if (textInput.value.trim().length > 20) {
        processText(textInput.value);
      }
    }, 900);
  });

  textInput.addEventListener('paste', () => {
    setTimeout(() => {
      if (textInput.value.trim()) {
        processText(textInput.value);
      }
    }, 60);
  });

  // B. Nút Cập nhật sau khi sửa khung nội dung
  const btnUpdateContent = document.getElementById('btnUpdateContent');
  if (btnUpdateContent) {
    btnUpdateContent.addEventListener('click', () => {
      const edited = (contentDisplay.innerText || contentDisplay.textContent || '').trim();
      if (!edited) {
        ttsStatus.textContent = 'Nội dung trống.';
        return;
      }
      // Dừng đọc nếu đang chạy
      if (ttsState === 'playing' || ttsState === 'paused') {
        speechSynthesis.cancel();
        ttsState = 'stopped';
        isProcessing = false;
      }
      textInput.value = edited;
      processText(edited);
      ttsStatus.textContent = 'Đã cập nhật nội dung sau khi sửa.';
      updateUI();
    });
  }

  // Ctrl + Enter trong khung nội dung = Cập nhật nhanh
  contentDisplay.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      if (btnUpdateContent) btnUpdateContent.click();
    }
  });

  // C. Đang sửa nội dung thì tự tạm dừng đọc
  contentDisplay.addEventListener('focus', () => {
    if (ttsState === 'playing') {
      try { speechSynthesis.pause(); } catch (_) {}
      ttsState = 'paused';
      updateUI();
      ttsStatus.textContent = 'Đã tạm dừng để bạn chỉnh sửa nội dung.';
    }
  });
    // ===================== DONATE MODAL =====================
  const donateModal = document.getElementById('donateModal');
  const btnDonate = document.getElementById('btnDonate');
  const btnCloseDonate = document.getElementById('btnCloseDonate');

  function showToast(msg) {
    const old = document.querySelector('.toast');
    if (old) old.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2200);
  }

  if (btnDonate && donateModal) {
    btnDonate.addEventListener('click', () => {
      donateModal.style.display = 'flex';
    });
  }
  if (btnCloseDonate) {
    btnCloseDonate.addEventListener('click', () => {
      donateModal.style.display = 'none';
    });
  }
  // Bấm nền tối để đóng
  if (donateModal) {
    donateModal.addEventListener('click', (e) => {
      if (e.target === donateModal) donateModal.style.display = 'none';
    });
  }

  // Copy số TK / email
  document.querySelectorAll('.copy-row').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-copy') || '';
      const label = btn.getAttribute('data-label') || '';
      try {
        await navigator.clipboard.writeText(text);
        showToast('✅ Đã sao chép ' + label + ': ' + text);
      } catch (_) {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        showToast('✅ Đã sao chép ' + label + ': ' + text);
      }
    });
  });

  // Lưu ảnh QR
  const btnSaveQr = document.getElementById('btnSaveQr');
  if (btnSaveQr) {
    btnSaveQr.addEventListener('click', () => {
      const img = document.querySelector('.qr-img');
      if (!img || !img.src || img.style.display === 'none') {
        showToast('Chưa có ảnh QR');
        return;
      }
      const a = document.createElement('a');
      a.href = img.src;
      a.download = 'QR_Ung_Ho_Thai_Thong.png';
      a.click();
      showToast('✅ Đang tải ảnh QR...');
    });
  }
  // Init
  updateUI();
  // Preload voices
  setTimeout(loadVoices, 300);
})();