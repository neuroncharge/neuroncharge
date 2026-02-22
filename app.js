const App = {
    games: [
        { id: 'reaction', name: 'Reaction Time', unit: 'ms', type: 'low', desc: 'When the red box turns green, click it as quickly as possible.' },
        { id: 'typing', name: 'Speed Typing', unit: 'WPM', type: 'high', desc: 'Type the displayed paragraph as fast and accurately as you can.' },
        { id: 'chimp', name: 'Chimp Test', unit: 'Pts', type: 'high', desc: 'Click the numbers in ascending order. They will hide after the first click.' },
        { id: 'visual', name: 'Visual Memory', unit: 'Lvl', type: 'high', desc: 'Memorize the white tiles, then click them after they disappear.' },
        { id: 'sequence', name: 'Sequence Memory', unit: 'Lvl', type: 'high', desc: 'Remember the pattern of flashing squares and repeat it.' },
        { id: 'number', name: 'Number Memory', unit: 'Digits', type: 'high', desc: 'Memorize the number shown on screen, then type it from memory.' },
        { id: 'stroop', name: 'Stroop Test', unit: 'Pts', type: 'high', desc: 'Click the button matching the INK COLOR of the word, not what the word says.' },
        { id: 'cps', name: 'CPS Test', unit: 'CPS', type: 'high', desc: 'Click the target area as many times as possible in 5 seconds.' },
        { id: 'estimation', name: 'Time Estimation', unit: 'ms', type: 'raw', desc: 'Select a target time. Click Start, then click Stop when you think that exact amount of time has passed.' }
    ],
    
    timers: [],
    activeGame: null,
    
    init() {
        const menu = document.getElementById('menu-list');
        this.games.forEach(g => {
            const btn = document.createElement('button');
            btn.className = 'menu-btn';
            btn.textContent = g.name.toUpperCase();
            btn.onclick = () => {
                document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.loadGame(g.id);
            };
            menu.appendChild(btn);
        });
        
        const checkbox = document.getElementById('theme-checkbox');
        const savedTheme = localStorage.getItem('nc_theme') || 'dark';
        
        document.body.setAttribute('data-theme', savedTheme);
        checkbox.checked = savedTheme === 'light';

        checkbox.onchange = () => {
            const theme = checkbox.checked ? 'light' : 'dark';
            document.body.setAttribute('data-theme', theme);
            localStorage.setItem('nc_theme', theme);
        };

        const infoBtn = document.getElementById('info-btn');
        const infoPanel = document.getElementById('info-panel');
        infoBtn.onclick = () => infoPanel.classList.toggle('hidden');
        
        document.addEventListener('click', (e) => {
            if (!infoBtn.contains(e.target) && !infoPanel.contains(e.target)) {
                infoPanel.classList.add('hidden');
            }
        });

        if(!localStorage.getItem('nc_stats')) localStorage.setItem('nc_stats', JSON.stringify({}));
        this.loadHome();
    },

    customConfirm(title, message, onConfirm) {
        const modal = document.getElementById('confirm-modal');
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-msg').textContent = message;
        
        modal.classList.remove('hidden');

        document.getElementById('confirm-ok').onclick = () => {
            onConfirm();
            modal.classList.add('hidden');
        };

        document.getElementById('confirm-cancel').onclick = () => {
            modal.classList.add('hidden');
        };
    },

    clear() {
        this.timers.forEach(t => { clearInterval(t); clearTimeout(t); });
        this.timers = [];
        document.getElementById('modal').classList.add('hidden');
    },

    resetStat(id) {
        this.customConfirm(
            'RESET MODULE DATA', 
            `Are you sure you want to erase all history for this module? This cannot be undone.`,
            () => {
                const data = JSON.parse(localStorage.getItem('nc_stats')) || {};
                delete data[id];
                localStorage.setItem('nc_stats', JSON.stringify(data));
                this.showStats();
            }
        );
    },

    resetAllStats() {
        this.customConfirm(
            'PERMANENT SYSTEM WIPE', 
            'Warning: This will delete every single score and average recorded on this device. Proceed with caution.',
            () => {
                localStorage.setItem('nc_stats', JSON.stringify({}));
                this.showStats();
            }
        );
    },

    updateInfo(id) {
        this.activeGame = id;
        const g = this.games.find(x => x.id === id);
        if (g) document.getElementById('info-text').innerHTML = `<p>${g.desc}</p>`;
        else document.getElementById('info-text').innerHTML = `<p>Select a test to view instructions.</p>`;
    },

    loadHome() {
        this.clear();
        this.updateInfo(null);
        document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('stage').innerHTML = `
            <div class="welcome-screen">
                <div class="dots-container">
                    <div class="big-dot"></div>
                    <div class="big-dot"></div>
                    <div class="big-dot"></div>
                </div>
                <p>Select a module from the sidebar to measure your reaction speed, memory, focus, and cognitive performance.</p>
            </div>`;
    },

    getStats(id) {
        const data = JSON.parse(localStorage.getItem('nc_stats')) || {};
        if (!data[id]) return { best: 0, avg: 0, count: 0, total: 0 };
        return data[id];
    },

    saveScore(id, score, error = null) {
        const data = JSON.parse(localStorage.getItem('nc_stats')) || {};
        if (!data[id]) data[id] = { best: 0, total: 0, count: 0, bestError: Infinity };
        
        const g = this.games.find(x => x.id === id);
        data[id].count++;
        data[id].total += score;
        
        if (data[id].count === 1) {
            data[id].best = score;
            if (error !== null) data[id].bestError = error;
        } else {
            if (g.id === 'estimation') {
                // For estimation, the best score is the one closest to the target
                if (error < data[id].bestError) {
                    data[id].best = score;
                    data[id].bestError = error;
                }
            } else if (g.type === 'low') {
                data[id].best = Math.min(data[id].best, score);
            } else {
                data[id].best = Math.max(data[id].best, score);
            }
        }
        
        localStorage.setItem('nc_stats', JSON.stringify(data));
        return data[id];
    },

    showStats() {
        this.clear();
        this.updateInfo(null);
        document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
        let html = `<div style="width:100%; max-width:800px; margin:auto; text-align:left;">
            <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom:20px;">
                <h1 style="margin:0;">STATISTICS</h1>
                <button class="btn secondary" style="border-color:var(--error); color:var(--error); padding: 8px 16px; font-size: 0.8rem; margin:0;" onclick="App.resetAllStats()">RESET ALL</button>
            </div>
            <table class="stats-table">
                <thead>
                    <tr><th>MODULE</th><th>BEST</th><th>AVERAGE</th><th>ATTEMPTS</th><th>RESET</th></tr>
                </thead>
                <tbody>`;

        this.games.forEach(g => {
            const s = this.getStats(g.id);
            // Fix: Ensure we use the 'best' property from our saved data
            const best = (s && s.best) ? s.best : '-';
            const avg = (s && s.count > 0) ? (s.total / s.count).toFixed(1) : '-';
            const count = (s && s.count) ? s.count : 0;
            html += `<tr>
                <td>${g.name}</td>
                <td>${best !== '-' ? best + ' ' + g.unit : '-'}</td>
                <td>${avg !== '-' ? avg : '-'}</td>
                <td>${s.count}</td>
                <td><button class="icon-btn" onclick="App.resetStat('${g.id}')" title="Reset ${g.name}" style="opacity: 1;">↻</button></td>
            </tr>`;
        });
        html += `</tbody></table></div>`;
        document.getElementById('stage').innerHTML = html;
    },

    showPrivacyPolicy() {
        this.clear();
        this.updateInfo(null);
        document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('stage').innerHTML = `
        <div class="policy-doc">
            <p style="color: var(--text-dim); font-size: 0.8rem; letter-spacing: 1px;">LAST UPDATED: 20.02.2026</p>
            <h1>Privacy Policy</h1>
            
            <h2>1. Introduction</h2>
            <p>Welcome to NEURONCHARGE. We respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your information when you use our website and its cognitive performance tests. By using our website, you agree to the practices described in this policy.</p>
            
            <h2>2. Information We Collect</h2>
            <p><strong>a) Automatically Collected Information</strong><br>When you visit our website, we may automatically collect:</p>
            <ul><li>IP address</li><li>Browser type</li><li>Device type</li><li>Operating system</li><li>Pages visited</li><li>Time spent on pages</li><li>Referring website</li><li>General location (country/region level)</li></ul>
            <p>This data is collected through cookies and analytics tools.</p>
            <p><strong>b) Test Performance Data</strong><br>We may collect anonymous performance data from tests, such as:</p>
            <ul><li>Reaction times</li><li>Typing speed results</li><li>Click speed results</li><li>Memory scores</li><li>Test attempts</li><li>Average and best scores</li></ul>
            <p>This data is used for statistical and analytical purposes. We do not require users to create accounts.</p>

            <h2>3. Cookies</h2>
            <p>Our website uses cookies to:</p>
            <ul><li>Improve user experience</li><li>Remember user preferences</li><li>Store anonymous statistics</li><li>Analyse website traffic</li><li>Serve advertisements</li></ul>
            <p>Cookies are small text files stored on your device. You can disable cookies in your browser settings. However, some parts of the website may not function properly if cookies are disabled.</p>

            <h2>4. Google Analytics</h2>
            <p>We use Google Analytics to understand how users interact with our website. Google Analytics may collect: IP address, Device information, Usage data, and Website interaction behaviour. This information helps us improve performance and user experience. For more information, visit: <a href="https://policies.google.com/privacy" target="_blank" style="color:var(--text);">https://policies.google.com/privacy</a>. You can opt out of Google Analytics using browser extensions provided by Google.</p>

            <h2>5. Advertising and Third-Party Ads</h2>
            <p>Our website displays advertisements, which may include: Banner ads, Pop-up ads, and Third-party ad networks. Advertising partners may use cookies and tracking technologies to: Deliver personalized advertisements, Measure ad performance, and Analyse user interactions. We do not control third-party advertisers or their tracking technologies.</p>

            <h2>6. How We Use Your Information</h2>
            <p>We use collected information to: Improve website functionality, Analyse performance and user trends, Maintain website security, Optimize user experience, and Display relevant advertisements. We do not sell personal information to third parties.</p>

            <h2>7. Data Security</h2>
            <p>We implement reasonable technical and organizational measures to protect your information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>

            <h2>8. Children’s Privacy</h2>
            <p>Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>

            <h2>9. Third-Party Links</h2>
            <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those external websites.</p>

            <h2>10. Your Rights</h2>
            <p>Depending on your location, you may have rights regarding your personal data, including: Accessing your data, Requesting deletion, Objecting to processing, and Requesting data portability. As we do not collect personally identifiable information directly, data access or deletion requests may not apply, but if you have privacy-related concerns, you may reach us at the email provided below.</p>

            <h2>11. Changes to This Privacy Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated “Last Updated” date.</p>

            <h2>12. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:<br>Email: neuroncharge@gmail.com</p>
        </div>`;
    },

    loadGame(id) {
        this.clear();
        this.updateInfo(id);
        const stage = document.getElementById('stage');
        stage.innerHTML = `<div id="game-mount" style="text-align:center;"></div>`;
        this[`run_${id}`](document.getElementById('game-mount'));
    },

    finish(id, score, error = null) {
        this.clear();
        const stats = this.saveScore(id, parseFloat(score), error);
        const g = this.games.find(x => x.id === id);
        const avg = (stats.total / stats.count).toFixed(1);

        document.getElementById('modal').classList.remove('hidden');
        document.getElementById('score-val').textContent = score;
        document.getElementById('score-unit').textContent = g.unit;
        
        // Show Personal Best for all modules
        const bestContainer = document.getElementById('res-best').parentElement;
        bestContainer.style.display = 'block'; 
        document.getElementById('res-best').textContent = stats.best;
        
        document.getElementById('res-avg').textContent = avg;
        document.getElementById('res-count').textContent = stats.count;

        document.getElementById('btn-retry').onclick = () => this.loadGame(id);
    },

    run_reaction(m) {
        m.innerHTML = `<div id="rxn" class="target-box wait">CLICK TO START</div>`;
        const box = document.getElementById('rxn');
        let state = 'start', t0;
        
        box.onmousedown = () => {
            if (state === 'start') {
                state = 'wait'; box.className = 'target-box ready'; box.textContent = 'WAIT...';
                this.timers.push(setTimeout(() => {
                    state = 'go'; box.className = 'target-box go'; box.textContent = 'CLICK!'; t0 = Date.now();
                }, Math.random() * 2000 + 1500));
            } else if (state === 'go') { this.finish('reaction', Date.now() - t0);
            } else if (state === 'wait') {
                box.textContent = 'TOO SOON'; this.clear(); setTimeout(() => this.run_reaction(m), 1000);
            }
        };
    },

    run_cps(m) {
        m.innerHTML = `<h2>5.0s</h2><br><button id="cps-btn" class="target-box wait" style="font-size:1.5rem;">START CLICKING</button>`;
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
            btn.innerHTML = `<span style="font-size:3rem;">${clicks}</span>`;
        };
    },

    run_typing(m) {
        const paragraphs = [
            "Cognitive performance is a measure of how efficiently your brain processes information, makes decisions, and reacts to stimuli. Regular practice can improve your overall neuroplasticity.",
            "In the fast-paced digital age, typing speed and accuracy are essential skills. By practicing regularly, you can develop muscle memory and type without looking at the keys, drastically improving your workflow.",
            "The human brain is a remarkable organ, capable of continuous adaptation. When you challenge yourself with cognitive tasks, you are actively forging new neural pathways and strengthening existing ones."
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
                
                // NEW LOGIC: Only count whole, perfectly spelled words
                const targetWords = txt.split(' ');
                const typedWords = e.target.value.split(' ');
                let correctWords = 0;
                
                for(let i = 0; i < targetWords.length; i++) {
                    if (typedWords[i] === targetWords[i]) {
                        correctWords++;
                    }
                }
                
                const wpm = Math.round(correctWords / timeMin);
                this.finish('typing', wpm);
            }
        };
        setTimeout(() => document.getElementById('t-in').focus(), 100);
    },

    run_chimp(m) {
        m.innerHTML = `<button class="btn primary" id="start-chimp">START MODULE</button>`;
        document.getElementById('start-chimp').onclick = () => {
            let count = 4;
            const play = () => {
                m.innerHTML = `<div class="grid-system" style="grid-template-columns:repeat(6, 80px);"></div>`;
                const grid = m.querySelector('.grid-system');
                let pos = [...Array(36).keys()].sort(() => 0.5 - Math.random()).slice(0, count);
                let next = 1;

                pos.forEach((p, i) => {
                    const cell = document.createElement('div');
                    cell.className = 'cell active'; cell.textContent = i + 1;
                    cell.style.gridColumnStart = (p % 6) + 1; cell.style.gridRowStart = Math.floor(p / 6) + 1;
                    
                    cell.onmousedown = () => {
                        if (parseInt(cell.textContent) === next) {
                            if (next === 1) document.querySelectorAll('.cell').forEach(c => { c.classList.remove('active'); c.style.color='transparent'; });
                            cell.style.visibility = 'hidden'; next++;
                            if (next > count) { count++; play(); }
                        } else this.finish('chimp', (count - 1) < 4 ? 0 : count - 1);
                    };
                    grid.appendChild(cell);
                });
            };
            play();
        };
    },
    
    run_visual(m) {
         m.innerHTML = `<button class="btn primary" id="start-vis">START MODULE</button>`;
         document.getElementById('start-vis').onclick = () => {
            let level = 1, size = 3;
            const play = () => {
                m.innerHTML = `<div class="grid-system" id="v-grid" style="grid-template-columns:repeat(${size}, 80px);"></div>`;
                const grid = document.getElementById('v-grid');
                let count = size + 1, found = 0;
                let targets = [...Array(size*size).keys()].sort(()=>0.5-Math.random()).slice(0, count);
                
                for(let i=0; i<size*size; i++) {
                    const c = document.createElement('div'); c.className = 'cell';
                    if(targets.includes(i)) {
                        c.classList.add('active');
                        setTimeout(() => c.classList.remove('active'), 1000);
                    }
                    c.onmousedown = () => {
                        if(targets.includes(i) && !c.classList.contains('good')) {
                            c.classList.add('good'); found++;
                            if(found === count) { level++; if(level%2===0) size++; setTimeout(play, 500); }
                        } else if(!targets.includes(i)) { c.classList.add('bad'); this.finish('visual', (level - 1)); }
                    };
                    grid.appendChild(c);
                }
            };
            play();
         };
    },

    run_sequence(m) {
        m.innerHTML = `<button class="btn primary" id="start-seq">START MODULE</button>`;
        document.getElementById('start-seq').onclick = () => {
            m.innerHTML = `<div class="grid-system" id="s-grid" style="grid-template-columns:repeat(3, 90px);"></div>`;
            const grid = document.getElementById('s-grid');
            for(let i=0; i<9; i++) { const c = document.createElement('div'); c.className = 'cell'; c.dataset.i = i; grid.appendChild(c); }
            
            let seq = [];
            const turn = async () => {
                seq.push(Math.floor(Math.random()*9));
                grid.style.pointerEvents = 'none';
                for(let i of seq) {
                    await new Promise(r => setTimeout(r, 400));
                    grid.children[i].classList.add('active');
                    await new Promise(r => setTimeout(r, 400));
                    grid.children[i].classList.remove('active');
                }
                grid.style.pointerEvents = 'all';
                let idx = 0;
                grid.onmousedown = (e) => {
                    if(!e.target.classList.contains('cell')) return;
                    e.target.classList.add('active'); setTimeout(()=>e.target.classList.remove('active'), 100);
                    if(parseInt(e.target.dataset.i) === seq[idx]) {
                        idx++; if(idx===seq.length) setTimeout(turn, 500);
                    } else this.finish('sequence', seq.length - 1);
                };
            };
            turn();
        };
    },

    run_number(m) {
        m.innerHTML = `<button class="btn primary" id="start-num">START MODULE</button>`;
        document.getElementById('start-num').onclick = () => {
            let digits = 3;
            const play = () => {
                const num = Math.floor(Math.random() * Math.pow(10, digits)).toString().padStart(digits, '0');
                m.innerHTML = `<div class="number-display">${num}</div>`;
                
                this.timers.push(setTimeout(() => {
                    m.innerHTML = `
                        <p style="color:var(--text-dim); margin-bottom:10px;">What was the number?</p>
                        <input id="n-in" class="typing-input" style="text-align:center;" type="number">
                        <br><br><button id="n-sub" class="btn primary">SUBMIT</button>
                    `;
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
        m.innerHTML = `<button class="btn primary" id="start-str">START MODULE</button>`;
        document.getElementById('start-str').onclick = () => {
            let score = 0, time = 20;
            const colors = ['Red', 'Blue', 'Green', 'Yellow'];
            const colorMap = { 'Red': '#ff3333', 'Blue': '#3388ff', 'Green': '#00ff00', 'Yellow': '#ffcc00' };
            
            this.timers.push(setInterval(() => {
                time--;
                const tDisp = document.getElementById('str-time');
                if(tDisp) tDisp.textContent = time + 's';
                if(time <= 0) this.finish('stroop', score);
            }, 1000));

            const next = () => {
                const word = colors[Math.floor(Math.random() * colors.length)];
                const ink = colors[Math.floor(Math.random() * colors.length)];
                
                let html = `<div style="display:flex; justify-content:space-between; width:300px; margin: 0 auto 20px auto; color:var(--text-dim);">
                    <span>TIME: <span id="str-time" style="color:var(--text);">${time}s</span></span>
                    <span>SCORE: <span style="color:var(--text);">${score}</span></span>
                </div>`;
                html += `<div class="stroop-word" style="color:${colorMap[ink]};">${word}</div><div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; max-width: 300px; margin: auto;">`;
                
                colors.forEach(c => {
                    html += `<button class="btn secondary str-btn" data-c="${c}">${c.toUpperCase()}</button>`;
                });
                html += `</div>`;
                m.innerHTML = html;

                m.querySelectorAll('.str-btn').forEach(btn => {
                    btn.onclick = (e) => {
                        if (e.target.dataset.c === ink) score++; else score;
                        next();
                    };
                });
            };
            next();
        };
    },

    run_estimation(m) {
        // We start with null so we know nothing is selected yet
        if (this.estimationTarget === undefined) this.estimationTarget = null;

        const render = () => {
            m.innerHTML = `
                <div style="margin-bottom:30px;">
                    <button class="btn ${this.estimationTarget===3000 ? 'primary' : 'secondary'} est-opt" data-t="3000">3 SECONDS</button>
                    <button class="btn ${this.estimationTarget===5000 ? 'primary' : 'secondary'} est-opt" data-t="5000">5 SECONDS</button>
                    <button class="btn ${this.estimationTarget===10000 ? 'primary' : 'secondary'} est-opt" data-t="10000">10 SECONDS</button>
                </div>
                <div id="est-box" class="target-box ${this.estimationTarget ? 'wait' : 'locked'}" style="margin: auto;">
                    ${this.estimationTarget ? 'CLICK TO START' : 'SELECT A TIME ABOVE'}
                </div>
            `;
            
            m.querySelectorAll('.est-opt').forEach(btn => {
                btn.onclick = (e) => { 
                    const newTarget = parseInt(e.target.dataset.t);
                    if (this.estimationTarget !== newTarget) {
                        this.estimationTarget = newTarget;
                        // Optional: Reset stats only if switching times
                        const data = JSON.parse(localStorage.getItem('nc_stats')) || {};
                        delete data['estimation'];
                        localStorage.setItem('nc_stats', JSON.stringify(data));
                    }
                    render(); 
                };
            });

            const box = document.getElementById('est-box');
            let state = 'start', t0;
            
            box.onmousedown = () => {
                // The condition: only run if a target is selected
                if (!this.estimationTarget) return; 

                if (state === 'start') {
                    state = 'timing';
                    box.className = 'target-box ready';
                    box.innerHTML = 'TIMING...<br><span style="font-size:1rem; font-weight:normal;">Click to stop</span>';
                    t0 = Date.now();
                } else if (state === 'timing') {
                    const actualTime = Date.now() - t0;
                    const error = Math.abs(actualTime - this.estimationTarget); 
                    this.finish('estimation', actualTime, error);
                }
            };
        };
        render();
    },
};

window.onload = () => App.init();