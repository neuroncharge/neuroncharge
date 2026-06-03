// neuroncalc — Core Shared Application Logic
(() => {
  // Safely grab the filename without URL parameters or hashes
  let path = location.pathname.split('/').pop();
  path = path ? path.split('?')[0].split('#')[0] : 'index.html';
  if (path === '') path = 'index.html';

  const init = {
    'health.html': initHealth,
    'accounts.html': initAccounts,
    'mathematics.html': initMath,
    'physics.html': initPhysics,
    'focus.html': initFocus,
    'breath.html': initBreath,
    'ambient.html': initAmbient,
    'mindful.html': initMindful,
    'insights.html': initInsights,
  }[path];

  const startApp = () => {
    applyGlobalUXLocks();
    
    // --- BULLETPROOF MODAL LOGIC (Event Delegation) ---
    document.addEventListener('click', (e) => {
      const modal = document.getElementById('version-modal');
      if (!modal) return; 

      if (e.target.closest('.modal-trigger')) {
        modal.classList.add('active');
      }
      if (e.target.closest('#close-modal')) {
        modal.classList.remove('active');
      }
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });

    if (init) init();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
  } else {
    startApp();
  }

  function applyGlobalUXLocks() {
    const style = document.createElement('style');
    style.textContent = `
      body, html { overflow-x: hidden; max-width: 100%; touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
      .unselectable, body, header, footer, nav, table, .card, .output-panel, h1, h2, h3, p, span:not(.input-wrapper) {
        -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; -webkit-touch-callout: none;
      }
      input, textarea, [contenteditable="true"], button, a, select { -webkit-user-select: text !important; -moz-user-select: text !important; -ms-user-select: text !important; user-select: text !important; }
    `;
    document.head.appendChild(style);
  }
  // ============== SYSTEM SEC 1: HEALTH ==============
  function initHealth() {
    let sex = 'm';
    const $ = id => document.getElementById(id);
    const seg = $('sex-seg');
    if (!seg) return;

    seg.addEventListener('click', e => {
      const b = e.target.closest('button[data-v]'); if (!b) return;
      sex = b.dataset.v;
      seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      calc();
    });

    // Smart Formatter for Health Metrics
    const formatHealth = (v, isBmi = false) => {
      if (isNaN(v) || !isFinite(v)) return '—';
      
      const absV = Math.abs(v);
      if (absV > 99999999) {
        return v.toExponential(4).replace('+', '');
      }
      
      const rounded = Number(v.toPrecision(8));
      // BMI gets 1 decimal point, BMR/TDEE get formatted with commas (e.g. 2,500)
      return isBmi ? rounded.toFixed(1) : rounded.toLocaleString();
    };

    const calc = () => {
      const H = Math.max(30, Math.min(300, +$('h').value)),
            W = Math.max(5, Math.min(600, +$('w').value)),
            A = Math.max(1, Math.min(125, +$('age').value)),
            AC = +$('act').value;
            
      if (!H || !W || !A || isNaN(AC)) return;

      const bmi = W / Math.pow(H / 100, 2);
      const bmr = sex === 'm' ? (10 * W) + (6.25 * H) - (5 * A) + 5 : (10 * W) + (6.25 * H) - (5 * A) - 161;
      const tdee = bmr * AC;
      const cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';

      if ($('o-bmi')) $('o-bmi').textContent = formatHealth(bmi, true);
      if ($('o-cat')) $('o-cat').textContent = cat;
      if ($('o-bmr')) $('o-bmr').textContent = formatHealth(bmr);
      if ($('o-tdee')) $('o-tdee').textContent = formatHealth(tdee);
    };

    ['h','w','age','act'].forEach(id => {
      const el = $(id);
      if (el) el.addEventListener('input', calc);
    });
    calc();
  }

  // ============== SYSTEM SEC 2: ACCOUNTS ==============
  function initAccounts() {
    const $ = id => document.getElementById(id);
    
    // Smart Formatter: Unitless numbers with commas, Scientific Notation for massive sums
    const fmt = (n) => {
      if (isNaN(n) || !isFinite(n)) return '0';
      
      const absN = Math.abs(n);
      // Triggers Scientific Notation if output exceeds 8 digits (99,999,999)
      if (absN > 99999999) {
        return n.toExponential(8).replace('+', '');
      }
      
      // Formats cleanly with commas and up to 2 decimal places, no currency
      return new Intl.NumberFormat('en-US', { 
        maximumFractionDigits: 2
      }).format(Number(n.toPrecision(8)));
    };

    const calc = () => {
      const P = Math.max(0, +$('p').value || 0),
            R = Math.max(0, (+$('r').value || 0) / 100),
            T = Math.max(0, +$('t').value || 0),
            N = Math.max(1, +$('n').value || 12),
            C = Math.max(0, +$('c').value || 0);

      const nt = N * T;
      const base = P * Math.pow(1 + R / N, nt);
      let contribFV = 0;

      if (R > 0) {
        contribFV = C * ((Math.pow(1 + R / N, nt) - 1) / (R / N)) * (N / 12);
      } else {
        contribFV = C * 12 * T;
      }

      const fv = base + contribFV;
      const contributed = C * 12 * T;
      const interest = fv - P - contributed;

      if ($('o-fv')) $('o-fv').textContent = fmt(fv);
      if ($('o-p')) $('o-p').textContent = fmt(P);
      if ($('o-c')) $('o-c').textContent = fmt(contributed);
      if ($('o-i')) $('o-i').textContent = fmt(interest);
    };

    ['p','r','t','n','c'].forEach(id => {
      const el = $(id);
      if (el) {
        el.addEventListener('input', calc);
        el.addEventListener('change', calc);
      }
    });
    calc();
  }

  // ============== MATH ==============
  function initMath() {
    let expr = '', out = '0', rad = true;
    const e = document.getElementById('expr');
    const o = document.getElementById('out');
    const keysEl = document.getElementById('keys');
    const render = () => { e.textContent = expr || '\u00A0'; o.textContent = out; };
    const evalExpr = s => {
      try {
        let x = s
          .replace(/π/g,'Math.PI').replace(/(?<![a-zA-Z])e(?![a-zA-Z])/g,'Math.E')
          .replace(/√\(/g,'Math.sqrt(')
          .replace(/\^/g,'**')
          .replace(/(sin|cos|tan)\(/g, (_m,f) => `Math.${f}((${rad?'1':'Math.PI/180'})*`)
          .replace(/log\(/g,'Math.log10(')
          .replace(/ln\(/g,'Math.log(');
        const cleanContext = Function(`"use strict"; return (${x})`);
        const r = cleanContext();
        if (r === null || r === undefined || isNaN(r) || !isFinite(r)) return 'Error';
        
        const finalResult = +r;
        const absV = Math.abs(finalResult);
        
        // Triggers Scientific Notation if output exceeds 8 digits
        if (absV > 99999999 || (absV > 0 && absV < 0.000001)) {
          return finalResult.toExponential(8).replace('+', '');
        }
        return String(Number(finalResult.toPrecision(8)));
      } catch { return 'Error'; }
    };
    const layout = () => [
      {l:'sin',v:'sin('},{l:'cos',v:'cos('},{l:'tan',v:'tan('},{l:rad?'rad':'deg',act:()=>{rad=!rad;build();},c:'muted'},
      {l:'ln',v:'ln('},{l:'log',v:'log('},{l:'√',v:'√('},{l:'^',v:'^'},
      {l:'π',v:'π'},{l:'e',v:'e'},{l:'(',v:'('},{l:')',v:')'},
      {l:'7',v:'7'},{l:'8',v:'8'},{l:'9',v:'9'},{l:'÷',v:'/'},
      {l:'4',v:'4'},{l:'5',v:'5'},{l:'6',v:'6'},{l:'×',v:'*'},
      {l:'1',v:'1'},{l:'2',v:'2'},{l:'3',v:'3'},{l:'−',v:'-'},
      {l:'0',v:'0'},{l:'.',v:'.'},{l:'C',act:()=>{expr='';out='0';render();},c:'danger'},{l:'+',v:'+'},
    ];
    const build = () => {
      keysEl.innerHTML = '';
      layout().forEach(k => {
        const b = document.createElement('button');
        b.textContent = k.l;
        if (k.c) b.classList.add(k.c);
        b.addEventListener('click', () => { if (k.act) k.act(); else { expr += k.v; render(); } });
        keysEl.appendChild(b);
      });
      const eq = document.createElement('button');
      eq.textContent = 'Equals'; eq.className = 'eq';
      eq.addEventListener('click', () => { out = evalExpr(expr); render(); });
      keysEl.appendChild(eq);
    };
    build(); render();
  }

  // ============== SYSTEM SEC 4: PHYSICS ==============
  function initPhysics() {
    const $ = id => document.getElementById(id);
    const ids = ['u','v','a','t','s'];
    const out = document.getElementById('phys-out');
    if (!out) return;

    function solve(k) {
      let changed = true, iterations = 0;
      while (changed && iterations++ < 10) {
        changed = false;
        let {u,v,a,t,s} = k;

        if (v==null && u!=null && a!=null && t!=null) { k.v = u + a*t; changed = true; }
        if (u==null && v!=null && a!=null && t!=null) { k.u = v - a*t; changed = true; }
        if (a==null && u!=null && v!=null && t!=null && t!==0) { k.a = (v - u)/t; changed = true; }
        if (t==null && u!=null && v!=null && a!=null && a!==0) { k.t = (v - u)/a; changed = true; }
        
        if (s==null && u!=null && a!=null && t!=null) { k.s = u*t + 0.5*a*t*t; changed = true; }
        if (s==null && u!=null && v!=null && t!=null) { k.s = 0.5*(u+v)*t; changed = true; }
        if (s==null && v!=null && a!=null && t!=null) { k.s = v*t - 0.5*a*t*t; changed = true; }
        if (s==null && v!=null && u!=null && a!=null && a!==0) { k.s = (v*v - u*u)/(2*a); changed = true; }
        
        if (v==null && u!=null && a!=null && s!=null) { const sq = u*u + 2*a*s; if (sq >= 0) { k.v = Math.sqrt(sq); changed = true; } }
        if (u==null && v!=null && a!=null && s!=null) { const sq = v*v - 2*a*s; if (sq >= 0) { k.u = Math.sqrt(sq); changed = true; } }
      }
      return k;
    }

    // Smart Formatter: Standard output for regular numbers, Scientific Notation for huge ones
    const formatVal = (v) => {
      if (v == null) return '—';
      const absV = Math.abs(v);
      if (absV > 99999999 || (absV > 0 && absV < 0.000001)) {
        return v.toExponential(8).replace('+', ''); // Outputs clean notation like 2.1313e16
      }
      return Number(v.toPrecision(8));
    };

    const update = () => {
      const known = {};
      ids.forEach(id => { 
        const el = $(id);
        const val = el ? el.value : ''; 
        known[id] = (val !== '' && !isNaN(val)) ? parseFloat(val) : null; 
      });
      
      const given = {...known};
      const r = solve(known);
      
      out.innerHTML = ids.map(id => {
        const v = r[id];
        const sub = given[id] != null ? 'Given' : (v != null ? 'Solved' : '—');
        return `<div class="out"><div class="lbl">${id.toUpperCase()}</div><div class="val">${formatVal(v)}</div><div class="sub">${sub}</div></div>`;
      }).join('');
    };

    ids.forEach(id => {
      const el = $(id);
      if (el) el.addEventListener('input', update);
    });
    update();
  }

  // ============== FOCUS TIMER ==============
  function initFocus() {
    let mins = 25, left = 0, running = false, iv = null;
    const $ = id => document.getElementById(id);
    const disp = $('display'), echo = $('obj-echo'), toggle = $('toggle');
    const customInput = $('custom-min');
    const customErr = $('custom-err');
    const fmt = () => {
      const t = running || left > 0 ? left : mins * 60;
      const mm = String(Math.floor(t/60)).padStart(2,'0');
      const ss = String(t%60).padStart(2,'0');
      disp.textContent = `${mm}:${ss}`;
    };
    const clearPresetActive = () =>
      $('presets').querySelectorAll('button').forEach(x => x.classList.remove('on'));

    $('presets').addEventListener('click', e => {
      const b = e.target.closest('button[data-m]'); if (!b || running) return;
      mins = +b.dataset.m;
      clearPresetActive();
      b.classList.add('on');
      if (customInput) { customInput.value = ''; if (customErr) customErr.textContent = ''; }
      fmt();
    });

    if (customInput) {
      const applyCustom = () => {
        if (running) return;
        const raw = customInput.value.trim();
        if (raw === '') { if (customErr) customErr.textContent = ''; return; }
        // integer 1..480 only
        if (!/^\d+$/.test(raw)) {
          if (customErr) customErr.textContent = 'Whole minutes only.';
          return;
        }
        const n = parseInt(raw, 10);
        if (!Number.isFinite(n) || n < 1 || n > 480) {
          if (customErr) customErr.textContent = 'Enter a value from 1 to 480.';
          return;
        }
        if (customErr) customErr.textContent = '';
        mins = n;
        clearPresetActive();
        fmt();
      };
      customInput.addEventListener('input', applyCustom);
      // block non-digit keys (still allow nav keys)
      customInput.addEventListener('keydown', e => {
        const ok = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End','Enter'];
        if (ok.includes(e.key)) return;
        if (e.metaKey || e.ctrlKey) return;
        if (!/^[0-9]$/.test(e.key)) e.preventDefault();
      });
    }

    const start = () => {
      if (customInput && customInput.value.trim() !== '') {
        // re-validate before starting
        const raw = customInput.value.trim();
        if (!/^\d+$/.test(raw) || +raw < 1 || +raw > 480) {
          if (customErr) customErr.textContent = 'Enter a value from 1 to 480.';
          return;
        }
        mins = +raw;
      }
      left = mins * 60; running = true;
      toggle.textContent = 'End early'; toggle.classList.remove('primary'); toggle.classList.add('secondary');
      $('obj').disabled = true;
      if (customInput) customInput.disabled = true;
      const obj = $('obj').value;
      if (obj) { echo.style.display = 'block'; echo.textContent = '→ ' + obj; }
      iv = setInterval(() => {
        left--;
        if (left <= 0) {
          clearInterval(iv); running = false; left = 0;
          const log = JSON.parse(localStorage.getItem('nc_focus') || '[]');
          log.push({ at: Date.now(), minutes: mins, objective: obj });
          localStorage.setItem('nc_focus', JSON.stringify(log));
          toggle.textContent = 'Begin focus'; toggle.classList.add('primary'); toggle.classList.remove('secondary');
          $('obj').disabled = false;
          if (customInput) customInput.disabled = false;
        }
        fmt();
      }, 1000);
      fmt();
    };
    const stop = () => {
      clearInterval(iv); running = false; left = 0;
      toggle.textContent = 'Begin focus'; toggle.classList.add('primary'); toggle.classList.remove('secondary');
      $('obj').disabled = false;
      if (customInput) customInput.disabled = false;
      fmt();
    };
    toggle.addEventListener('click', () => running ? stop() : start());
    fmt();
  }

  // ============== BREATH ==============
  function initBreath() {
    const phases = [
      { label: 'Inhale', sec: 4, scale: 1 },
      { label: 'Hold',   sec: 4, scale: 1 },
      { label: 'Exhale', sec: 4, scale: 0.5 },
      { label: 'Hold',   sec: 4, scale: 0.5 },
    ];
    let i = 0, t = 4, running = false, iv = null;
    const orb = document.getElementById('orb');
    const phase = document.getElementById('phase');
    const count = document.getElementById('count');
    const btn = document.getElementById('bt');
    const render = () => {
      const p = phases[i];
      orb.style.transitionDuration = running ? p.sec + 's' : '0.3s';
      orb.style.width = (p.scale * 100) + '%';
      orb.style.height = (p.scale * 100) + '%';
      phase.textContent = running ? p.label : 'Ready';
      count.textContent = running ? t : '·';
    };
    btn.addEventListener('click', () => {
      if (running) {
        clearInterval(iv); running = false; i = 0; t = 4;
        btn.textContent = 'Begin';
      } else {
        running = true; i = 0; t = phases[0].sec; btn.textContent = 'Stop';
        render();
        iv = setInterval(() => {
          t--;
          if (t <= 0) { i = (i+1) % phases.length; t = phases[i].sec; }
          render();
        }, 1000);
      }
      render();
    });
    render();
  }

  // ============== AMBIENT ==============
  function initAmbient() {
    let ctx = null;
    const gains = {};
    const builders = {
      brown: (ctx, gain) => {
        const bs = 4096; const node = ctx.createScriptProcessor(bs, 1, 1);
        let last = 0;
        node.onaudioprocess = e => {
          const o = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < bs; i++) { const w = Math.random()*2-1; o[i] = (last + 0.02*w)/1.02; last = o[i]; o[i] *= 3.5; }
        };
        node.connect(gain);
      },
      rain: (ctx, gain) => {
        const bs = 4096; const node = ctx.createScriptProcessor(bs, 1, 1);
        node.onaudioprocess = e => { const o = e.outputBuffer.getChannelData(0); for (let i = 0; i < bs; i++) o[i] = (Math.random()*2-1) * 0.6; };
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1200;
        node.connect(f).connect(gain);
      },
      waves: (ctx, gain) => {
        const bs = 4096; const node = ctx.createScriptProcessor(bs, 1, 1);
        let t = 0;
        node.onaudioprocess = e => {
          const o = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < bs; i++) {
            const env = 0.5 + 0.5 * Math.sin(t * 0.0006);
            o[i] = (Math.random()*2-1) * 0.5 * env; t++;
          }
        };
        const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 600;
        node.connect(f).connect(gain);
      },
    };
    const ensure = () => {
      if (ctx) { ctx.resume(); return; }
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      for (const id of Object.keys(builders)) {
        const g = ctx.createGain(); g.gain.value = 0; g.connect(ctx.destination);
        gains[id] = g; builders[id](ctx, g);
      }
    };
    document.querySelectorAll('input[type=range][data-layer]').forEach(input => {
      input.addEventListener('input', () => {
        ensure();
        const id = input.dataset.layer;
        const v = parseFloat(input.value);
        gains[id].gain.value = v;
        document.getElementById('v-' + id).textContent = Math.round(v * 100);
      });
    });
  }

  // ============== MINDFUL ==============
  function initMindful() {
    const sessions = JSON.parse(localStorage.getItem('nc_focus') || '[]');
    const now = Date.now();
    const weekAgo = now - 7*86400000;
    const week = sessions.filter(s => s.at > weekAgo);
    const total = week.reduce((a,b) => a + b.minutes, 0);
    document.getElementById('m-total').textContent = total + 'm';
    document.getElementById('m-count').textContent = week.length;
    document.getElementById('m-avg').textContent = week.length ? Math.round(total/week.length) + 'm' : '—';
    const days = Array.from({length:7}, (_,i) => {
      const d = new Date(now - (6-i)*86400000);
      const s = new Date(d); s.setHours(0,0,0,0);
      const e = new Date(d); e.setHours(23,59,59,999);
      const mins = sessions.filter(x => x.at >= s.getTime() && x.at <= e.getTime()).reduce((a,b) => a + b.minutes, 0);
      return { d: d.toLocaleDateString(undefined,{weekday:'short'}), mins };
    });
    const max = Math.max(60, ...days.map(d => d.mins));
    document.getElementById('bars').innerHTML = days.map(d =>
      `<div class="col"><div class="bar" style="height:${(d.mins/max)*100}%;opacity:${d.mins>0?1:.15}"></div><span class="lbl">${d.d}</span></div>`
    ).join('');
    const list = document.getElementById('recent');
    if (!week.length) {
      list.innerHTML = '<li style="border:0;color:var(--text-dim);">No sessions yet. <a href="focus.html" style="text-decoration:underline;">Start a focus timer</a>.</li>';
    } else {
      list.innerHTML = week.slice().reverse().slice(0,8).map(s => {
        const d = new Date(s.at).toLocaleString(undefined,{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
        const obj = s.objective || '<em style="color:var(--text-dim);">untitled</em>';
        return `<li><span>${obj}</span><span class="meta">${s.minutes}m · ${d}</span></li>`;
      }).join('');
    }
  }

  // ============== INSIGHTS ==============
  function initInsights() {
    const METRICS = [
      { id:'reaction', name:'Reaction Time', unit:'ms', type:'low' },
      { id:'typing', name:'Speed Typing', unit:'WPM', type:'high' },
      { id:'chimp', name:'Chimp Test', unit:'Pts', type:'high' },
      { id:'visual', name:'Visual Memory', unit:'Lvl', type:'high' },
      { id:'sequence', name:'Sequence Memory', unit:'Lvl', type:'high' },
      { id:'number', name:'Number Memory', unit:'Digits', type:'high' },
      { id:'stroop', name:'Stroop Test', unit:'Pts', type:'high' },
      { id:'cps', name:'CPS Test', unit:'CPS', type:'high' },
      { id:'estimation', name:'Time Estimation', unit:'ms', type:'raw' },
    ];
    const render = () => {
      const stats = JSON.parse(localStorage.getItem('nc_stats') || '{}');
      const focusMin = (JSON.parse(localStorage.getItem('nc_focus') || '[]'))
        .filter(s => s.at > Date.now() - 7*86400000)
        .reduce((a,b) => a + b.minutes, 0);
      const tested = METRICS.filter(m => stats[m.id]?.count);
      document.getElementById('stat-tried').textContent = tested.length + ' / 9';
      document.getElementById('stat-attempts').textContent = tested.reduce((a,m) => a + stats[m.id].count, 0);
      document.getElementById('stat-focus').textContent = focusMin + 'm';
      document.getElementById('stat-top').textContent = tested[0]?.name.split(' ')[0] ?? '—';
      document.getElementById('ins-rows').innerHTML = METRICS.map(m => {
        const s = stats[m.id];
        const best = s?.best ? `${s.best} ${m.unit}` : '—';
        const avg = s?.count ? (s.total/s.count).toFixed(1) + ' ' + m.unit : '—';
        const tries = s?.count ?? '—';
        return `<tr><td><a href="tests/${m.id}.html">${m.name}</a></td><td class="r">${best}</td><td class="r dim">${avg}</td><td class="r dim">${tries}</td></tr>`;
      }).join('');
    };
    document.getElementById('reset-btn').addEventListener('click', () => {
      if (!confirm('Erase all scores and focus history?')) return;
      localStorage.removeItem('nc_stats');
      localStorage.removeItem('nc_focus');
      render();
    });
    render();
  }
})();
