// Configuration for donation handles
const DONATION_CONFIG = {
  upiId: 'abhinava6525@naviaxis',
  buyMeACoffeeUsername: 'abhinavsanthoshpp',
  kofiUsername: 'abhinav',
  githubUsername: 'abhinavsanthoshpp'
};

let selectedAmount = 5;

// Read amount from URL query param if available (e.g. donate.html?amount=10)
const urlParams = new URLSearchParams(window.location.search);
const paramAmount = parseInt(urlParams.get('amount'), 10);
if (paramAmount && !isNaN(paramAmount)) {
  selectedAmount = paramAmount;
}

const amountButtons = document.querySelectorAll('.amount-btn');
const customInput = document.getElementById('custom-amount');

function syncAmountUI() {
  amountButtons.forEach(btn => {
    const val = parseInt(btn.dataset.amount, 10);
    if (val === selectedAmount && !customInput.value) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  updatePaymentLinks();
}

amountButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedAmount = parseInt(btn.dataset.amount, 10);
    customInput.value = '';
    syncAmountUI();
  });
});

if (customInput) {
  customInput.addEventListener('input', () => {
    const val = parseInt(customInput.value, 10);
    if (val && val > 0) {
      selectedAmount = val;
      amountButtons.forEach(b => b.classList.remove('active'));
    } else {
      selectedAmount = 5;
    }
    updatePaymentLinks();
  });
}

function updatePaymentLinks() {
  const bmacLink = document.getElementById('link-bmac');
  const kofiLink = document.getElementById('link-kofi');
  const githubLink = document.getElementById('link-github');

  if (bmacLink) {
    bmacLink.href = `https://buymeacoffee.com/${DONATION_CONFIG.buyMeACoffeeUsername}`;
  }
  if (kofiLink) {
    kofiLink.href = `https://ko-fi.com/${DONATION_CONFIG.kofiUsername}`;
  }
  if (githubLink) {
    githubLink.href = `https://github.com/sponsors/${DONATION_CONFIG.githubUsername}`;
  }
}

// Toggle UPI QR Code
const qrToggleBtn = document.getElementById('btn-toggle-qr');
const qrWrapper = document.getElementById('upi-qr-wrapper');
if (qrToggleBtn && qrWrapper) {
  qrToggleBtn.addEventListener('click', () => {
    const isShown = qrWrapper.classList.toggle('show');
    qrToggleBtn.textContent = isShown ? 'Hide QR' : 'Scan QR';
  });
}

// Copy to clipboard helper
function copyText(id, btn) {
  const textEl = document.getElementById(id);
  if (!textEl) return;
  const text = textEl.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    btn.style.background = '#46D369';
    setTimeout(() => {
      btn.textContent = original;
      btn.style.background = '';
    }, 1800);
  }).catch(() => {});
}

// UPI copy button listener
const copyUpiBtn = document.getElementById('btn-copy-upi');
if (copyUpiBtn) {
  copyUpiBtn.addEventListener('click', () => {
    copyText('upi-id-val', copyUpiBtn);
  });
}

// Set addresses from config
const upiEl = document.getElementById('upi-id-val');
if (upiEl) upiEl.textContent = DONATION_CONFIG.upiId;

const upiQrImg = document.getElementById('upi-qr-image');
if (upiQrImg) {
  const upiUri = `upi://pay?pa=${encodeURIComponent(DONATION_CONFIG.upiId)}&pn=Abhinav&cu=INR`;
  upiQrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;
}

// Initialize
syncAmountUI();
