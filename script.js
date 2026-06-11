/* ============================================================
   Wedding Website — Optimised Script
   Performance notes:
   - Countdown uses requestAnimationFrame for silky 60fps
   - Passive event listeners throughout
   - IntersectionObserver triggers animations only when visible
   - Background image loaded via a <link rel=preload>-friendly
     CSS class swap instead of a blocking JS Image object
   ============================================================ */

'use strict';

// ── Helpers ──────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);

// ── i18n ─────────────────────────────────────────────────
const TRANSLATIONS = {
    en: {
        'subtitle':    'A love letter from',
        'open-btn':    'Open the invitation',
        'copy-label':  'Meet us in',
        'copy-title':  'Club House, Obour',
        'detail-1':    'On Saturday, 27 June 2026',
        'detail-2':    'Seven in the afternoon.',
        'detail-3':    'Formal invitation to follow.',
        'cd-days':     'Days',
        'cd-hours':    'Hours',
        'cd-minutes':  'Minutes',
        'cd-seconds':  'Seconds',
        'footer-btn':  'Your Reply Requested',
        'modal-title': 'Reply Requested',
        'modal-desc':  'Please let us know if you will be able to join the celebration. Your response is appreciated.',
        'success-msg': 'Thank you! We got your response.',
        'field-name':  'Name',
        'name-ph':     'Your name',
        'side-label':  'You are joining from',
        'side-groom':  '🤵 Groom\'s Side',
        'side-bride':  '👰 Bride\'s Side',
        'attend-q':    'Will you attend?',
        'attend-yes':  "Yes, I'll be there!",
        'attend-no':   "Sorry, I can't make it",
        'submit-btn':  'Send Reply',
        'sending':     'Sending…',
        'lang-switch': 'عربي',
    },
    ar: {
        'subtitle':    'رسالة حب من',
        'open-btn':    'افتح الدعوة',
        'copy-label':  'موعدنا',
        'copy-title':  'كلوب هاوس، العبور',
        'detail-1':    'السبت، 27 يونيو 2026',
        'detail-2':    'السابعة مساءً.',
        'detail-3':    'دعوة رسمية ستصلكم قريباً.',
        'cd-days':     'أيام',
        'cd-hours':    'ساعات',
        'cd-minutes':  'دقائق',
        'cd-seconds':  'ثواني',
        'footer-btn':  'نودّ معرفة ردّكم',
        'modal-title': 'ردّ مطلوب',
        'modal-desc':  'يُرجى إعلامنا إذا كنتم قادرين على حضور الاحتفال. نقدر ردّكم.',
        'success-msg': 'شكراً! تلقينا ردّكم.',
        'field-name':  'الاسم',
        'name-ph':     'اسمك',
        'side-label':  'أنت من جانب',
        'side-groom':  '🤵 جانب العريس',
        'side-bride':  '👰 جانب العروسة',
        'attend-q':    'هل ستحضر؟',
        'attend-yes':  'نعم، سأكون هناك!',
        'attend-no':   'آسف، لن أستطيع الحضور',
        'submit-btn':  'إرسال الرد',
        'sending':     'جارٍ الإرسال…',
        'lang-switch': 'English',
    }
};

let currentLang = localStorage.getItem('wedding_lang') || 'en';

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('wedding_lang', lang);
    const t = TRANSLATIONS[lang];
    const isAr = lang === 'ar';

    // Direction + lang attribute
    document.documentElement.setAttribute('dir',  isAr ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.classList.toggle('lang-ar', isAr);

    // Swap textContent for all tagged elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key] !== undefined) el.textContent = t[key];
    });

    // Swap placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
        const key = el.dataset.i18nPh;
        if (t[key] !== undefined) el.placeholder = t[key];
    });
}

function setupLanguage() {
    const btn = $('lang-btn');
    if (btn) {
        btn.addEventListener('click', () => {
            applyLanguage(currentLang === 'en' ? 'ar' : 'en');
        }, { passive: true });
    }
    applyLanguage(currentLang);
}

// ── Page: index.html — open envelope ─────────────────────────
const openInvitation = $('open-invitation');
if (openInvitation) {
    openInvitation.addEventListener('click', () => {
        // User gesture here — start music before navigating
        const audio = document.getElementById('bg-music');
        if (audio) audio.play().catch(() => {});
        window.location.href = 'invitation.html';
    }, { passive: true });
}

// ── Device detection (mobile-only guard) ─────────────────────
function isMobileDevice() {
    const ua = navigator.userAgent || '';
    const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB10|IEMobile|Opera Mini/i.test(ua);
    const hint = navigator.userAgentData?.mobile;
    return hint !== undefined ? hint : mobileUA;
}

function enforceMobileOnly() {
    if (window.location.pathname.includes('admin.html')) return;
    const overlay = qs('.desktop-overlay');
    if (!isMobileDevice()) {
        document.body.classList.add('desktop-locked');
        if (overlay) overlay.style.display = 'flex';
    }
}

// ── Countdown (rAF-driven, no setInterval jank) ───────────────
function startCountdown() {
    const target  = new Date('2026-06-27T19:00:00').getTime();
    const daysEl  = $('days');
    const hoursEl = $('hours');
    const minsEl  = $('minutes');
    const secsEl  = $('seconds');

    if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

    let lastSec = -1; // only update DOM when the second changes

    function tick() {
        const diff = target - Date.now();

        if (diff <= 0) {
            daysEl.textContent = hoursEl.textContent =
            minsEl.textContent = secsEl.textContent = '00';
            return;
        }

        const totalSecs = Math.floor(diff / 1000);
        if (totalSecs === lastSec) {
            requestAnimationFrame(tick);
            return;
        }
        lastSec = totalSecs;

        const s = totalSecs % 60;
        const m = Math.floor(totalSecs / 60) % 60;
        const h = Math.floor(totalSecs / 3600) % 24;
        const d = Math.floor(totalSecs / 86400);

        const pad = n => String(n).padStart(2, '0');
        daysEl.textContent  = pad(d);
        hoursEl.textContent = pad(h);
        minsEl.textContent  = pad(m);
        secsEl.textContent  = pad(s);

        requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

// ── RSVP modal ────────────────────────────────────────────────
function setupReplyModal() {
    const openBtn       = $('reply-requested-button');
    const modalOverlay  = $('reply-modal-overlay');
    const closeBtn      = $('reply-modal-close');
    const replyForm     = $('reply-form');

    if (!openBtn || !modalOverlay || !closeBtn || !replyForm) return;

    const successMsg     = $('reply-success-message');
    const attendCB       = $('reply-attendance');
    const attendLabel    = $('attendance-label');
    const sideGroomBtn   = $('side-groom');
    const sideBrideBtn   = $('side-bride');

    // Track selected side (default: groom)
    let selectedSide = 'groom';

    if (sideGroomBtn && sideBrideBtn) {
        [sideGroomBtn, sideBrideBtn].forEach(btn => {
            btn.addEventListener('click', () => {
                selectedSide = btn.dataset.side;
                sideGroomBtn.classList.toggle('active', selectedSide === 'groom');
                sideBrideBtn.classList.toggle('active', selectedSide === 'bride');
            }, { passive: true });
        });
    }

    // Toggle label text
    if (attendCB && attendLabel) {
        attendCB.addEventListener('change', () => {
            const t = TRANSLATIONS[currentLang];
            if (attendCB.checked) {
                attendLabel.textContent = t['attend-yes'];
                attendLabel.classList.remove('not-attending');
            } else {
                attendLabel.textContent = t['attend-no'];
                attendLabel.classList.add('not-attending');
            }
        }, { passive: true });
    }

    function openModal() {
        modalOverlay.classList.add('active');
        document.body.classList.add('modal-open');
        // Reset side to groom
        selectedSide = 'groom';
        if (sideGroomBtn) sideGroomBtn.classList.add('active');
        if (sideBrideBtn) sideBrideBtn.classList.remove('active');
        if (attendCB) {
            attendCB.checked = true;
            if (attendLabel) {
                attendLabel.textContent = TRANSLATIONS[currentLang]['attend-yes'];
                attendLabel.classList.remove('not-attending');
            }
        }
        if (successMsg) successMsg.hidden = true;
        replyForm.hidden = false;
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open');
        if (successMsg) successMsg.hidden = true;
        replyForm.hidden = false;
    }

    openBtn.addEventListener('click', openModal, { passive: true });
    closeBtn.addEventListener('click', closeModal, { passive: true });

    // Close on backdrop tap
    modalOverlay.addEventListener('click', e => {
        if (e.target === modalOverlay) closeModal();
    }, { passive: true });

    // Form submit → Google Sheets
    replyForm.addEventListener('submit', async e => {
        e.preventDefault();
        const name = $('reply-name').value.trim();
        const isAttending = attendCB ? attendCB.checked : true;
        if (!name) return;

        // Find the submit button and disable it to prevent double-submits
        const submitBtn = replyForm.querySelector('[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = TRANSLATIONS[currentLang]['sending'];
        }

        const replyData = {
            name,
            side: selectedSide === 'groom' ? "Groom's Side" : "Bride's Side",
            response: isAttending ? 'Yes, attending' : 'No, not attending',
            submittedAt: new Date().toISOString()
        };

        const hasUrl =
            typeof GOOGLE_SCRIPT_URL !== 'undefined' &&
            GOOGLE_SCRIPT_URL &&
            GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL';

        try {
            if (!hasUrl) {
                // Fallback: local storage (for testing without a deployed script)
                const stored = JSON.parse(localStorage.getItem('wedding_replies') || '[]');
                stored.push(replyData);
                localStorage.setItem('wedding_replies', JSON.stringify(stored));
                await new Promise(r => setTimeout(r, 600));
            } else {
                const res = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(replyData)
                });
                if (!res.ok) throw new Error('Network response was not ok');
            }

            replyForm.reset();
            replyForm.hidden = true;
            if (successMsg) successMsg.hidden = false;
        } catch (err) {
            // Re-enable button so the user can try again
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = TRANSLATIONS[currentLang]['submit-btn'];
            }
            alert('Unable to save your response right now. Please try again later.');
            console.error(err);
        }
    });
}

// ── Background image loader (index.html) ──────────────────────
// Loads the large background off the main thread and reveals
// the page only when ready, with a hard 4-second safety cap.
function initBackgroundLoad() {
    const wrapper = qs('.envelope-wrapper');
    if (!wrapper) return;

    document.body.classList.add('bg-loading');

    let done = false;
    function reveal() {
        if (done) return;
        done = true;
        document.body.classList.remove('bg-loading');
        document.body.classList.add('bg-loaded');
    }

    // Use a hidden <img> tag — browser can prioritise & cache it properly
    const img = new Image();
    img.onload  = reveal;
    img.onerror = reveal; // show page even if image fails

    // Small delay so the splash animation starts playing first (better UX)
    setTimeout(() => {
        img.src = 'images/2bmapex8m9rmw0cyp3pt8yf3sr_result_0.png';
    }, 100);

    // Hard cap — never stay stuck longer than 4 s
    setTimeout(reveal, 4000);
}

// ── IntersectionObserver: trigger CSS animations on scroll ────
function observeAnimations() {
    const targets = document.querySelectorAll(
        '.countdown-item, .invite-copy-details p, .invite-map-card'
    );
    if (!targets.length) return;

    const io = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    targets.forEach(el => io.observe(el));
}

// ── Background Music ─────────────────────────────────────────
// Browsers require a real user gesture before playing audio.
// On index.html the envelope tap is the gesture.
// On invitation.html we wait for the first tap anywhere.
function initBackgroundMusic() {
    const audio = document.getElementById('bg-music');
    if (!audio) return;

    audio.volume = 0.5;

    // Try immediately (works if a gesture already happened on this page)
    audio.play().catch(() => {
        // Not yet — wait silently for the first interaction
        const start = () => audio.play().catch(() => {});
        document.addEventListener('touchstart', start, { once: true, passive: true });
        document.addEventListener('click',      start, { once: true, passive: true });
    });
}

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    enforceMobileOnly();
    setupLanguage();        // must run before other setup so text is correct
    initBackgroundLoad();
    startCountdown();
    setupReplyModal();
    observeAnimations();
    initBackgroundMusic();
}, { once: true });
