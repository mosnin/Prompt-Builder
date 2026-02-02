/* ===================================================
   AI Prompt Generator - Shared JavaScript
   =================================================== */

// === Sidebar Toggle (mobile) ===
(function() {
  var toggle = document.getElementById('sidebarToggle');
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', function() {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open');
  });
  if (overlay) {
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }
})();

// === FAQ Toggle ===
document.querySelectorAll('.faq-question').forEach(function(q) {
  q.addEventListener('click', function() {
    var item = this.parentElement;
    var isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(function(i) {
      i.classList.remove('open');
      i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      this.setAttribute('aria-expanded', 'true');
    }
  });
  q.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.click(); }
  });
});

// === Copy to Clipboard ===
function initCopyButton(btnId, sourceId) {
  var btn = document.getElementById(btnId);
  var source = document.getElementById(sourceId);
  if (!btn || !source) return;

  btn.addEventListener('click', function() {
    var text = source.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(function() {
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(function() {
        btn.textContent = 'Copy to Clipboard';
        btn.classList.remove('copied');
      }, 2000);
    }).catch(function() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      btn.textContent = 'Copied!';
      btn.classList.add('copied');
      setTimeout(function() {
        btn.textContent = 'Copy to Clipboard';
        btn.classList.remove('copied');
      }, 2000);
    });
  });
}

// === Generic Prompt Form Initializer ===
function initPromptForm(formId, buildFn, outputAreaId, outputBoxId, copyBtnId) {
  var form = document.getElementById(formId || 'promptForm');
  var outputArea = document.getElementById(outputAreaId || 'outputArea');
  var outputBox = document.getElementById(outputBoxId || 'outputBox');
  if (!form || !outputArea || !outputBox) return;

  initCopyButton(copyBtnId || 'copyBtn', outputBoxId || 'outputBox');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var prompt = buildFn();
    if (!prompt) return;
    outputBox.textContent = prompt;
    outputArea.classList.add('visible');
    outputArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}
