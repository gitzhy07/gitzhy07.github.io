(function(){
"use strict";
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* ---------- 时钟 ---------- */
const clock = $('#clock');
const tickClock = () => { clock.textContent = new Date().toTimeString().slice(0,8); };
tickClock(); setInterval(tickClock, 1000);

/* ---------- 阅读进度 & 回顶 ---------- */
const bar = $('#progress'), topBtn = $('#top-btn');
addEventListener('scroll', () => {
  const h = document.documentElement;
  bar.style.transform = 'scaleX(' + (h.scrollTop / (h.scrollHeight - h.clientHeight) || 0) + ')';
  topBtn.classList.toggle('show', h.scrollTop > 600);
}, {passive:true});
topBtn.addEventListener('click', () => scrollTo({top:0, behavior: RM ? 'auto' : 'smooth'}));

/* ---------- 标题乱码解码 ---------- */
const POOL = '!<>-_/[]{}=+*^?#01码流构序源核阵链';
function scramble(el){
  const text = el.dataset.text;
  if (RM) { el.textContent = text; return; }
  const dur = 720, start = performance.now();
  (function frame(now){
    const p = Math.min(1, (now - start) / dur);
    const n = Math.floor(p * text.length);
    let out = text.slice(0, n);
    for (let i = n; i < text.length; i++) out += POOL[Math.random() * POOL.length | 0];
    el.textContent = out;
    if (p < 1) requestAnimationFrame(frame); else el.textContent = text;
  })(start);
}
$$('[data-scramble]').forEach(el => el.dataset.text = el.textContent);

/* ---------- 滚动入场 ---------- */
$$('[data-stagger]').forEach(g =>
  Array.from(g.children).forEach((c, i) => { c.classList.add('rv'); c.style.transitionDelay = (i * 70) + 'ms'; })
);
const io = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add('in');
  if (e.target.hasAttribute('data-scramble')) scramble(e.target);
  io.unobserve(e.target);
}), {threshold:.12});
$$('.rv, [data-scramble]').forEach(el => io.observe(el));

/* ---------- 终端：打字引导 ---------- */
const out  = $('#term-out'), body = $('#term-body'), input = $('#term-input');
const PROMPT = 'guest@chenmo ~ % ';
const SCRIPT = [
  {cmd:'whoami', out:['<b>z</b> · 后端工程师 / 分布式存储方向','写代码，也写关于代码的代码。']},
  {cmd:'cat ./now.txt', out:['正在攻坚 ▸ 用 <span class="hl">eBPF</span> 重写服务网格数据面','正在阅读 ▸ 《数据密集型应用系统设计》第 8 章']},
  {cmd:'uptime', out:['blog online <span class="am">1,024</span> days · 42 posts · load average: 0.42, 0.38, 0.36']}
];
function line(html, cls){
  const d = document.createElement('div');
  d.className = cls || 'o'; d.innerHTML = html;
  out.appendChild(d); body.scrollTop = body.scrollHeight;
  return d;
}
function cmdLine(){
  const d = document.createElement('div');
  d.className = 'o';
  const p = document.createElement('span'); p.className='p'; p.textContent = PROMPT;
  const t = document.createElement('span'); t.className='t-cmd';
  d.append(p, t); out.appendChild(d);
  return t;
}
async function boot(){
  if (RM) {
    SCRIPT.forEach(s => { cmdLine().textContent = s.cmd; s.out.forEach(o => line(o)); });
  } else {
    await sleep(500);
    for (const s of SCRIPT) {
      const t = cmdLine();
      for (const ch of s.cmd) { t.textContent += ch; body.scrollTop = body.scrollHeight; await sleep(28 + Math.random()*55); }
      await sleep(260);
      for (const o of s.out) { line(o); await sleep(160); }
      await sleep(320);
    }
  }
  line('<span class="term-hint">// 输入 <span class="hl">help</span> 查看可用命令</span>');
  input.disabled = false;
}
boot();
document.querySelector('.term').addEventListener('click', () => input.focus());

/* ---------- 终端：交互命令 ---------- */
const history = []; let hIdx = -1;
function toggleTheme(){
  const amber = document.body.classList.toggle('amber');
  return ['主题已切换 → <span class="am">' + (amber ? '琥珀磷光 amber' : '荧光绿 phosphor') + '</span>'];
}
const CMDS = {
  help: () => ['可用命令：',
    '&nbsp;&nbsp;<span class="hl">about</span>&nbsp;&nbsp;&nbsp;&nbsp;关于我',
    '&nbsp;&nbsp;<span class="hl">posts</span>&nbsp;&nbsp;&nbsp;&nbsp;跳转最新文章',
    '&nbsp;&nbsp;<span class="hl">projects</span> 跳转开源项目',
    '&nbsp;&nbsp;<span class="hl">theme</span>&nbsp;&nbsp;&nbsp;&nbsp;切换荧光绿 / 琥珀主题',
    '&nbsp;&nbsp;<span class="hl">date</span>&nbsp;&nbsp;&nbsp;&nbsp;当前时间',
    '&nbsp;&nbsp;<span class="hl">clear</span>&nbsp;&nbsp;&nbsp;清屏'],
  about: () => ['<b>z</b> · 杭州 · 后端工程师','关注：分布式存储 / 可观测性 / Rust','信条：先测量，再优化；先跑通，再抽象。'],
  posts: () => { $('#posts').scrollIntoView({behavior: RM ? 'auto':'smooth'}); return ['已为你定位到 <span class="hl">最新文章 ↓</span>']; },
  projects: () => { $('#projects').scrollIntoView({behavior: RM ? 'auto':'smooth'}); return ['已为你定位到 <span class="hl">开源项目 ↓</span>']; },
  theme: toggleTheme,
  date: () => [new Date().toLocaleString('zh-CN')],
  ls: () => ['posts/&nbsp;&nbsp;projects/&nbsp;&nbsp;now.txt&nbsp;&nbsp;resume.pdf&nbsp;&nbsp;<span class="rd">secrets/（权限不足）</span>'],
  sudo: () => ['[sudo] password for guest: ********','<span class="rd">guest 不在 sudoers 名单上。此事将被记录在案 :)</span>'],
  exit: () => ['连接已断开……才怪，欢迎常来坐坐。'],
  clear: () => { out.innerHTML = ''; return null; }
};
input.addEventListener('keydown', async e => {
  if (e.key === 'ArrowUp')   { e.preventDefault(); if (history.length){ hIdx = Math.max(0, hIdx-1); input.value = history[hIdx]; } return; }
  if (e.key === 'ArrowDown') { e.preventDefault(); hIdx = Math.min(history.length, hIdx+1); input.value = history[hIdx] || ''; return; }
  if (e.key !== 'Enter') return;
  const raw = input.value.trim(); input.value = '';
  if (!raw) return;
  history.push(raw); hIdx = history.length;
  const echo = document.createElement('div'); echo.className = 'o';
  const p = document.createElement('span'); p.className='p'; p.textContent = PROMPT;
  const t = document.createElement('span'); t.className='t-cmd'; t.textContent = raw;
  echo.append(p,t); out.appendChild(echo);
  const name = raw.split(/\s+/)[0].toLowerCase();
  const fn = CMDS[name];
  await sleep(RM ? 0 : 220);
  if (fn) { const res = fn(); if (res) res.forEach(r => line(r)); }
  else line('<span class="rd">zsh: command not found:</span> ' + raw.replace(/</g,'&lt;') + ' —— 试试 <span class="hl">help</span>');
  body.scrollTop = body.scrollHeight;
});

/* ---------- 分类筛选 ---------- */
const posts = $$('#post-list .post'), shownEl = $('#shown');
$$('.fbtn').forEach(btn => btn.addEventListener('click', () => {
  $$('.fbtn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  const f = btn.dataset.f; let n = 0;
  posts.forEach(p => {
    const show = f === 'all' || p.dataset.cat === f;
    if (show) {
      n++; p.classList.remove('gone');
      requestAnimationFrame(() => requestAnimationFrame(() => p.classList.remove('out')));
    } else {
      p.classList.add('out');
      setTimeout(() => { if (p.classList.contains('out')) p.classList.add('gone'); }, 240);
    }
  });
  shownEl.textContent = n;
}));

/* ---------- 复制代码 ---------- */
const copyBtn = $('#copy-btn');
copyBtn.addEventListener('click', () => {
  const code = Array.from(document.querySelectorAll('.cl')).map(l => l.innerText).join('\n');
  const done = () => { copyBtn.textContent = '已复制 ✓'; copyBtn.classList.add('ok');
    setTimeout(() => { copyBtn.textContent = '复制代码'; copyBtn.classList.remove('ok'); }, 1600); };
  if (navigator.clipboard) navigator.clipboard.writeText(code).then(done);
  else { const ta = document.createElement('textarea'); ta.value = code; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); done(); }
});

/* ---------- 订阅表单 ---------- */
const subForm = $('#sub-form'), subEmail = $('#sub-email'), subMsg = $('#sub-msg');
subForm.addEventListener('submit', e => {
  e.preventDefault();
  const v = subEmail.value.trim();
  if (/^\S+@\S+\.\S+$/.test(v)) {
    subMsg.textContent = '✔ 订阅成功 · 确认邮件已发往 ' + v;
    subMsg.className = 'sub-msg ok'; subEmail.value = '';
  } else {
    subMsg.textContent = '✘ 邮箱格式看起来不太对，再试试？';
    subMsg.className = 'sub-msg err';
  }
});
})();
