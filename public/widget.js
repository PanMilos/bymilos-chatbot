(function () {
  'use strict';

  var cfg = Object.assign({
    botName: 'Asistent Miloše',
    greeting: 'Ahoj! 👋 Jsem digitální asistent Miloše. Ptejte se na weby, správu nebo ceny – rád pomůžu.',
    primaryColor: '#1a2e4a',
    accentColor: '#2d6cdf',
    apiUrl: '/api/chat',
    systemPrompt: null,
    position: 'right'
  }, window.chatbotConfig || {});

  var messages = [];
  var isOpen = false;
  var isTyping = false;

  /* ─── Styles ─── */
  var style = document.createElement('style');
  style.textContent = [
    '#bm-chat-wrap *{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;margin:0;padding:0}',
    '#bm-chat-btn{position:fixed;bottom:24px;' + cfg.position + ':24px;width:56px;height:56px;border-radius:50%;background:' + cfg.accentColor + ';border:none;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;z-index:9999;transition:transform .2s,box-shadow .2s}',
    '#bm-chat-btn:hover{transform:scale(1.08);box-shadow:0 6px 28px rgba(0,0,0,.32)}',
    '#bm-chat-btn svg{transition:transform .25s}',
    '#bm-chat-box{position:fixed;bottom:92px;' + cfg.position + ':24px;width:360px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 120px);border-radius:16px;background:#fff;box-shadow:0 8px 40px rgba(0,0,0,.18);display:flex;flex-direction:column;z-index:9998;transform:scale(.92) translateY(16px);opacity:0;pointer-events:none;transition:transform .22s cubic-bezier(.34,1.56,.64,1),opacity .18s}',
    '#bm-chat-box.bm-open{transform:scale(1) translateY(0);opacity:1;pointer-events:all}',
    '#bm-chat-head{background:' + cfg.primaryColor + ';border-radius:16px 16px 0 0;padding:14px 18px;display:flex;align-items:center;gap:10px}',
    '#bm-chat-head .bm-avatar{width:36px;height:36px;border-radius:50%;background:' + cfg.accentColor + ';display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0}',
    '#bm-chat-head .bm-info{flex:1}',
    '#bm-chat-head .bm-name{color:#fff;font-weight:600;font-size:14px}',
    '#bm-chat-head .bm-status{color:rgba(255,255,255,.65);font-size:12px;margin-top:1px}',
    '#bm-chat-head .bm-close{background:none;border:none;cursor:pointer;color:rgba(255,255,255,.7);padding:4px;border-radius:6px;display:flex;align-items:center;justify-content:center;transition:color .15s}',
    '#bm-chat-head .bm-close:hover{color:#fff}',
    '#bm-chat-msgs{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}',
    '#bm-chat-msgs::-webkit-scrollbar{width:4px}',
    '#bm-chat-msgs::-webkit-scrollbar-track{background:transparent}',
    '#bm-chat-msgs::-webkit-scrollbar-thumb{background:#ddd;border-radius:2px}',
    '.bm-msg{max-width:82%;padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.5;word-break:break-word}',
    '.bm-msg.bm-bot{background:#f0f4f8;color:#1a2e4a;border-bottom-left-radius:4px;align-self:flex-start}',
    '.bm-msg.bm-user{background:' + cfg.accentColor + ';color:#fff;border-bottom-right-radius:4px;align-self:flex-end}',
    '.bm-typing{display:flex;align-items:center;gap:5px;padding:12px 14px;background:#f0f4f8;border-radius:14px;border-bottom-left-radius:4px;align-self:flex-start;width:fit-content}',
    '.bm-dot{width:7px;height:7px;border-radius:50%;background:#93a3b8;animation:bm-bounce .9s ease-in-out infinite}',
    '.bm-dot:nth-child(2){animation-delay:.15s}',
    '.bm-dot:nth-child(3){animation-delay:.3s}',
    '@keyframes bm-bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}',
    '#bm-chat-form{padding:12px;border-top:1px solid #e8edf2;display:flex;gap:8px;align-items:flex-end}',
    '#bm-chat-input{flex:1;border:1.5px solid #dde3ea;border-radius:10px;padding:9px 12px;font-size:14px;line-height:1.4;resize:none;outline:none;max-height:100px;color:#1a2e4a;transition:border-color .15s}',
    '#bm-chat-input:focus{border-color:' + cfg.accentColor + '}',
    '#bm-chat-input::placeholder{color:#aab4be}',
    '#bm-chat-send{width:38px;height:38px;border-radius:10px;background:' + cfg.accentColor + ';border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .15s,transform .1s}',
    '#bm-chat-send:hover{background:' + cfg.primaryColor + '}',
    '#bm-chat-send:active{transform:scale(.93)}',
    '#bm-chat-send:disabled{opacity:.45;cursor:not-allowed;transform:none}',
    '#bm-chat-footer{text-align:center;padding:6px 0 10px;font-size:11px;color:#aab4be}'
  ].join('');
  document.head.appendChild(style);

  /* ─── HTML ─── */
  var wrap = document.createElement('div');
  wrap.id = 'bm-chat-wrap';
  wrap.innerHTML = [
    '<button id="bm-chat-btn" aria-label="Otevřít chat">',
      '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    '</button>',
    '<div id="bm-chat-box" role="dialog" aria-label="Chat">',
      '<div id="bm-chat-head">',
        '<div class="bm-avatar">💬</div>',
        '<div class="bm-info">',
          '<div class="bm-name">' + escHtml(cfg.botName) + '</div>',
          '<div class="bm-status">Online</div>',
        '</div>',
        '<button class="bm-close" aria-label="Zavřít">',
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        '</button>',
      '</div>',
      '<div id="bm-chat-msgs"></div>',
      '<form id="bm-chat-form">',
        '<textarea id="bm-chat-input" placeholder="Napište zprávu…" rows="1" maxlength="800" aria-label="Vaše zpráva"></textarea>',
        '<button id="bm-chat-send" type="submit" aria-label="Odeslat" disabled>',
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
        '</button>',
      '</form>',
      '<div id="bm-chat-footer">Powered by <strong>bymilos.cz</strong></div>',
    '</div>'
  ].join('');
  document.body.appendChild(wrap);

  var btn = document.getElementById('bm-chat-btn');
  var box = document.getElementById('bm-chat-box');
  var msgsEl = document.getElementById('bm-chat-msgs');
  var form = document.getElementById('bm-chat-form');
  var input = document.getElementById('bm-chat-input');
  var sendBtn = document.getElementById('bm-chat-send');
  var closeBtn = box.querySelector('.bm-close');

  /* ─── Helpers ─── */
  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function formatText(text) {
    return escHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  function scrollBottom() {
    msgsEl.scrollTop = msgsEl.scrollHeight;
  }

  function addMessage(role, text) {
    var el = document.createElement('div');
    el.className = 'bm-msg ' + (role === 'user' ? 'bm-user' : 'bm-bot');
    el.innerHTML = role === 'user' ? escHtml(text) : formatText(text);
    msgsEl.appendChild(el);
    scrollBottom();
    return el;
  }

  function showTyping() {
    var el = document.createElement('div');
    el.className = 'bm-typing';
    el.id = 'bm-typing';
    el.innerHTML = '<div class="bm-dot"></div><div class="bm-dot"></div><div class="bm-dot"></div>';
    msgsEl.appendChild(el);
    scrollBottom();
  }

  function hideTyping() {
    var el = document.getElementById('bm-typing');
    if (el) el.remove();
  }

  function setDisabled(val) {
    isTyping = val;
    sendBtn.disabled = val || input.value.trim() === '';
    input.disabled = val;
  }

  /* ─── Open / Close ─── */
  function openChat() {
    isOpen = true;
    box.classList.add('bm-open');
    btn.setAttribute('aria-expanded', 'true');
    setTimeout(function () { input.focus(); }, 250);
  }

  function closeChat() {
    isOpen = false;
    box.classList.remove('bm-open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', function () {
    isOpen ? closeChat() : openChat();
  });
  closeBtn.addEventListener('click', closeChat);

  /* ─── Auto-resize textarea ─── */
  input.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    sendBtn.disabled = isTyping || this.value.trim() === '';
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) form.dispatchEvent(new Event('submit'));
    }
  });

  /* ─── Send message ─── */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text || isTyping) return;

    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;

    messages.push({ role: 'user', content: text });
    addMessage('user', text);
    setDisabled(true);
    showTyping();

    var body = { messages: messages };
    if (cfg.systemPrompt) body.systemPrompt = cfg.systemPrompt;

    fetch(cfg.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        hideTyping();
        var reply = data.message || data.error || 'Ups, něco se pokazilo. Zkuste to znovu.';
        messages.push({ role: 'assistant', content: reply });
        addMessage('assistant', reply);
      })
      .catch(function () {
        hideTyping();
        addMessage('assistant', 'Nepodařilo se spojit se serverem. Zkuste to za chvíli.');
      })
      .finally(function () {
        setDisabled(false);
        input.focus();
      });
  });

  /* ─── Init greeting ─── */
  addMessage('assistant', cfg.greeting);

})();
