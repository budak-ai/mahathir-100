/* === Age Calculator === */
function calculateAge() {
    const birthDate = new Date(1925, 6, 10); // July 10, 1925
    const now = new Date();

    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();

    if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    document.getElementById('years').textContent = years.toString().padStart(2, '0');
    document.getElementById('months').textContent = months.toString().padStart(2, '0');
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
}

calculateAge();
setInterval(calculateAge, 60000); // Update every minute

/* === Time Token (anti-spam) === */
const PAGE_LOAD_TIME = Date.now();
const timeTokenEl = document.getElementById('time-token');
if (timeTokenEl) {
    timeTokenEl.value = PAGE_LOAD_TIME.toString();
}

/* === Character Counter === */
const msgText = document.getElementById('msg-text');
const charCurrent = document.getElementById('char-current');

if (msgText && charCurrent) {
    msgText.addEventListener('input', () => {
        charCurrent.textContent = msgText.value.length;
    });
}

/* === Load News === */
async function loadNews() {
    const grid = document.getElementById('news-grid');
    const fallback = document.getElementById('news-fallback');

    try {
        const res = await fetch('/api/news');
        if (!res.ok) throw new Error('News fetch failed');
        const data = await res.json();

        if (!data.articles || data.articles.length === 0) {
            grid.innerHTML = '';
            fallback.style.display = 'block';
            return;
        }

        grid.innerHTML = data.articles.slice(0, 5).map((article, i) => `
            <a href="${escapeHtml(article.link)}" target="_blank" rel="noopener" class="news-item">
                <span class="news-item-number">${i + 1}</span>
                <div class="news-item-content">
                    <h3>${escapeHtml(article.title)}</h3>
                    <span class="news-item-meta">${escapeHtml(article.source || '')}${article.pubDate ? ' · ' + formatDate(article.pubDate) : ''}</span>
                </div>
            </a>
        `).join('');

        fallback.style.display = 'block'; // Always show Google News link
    } catch (e) {
        console.error('Failed to load news:', e);
        grid.innerHTML = '';
        fallback.style.display = 'block';
    }
}

/* === Load Messages === */
async function loadMessages() {
    const wall = document.getElementById('message-wall');

    try {
        const res = await fetch('/api/messages');
        if (!res.ok) throw new Error('Messages fetch failed');
        const data = await res.json();

        if (!data.messages || data.messages.length === 0) {
            wall.innerHTML = '<div class="no-messages">Belum ada pesanan. Jadilah yang pertama! / No messages yet. Be the first!</div>';
            return;
        }

        wall.innerHTML = data.messages.map(msg => `
            <div class="message-card">
                <div class="message-card-name">${escapeHtml(msg.name)}</div>
                <div class="message-card-text">${escapeHtml(msg.message)}</div>
                <div class="message-card-time">${formatDate(msg.timestamp)}</div>
            </div>
        `).join('');
    } catch (e) {
        console.error('Failed to load messages:', e);
        wall.innerHTML = '<div class="no-messages">Tidak dapat memuatkan pesanan. / Could not load messages.</div>';
    }
}

/* === Submit Message === */
const form = document.getElementById('message-form');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = document.getElementById('btn-submit');
        const status = document.getElementById('form-status');
        const btnText = btn.querySelector('.btn-text');
        const btnLoading = btn.querySelector('.btn-loading');

        const name = document.getElementById('msg-name').value.trim();
        const message = document.getElementById('msg-text').value.trim();
        const website = document.getElementById('website').value;
        const timeToken = document.getElementById('time-token').value;

        if (!name || !message) return;

        btn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        status.textContent = '';
        status.className = 'form-status';

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, message, website, time_token: timeToken })
            });

            const data = await res.json();

            if (res.ok) {
                status.textContent = 'Terima kasih! Pesanan anda telah dihantar. / Thank you!';
                status.className = 'form-status success';
                form.reset();
                charCurrent.textContent = '0';
                // Reset time token
                document.getElementById('time-token').value = Date.now().toString();
                loadMessages();
            } else {
                status.textContent = data.error || 'Gagal menghantar. Sila cuba lagi. / Failed to submit.';
                status.className = 'form-status error';
            }
        } catch (e) {
            status.textContent = 'Ralat rangkaian. Sila cuba lagi. / Network error.';
            status.className = 'form-status error';
        } finally {
            btn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    });
}

/* === Helpers === */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('ms-MY', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return '';
    }
}

/* === Init === */
document.addEventListener('DOMContentLoaded', () => {
    loadNews();
    loadMessages();
});
