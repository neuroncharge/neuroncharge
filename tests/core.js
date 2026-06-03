// neuroncalc — per-page test engine. Each HTML loads this file then calls App.run('<id>')
const App = {
  games: {
    reaction:   { name: 'Reaction Time',   unit: 'ms',     type: 'low'  },
    typing:     { name: 'Speed Typing',    unit: 'WPM',    type: 'high' },
    chimp:      { name: 'Chimp Test',      unit: 'Pts',    type: 'high' },
    visual:     { name: 'Visual Memory',   unit: 'Lvl',    type: 'high' },
    sequence:   { name: 'Sequence Memory', unit: 'Lvl',    type: 'high' },
    number:     { name: 'Number Memory',   unit: 'Digits', type: 'high' },
    stroop:     { name: 'Stroop Test',     unit: 'Pts',    type: 'high' },
    cps:        { name: 'CPS Test',        unit: 'CPS',    type: 'high' },
    estimation: { name: 'Time Estimation', unit: 'ms',     type: 'raw'  },
  },
  timers: [],
  activeId: null,

  init() { if (!localStorage.getItem('nc_stats')) localStorage.setItem('nc_stats', JSON.stringify({})); },
  clear() { this.timers.forEach(t => { clearInterval(t); clearTimeout(t); }); this.timers = []; const m = document.getElementById('modal'); if (m) m.classList.add('hidden'); },

  getStats(id) {
    const data = JSON.parse(localStorage.getItem('nc_stats')) || {};
    return data[id] || { best: 0, avg: 0, count: 0, total: 0 };
  },
  saveScore(id, score, error = null) {
    const data = JSON.parse(localStorage.getItem('nc_stats')) || {};
    if (!data[id]) data[id] = { best: 0, total: 0, count: 0, bestError: Infinity };
    const g = this.games[id];
    data[id].count++;
    data[id].total += score;
    if (data[id].count === 1) {
      data[id].best = score;
      if (error !== null) data[id].bestError = error;
    } else if (id === 'estimation') {
      if (error < data[id].bestError) { data[id].best = score; data[id].bestError = error; }
    } else if (g.type === 'low') {
      data[id].best = Math.min(data[id].best, score);
    } else {
      data[id].best = Math.max(data[id].best, score);
    }
    localStorage.setItem('nc_stats', JSON.stringify(data));
    return data[id];
  },

  run(id) {
    this.init();
    this.activeId = id;
    this.clear();
    const mount = document.getElementById('game-mount');
    mount.innerHTML = '';
    this[`run_${id}`](mount);
  },

  finish(id, score, error = null) {
    this.clear();
    const stats = this.saveScore(id, parseFloat(score), error);
    const g = this.games[id];
    const avg = (stats.total / stats.count).toFixed(1);
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('score-val').textContent = score;
    document.getElementById('score-unit').textContent = g.unit;
    document.getElementById('res-best').textContent = stats.best;
    document.getElementById('res-avg').textContent = avg;
    document.getElementById('res-count').textContent = stats.count;
    document.getElementById('btn-retry').onclick = () => this.run(id);
  },

  // ===== Games =====
  run_reaction(m) {
    m.innerHTML = `<div id="rxn" class="target-box wait">Click to start</div>`;
    const box = document.getElementById('rxn');
    let state = 'start', t0;
    box.onmousedown = () => {
      if (state === 'start') {
        state = 'wait'; box.className = 'target-box ready'; box.textContent = 'Wait...';
        this.timers.push(setTimeout(() => {
          state = 'go'; box.className = 'target-box go'; box.textContent = 'Click!'; t0 = Date.now();
        }, Math.random() * 2000 + 1500));
      } else if (state === 'go') { this.finish('reaction', Date.now() - t0);
      } else if (state === 'wait') {
        box.textContent = 'Too soon'; this.clear(); setTimeout(() => this.run_reaction(m), 1000);
      }
    };
  },

  run_cps(m) {
    m.innerHTML = `<h2 style="font-family:var(--mono);font-size:1.5rem;margin-bottom:1rem;letter-spacing:0.1em;">5.0s</h2><button id="cps-btn" class="target-box wait">Start clicking</button>`;
    let start = false, clicks = 0, time = 5.0;
    const btn = document.getElementById('cps-btn');
    btn.onmousedown = () => {
      if (!start) {
        start = true;
        this.timers.push(setInterval(() => {
          time -= 0.1; m.querySelector('h2').textContent = Math.max(0, time).toFixed(1) + 's';
          if (time <= 0) this.finish('cps', (clicks / 5).toFixed(1));
        }, 100));
      }
      clicks++;
      btn.innerHTML = `<span style="font-size:3rem;font-family:var(--mono);">${clicks}</span>`;
    };
  },

  run_typing(m) {
    const paragraphs = [
      "Cognitive performance is a measure of how efficiently your brain processes information, makes decisions, and reacts to stimuli. Regular practice can improve your overall neuroplasticity.",
      "In the fast paced digital age, typing speed and accuracy are essential skills. By practicing regularly, you can develop muscle memory and type without looking at the keys.",
      "The human brain is a remarkable organ, capable of continuous adaptation. When you challenge yourself with cognitive tasks, you are actively forging new neural pathways."
    ];
    const txt = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    m.innerHTML = `<div class="typing-area"><div id="t-disp" class="typing-text"></div><input id="t-in" class="typing-input" type="text" placeholder="Type here..." autocomplete="off"></div>`;
    const disp = document.getElementById('t-disp');
    disp.innerHTML = txt.split('').map(c => `<span>${c}</span>`).join('');
    let start = false, t0;
    document.getElementById('t-in').oninput = (e) => {
      if (!start) { start = true; t0 = Date.now(); }
      const val = e.target.value.split(''), spans = disp.querySelectorAll('span');
      spans.forEach((s, i) => {
        if (val[i] == null) s.className = '';
        else if (val[i] === s.textContent) s.className = 'c-correct';
        else s.className = 'c-wrong';
      });
      if (val.length >= txt.length) {
        const timeMin = (Date.now() - t0) / 1000 / 60;
        const tw = txt.split(' '), uw = e.target.value.split(' ');
        let cw = 0;
        for (let i = 0; i < tw.length; i++) if (uw[i] === tw[i]) cw++;
        this.finish('typing', Math.round(cw / timeMin));
      }
    };
    setTimeout(() => document.getElementById('t-in').focus(), 100);
  },

  run_chimp(m) {
    m.innerHTML = `<button class="btn primary" id="start-chimp">Start module</button>`;
    document.getElementById('start-chimp').onclick = () => {
      let count = 4;
      const play = () => {
        m.innerHTML = `<div class="grid-system" style="grid-template-columns:repeat(6, min(14vw, 72px));"></div>`;
        const grid = m.querySelector('.grid-system');
        let pos = [...Array(36).keys()].sort(() => 0.5 - Math.random()).slice(0, count);
        let next = 1;
        pos.forEach((p, i) => {
          const c = document.createElement('div');
          c.className = 'cell active'; c.textContent = i + 1;
          c.style.gridColumnStart = (p % 6) + 1; c.style.gridRowStart = Math.floor(p / 6) + 1;
          c.onmousedown = () => {
            if (parseInt(c.textContent) === next) {
              if (next === 1) document.querySelectorAll('.cell').forEach(cc => { cc.classList.remove('active'); cc.style.color = 'transparent'; });
              c.style.visibility = 'hidden'; next++;
              if (next > count) { count++; play(); }
            } else this.finish('chimp', (count - 1) < 4 ? 0 : count - 1);
          };
          grid.appendChild(c);
        });
      };
      play();
    };
  },

  run_visual(m) {
    m.innerHTML = `<button class="btn primary" id="start-vis">Start module</button>`;
    document.getElementById('start-vis').onclick = () => {
      let level = 1, size = 3;
      const play = () => {
        m.innerHTML = `<div class="grid-system" id="v-grid" style="grid-template-columns:repeat(${size}, min(18vw, 72px));"></div>`;
        const grid = document.getElementById('v-grid');
        let count = size + 1, found = 0;
        let targets = [...Array(size*size).keys()].sort(()=>0.5-Math.random()).slice(0, count);
        for (let i = 0; i < size*size; i++) {
          const c = document.createElement('div'); c.className = 'cell';
          if (targets.includes(i)) { c.classList.add('active'); setTimeout(() => c.classList.remove('active'), 1000); }
          c.onmousedown = () => {
            if (targets.includes(i) && !c.classList.contains('good')) {
              c.classList.add('good'); found++;
              if (found === count) { level++; if (level % 2 === 0) size++; setTimeout(play, 500); }
            } else if (!targets.includes(i)) { c.classList.add('bad'); this.finish('visual', level - 1); }
          };
          grid.appendChild(c);
        }
      };
      play();
    };
  },

  run_sequence(m) {
    m.innerHTML = `<button class="btn primary" id="start-seq">Start module</button>`;
    document.getElementById('start-seq').onclick = () => {
      m.innerHTML = `<div class="grid-system" id="s-grid" style="grid-template-columns:repeat(3, min(25vw, 84px));"></div>`;
      const grid = document.getElementById('s-grid');
      for (let i = 0; i < 9; i++) { const c = document.createElement('div'); c.className = 'cell'; c.dataset.i = i; grid.appendChild(c); }
      let seq = [];
      const turn = async () => {
        seq.push(Math.floor(Math.random() * 9));
        grid.style.pointerEvents = 'none';
        for (let i of seq) {
          await new Promise(r => setTimeout(r, 400));
          grid.children[i].classList.add('active');
          await new Promise(r => setTimeout(r, 400));
          grid.children[i].classList.remove('active');
        }
        grid.style.pointerEvents = 'all';
        let idx = 0;
        grid.onmousedown = (e) => {
          if (!e.target.classList.contains('cell')) return;
          e.target.classList.add('active'); setTimeout(() => e.target.classList.remove('active'), 100);
          if (parseInt(e.target.dataset.i) === seq[idx]) { idx++; if (idx === seq.length) setTimeout(turn, 500); }
          else this.finish('sequence', seq.length - 1);
        };
      };
      turn();
    };
  },

  run_number(m) {
    m.innerHTML = `<button class="btn primary" id="start-num">Start module</button>`;
    document.getElementById('start-num').onclick = () => {
      let digits = 3;
      const play = () => {
        const num = Math.floor(Math.random() * Math.pow(10, digits)).toString().padStart(digits, '0');
        m.innerHTML = `<div class="number-display">${num}</div>`;
        this.timers.push(setTimeout(() => {
          m.innerHTML = `
            <p style="color:var(--text-dim); margin-bottom:1rem; font-family:var(--mono); font-size:0.8rem; letter-spacing:0.1em; text-transform:uppercase;">What was the number?</p>
            <input id="n-in" class="typing-input" style="text-align:center; max-width:300px;" type="number">
            <br><br><button id="n-sub" class="btn primary">Submit</button>`;
          document.getElementById('n-in').focus();
          document.getElementById('n-sub').onclick = () => {
            if (document.getElementById('n-in').value === num) { digits++; play(); }
            else this.finish('number', (digits - 1) < 3 ? 0 : digits - 1);
          };
        }, 2000));
      };
      play();
    };
  },

  run_stroop(m) {
    m.innerHTML = `<button class="btn primary" id="start-str">Start module</button>`;
    document.getElementById('start-str').onclick = () => {
      let score = 0, time = 20;
      const colors = ['Red', 'Blue', 'Green', 'Yellow'];
      const colorMap = { 'Red': '#c1272d', 'Blue': '#2563eb', 'Green': '#1f7a3a', 'Yellow': '#d4a017' };
      this.timers.push(setInterval(() => {
        time--;
        const t = document.getElementById('str-time');
        if (t) t.textContent = time + 's';
        if (time <= 0) this.finish('stroop', score);
      }, 1000));
      const next = () => {
        const word = colors[Math.floor(Math.random() * colors.length)];
        const ink  = colors[Math.floor(Math.random() * colors.length)];
        let html = `<div class="str-bar"><span>Time <span id="str-time">${time}s</span></span><span>Score <span>${score}</span></span></div>`;
        html += `<div class="stroop-word" style="color:${colorMap[ink]};">${word}</div><div class="str-grid">`;
        colors.forEach(c => { html += `<button class="btn secondary str-btn" data-c="${c}">${c}</button>`; });
        html += `</div>`;
        m.innerHTML = html;
        m.querySelectorAll('.str-btn').forEach(b => {
          b.onclick = (e) => { if (e.target.dataset.c === ink) score++; next(); };
        });
      };
      next();
    };
  },

  run_estimation(m) {
    if (this.estimationTarget === undefined) this.estimationTarget = null;
    const render = () => {
      m.innerHTML = `
        <div style="margin-bottom:2rem;">
          <button class="btn ${this.estimationTarget===3000?'primary':'secondary'} est-opt" data-t="3000">3 seconds</button>
          <button class="btn ${this.estimationTarget===5000?'primary':'secondary'} est-opt" data-t="5000">5 seconds</button>
          <button class="btn ${this.estimationTarget===10000?'primary':'secondary'} est-opt" data-t="10000">10 seconds</button>
        </div>
        <div id="est-box" class="target-box ${this.estimationTarget?'wait':'locked'}">
          ${this.estimationTarget ? 'Click to start' : 'Select a time'}
        </div>`;
      m.querySelectorAll('.est-opt').forEach(b => {
        b.onclick = (e) => {
          const t = parseInt(e.target.dataset.t);
          if (this.estimationTarget !== t) {
            this.estimationTarget = t;
            const data = JSON.parse(localStorage.getItem('nc_stats')) || {};
            delete data['estimation']; localStorage.setItem('nc_stats', JSON.stringify(data));
          }
          render();
        };
      });
      const box = document.getElementById('est-box');
      let state = 'start', t0;
      box.onmousedown = () => {
        if (!this.estimationTarget) return;
        if (state === 'start') {
          state = 'timing'; box.className = 'target-box ready';
          box.innerHTML = 'Timing...<br><span style="font-size:0.75rem; font-weight:400; letter-spacing:0.15em; margin-top:0.5rem;">Click to stop</span>';
          t0 = Date.now();
        } else if (state === 'timing') {
          const actual = Date.now() - t0;
          const error = Math.abs(actual - this.estimationTarget);
          this.finish('estimation', actual, error);
        }
      };
    };
    render();
  },
};
window.App = App;
