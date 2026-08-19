(function () {
  // ===================== CONFIG =====================
  const SPEED_MULTIPLIERS = [1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5, 6];
  const BASE_RATE = 1.0; // Web Speech API rate is around 1.0 = normal
  const MAX_CHUNK_LEN = 220;

  const LANG_CONFIG = {
  // --- Đông Nam Á ---
  vi: { code: 'vi-VN', name: 'Tiếng Việt', keywords: ['south', 'nam', 'saigon', 'linh', 'mai', 'hoaimy', 'an', 'female', 'nữ'] },
  th: { code: 'th-TH', name: 'ไทย (Thái)', keywords: ['enhanced', 'neural', 'kanya', 'prem', 'female'] },
  id: { code: 'id-ID', name: 'Bahasa Indonesia', keywords: ['enhanced', 'neural', 'andika', 'gadis', 'female'] },
  ms: { code: 'ms-MY', name: 'Bahasa Melayu', keywords: ['enhanced', 'neural', 'yasmin', 'osman', 'female'] },
  km: { code: 'km-KH', name: 'ភាសាខ្មែរ (Khmer)', keywords: ['enhanced', 'neural', 'piseth', 'sreymom', 'female'] },
  lo: { code: 'lo-LA', name: 'ພາສາລາວ (Lào)', keywords: ['enhanced', 'neural', 'chanthavong', 'keomany', 'female'] },
  my: { code: 'my-MM', name: 'မြန်မာဘာသာ (Burmese)', keywords: ['enhanced', 'neural', 'nilar', 'female'] },
  fil: { code: 'fil-PH', name: 'Filipino / Tagalog', keywords: ['enhanced', 'neural', 'angelo', 'blessica', 'female'] },

  // --- Đông Á ---
  zh: { code: 'zh-CN', name: '中文 (Giản thể - Trung Quốc)', keywords: ['enhanced', 'neural', 'ting-ting', 'xiaoxiao', 'yunxi', 'female', 'natural'] },
  'zh-TW': { code: 'zh-TW', name: '中文 (Phồn thể - Đài Loan)', keywords: ['enhanced', 'neural', 'yating', 'hanhan', 'hsiao-chen', 'female'] },
  'zh-HK': { code: 'zh-HK', name: '廣東話 (Quảng Đông / Hong Kong)', keywords: ['enhanced', 'neural', 'sinji', 'cantonese', 'hongkong', 'female'] },
  yue: { code: 'zh-HK', name: '粵語 (Quảng Đông)', keywords: ['cantonese', 'yue', 'hongkong', 'female'] },
  ja: { code: 'ja-JP', name: '日本語 (Nhật Bản)', keywords: ['enhanced', 'neural', 'kyoko', 'otoya', 'nanami', 'female'] },
  ko: { code: 'ko-KR', name: '한국어 (Hàn Quốc)', keywords: ['enhanced', 'neural', 'yuna', 'sora', 'sunhi', 'female'] },
  bo: { code: 'bo-CN', name: 'Tibetan (Tây Tạng)', keywords: ['enhanced', 'neural', 'tibetan', 'female'] },
  mn: { code: 'mn-MN', name: 'Mongolian (Mông Cổ)', keywords: ['enhanced', 'neural', 'yesui', 'bataar', 'female'] },

  // --- Nam Á ---
  hi: { code: 'hi-IN', name: 'हिन्दी (Hindi)', keywords: ['enhanced', 'neural', 'swara', 'madhur', 'female'] },
  bn: { code: 'bn-IN', name: 'বাংলা (Bengali)', keywords: ['enhanced', 'neural', 'bashkar', 'tanishaa', 'female'] },
  ta: { code: 'ta-IN', name: 'தமிழ் (Tamil)', keywords: ['enhanced', 'neural', 'valluvar', 'ani', 'female'] },
  te: { code: 'te-IN', name: 'తెలుగు (Telugu)', keywords: ['enhanced', 'neural', 'mohan', 'shruti', 'female'] },
  mr: { code: 'mr-IN', name: 'मराठी (Marathi)', keywords: ['enhanced', 'neural', 'aarti', 'manohar', 'female'] },
  gu: { code: 'gu-IN', name: 'ગુજરાતી (Gujarati)', keywords: ['enhanced', 'neural', 'dhwani', 'niranjan', 'female'] },
  kn: { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)', keywords: ['enhanced', 'neural', 'gapan', 'sapna', 'female'] },
  ml: { code: 'ml-IN', name: 'മലയാളം (Malayalam)', keywords: ['enhanced', 'neural', 'midhun', 'sobhana', 'female'] },
  pa: { code: 'pa-IN', name: 'ਪੰਜਾਬੀ (Punjabi)', keywords: ['enhanced', 'neural', 'vaani', 'female'] },
  ur: { code: 'ur-PK', name: 'اردو (Urdu)', keywords: ['enhanced', 'neural', 'asad', 'uzma', 'female'] },
  ne: { code: 'ne-NP', name: 'नेपाली (Nepali)', keywords: ['enhanced', 'neural', 'sagun', 'female'] },

  // --- Trung Đông & Ả Rập (mở rộng) ---
  ar: { code: 'ar-SA', name: 'العربية (Ả Rập chuẩn / Saudi)', keywords: ['enhanced', 'neural', 'hamed', 'zariyah', 'maged', 'fatima', 'female'] },
  'ar-AE': { code: 'ar-AE', name: 'العربية (UAE / Dubai)', keywords: ['enhanced', 'neural', 'fatima', 'hamdan', 'female'] },
  'ar-EG': { code: 'ar-EG', name: 'العربية (Ai Cập)', keywords: ['enhanced', 'neural', 'salma', 'female'] },
  'ar-JO': { code: 'ar-JO', name: 'العربية (Jordan)', keywords: ['enhanced', 'neural', 'sana', 'female'] },
  'ar-IQ': { code: 'ar-IQ', name: 'العربية (Iraq)', keywords: ['enhanced', 'neural', 'female'] },
  fa: { code: 'fa-IR', name: 'فارسی (Ba Tư / Iran)', keywords: ['enhanced', 'neural', 'dilara', 'female'] },
  he: { code: 'he-IL', name: 'עברית (Hebrew)', keywords: ['enhanced', 'neural', 'avri', 'hila', 'female'] },
  tr: { code: 'tr-TR', name: 'Türkçe (Thổ Nhĩ Kỳ)', keywords: ['enhanced', 'neural', 'emel', 'ahmet', 'female'] },

  // --- Châu Âu & Bắc Mỹ ---
  en: { code: 'en-US', name: 'English', keywords: ['enhanced', 'premium', 'neural', 'natural', 'samantha', 'google', 'aria', 'jenny', 'guy'] },
  fr: { code: 'fr-FR', name: 'Français', keywords: ['enhanced', 'neural', 'thomas', 'audrey', 'denise', 'female'] },
  de: { code: 'de-DE', name: 'Deutsch', keywords: ['enhanced', 'neural', 'anna', 'marlene', 'katja', 'female'] },
  es: { code: 'es-ES', name: 'Español', keywords: ['enhanced', 'neural', 'monica', 'jorge', 'elvira', 'female'] },
  it: { code: 'it-IT', name: 'Italiano', keywords: ['enhanced', 'neural', 'elsa', 'diego', 'female'] },
  pt: { code: 'pt-BR', name: 'Português (Brasil)', keywords: ['enhanced', 'neural', 'francisca', 'antonio', 'brasil', 'female'] },
  ru: { code: 'ru-RU', name: 'Русский', keywords: ['enhanced', 'neural', 'tatyana', 'pavel', 'dariya', 'female'] },
  uk: { code: 'uk-UA', name: 'Українська', keywords: ['enhanced', 'neural', 'polina', 'ostap', 'female'] },
  pl: { code: 'pl-PL', name: 'Polski', keywords: ['enhanced', 'neural', 'zosia', 'marek', 'female'] },
  nl: { code: 'nl-NL', name: 'Nederlands', keywords: ['enhanced', 'neural', 'colette', 'maarten', 'female'] },
  sv: { code: 'sv-SE', name: 'Svenska', keywords: ['enhanced', 'neural', 'hillevi', 'female'] },
  no: { code: 'nb-NO', name: 'Norsk', keywords: ['enhanced', 'neural', 'pernille', 'female'] },
  da: { code: 'da-DK', name: 'Dansk', keywords: ['enhanced', 'neural', 'christel', 'female'] },
  fi: { code: 'fi-FI', name: 'Suomi', keywords: ['enhanced', 'neural', 'noora', 'female'] },
  el: { code: 'el-GR', name: 'Ελληνικά', keywords: ['enhanced', 'neural', 'athina', 'female'] },
  cs: { code: 'cs-CZ', name: 'Čeština', keywords: ['enhanced', 'neural', 'vlasta', 'female'] },
  hu: { code: 'hu-HU', name: 'Magyar', keywords: ['enhanced', 'neural', 'noemi', 'female'] },
  ro: { code: 'ro-RO', name: 'Română', keywords: ['enhanced', 'neural', 'alina', 'female'] },

  // --- Châu Phi ---
  sw: { code: 'sw-KE', name: 'Kiswahili', keywords: ['enhanced', 'neural', 'rafiki', 'female'] },
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

  // 1. Script đặc thù (ưu tiên cao nhất) - dựa trên hàm gốc + bổ sung an toàn
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(sample)) return 'ja';     // Nhật
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(sample)) return 'ko';     // Hàn
  if (/[\u0E00-\u0E7F]/.test(sample)) return 'th';                 // Thái
  if (/[\u0E80-\u0EFF]/.test(sample)) return 'lo';                 // Lào
  if (/[\u1000-\u109F]/.test(sample)) return 'my';                 // Myanmar
  if (/[\u1780-\u17FF]/.test(sample)) return 'km';                 // Khmer
  if (/[\u0F00-\u0FFF]/.test(sample)) return 'bo';                 // Tây Tạng
  if (/[\u0590-\u05FF]/.test(sample)) return 'he';                 // Hebrew
  if (/[\u0370-\u03FF]/.test(sample)) return 'el';                 // Greek

  // Nam Á
  if (/[\u0900-\u097F]/.test(sample)) return 'hi';                 // Hindi
  if (/[\u0980-\u09FF]/.test(sample)) return 'bn';                 // Bengali
  if (/[\u0A00-\u0A7F]/.test(sample)) return 'pa';                 // Punjabi
  if (/[\u0A80-\u0AFF]/.test(sample)) return 'gu';                 // Gujarati
  if (/[\u0B80-\u0BFF]/.test(sample)) return 'ta';                 // Tamil
  if (/[\u0C00-\u0C7F]/.test(sample)) return 'te';                 // Telugu
  if (/[\u0C80-\u0CFF]/.test(sample)) return 'kn';                 // Kannada
  if (/[\u0D00-\u0DFF]/.test(sample)) return 'ml';                 // Malayalam

  // Ả Rập / Ba Tư / Urdu (bổ sung nhẹ, vẫn an toàn)
  if (/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(sample)) {
    if (/[پچگژ]/.test(sample)) return 'fa';                        // Persian
    if (/[ںےٹڈڑ]/.test(sample)) return 'ur';                       // Urdu
    return 'ar';                                                  // Arabic
  }

  // Cyrillic
  if (/[\u0400-\u04FF]/.test(sample)) {
    if (/[іїєґІЇЄҐ]/.test(sample)) return 'uk';
    return 'ru';
  }

  // Chữ Hán
  if (/[\u4E00-\u9FFF]/.test(sample)) return 'zh';

  // 2. Tiếng Việt – chỉ dựa vào ký tự đặc trưng (giữ nguyên để ổn định)
  if (/[ăắằẳẵặơớờởỡợưứừửữựđĂẮẰẲẴẶƠỚỜỞỠỢƯỨỪỬỮỰĐ]/i.test(sample)) {
    return 'vi';
  }

  // 3. Điểm số từ vựng (giữ ngưỡng >= 3 như gốc)
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
    fil: score(/\b(ang|ng|mga|sa|na|si|ay|para|at|may|din|rin|ko|mo|ni|niya|kami|tayo|sila)\b/g),
  };

  let max = 0, detected = 'en';
  for (const [k, v] of Object.entries(scores)) {
    if (v > max) {
      max = v;
      detected = k;
    }
  }

  // Ngưỡng tối thiểu giữ nguyên như hàm gốc (an toàn)
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

  // ===================== TIẾNG ANH =====================
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
      '\\bDept\\.\\b': 'Department',
      '\\bUniv\\.\\b': 'University',
      '\\bInc\\.\\b': 'Incorporated',
      '\\bLtd\\.\\b': 'Limited',
      '\\bJr\\.\\b': 'Junior',
      '\\bSr\\.\\b': 'Senior',
      '\\bSt\\.\\b': 'Street',
      '\\bAve\\.\\b': 'Avenue',
      '\\bBlvd\\.\\b': 'Boulevard',
      '\\bNo\\.\\b': 'Number',
      '\\bVol\\.\\b': 'Volume',
      '\\bpp\\.\\b': 'pages',
      '\\bfig\\.\\b': 'figure',
    };

    for (const [p, r] of Object.entries(abbr)) {
      result = result.replace(new RegExp(p, 'gi'), r);
    }

    // Số thứ tự
    result = result.replace(/\b(\d+)(st|nd|rd|th)\b/gi, (m, num, suf) => {
      const n = parseInt(num, 10);
      if (n === 1) return 'first';
      if (n === 2) return 'second';
      if (n === 3) return 'third';
      return num + ' ' + suf;
    });

    // Ngày tháng
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

  // ===================== TIẾNG VIỆT (giữ nguyên) =====================
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

  return (
    lang.startsWith('vi') ||
    lang.includes('vietnam') ||
    name.includes('vietnam') ||
    name.includes('vietnamese') ||
    name.includes('hoaimy') ||
    name.includes('hoai my') ||
    name.includes('linh') ||
    name.includes('mai ') ||
    name.includes('nam ') ||
    name.includes('saigon') ||
    name.includes('hanoi') ||
    name.includes('an ')          // Microsoft An
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

  // 1. Điểm nền tảng theo Ngôn ngữ / Locale
  if (langKey === 'vi' && isVietnameseVoice(voice)) {
    score += 200;
    if (lang === 'vi-vn' || lang === 'vi') score += 30;
  } else if (lang === cfg.code.toLowerCase() || lang === cfg.code.toLowerCase().replace('-', '_')) {
    score += 100;
  } else if (lang.startsWith(codeShort + '-') || lang.startsWith(codeShort + '_')) {
    score += 70;
  } else if (lang.startsWith(codeShort)) {
    score += 40;
  } else {
    score -= 100;
  }

  // 2. Thưởng điểm Công nghệ & Chất lượng giọng
  if (name.includes('neural')) score += 50;
  if (name.includes('natural')) score += 45;
  if (name.includes('wavenet')) score += 35;
  if (name.includes('enhanced') || name.includes('premium')) score += 30;

  if (name.includes('google')) score += 25;
  if (name.includes('microsoft')) score += 25;
  if (name.includes('siri') || name.includes('samantha') || name.includes('ava')) score += 20;

  // 3. Khớp từ khóa ưu tiên
  if (cfg.keywords && cfg.keywords.length) {
    cfg.keywords.forEach((kw, i) => {
      if (name.includes(kw.toLowerCase())) {
        score += (cfg.keywords.length - i) * 6;
      }
    });
  }

  // 4. Trừ điểm giọng kém
  if (name.includes('compact') || name.includes('eloquence') || name.includes('espeak')) {
    score -= 60;
  }

  // Giữ lại đoạn trừ điểm giọng nam của hàm gốc
  if (name.includes('male') && (langKey === 'vi' || langKey === 'th')) {
    score -= 5;
  }

  return score;
}

  function populateVoiceSelect() {
  const langKey = detectedLang;
  const cfg = LANG_CONFIG[langKey] || LANG_CONFIG.vi;

  // 1. Lưu lại giọng người dùng đang chọn trước khi làm mới dropdown
  const previousSelectedIndex = voiceSelect.value;
  const previousSelectedVoice = (previousSelectedIndex !== '' && voices[previousSelectedIndex])
    ? voices[previousSelectedIndex]
    : null;

  voiceSelect.innerHTML = '';

  if (!voices.length) {
    const opt = document.createElement('option');
    opt.textContent = 'Đang tải danh sách giọng...';
    voiceSelect.appendChild(opt);
    return;
  }

  // Chấm điểm và sắp xếp giọng đọc theo ngôn ngữ hiện tại
  const scored = voices
    .map(v => ({ v, s: scoreVoice(v, langKey) }))
    .sort((a, b) => b.s - a.s);

  let matched = scored.filter(x => x.s > 0);
  const hasVietnamese = voices.some(isVietnameseVoice);

  const currentUILang = localStorage.getItem('app_lang') || 'vi';
  const t = (typeof translations !== 'undefined' && translations[currentUILang]) 
            ? translations[currentUILang] 
            : null;

  // ========== TRƯỜNG HỢP 1: Không tìm thấy giọng phù hợp ==========
  if (matched.length === 0 || (langKey === 'vi' && !hasVietnamese)) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = t 
      ? t.noVoiceFound.replace('{lang}', cfg.name) 
      : `⚠️ Không tìm thấy giọng ${cfg.name}`;
    voiceSelect.appendChild(opt);

    const sep = document.createElement('option');
    sep.disabled = true;
    sep.textContent = currentUILang === 'en'
      ? `── All available voices (${voices.length}) ──`
      : `── Tất cả giọng đang có trên máy (${voices.length}) ──`;
    voiceSelect.appendChild(sep);

    scored.forEach(({ v }) => {
      const o = document.createElement('option');
      o.value = voices.indexOf(v);
      o.textContent = `${v.name} (${v.lang})`;
      voiceSelect.appendChild(o);
    });

    if (langKey === 'vi') {
      ttsStatus.innerHTML = '❌ <b>Vẫn chưa thấy giọng Tiếng Việt</b>.<br>' +
        '1. Hãy <b>tắt hoàn toàn Chrome</b> (kể cả chạy nền) rồi mở lại.<br>' +
        '2. Vào Cài đặt Windows → Thời gian & ngôn ngữ → <b>Giọng nói</b> → kiểm tra đã có giọng Việt chưa.<br>' +
        '3. Nếu dùng Edge, kiểm tra kết nối mạng để dùng giọng Online Natural.';
    } else {
      ttsStatus.textContent = t 
        ? t.noVoiceFoundDetail.replace('{lang}', cfg.name)
        : `⚠️ Không tìm thấy giọng ${cfg.name} trên thiết bị này.`;
    }
    return;
  }

  // ========== TRƯỜNG HỢP 2: Có giọng phù hợp ==========
  matched.forEach(({ v }, i) => {
    const opt = document.createElement('option');
    opt.value = voices.indexOf(v);
    const star = i === 0 ? ' ★' : '';
    opt.textContent = `${v.name} (${v.lang})${star}`;
    voiceSelect.appendChild(opt);
  });

  // Thêm danh sách các giọng ngôn ngữ khác ở bên dưới
  const unmatched = scored.filter(x => x.s <= 0);
  if (unmatched.length > 0) {
    const sep = document.createElement('option');
    sep.disabled = true;
    sep.textContent = currentUILang === 'en' ? '── Other voices ──' : '── Giọng ngôn ngữ khác ──';
    voiceSelect.appendChild(sep);

    unmatched.slice(0, 15).forEach(({ v }) => {
      const o = document.createElement('option');
      o.value = voices.indexOf(v);
      o.textContent = `${v.name} (${v.lang})`;
      voiceSelect.appendChild(o);
    });
  }

  // 1. Tự động chọn giọng tốt nhất (ngôi sao ★) của ngôn ngữ mới
  voiceSelect.value = voices.indexOf(matched[0].v);

  // 2. KHÔI PHỤC LỰA CHỌN CŨ (Chỉ áp dụng NẾU giọng cũ CÙNG NGÔN NGỮ với file mới)
  const targetCode = (cfg.code || langKey).toLowerCase().split('-')[0];
  const prevLang = (previousSelectedVoice?.lang || '').toLowerCase().replace('_', '-');

  const isSameLanguage = previousSelectedVoice && (
    prevLang.startsWith(targetCode) || 
    prevLang.startsWith(langKey.toLowerCase())
  );

  if (isSameLanguage && scoreVoice(previousSelectedVoice, langKey) > 0) {
    const newIdx = voices.indexOf(previousSelectedVoice);
    if (newIdx !== -1) {
      voiceSelect.value = newIdx;
    }
  }

  // Thông báo thành công
  if (langKey === 'vi') {
    ttsStatus.textContent = hasVietnamese ? '✓ Đã tìm thấy giọng Tiếng Việt' : '';
  } else {
    ttsStatus.textContent = `✓ Đã tìm thấy ${matched.length} giọng ${cfg.name}`;
  }
}

function getSelectedVoice() {
  const idx = parseInt(voiceSelect.value, 10);
  // Nếu người dùng chọn hợp lệ từ danh sách dropdown
  if (!isNaN(idx) && voices[idx]) {
    return voices[idx];
  }
  
  // Fallback: Tự động lấy giọng có điểm số cao nhất cho ngôn ngữ hiện tại
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
    currentUtterance = null;
    updateUI();
    ttsStatus.textContent = index >= textChunks.length ? 'Đã đọc xong.' : '';
    return;
  }
  if (isProcessing) return;
  isProcessing = true;
  currentChunkIndex = index;
  updateUI();

  const isFirstChunk = index === 0;
  const startDelay = isFirstChunk ? 160 : 0;

  const doSpeak = () => {
    const text = textChunks[index];
    const utter = new SpeechSynthesisUtterance(text);
    const voice = getSelectedVoice();
    const langCode = (LANG_CONFIG[detectedLang] || LANG_CONFIG.vi).code;

    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang || langCode;
    } else {
      utter.lang = langCode;
    }

    let rate = BASE_RATE * SPEED_MULTIPLIERS[selectedSpeedIndex];
    if (detectedLang === 'vi') {
      rate = Math.min(rate * 0.85, 1.6);
    } else if (detectedLang === 'en') {
      rate = Math.min(rate * 0.92, 1.8);
    } else if (['ja', 'zh', 'ko', 'th'].includes(detectedLang)) {
      rate = Math.min(rate * 0.90, 1.7);
    }
    utter.rate = Math.max(0.5, Math.min(rate, 2));
    utter.pitch = 1;
    utter.volume = 1;

    utter.onend = () => {
      isProcessing = false;
      currentUtterance = null;
      if (ttsState === 'playing') {
        currentChunkIndex++;
        const pause = detectedLang === 'en' ? 180 : 140;
        setTimeout(() => speakChunk(currentChunkIndex), pause);
      }
    };

    utter.onerror = (e) => {
      console.warn('TTS error', e);
      isProcessing = false;
      currentUtterance = null;
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

    // Hủy sạch trước khi nói (thêm cả trường hợp paused)
    try {
      if (speechSynthesis.speaking || speechSynthesis.pending || speechSynthesis.paused) {
        speechSynthesis.cancel();
      }
    } catch (_) {}

    speechSynthesis.speak(utter);
    ttsStatus.textContent = `Đang đọc câu ${index + 1}/${textChunks.length} · ${langCode}`;
  };

  if (startDelay > 0) {
    setTimeout(doSpeak, startDelay);
  } else {
    doSpeak();
  }
}

function togglePlay() {
  if (!textChunks.length) {
    ttsStatus.textContent = 'Chưa có nội dung. Hãy nhấn "Xử lý & Chuẩn bị đọc" trước.';
    return;
  }

  if (ttsState === 'playing') {
    // Pause thật → giữ đúng vị trí đang đọc
    try { speechSynthesis.pause(); } catch (_) {}
    ttsState = 'paused';
    isProcessing = false;          // ← quan trọng, tránh bị kẹt
    ttsStatus.textContent = 'Đã tạm dừng.';
    updateUI();
  } else if (ttsState === 'paused') {
    // Resume thật từ đúng chỗ
    try { speechSynthesis.resume(); } catch (_) {}
    ttsState = 'playing';
    ttsStatus.textContent = 'Đang đọc tiếp...';
    updateUI();

    // Fallback nhẹ nếu browser không resume được (thường gặp sau obfuscate hoặc Chrome)
    setTimeout(() => {
      if (ttsState === 'playing' && !speechSynthesis.speaking && !speechSynthesis.paused) {
        isProcessing = false;
        speakChunk(currentChunkIndex);
      }
    }, 80);
  } else {
    // Từ stopped → bắt đầu mới
    try { speechSynthesis.cancel(); } catch (_) {}
    ttsState = 'playing';
    isProcessing = false;
    currentUtterance = null;
    if (currentChunkIndex >= textChunks.length) currentChunkIndex = 0;
    updateUI();
    speakChunk(currentChunkIndex);
  }
}

function stopTts() {
  try { speechSynthesis.cancel(); } catch (_) {}
  ttsState = 'stopped';
  isProcessing = false;
  currentUtterance = null;
  currentChunkIndex = 0;
  selectedSpeedIndex = 0;
  updateUI();
  ttsStatus.textContent = 'Đã dừng.';
}

function cycleSpeed() {
  selectedSpeedIndex = (selectedSpeedIndex + 1) % SPEED_MULTIPLIERS.length;
  updateUI();
  if (ttsState === 'playing') {
    try { speechSynthesis.cancel(); } catch (_) {}
    isProcessing = false;
    currentUtterance = null;
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
    try { speechSynthesis.cancel(); } catch (_) {}
    isProcessing = false;
    currentUtterance = null;
    setTimeout(() => speakChunk(currentChunkIndex), 50);
  }
}

  // ===================== LOAD CONTENT & JINA READER PRO =====================
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
  updateContentStats();   // ← thêm dòng này
  currentChunkIndex = 0;
  updateUI();
  populateVoiceSelect();
  loadStatus.textContent = `Đã xử lý ${textChunks.length} câu · Ngôn ngữ: ${cfg.name}`;
  ttsStatus.textContent = '';
}

// ===================== LẤY NỘI DUNG NGUYÊN BẢN (CHUYÊN TRUYỆN CHỮ & BÁO CHÍ) =====================
async function fetchUrlContent(url) {
  loadStatus.innerHTML = '<span class="loading"></span> Đang kết nối Jina Reader...';

  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  // ========== Hàm thử Jina (có retry 1 lần) ==========
  async function tryJina(attempt = 1) {
    const jinaUrl = 'https://r.jina.ai/' + url;
    const res = await fetch(jinaUrl, {
      method: 'GET',
      signal: AbortSignal.timeout(18000), // tăng nhẹ timeout
      headers: {
        'Accept': 'text/plain',
        'X-Remove-Selector': 'header, nav, footer, sidebar, img, figure, video, iframe, picture, svg, .header, .menu, .sidebar, .comments, .ads, .related-posts, .ez-toc-container, .box-category, .social-share, .date-time, .author-info, .tags, .nav-links, .chapter-nav, .btn-group',
        'X-Respond-With': 'markdown',
        'X-No-Cache': 'true',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!res.ok) throw new Error('Jina HTTP ' + res.status);

    let text = await res.text();

    // Lọc metadata
    text = text
      .replace(/^Title:.*$/im, '')
      .replace(/^URL Source:.*$/im, '')
      .replace(/^Published Time:.*$/im, '')
      .replace(/^Markdown Content:.*$/im, '');

    // Lọc ảnh + link + markdown
    text = text
      .replace(/!\[.*?\]\([^)]*\)/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\]\([^)]*\)/g, '')
      .replace(/https?:\/\/\S+/gi, '')
      .replace(/<[^>]*>/g, '')
      .replace(/#{1,6}\s?/g, '')
      .replace(/[\*_~`>]/g, '')
      .replace(/^\s*[\*\-]\s*/gm, '');

    // Lọc rác truyện
    text = text
      .replace(/^(Chương trước|Chương sau|Danh sách chương|Mục lục|Báo lỗi|Cầu kim phiếu|Cầu đánh giá|Tải app).*$/gmi, '')
      .replace(/^(Bạn đang đọc truyện|Nguồn:|Converter:|Tác giả:|Thể loại:).*$/gmi, '')
      .replace(/^Thứ\s+[a-z0-9,:\s/()+-]+/gmi, '')
      .replace(/^\d{1,2}\/\d{1,2}\/\d{4}.*$/gm, '');

    // Làm sạch dòng
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let cleanLines = [];
    for (let i = 0; i < lines.length; i++) {
      if (i > 0 && lines[i] === lines[i - 1]) continue;
      if (lines[i].length < 6 && !/^[0-9A-ZĐÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĂĐĨŨƠƯ]/i.test(lines[i])) continue;
      cleanLines.push(lines[i]);
    }
    text = cleanLines.join('\n\n');

    // Clean mạnh
    text = cleanDocumentText(text);

    if (text.length > 60) return text;   // hạ xuống 60
console.warn('Jina nội dung sau clean còn:', text.length, 'ký tự →', text.slice(0, 150));
throw new Error('Jina trả về nội dung quá ngắn');
  }

  // Thử Jina lần 1
  try {
    const text = await tryJina(1);
    loadStatus.textContent = '✅ Đã trích xuất nội dung (Jina).';
    return text;
  } catch (e1) {
    console.warn('Jina lần 1 lỗi:', e1.message);
  }

  // Thử Jina lần 2 (đợi 1.2 giây)
  try {
    loadStatus.innerHTML = '<span class="loading"></span> Jina đang thử lại...';
    await new Promise(r => setTimeout(r, 1200));
    const text = await tryJina(2);
    loadStatus.textContent = '✅ Đã trích xuất nội dung (Jina retry).';
    return text;
  } catch (e2) {
    console.warn('Jina lần 2 cũng lỗi:', e2.message);
  }

  // ========== CÁCH 2: PROXY DỰ PHÒNG (chỉ giữ 2 cái ổn nhất) ==========
  loadStatus.innerHTML = '<span class="loading"></span> Thử proxy dự phòng...';

  const proxies = [
    (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`,
  ];

  let html = null;
  let lastErr = null;

  for (const make of proxies) {
    try {
      const res = await fetch(make(url), {
  signal: AbortSignal.timeout(12000),
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8'
  }
});
      if (!res.ok) throw new Error('HTTP ' + res.status);

      let body = await res.text();
      if (body.trim().startsWith('{')) {
        try {
          const json = JSON.parse(body);
          body = json.contents || json.content || body;
        } catch (_) {}
      }
      if (body && body.length > 500) {
        html = body;
        break;
      }
    } catch (e) {
      lastErr = e;
      console.warn('Proxy lỗi:', e.message);
    }
  }

  if (!html) {
    throw lastErr || new Error('Tất cả cách lấy nội dung đều thất bại. Hãy thử copy-paste thủ công hoặc mở bằng localhost.');
  }

  // ===== DOM Parser (giữ nguyên logic gốc) =====
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const removeSelectors = [
    'script', 'style', 'noscript', 'iframe', 'svg', 'canvas', 'form', 'img', 'picture', 'figure', 'video', 'audio',
    'nav', 'header', 'footer', 'aside', 'button', 'input', 'select',
    '.header', '.menu', '.sidebar', '.ads', '.advertisement', '.comments', '#comments',
    '.breadcrumb', '.social-share', '.date-time', '.box-category', '.taboola-placeholder',
    '.author-info', '.tags', '.relate-news', '.chapter-nav', '.nav-spec', '.btn-group'
  ];
  removeSelectors.forEach(sel => {
    try { doc.querySelectorAll(sel).forEach(el => el.remove()); } catch (_) {}
  });

  const title = doc.querySelector('h1.title-detail, h1.chapter-title, .chapter-title, h1.title, h1')?.innerText?.trim() || '';

    const { selector: customSelector } = getManualConfig();

  let contentEl = null;

  // 1. Ưu tiên selector người dùng nhập
  if (customSelector) {
    try {
      const selectors = customSelector.split(',').map(s => s.trim()).filter(Boolean);
      for (const sel of selectors) {
        const el = doc.querySelector(sel);
        if (el && el.innerText.trim().length > 120) {
          contentEl = el;
          break;
        }
      }
    } catch (e) {
      console.warn('Selector tùy chỉnh lỗi:', e);
    }
  }

  // 2. Nếu chưa có thì dùng selector mặc định
  if (!contentEl) {
    const candidateSelectors = [
      '.chapter-c', '#chapter-c', '.chapter-content', '.reading-content', '.chap-content', '.content-chap', '.box-chap',
      '.fck_detail', 'article.fck_detail', '.detail-content', '.post-content-body', '.entry-content', 'article', 'main'
    ];

    for (const sel of candidateSelectors) {
      const el = doc.querySelector(sel);
      if (el && el.innerText.trim().length > 150) {
        contentEl = el;
        break;
      }
    }
  }

  // 3. Fallback cuối cùng
  if (!contentEl) {
    let maxLen = 0;
    doc.querySelectorAll('div, section').forEach(el => {
      const len = el.innerText.trim().length;
      if (len > maxLen) {
        maxLen = len;
        contentEl = el;
      }
    });
  }

  let bodyText = '';
  if (contentEl) {
    const cloneEl = contentEl.cloneNode(true);
    cloneEl.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
    const rawParagraphs = cloneEl.innerText.split('\n');
    bodyText = rawParagraphs
      .map(p => p.trim())
      .filter(p => {
        if (p.length < 3) return false;
        if (/^(Chương trước|Chương sau|Danh sách chương|Mục lục|Báo lỗi|Cầu kim phiếu|Cầu đánh giá)/i.test(p)) return false;
        return true;
      })
      .join('\n\n');
  }

  let resultText = [title, bodyText].filter(Boolean).join('\n\n');
  resultText = resultText
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  resultText = cleanDocumentText(resultText);

  if (resultText.length < 50) throw new Error('Không thể bóc tách nội dung bài viết/truyện.');

  loadStatus.textContent = '✅ Đã rút trích nội dung thành công (proxy).';
  return resultText;
}

// ===================== EVENT LISTENERS =====================
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
      textInput.value = text; // Tự động điền vào textarea
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

    // ===================== PDF PHÂN TRANG CHUẨN A4 (KHÔNG BỊ CẮT CHỮ) =====================
$('btnPdf').addEventListener('click', async () => {
  const text = (rawText || contentDisplay.innerText || '').trim();
  if (!text) {
    ttsStatus.textContent = '❌ Chưa có nội dung để xuất PDF.';
    return;
  }

  ttsStatus.textContent = '⏳ Đang tính toán phân trang & tạo PDF...';

  try {
    const { jsPDF } = window.jspdf;
    const today = new Date().toLocaleDateString('vi-VN', { 
      year: 'numeric', month: '2-digit', day: '2-digit', 
      hour: '2-digit', minute: '2-digit' 
    });

    // Kích thước chuẩn A4 tỉ lệ pixel (750 x 1060px)
    const PAGE_WIDTH = 750;
    const PAGE_HEIGHT = 1060;

    // Hàm tạo 1 trang A4 DOM ảo
    function createPageElement() {
      const page = document.createElement('div');
      page.style.cssText = `
        position: fixed;
        left: -9999px;
        top: 0;
        width: ${PAGE_WIDTH}px;
        height: ${PAGE_HEIGHT}px;
        padding: 40px 45px 35px 45px;
        background: #ffffff;
        color: #1e293b;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        font-size: 13.5px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      `;

      page.innerHTML = `
        <!-- HEADER TRANG -->
        <div style="border-bottom: 2px solid #0284c7; padding-bottom: 10px; display: flex; justify-content: space-between; align-items: flex-end;">
          <div>
            <div style="font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">THÁI THÔNG · TTS</div>
            <div style="font-size: 10px; color: #0284c7; font-weight: 600; text-transform: uppercase; margin-top: 2px;">Tài Liệu Văn Bản & Giọng Nói</div>
          </div>
          <div style="text-align: right; font-size: 10.5px; color: #64748b;">
            <div>📅 ${today}</div>
            <div style="margin-top: 2px; color: #0284c7; font-weight: 500;">✉️ ThaiThongsj@gmail.com</div>
          </div>
        </div>

        <!-- VÙNG NỘI DUNG (TỰ CO CO GIÃN THEO TRANG) -->
        <div class="pdf-content" style="flex: 1; margin: 18px 0; color: #334155; overflow: hidden;"></div>

        <!-- FOOTER TRANG -->
        <div style="border-top: 1px dashed #cbd5e1; padding-top: 8px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8;">
          <span class="page-number">Trang 1</span>
          <span>❤️ Ung ho du an: Vietcombank 9898661918</span>
        </div>
      `;
      return page;
    }

    // Tách nhỏ văn bản thành các đoạn/câu để đưa vào trang
    const rawParagraphs = text.split('\n').filter(p => p.trim() !== '');
    const blocks = [];
    for (const rawP of rawParagraphs) {
      if (rawP.length > 350) {
        // Nếu đoạn quá dài, tự tách theo câu để xếp trang mịn hơn
        const sentences = rawP.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [rawP];
        blocks.push(...sentences);
      } else {
        blocks.push(rawP);
      }
    }

    // Tiến hành xếp nội dung vào từng trang A4
    const pages = [];
    let currentPage = createPageElement();
    document.body.appendChild(currentPage);
    pages.push(currentPage);

    let contentBox = currentPage.querySelector('.pdf-content');

    for (const block of blocks) {
      const p = document.createElement('p');
      p.style.cssText = "margin: 0 0 12px 0; text-align: justify; line-height: 1.65; word-break: break-word;";
      p.textContent = block;

      contentBox.appendChild(p);

      // Nếu tràn chiều cao trang A4 hiện tại -> Chuyển đoạn này sang trang mới
      if (contentBox.scrollHeight > contentBox.clientHeight) {
        contentBox.removeChild(p);

        currentPage = createPageElement();
        document.body.appendChild(currentPage);
        pages.push(currentPage);

        contentBox = currentPage.querySelector('.pdf-content');
        contentBox.appendChild(p);
      }
    }

    // Cập nhật số trang chuẩn (Trang X / Y)
    const totalPages = pages.length;
    pages.forEach((pg, idx) => {
      const pageNumEl = pg.querySelector('.page-number');
      if (pageNumEl) pageNumEl.textContent = `Trang ${idx + 1} / ${totalPages}`;
    });

    // Xuất sang PDF
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    for (let i = 0; i < pages.length; i++) {
      if (i > 0) pdf.addPage();
      
      const canvas = await html2canvas(pages[i], {
        scale: 2, // Độ nét HD
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });

      pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297);
      document.body.removeChild(pages[i]); // Dọn dẹp DOM ẩn
    }

    pdf.save(`ThaiThong_TTS_${Date.now()}.pdf`);
    ttsStatus.textContent = '✅ Đã xuất PDF chuẩn phân trang A4!';
  } catch (e) {
    console.error(e);
    ttsStatus.textContent = '❌ Lỗi xuất PDF: ' + (e.message || e);
  }
});
    // ===================== TỰ ĐỘNG XỬ LÝ + SỬA NỘI DUNG =====================

 // A. Tự xử lý khi dán hoặc ngừng gõ
let pasteTimer = null;
textInput.addEventListener('input', () => {
  clearTimeout(pasteTimer);
  pasteTimer = setTimeout(async () => {
    const rawVal = textInput.value;
    const cleanedVal = cleanDocumentText(rawVal);

    if (cleanedVal && cleanedVal !== rawVal) {
      textInput.value = cleanedVal;
    }
    if (cleanedVal && typeof processText === 'function') {
      await processText(cleanedVal);
      const statusEl = document.getElementById('loadStatus');
      if (statusEl) statusEl.innerHTML = '✅ Đã tự động lọc rác và sẵn sàng đọc!';
    }
  }, 600);
});

// B. Cập nhật thống kê khi sửa khung nội dung
contentDisplay.addEventListener('input', () => {
  updateContentStats();
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
  // ===================== KHỞI TẠO WORKER CHO PDF.JS =====================
if (window.pdfjsLib) {
  // Trỏ trực tiếp đến file worker đã tải về cùng thư mục
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdf.worker.min.js';
}

// Khai báo an toàn tránh đụng độ biến $ ở đầu file T2.js
const $el = (id) => document.getElementById(id);

// ===================== LẤY CẤU HÌNH CHỈNH TAY TỪ UI =====================
function getManualConfig() {
  const selector = (document.getElementById('selectorInput')?.value || '').trim();
  const excludeRaw = (document.getElementById('excludeInput')?.value || '').trim();
  const extraKeywords = excludeRaw
    ? excludeRaw.split(',').map(k => k.trim()).filter(Boolean)
    : [];
  return { selector, extraKeywords };
}

// ===================== THUẬT TOÁN LÀM SẠCH & LỌC RÁC THÔNG MINH (DÙNG CHUNG CHO PASTE & URL) =====================
function cleanDocumentText(text) {
  if (!text) return '';

  let cleaned = text
    // 1. Chuẩn hóa xuống dòng
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // 2. Bỏ ký tự điều khiển
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')

    // 3. XÓA ẢNH / VIDEO / IFRAME
    .replace(/!\[.*?\]\([^)]*\)/g, '')
    .replace(/<img[^>]*>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|tiktok\.com|facebook\.com|instagram\.)\S+/gi, '')

    // 4. XỬ LÝ LINK
    .replace(/\[([^\]]+)\]\((?:https?:\/\/\S+|[^)]*?\.(?:png|jpg|jpeg|gif|webp|mp4|webm))[^)]*\)/gi, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/gi, '')
    .replace(/www\.\S+/gi, '')

    // 5. Xóa thẻ HTML còn sót
    .replace(/<[^>]*>/g, '')

    // 6. Nối dòng bị gãy (PDF / một số trang)
    .replace(/([a-z0-9àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ])\n([a-z0-9àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ])/gi, '$1 $2')

    // ===== RÁC ĐẶC THÙ VNEXPRESS + TABOOLA + VIDEO PLAYER =====
    .replace(/Advertisement[\s\S]*?(?=Next|Stay|Playback|Quality|Back|$)/gi, '')
    .replace(/(?:Next|Stay|Playback speed|Quality|Auto|Back|0\.25x|0\.5x|1x Normal|1\.5x|2x|322p|240p|144p)\s*/gi, '')
    .replace(/\b(?:Undo|Sponsored|by Taboola|Discover|Read More Skip|Learn More|Want to know more\?|click here-?)\b/gi, '')
    .replace(/\[SponsoredSponsored.*?\]/gi, '')
    .replace(/organixmag\.com.*?/gi, '')
    .replace(/Sustainability For All.*?ACCIONA/gi, '')

    // Caption ảnh / video
    .replace(/\b(?:Ảnh|Video|Hình)\s*:\s*[A-Za-z0-9\s\.]+/gi, '')
    .replace(/Huấn Hoa Hồng khoe tiền trên mạng xã hội trước khi bị bắt\.\s*/gi, '')
    .replace(/Công an tống đạt quyết định với Huấn Hoa Hồng\.\s*/gi, '')
    .replace(/Hàng trăm người theo dõi vụ việc trước nhà Huấn Hoa Hồng\.\s*/gi, '')

    // Hướng dẫn Google / Trở lại / Lưu
    .replace(/Trở lại Pháp luật\s*/gi, '')
    .replace(/Lưu;?\)?\s*/gi, '')
    .replace(/Thêm VnExpress trên Google[\s\S]*?đã hoàn thành\./gi, '')
    .replace(/Chọn VnExpress làm nguồn ưu tiên[\s\S]*?đã hoàn thành\./gi, '')
    .replace(/Copy link thành công\s*/gi, '')
    .replace(/Xem hướng dẫn\.\s*/gi, '')

    // Phần bình luận
    .replace(/Ý kiến[\s\S]*?(?=Tiếp tục đọc|$)/gi, '')
    .replace(/(?:Thích|Ngạc nhiên|Buồn)\s+\d+\s*Trả lời\s*Báo vi phạm\s*\d+h trước(?:\s*\d+\s*trả lời)?/gi, '')
    .replace(/Quan tâm nhất\s*Mới nhất\s*/gi, '')
    .replace(/Chuyên gia tư vấn\s*/gi, '')
    .replace(/Vui lòng tuân thủ quy định khi chia sẻ quan điểm[\s\S]*?Gửi/gi, '')
    .replace(/Bạn chưa nhập nội dung bình luận[\s\S]*?Gửi/gi, '')

    // ===== CẮT ĐUÔI BÀI LIÊN QUAN + SPONSORED (mới thêm) =====
    .replace(/(?:Xem thêm|Tin liên quan|Bài viết liên quan|Có thể bạn quan tâm|Đọc thêm|Tiếp tục đọc|Phản hồi)[\s\S]*$/i, '')
    .replace(/(?:Sponsored|by Taboola|Advertisement|\[Sponsored)[\s\S]*$/i, '')
    .replace(/(?:Vợ gọi tên người cũ|Nhiễm độc do dị ứng|Apple tìm cách|Chủ nhà hàng Hàn Quốc|5 tàu cá bốc cháy|38 giờ truy vết|Lúa phủ xanh|Hậu trường cân não|Cảnh sát tiếp nhận 50 thỏi vàng|Trúng đấu giá|Malaysia chỉ có 16 cầu thủ|Nước nào có mỏ đất hiếm)[\s\S]*$/i, '')

    // Tiêu đề bài liên quan + số view
    .replace(/^\d+\s+[A-ZĐÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝ].{10,120}$/gm, '')
    .replace(/^(?:Vì sao|Từ '|Nhiều cảnh sát|Chủ nhà hàng|Nhiễm độc|Cảnh sát tiếp nhận|Hậu trường|5 tàu cá|38 giờ|Trúng đấu giá|Lúa phủ|Đề xuất|165 tác phẩm|6 người|Bạn gái).*$/gmi, '')

    // Menu + chuyên mục dài
    .replace(/Tất cả chuyên mục[\s\S]*?(?=Trở lại|Pháp luật|Vợ chồng|$)/gi, '')
    .replace(/^(?:Đóng|VnE-GO|Discover|Shorts|Podcasts|Thời sự|Chính trị|Kỷ nguyên mới|Dân sinh|Việc làm|Giao thông|Quỹ Hy vọng|Thế giới|Phân tích|Tư liệu|Quân sự|Cuộc sống đó đây|Người Việt 5 châu|Bắc Mỹ|Kinh doanh|NetZero|Quốc tế|Doanh nghiệp|Chứng khoán|Ebank|Vĩ mô|Tiền của tôi|Hàng hóa|Khoa học công nghệ|Hoạt động Bộ|Chuyển đổi số|Đổi mới sáng tạo|AI|Vũ trụ|Thế giới tự nhiên|Thiết bị|Cửa sổ tri thức|Góc nhìn|Bất động sản|Sức khỏe|Giải trí|Thể thao|Pháp luật|Giáo dục|Đời sống|Xe|Du lịch|Ý kiến|Spotlight|Infographics|Mới nhất|Xem nhiều|Tin nổi bật|Lịch vạn niên|Rao vặt|Liên hệ|Tòa soạn|Tải ứng dụng|VnExpressInternational)\s*/gmi, '')

    // Rác truyện chữ + số trang
    .replace(/^\s*(?:trang|page)?\s*\d+\s*$/gmi, '')
    .replace(/^(Chương trước|Chương sau|Danh sách chương|Mục lục|Báo lỗi|Cầu kim phiếu|Cầu đánh giá|Tải app|Chia sẻ|Bình luận|Ý kiến bạn đọc|Tin liên quan|Đăng nhập|Đăng ký).*$/gmi, '')
    .replace(/^(Bạn đang đọc truyện|Nguồn:|Converter:|Tác giả:|Thể loại:|Advertisements|Ads).*$/gmi, '')
    .replace(/^\d{1,2}\/\d{1,2}\/\d{4}.*$/gm, '')

    // Chuẩn hóa khoảng trắng
        // Chuẩn hóa khoảng trắng
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n');

  // ===== Loại bỏ từ khóa người dùng nhập thêm =====
  const { extraKeywords } = getManualConfig();
  if (extraKeywords.length) {
    extraKeywords.forEach(kw => {
      if (kw.length > 1) {
        try {
          const re = new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          cleaned = cleaned.replace(re, ' ');
        } catch (_) {}
      }
    });
  }

  // ===== LỌC TỪNG DÒNG =====
  const lines = cleaned.split('\n').map(l => l.trim()).filter(Boolean);
  const cleanLines = [];
  const junkLineRe = [
    /^(Tất cả chuyên mục|Đóng|VnE-GO|Discover|Shorts|Podcasts|Thời sự|Chính trị|Xem thêm|Trở lại|Lưu|Thêm VnExpress|Chọn VnExpress|Xem hướng dẫn|Copy link|Advertisement|Next|Stay|Playback|Quality|Auto|Back|Undo|Sponsored|by Taboola|Read More|Learn More|Want to know more)/i,
    /^(Thích|Ngạc nhiên|Buồn|Trả lời|Báo vi phạm|\d+h trước|\d+ trả lời)/i,
    /^(Quan tâm nhất|Mới nhất|Chuyên gia tư vấn|Ý kiến|Phản hồi|Tiếp tục đọc)/i,
    /^[\[\(].*[\]\)]$/,
    /^[A-ZĐÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĂĐĨŨƠƯ\s\-]{3,50}$/,
    /Ảnh:\s*[A-Za-z0-9\.]+/i,
    /Video:\s*[A-Za-z0-9\.]+/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (i > 0 && line === lines[i - 1]) continue;
    if (line.length < 12 && !/^[0-9A-ZĐÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝ]/.test(line)) continue;
    if (junkLineRe.some(re => re.test(line))) continue;

    const words = line.split(/\s+/);
    if (words.length <= 5 && /^[A-ZĐÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝ]/.test(line) && line.length < 55) {
      continue;
    }
    cleanLines.push(line);
  }

  return cleanLines.join('\n\n').trim();
}

// 1. Cập nhật hàm điều hướng đọc file (bổ sung dạng ảnh)
async function readTextFromFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  
  // Kiểm tra đuôi file hình ảnh
  if (['png', 'jpg', 'jpeg', 'bmp', 'webp', 'gif'].includes(ext)) {
    return await readImageFile(file);
  } else if (ext === 'pdf') {
    return await readPdfFile(file);
  } else if (ext === 'docx') {
    return await readDocxFile(file);
  } else if (ext === 'doc') {
    throw new Error('File .doc cũ không hỗ trợ đọc trực tiếp. Vui lòng đổi sang dạng .docx, .pdf hoặc .jpg!');
  } else {
    return await readTextFile(file);
  }
}

// 2. Thêm hàm quét OCR nhận diện chữ từ file ảnh
async function readImageFile(file) {
  if (typeof Tesseract === 'undefined') {
    throw new Error('Chưa tải xong thư viện quét ảnh Tesseract.js. Vui lòng kiểm tra kết nối mạng!');
  }

  const statusEl = $el('loadStatus');
  if (statusEl) statusEl.innerHTML = '<span class="loading"></span> Đang chuẩn bị quét chữ từ ảnh...';

  // Quét kết hợp cả Tiếng Việt (vie) và Tiếng Anh (eng)
  const result = await Tesseract.recognize(file, 'vie+eng', {
    logger: m => {
      if (m.status === 'recognizing text' && statusEl) {
        const progress = Math.round((m.progress || 0) * 100);
        statusEl.innerHTML = `<span class="loading"></span> Đang quét chữ từ ảnh: ${progress}%...`;
      }
    }
  });

  const extractedText = result.data.text;
  if (!extractedText || !extractedText.trim()) {
    throw new Error('Không tìm thấy chữ hoặc ảnh quá mờ/chất lượng thấp.');
  }

  return cleanDocumentText(extractedText);
}

// 1. Hàm kiểm tra văn bản bị lỗi font mã hóa (Mojibake/Vỡ nét)
function isMangledText(text) {
  if (!text || text.trim().length === 0) return true;

  // Tập hợp các ký tự rác/mã hóa sai TCVN3/Windows-1252 phổ biến khi bóc tách PDF lỗi font
  const mangledPattern = /[¢¾¬Ë¯µ£§¥μ°±¡¿ÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßæçëîïðñö÷øûüþÿ]/g;
  const matches = text.match(mangledPattern) || [];

  // Bắt các lỗi kết hợp ký tự rác phổ biến như: "V)nh", "nh¥t", "Hu¿", "TiÁn"
  const structureMangle = (text.match(/\b\w+[\)\¥\¿\Á\±\°]\w+\b/g) || []).length;

  const totalBadHits = matches.length + (structureMangle * 2);

  // Nếu tỷ lệ ký tự rác > 2% tổng số ký tự -> Xác định file bị vỡ font
  return (totalBadHits / text.length) > 0.02;
}

// 2. Hàm đọc file PDF tối ưu tốc độ OCR & khắc phục cảnh báo lặp
async function readPdfFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  const statusEl = $el('loadStatus');

  // Khởi tạo trước 1 Tesseract Worker dùng chung cho tất cả các trang
  let ocrWorker = null;

  try {
    for (let i = 1; i <= pdf.numPages; i++) {
      if (statusEl) {
        statusEl.innerHTML = `<span class="loading"></span> Đang xử lý trang ${i}/${pdf.numPages}...`;
      }

      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Ghép văn bản trực tiếp từ PDF
      let lastY = null;
      let pageText = '';
      for (const item of textContent.items) {
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
          pageText += '\n';
        } else if (pageText && !pageText.endsWith(' ') && !item.str.startsWith(' ')) {
          pageText += ' ';
        }
        pageText += item.str;
        lastY = item.transform[5];
      }

      const cleanExtract = pageText.trim();
      const isCorrupted = isMangledText(cleanExtract);

      // Nếu văn bản bóc ra đủ dài VÀ KHÔNG BỊ LỖI FONT -> Dùng trực tiếp
      if (cleanExtract.length > 30 && !isCorrupted) {
        fullText += cleanExtract + '\n\n';
      } else {
        // Nếu bị vỡ font hoặc là PDF dạng ảnh -> Dùng OCR
        if (statusEl) {
          statusEl.innerHTML = `<span class="loading"></span> Trang ${i}/${pdf.numPages}: Đang nhận diện OCR chữ Tiếng Việt...`;
        }

        // Tạo Worker Tesseract một lần duy nhất khi gặp trang cần OCR
        if (!ocrWorker) {
          if (typeof Tesseract.createWorker === 'function') {
            ocrWorker = await Tesseract.createWorker('vie+eng');
          }
        }

        // Render trang PDF ra Canvas chất lượng cao (Scale 2.0)
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        // Quét OCR bằng Worker đã khởi tạo
        if (ocrWorker) {
          const ret = await ocrWorker.recognize(canvas);
          fullText += (ret.data.text || '') + '\n\n';
        } else {
          // Fallback nếu dùng bản Tesseract.js cũ
          const ret = await Tesseract.recognize(canvas, 'vie+eng');
          fullText += (ret.data.text || '') + '\n\n';
        }
      }
    }
  } finally {
    // Giải phóng bộ nhớ Tesseract Worker sau khi hoàn thành toàn bộ các trang
    if (ocrWorker && typeof ocrWorker.terminate === 'function') {
      await ocrWorker.terminate();
    }
  }

  if (!fullText.trim()) {
    throw new Error('Không thể rút trích văn bản từ file PDF này.');
  }

  return cleanDocumentText(fullText);
}

// 2. Đọc file Word (.docx)
async function readDocxFile(file) {
  if (!window.mammoth) throw new Error('Chưa tải xong thư viện Mammoth.js');
  const arrayBuffer = await file.arrayBuffer();
  const statusEl = $el('loadStatus');
  if (statusEl) statusEl.innerHTML = '<span class="loading"></span> Đang trích xuất tài liệu Word...';
  const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
  return cleanDocumentText(result.value);
}

// 3. Đọc file Văn bản (.txt, .md)
function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(cleanDocumentText(e.target.result));
    reader.onerror = () => reject(new Error('Không thể đọc nội dung file văn bản.'));
    reader.readAsText(file, 'UTF-8');
  });
}

// ===================== CẬP NHẬT TAB EVENTS & KÉO THẢ FILE =====================
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    if ($el('panel-text')) $el('panel-text').style.display = target === 'text' ? 'block' : 'none';
    if ($el('panel-url')) $el('panel-url').style.display = target === 'url' ? 'block' : 'none';
    if ($el('panel-file')) $el('panel-file').style.display = target === 'file' ? 'block' : 'none';
  });
});

const dropZone = $el('dropZone');
const fileInput = $el('fileInput');
const dropZoneContent = $el('dropZoneContent');
const fileInfo = $el('fileInfo');

if (dropZone && fileInput) {
  dropZone.addEventListener('click', () => fileInput.click());

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.background = 'rgba(2, 132, 199, 0.1)';
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.style.background = 'rgba(2, 132, 199, 0.03)';
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.background = 'rgba(2, 132, 199, 0.03)';
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      handleFileSelect(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  });
}

// TỰ ĐỘNG CHẠY NGAY KHI CHỌN HOẶC THẢ FILE
async function handleFileSelect(file) {
  if (!file) return;

  if (dropZoneContent) dropZoneContent.style.display = 'none';
  if (fileInfo) {
    fileInfo.style.display = 'block';
    fileInfo.innerHTML = `📌 Đã chọn: <b>${file.name}</b> (${(file.size / 1024).toFixed(1)} KB)`;
  }

  const statusEl = $el('loadStatus');
  try {
    if (statusEl) statusEl.innerHTML = '<span class="loading"></span> Đang nạp và trích xuất file...';
    
    // Đọc nội dung file
    const extractedText = await readTextFromFile(file);
    
    // Đổ vào ô nhập
    const textInput = $el('textInput');
    if (textInput) textInput.value = extractedText;

    // Nạp trực tiếp vào bộ xử lý câu để đọc ngay
    if (typeof processText === 'function') {
      await processText(extractedText);
    }

    if (statusEl) statusEl.innerHTML = '✅ Đã nạp file xong! Bấm <b>▶ ĐỌC GIỌNG MÁY</b> để nghe ngay.';
  } catch (err) {
    console.error(err);
    if (statusEl) statusEl.textContent = 'Lỗi đọc file: ' + (err.message || err);
  }
}

// Bảng từ điển ngôn ngữ mở rộng cho khung Controls
const controlsTranslations = {
  vi: {
    speedTitle: "Đổi tốc độ đọc",
    sentenceLabel: "Câu",
    jumpLabel: "Tới câu:",
    playLabel: "ĐỌC GIỌNG MÁY",
    stopTitle: "Dừng & về đầu",
    pdfLabel: "📄 XUẤT PDF",
    voiceLabel: "Giọng đọc (tự chọn tốt nhất theo ngôn ngữ)",
    badgeText: "vi · Tiếng Việt"
  },
  en: {
    speedTitle: "Change reading speed",
    sentenceLabel: "Sentence",
    jumpLabel: "Jump to:",
    playLabel: "PLAY SPEECH",
    stopTitle: "Stop & Reset",
    pdfLabel: "📄 EXPORT PDF",
    voiceLabel: "Voice (auto-selected best by language)",
    badgeText: "en · English"
  },
  ja: {
    speedTitle: "読み上げ速度の変更",
    sentenceLabel: "文",
    jumpLabel: "移動:",
    playLabel: "音声読み上げ",
    stopTitle: "停止して r 保持",
    pdfLabel: "📄 PDF出力",
    voiceLabel: "音声 (言語に最適な声を tự động 選択)",
    badgeText: "ja · 日本語"
  },
  zh: {
    speedTitle: "更改朗读速度",
    sentenceLabel: "句",
    jumpLabel: "跳转至:",
    playLabel: "朗读文本",
    stopTitle: "停止并重置",
    pdfLabel: "📄 导出 PDF",
    voiceLabel: "语音 (按语言自动选择最佳)",
    badgeText: "zh · 中文"
  }
};

// Hàm cập nhật riêng cho khu vực Controls
function updateControlsUI(langCode = 'vi', currentSentence = 0, totalSentences = 0) {
  // Lấy ngôn ngữ tương ứng (mặc định 'vi' nếu chưa hỗ trợ)
  const langKey = langCode.substring(0, 2).toLowerCase();
  const t = controlsTranslations[langKey] || controlsTranslations.vi;

  // Cập nhật các phần tử HTML
  document.getElementById('btnSpeed').title = t.speedTitle;
  document.getElementById('lblJump').textContent = t.jumpLabel;
  document.getElementById('playLabel').textContent = t.playLabel;
  document.getElementById('btnStop').title = t.stopTitle;
  document.getElementById('pdfLabel').textContent = t.pdfLabel;
  document.getElementById('lblVoiceSelect').textContent = t.voiceLabel;

  // Cập nhật thẻ Badge hiển thị ngôn ngữ
  const langBadge = document.getElementById('langBadge');
  if (langBadge) {
    langBadge.textContent = t.badgeText;
  }

  // Cập nhật chỉ số câu (Sentence Info)
  const sentenceInfo = document.getElementById('sentenceInfo');
  if (sentenceInfo) {
    sentenceInfo.textContent = `${t.sentenceLabel}: ${currentSentence} / ${totalSentences}`;
  }
}

// Ví dụ tích hợp khi người dùng chọn giọng đọc hoặc thay đổi ngôn ngữ:
document.getElementById('voiceSelect').addEventListener('change', (e) => {
  const selectedOption = e.target.options[e.target.selectedIndex];
  if (selectedOption && selectedOption.dataset.lang) {
    const lang = selectedOption.dataset.lang; // VD: 'en-US', 'vi-VN', 'ja-JP'
    updateControlsUI(lang, 0, 0);
  }
});
  function updateContentStats() {
  const el = document.getElementById('contentDisplay');
  const statsEl = document.getElementById('contentStats');
  if (!el || !statsEl) return;

  const text = (el.innerText || el.textContent || '').trim();
  const charCount = text.length;
  const lineCount = text ? text.split(/\n/).filter(l => l.trim().length > 0).length : 0;

  statsEl.textContent = `${charCount.toLocaleString('vi-VN')} ký tự · ${lineCount} dòng`;
}
  // Init
  updateUI();
  // Preload voices
  setTimeout(loadVoices, 300);
})();