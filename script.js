const openInvitation = document.getElementById('open-invitation');
if (openInvitation) {
    openInvitation.addEventListener('click', () => {
        window.location.href = 'invitation.html';
    });
}

function isMobileDevice() {
    if (typeof navigator === 'undefined') return false;
    const userAgent = navigator.userAgent || '';
    const mobileMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|BB10|IEMobile|Opera Mini/i.test(userAgent);
    const mobileHint = navigator.userAgentData?.mobile;
    return mobileHint !== undefined ? mobileHint : mobileMatch;
}

function enforceMobileOnly() {
    const isAdminPage = window.location.pathname.includes('admin.html');
    if (isAdminPage) return;

    const overlay = document.querySelector('.desktop-overlay');
    const isMobile = isMobileDevice();
    if (!isMobile) {
        document.body.classList.add('desktop-locked');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }
}

function startCountdown() {
    const target = new Date('2026-06-27T19:00:00');
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

    function updateTimer() {
        const now = new Date();
        const diff = target - now;
        if (diff <= 0) {
            daysEl.textContent = '00';
            hoursEl.textContent = '00';
            minutesEl.textContent = '00';
            secondsEl.textContent = '00';
            clearInterval(timerInterval);
            return;
        }

        const seconds = Math.floor((diff / 1000) % 60);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    }

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
}

function setupReplyModal() {
    const openButton = document.getElementById('reply-requested-button');
    const modalOverlay = document.getElementById('reply-modal-overlay');
    const closeButton = document.getElementById('reply-modal-close');
    const replyForm = document.getElementById('reply-form');

    if (!openButton || !modalOverlay || !closeButton || !replyForm) return;

    const successMessage = document.getElementById('reply-success-message');
    const attendanceCheckbox = document.getElementById('reply-attendance');
    const attendanceLabel = document.getElementById('attendance-label');

    if (attendanceCheckbox && attendanceLabel) {
        attendanceCheckbox.addEventListener('change', () => {
            if (attendanceCheckbox.checked) {
                attendanceLabel.textContent = "Yes, I'll be there!";
                attendanceLabel.classList.remove('not-attending');
            } else {
                attendanceLabel.textContent = "Sorry, I can't make it";
                attendanceLabel.classList.add('not-attending');
            }
        });
    }

    function openModal() {
        modalOverlay.classList.add('active');
        document.body.classList.add('modal-open');
        if (attendanceCheckbox) {
            attendanceCheckbox.checked = true;
            if (attendanceLabel) {
                attendanceLabel.textContent = "Yes, I'll be there!";
                attendanceLabel.classList.remove('not-attending');
            }
        }
        if (successMessage) {
            successMessage.hidden = true;
        }
        if (replyForm) {
            replyForm.hidden = false;
        }
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open');
        if (successMessage) {
            successMessage.hidden = true;
        }
        if (replyForm) {
            replyForm.hidden = false;
        }
    }

    openButton.addEventListener('click', openModal);
    closeButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (event) => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    replyForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const name = document.getElementById('reply-name').value.trim();
        const isAttending = attendanceCheckbox ? attendanceCheckbox.checked : true;
        const response = isAttending ? "Yes, attending" : "No, not attending";
        if (!name) return;

        const replyData = {
            name,
            response,
            submittedAt: new Date().toISOString()
        };

        try {
            const hasUrl = typeof GOOGLE_SCRIPT_URL !== 'undefined' && 
                            GOOGLE_SCRIPT_URL && 
                            GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL';

            if (!hasUrl) {
                // FALLBACK TO LOCAL STORAGE FOR TESTING (if not yet configured)
                console.warn('Google Sheets URL not configured. Saving reply to local storage.');
                const localReplies = JSON.parse(localStorage.getItem('wedding_replies') || '[]');
                localReplies.push(replyData);
                localStorage.setItem('wedding_replies', JSON.stringify(localReplies));
                
                // Simulate network latency
                await new Promise(resolve => setTimeout(resolve, 800));
            } else {
                // Send to Google Sheets (using text/plain / simple request to avoid preflight options check)
                const res = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    mode: 'cors',
                    body: JSON.stringify(replyData)
                });

                if (!res.ok) {
                    throw new Error('Failed to save reply');
                }
            }

            replyForm.reset();
            replyForm.hidden = true;
            if (successMessage) {
                successMessage.hidden = false;
            }
        } catch (error) {
            alert('Unable to save your response right now. Please try again later.');
            console.error(error);
        }
    });
}

function handleEnvelopeBackgroundLoad() {
    const wrapper = document.querySelector('.envelope-wrapper');
    if (!wrapper) return;

    const bgUrl = 'images/2bmapex8m9rmw0cyp3pt8yf3sr_result_0.png';
    const img = new Image();
    
    // Add loading class to body
    document.body.classList.add('bg-loading');

    let imageLoaded = false;
    let minTimeElapsed = false;

    function checkLoadedState() {
        if (imageLoaded && minTimeElapsed) {
            document.body.classList.remove('bg-loading');
            document.body.classList.add('bg-loaded');
        }
    }

    img.onload = () => {
        imageLoaded = true;
        checkLoadedState();
    };
    img.onerror = () => {
        imageLoaded = true; // Proceed anyway in case of error
        checkLoadedState();
    };
    img.src = bgUrl;

    // Enforce 1.8 seconds minimum display time for the splash screen
    setTimeout(() => {
        minTimeElapsed = true;
        checkLoadedState();
    }, 1800);
}

document.addEventListener('DOMContentLoaded', () => {
    enforceMobileOnly();
    handleEnvelopeBackgroundLoad();
    startCountdown();
    setupReplyModal();
});
