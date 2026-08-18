 <!-- SCRIPT HỖ TRỢ ĐỔI NGÔN NGỮ & LƯU TRỮ LOCALSTORAGE -->

    const translations = {
      vi: {
        title: "Thai Thong - TTS Đa Ngôn Ngữ",
        headerTitle: "Thai Thong · TTS ĐA NGÔN NGỮ",
        btnDonate: "❤️ Ủng hộ",
        badge: "Web Edition",
        tabText: "Văn bản",
        tabUrl: "Link trang web",
        tabFile: "📁 Tải File (PDF/Word/Ảnh/TXT)",
        textLabel: "Dán nội dung cần đọc",
        textPlaceholder: "Dán văn bản luận giải hoặc bất kỳ nội dung nào vào đây...",
        urlLabel: "Dán link bài viết / báo mạng vào đây",
        urlPlaceholder: "https://tuoitre.vn/bai-viet-hay... hoặc link blog",
        sampleHint: "💡 Dùng thử: ",
        sampleBtn: "Link báo mẫu",
        urlTip: "✨ <b>Mẹo:</b> Hỗ trợ tốt nhất cho các trang tin tức, báo chí, blog, bài viết hướng dẫn.",
        advToggle: "⚙️ Lấy bị sai/thừa chữ? Bấm vào đây để chỉnh",
        advTip: "Nếu ứng dụng lấy lộn menu hoặc quảng cáo, hãy chọn loại trang web bên dưới:",
        preset1: "📰 Trang Báo chí",
        preset2: "📝 Blog / WordPress",
        preset3: "🌐 Web thông thường",
        selectorLabel: "Vùng lấy chữ (CSS Selector):",
        selectorPlaceholder: "VD: article, .post-content (để trống = tự động)",
        excludeLabel: "Các từ khóa muốn loại bỏ (cách nhau dấu phẩy):",
        fileLabel: "Tải file tài liệu lên để đọc",
        dropzoneText1: "Kéo & thả file vào đây",
        dropzoneText2: "Bấm để chọn file",
        dropzoneFormats: "Hỗ trợ: PDF, Word (.docx), Ảnh (.png, .jpg, .webp...), Văn bản (.txt, .md)",
        btnLoad: "Xử lý & Chuẩn bị đọc",
        btnClear: "Xóa",
        speedBtnTitle: "Đổi tốc độ đọc",
        jumpLabel: "Tới câu:",
        playLabel: "ĐỌC GIỌNG MÁY",
        pdfLabel: "📄 XUẤT PDF",
        voiceLabel: "Giọng đọc (tự chọn tốt nhất theo ngôn ngữ)",
        contentHeaderTitle: "NỘI DUNG (có thể sửa trực tiếp)",
        btnUpdateContent: "↻ Cập nhật",
        contentEditableTitle: "Click vào đây để sửa / xóa phần không muốn đọc",
        donateTitle: "❤️ ỦNG HỘ DỰ ÁN",
        btnSaveQr: "⬇️ Lưu ảnh QR về máy",
        qrFallback: "Chưa có ảnh QR (bank.png)",
        donateHint: "Quét mã QR để ủng hộ kinh phí duy trì dự án.",
        emailLabel: "📬 Gửi bộ hồ sơ / liên hệ:",
        btnCloseDonate: "Đóng",
        footerNoteBadge: "💡 LƯU Ý GIỌNG ĐỌC",
        footerNoteText: "Ứng dụng chạy trực tiếp bằng <b>Web Speech API</b> của thiết bị.",
        footerSummary: "❓ Làm sao để cài đặt hoặc thêm giọng Tiếng Việt đọc hay hơn?",
        guideEdgeTitle: "✨ Cách nhanh nhất (Khuyên dùng)",
        guideEdgeDesc: "Mở ứng dụng này bằng <b>Microsoft Edge</b>. Trình duyệt này có sẵn giọng đọc AI <i>Microsoft HoaiMy / An (Natural)</i> cực chuẩn mà <b>không cần cài thêm gì</b>.",
        guideWinTitle: "🪟 Trên Windows 10 / 11:",
        guideWinSteps: "<li>Vào <b>Cài đặt (Settings)</b> → <b>Thời gian & Ngôn ngữ</b>.</li><li>Mục <b>Giọng nói (Speech)</b> → Chọn <b>Thêm giọng nói</b>.</li><li>Tìm <b>\"Tiếng Việt\"</b> và bấm <b>Cài đặt</b>.</li><li>Tắt hoàn toàn Chrome/Edge rồi mở lại.</li>",
        guideAndroidTitle: "📱 Trên Android:",
        guideAndroidSteps: "<li>Vào <b>Cài đặt</b> → <b>Quản lý chung</b> → <b>Văn bản thành giọng nói</b>.</li><li>Chọn <b>Mục chuyển đổi preferred: Công cụ TTS của Google</b>.</li><li>Cài đặt dữ liệu giọng nói → Tải gói <b>Tiếng Việt</b>.</li>",
        guideIosTitle: "🍎 Trên iOS / macOS:",
        guideIosSteps: "<li>Vào <b>Cài đặt</b> → <b>Trợ năng</b> → <b>Nội dung được đọc</b>.</li><li>Mục <b>Giọng nói</b> → Chọn <b>Tiếng Việt</b>.</li><li>Tải bản giọng <i>\"Linh (Tự nhiên / Nâng cao)\"</i> để đọc chuẩn nhất.</li>",
		noVoiceFound: "⚠️ Không tìm thấy giọng {lang}",
        noVoiceFoundDetail: "Thiết bị chưa cài giọng {lang}. Hệ thống sẽ dùng giọng gần nhất có sẵn."
      },
      en: {
        title: "Thai Thong - Multilingual TTS",
        headerTitle: "Thai Thong · MULTILINGUAL TTS",
        btnDonate: "❤️ Donate",
        badge: "Web Edition",
        tabText: "Text",
        tabUrl: "Web Link",
        tabFile: "📁 Upload File (PDF/Word/Image/TXT)",
        textLabel: "Paste content to read",
        textPlaceholder: "Paste analysis text or any content here...",
        urlLabel: "Paste article / news link here",
        urlPlaceholder: "https://example.com/article... or blog link",
        sampleHint: "💡 Try sample: ",
        sampleBtn: "Sample News Link",
        urlTip: "✨ <b>Tip:</b> Best supports news sites, blogs, and guide articles.",
        advToggle: "⚙️ Wrong/extra text extracted? Click here to adjust",
        advTip: "If the app extracts menus or ads, choose the website type below:",
        preset1: "📰 News Site",
        preset2: "📝 Blog / WordPress",
        preset3: "🌐 General Web",
        selectorLabel: "Content area (CSS Selector):",
        selectorPlaceholder: "E.g.: article, .post-content (leave empty = auto)",
        excludeLabel: "Keywords to exclude (comma separated):",
        fileLabel: "Upload document file to read",
        dropzoneText1: "Drag & drop file here",
        dropzoneText2: "Click to select file",
        dropzoneFormats: "Supports: PDF (.pdf), Word (.docx), Image (.png, .jpg, .jpeg, .webp), Text (.txt, .md)",
        btnLoad: "Process & Prepare to Read",
        btnClear: "Clear",
        speedBtnTitle: "Change reading speed",
        jumpLabel: "Jump to:",
        playLabel: "PLAY SPEECH",
        pdfLabel: "📄 EXPORT PDF",
        voiceLabel: "Voice (auto-selected best by language)",
        contentHeaderTitle: "CONTENT (editable directly)",
        btnUpdateContent: "↻ Update",
        contentEditableTitle: "Click here to edit / delete unwanted text",
        donateTitle: "❤️ SUPPORT PROJECT",
        btnSaveQr: "⬇️ Save QR Image",
        qrFallback: "No QR image (bank.png)",
        donateHint: "Scan QR code to support project maintenance.",
        emailLabel: "📬 Send portfolio / contact:",
        btnCloseDonate: "Close",
        footerNoteBadge: "💡 VOICE NOTE",
        footerNoteText: "App runs directly using device's <b>Web Speech API</b>.",
        footerSummary: "❓ How to install or add better voice support?",
        guideEdgeTitle: "✨ Fastest Way (Recommended)",
        guideEdgeDesc: "Open this app in <b>Microsoft Edge</b>. It features built-in natural AI voices with <b>no installation required</b>.",
        guideWinTitle: "🪟 On Windows 10 / 11:",
        guideWinSteps: "<li>Go to <b>Settings</b> → <b>Time & Language</b>.</li><li>Under <b>Speech</b> → Select <b>Add voices</b>.</li><li>Search for your language and click <b>Install</b>.</li><li>Restart your browser completely.</li>",
        guideAndroidTitle: "📱 On Android:",
        guideAndroidSteps: "<li>Go to <b>Settings</b> → <b>General management</b> → <b>Text-to-speech output</b>.</li><li>Select preferred engine (e.g., Google TTS).</li><li>Install voice data for your language.</li>",
        guideIosTitle: "🍎 On iOS / macOS:",
        guideIosSteps: "<li>Go to <b>Settings</b> → <b>Accessibility</b> → <b>Spoken Content</b>.</li><li>Under <b>Voices</b> → Select your language.</li><li>Download enhanced/natural voices for best quality.</li>",
		noVoiceFound: "⚠️ No voice found for {lang}",
        noVoiceFoundDetail: "This device doesn't have a voice for {lang}. The system will use the closest available voice."
      }
    };

    function setLanguage(lang) {
      localStorage.setItem('app_lang', lang);
      const t = translations[lang] || translations.vi;

      document.title = t.title;
      document.getElementById('headerTitle').innerHTML = t.headerTitle;
      document.getElementById('btnDonate').innerHTML = t.btnDonate;
      document.querySelector('.badge').textContent = t.badge;

      // Tabs
      document.querySelector('[data-tab="text"]').textContent = t.tabText;
      document.querySelector('[data-tab="url"]').textContent = t.tabUrl;
      document.querySelector('[data-tab="file"]').textContent = t.tabFile;

      // Panel Text
      document.querySelector('#panel-text label').textContent = t.textLabel;
      document.getElementById('textInput').placeholder = t.textPlaceholder;

      // Panel URL
      document.querySelector('#panel-url label').textContent = t.urlLabel;
      document.getElementById('urlInput').placeholder = t.urlPlaceholder;
      document.querySelector('.sample-links span').innerHTML = t.sampleHint;
      document.querySelector('.sample-links .btn-chip').textContent = t.sampleBtn;
      document.querySelector('.hint').innerHTML = t.urlTip;
      document.getElementById('advToggle').textContent = t.advToggle;
      document.querySelector('.advanced .adv-tip').textContent = t.advTip;

      const presetBtns = document.querySelectorAll('.btn-preset');
      if (presetBtns.length >= 3) {
        presetBtns[0].textContent = t.preset1;
        presetBtns[1].textContent = t.preset2;
        presetBtns[2].textContent = t.preset3;
      }

      const advInputs = document.querySelectorAll('#advancedBox label');
      if (advInputs.length >= 2) {
        advInputs[0].textContent = t.selectorLabel;
        advInputs[1].textContent = t.excludeLabel;
      }
      document.getElementById('selectorInput').placeholder = t.selectorPlaceholder;

      // Panel File
      document.querySelector('#panel-file label').textContent = t.fileLabel;
      const dropContent = document.getElementById('dropZoneContent');
      if (dropContent) {
        dropContent.querySelector('p').innerHTML = `<b>${t.dropzoneText1}</b> hoặc <span style="color: #0284c7; text-decoration: underline;">${t.dropzoneText2}</span>`;
        dropContent.querySelector('span:last-child').textContent = t.dropzoneFormats;
      }

      // Buttons
      document.getElementById('btnLoad').textContent = t.btnLoad;
      document.getElementById('btnClear').textContent = t.btnClear;

      // Controls
      document.getElementById('btnSpeed').title = t.speedBtnTitle;
      document.querySelector('.jump-group span').textContent = t.jumpLabel;
      document.getElementById('playLabel').textContent = t.playLabel;
      document.getElementById('btnPdf').textContent = t.pdfLabel;
      document.querySelector('.controls label').textContent = t.voiceLabel;

      // Content card
      document.querySelector('.content-header span').textContent = t.contentHeaderTitle;
      document.getElementById('btnUpdateContent').textContent = t.btnUpdateContent;
      document.getElementById('contentDisplay').title = t.contentEditableTitle;

      // Modal donate
      document.querySelector('.modal-title').textContent = t.donateTitle;
      document.getElementById('btnSaveQr').textContent = t.btnSaveQr;
      document.querySelector('.qr-fallback span:last-child').textContent = t.qrFallback;
      document.querySelector('.donate-hint').textContent = t.donateHint;
      document.querySelector('.email-label').textContent = t.emailLabel;
      document.getElementById('btnCloseDonate').textContent = t.btnCloseDonate;

      // Footer
      document.querySelector('.info-badge').textContent = t.footerNoteBadge;
      document.querySelector('.speech-info-card .info-header span:last-child').innerHTML = t.footerNoteText;
      document.querySelector('.help-accordion summary').textContent = t.footerSummary;

      const guideItems = document.querySelectorAll('.guide-item');
      if (guideItems.length >= 4) {
        guideItems[0].querySelector('strong').innerHTML = t.guideEdgeTitle;
        guideItems[0].querySelector('p').innerHTML = t.guideEdgeDesc;

        guideItems[1].querySelector('strong').innerHTML = t.guideWinTitle;
        guideItems[1].querySelector('ol').innerHTML = t.guideWinSteps;

        guideItems[2].querySelector('strong').innerHTML = t.guideAndroidTitle;
        guideItems[2].querySelector('ol').innerHTML = t.guideAndroidSteps;

        guideItems[3].querySelector('strong').innerHTML = t.guideIosTitle;
        guideItems[3].querySelector('ol').innerHTML = t.guideIosSteps;
      }

      // Update switcher button label
      const langBtn = document.getElementById('langToggleBtn');
      if (langBtn) {
        langBtn.textContent = lang === 'vi' ? '🌐 English' : '🌐 Tiếng Việt';
      }
    }

    document.addEventListener('DOMContentLoaded', () => {
      const header = document.querySelector('header');
      if (header && !document.getElementById('langToggleBtn')) {
        const langBtn = document.createElement('button');
        langBtn.className = 'btn-donate';
        langBtn.id = 'langToggleBtn';
        langBtn.style.marginRight = '6px';
        langBtn.onclick = () => {
          const current = localStorage.getItem('app_lang') || 'vi';
          setLanguage(current === 'vi' ? 'en' : 'vi');
        };
        const btnDonate = document.getElementById('btnDonate');
        header.insertBefore(langBtn, btnDonate);
      }

      const savedLang = localStorage.getItem('app_lang') || 'vi';
      setLanguage(savedLang);
    });