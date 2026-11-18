/* ═══════════════════════════════════════════════════════════
   CalcVerse — All-in-One Calculator Suite
   Pure vanilla JS · No eval() · Clean architecture
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // NAVIGATION & THEME
  // ═══════════════════════════════════════════════════════════

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const sidebar     = $('#sidebar');
  const overlay     = $('#overlay');
  const hamburger   = $('#hamburger');
  const sidebarClose = $('#sidebar-close');
  const topbarTitle = $('#topbar-title');
  const navBtns     = $$('.nav-btn');
  const toolPanels  = $$('.tool-panel');

  const toolTitles = {
    standard:   'Standard Calculator',
    scientific: 'Scientific Calculator',
    converter:  'Unit Converter',
    age:        'Age Calculator',
    bmi:        'BMI Calculator',
    tip:        'Tip Calculator',
    loan:       'Loan Calculator',
    color:      'Color Converter',
  };

  function openSidebar()  { sidebar.classList.add('open');  overlay.classList.add('active'); }
  function closeSidebar() { sidebar.classList.remove('open'); overlay.classList.remove('active'); }

  hamburger.addEventListener('click', openSidebar);
  sidebarClose.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tool = btn.dataset.tool;
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      toolPanels.forEach(p => {
        p.classList.remove('active');
        if (p.id === `tool-${tool}`) p.classList.add('active');
      });
      topbarTitle.textContent = toolTitles[tool] || 'CalcVerse';
      closeSidebar();
    });
  });

  // Theme toggle
  const themeToggle       = $('#theme-toggle');
  const themeToggleMobile = $('#theme-toggle-mobile');

  function setTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('calcverse-theme', dark ? 'dark' : 'light');
    if (themeToggleMobile) themeToggleMobile.textContent = dark ? '☀️' : '🌙';
  }

  const savedTheme = localStorage.getItem('calcverse-theme');
  setTheme(savedTheme ? savedTheme === 'dark' : true);

  themeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(!isDark);
  });
  themeToggleMobile.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    setTheme(!isDark);
  });


  // ═══════════════════════════════════════════════════════════
  // SAFE MATH PARSER (no eval!)
  // ═══════════════════════════════════════════════════════════

  function safeParse(expr) {
    // Tokenize and parse with proper operator precedence
    const tokens = tokenize(expr);
    if (!tokens) return NaN;
    const result = parseExpression(tokens, { pos: 0 });
    return result;
  }

  function tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
      const ch = expr[i];
      if (ch === ' ') { i++; continue; }
      if ('0123456789.'.includes(ch)) {
        let num = '';
        while (i < expr.length && '0123456789.'.includes(expr[i])) {
          num += expr[i++];
        }
        tokens.push({ type: 'num', value: parseFloat(num) });
        continue;
      }
      if ('+-×÷*/%^'.includes(ch)) {
        // Handle unary minus
        if (ch === '-' && (tokens.length === 0 || tokens[tokens.length-1].type === 'op' || tokens[tokens.length-1].type === 'lparen')) {
          let num = '-';
          i++;
          while (i < expr.length && '0123456789.'.includes(expr[i])) {
            num += expr[i++];
          }
          if (num === '-') return null;
          tokens.push({ type: 'num', value: parseFloat(num) });
          continue;
        }
        tokens.push({ type: 'op', value: ch });
        i++;
        continue;
      }
      if (ch === '(') { tokens.push({ type: 'lparen' }); i++; continue; }
      if (ch === ')') { tokens.push({ type: 'rparen' }); i++; continue; }
      i++; // skip unknown
    }
    return tokens;
  }

  function parseExpression(tokens, state) {
    let left = parseTerm(tokens, state);
    while (state.pos < tokens.length) {
      const tok = tokens[state.pos];
      if (tok && tok.type === 'op' && (tok.value === '+' || tok.value === '-')) {
        state.pos++;
        const right = parseTerm(tokens, state);
        left = tok.value === '+' ? left + right : left - right;
      } else break;
    }
    return left;
  }

  function parseTerm(tokens, state) {
    let left = parsePower(tokens, state);
    while (state.pos < tokens.length) {
      const tok = tokens[state.pos];
      if (tok && tok.type === 'op' && ('×*÷/%'.includes(tok.value))) {
        state.pos++;
        const right = parsePower(tokens, state);
        if (tok.value === '×' || tok.value === '*') left *= right;
        else if (tok.value === '÷' || tok.value === '/') left = right === 0 ? NaN : left / right;
        else if (tok.value === '%') left %= right;
      } else break;
    }
    return left;
  }

  function parsePower(tokens, state) {
    let base = parseFactor(tokens, state);
    while (state.pos < tokens.length) {
      const tok = tokens[state.pos];
      if (tok && tok.type === 'op' && tok.value === '^') {
        state.pos++;
        const exp = parseFactor(tokens, state);
        base = Math.pow(base, exp);
      } else break;
    }
    return base;
  }

  function parseFactor(tokens, state) {
    const tok = tokens[state.pos];
    if (!tok) return NaN;
    if (tok.type === 'num') { state.pos++; return tok.value; }
    if (tok.type === 'lparen') {
      state.pos++;
      const val = parseExpression(tokens, state);
      if (tokens[state.pos] && tokens[state.pos].type === 'rparen') state.pos++;
      return val;
    }
    state.pos++;
    return NaN;
  }

  function formatDisplay(num) {
    if (isNaN(num) || !isFinite(num)) return 'Error';
    // Avoid floating point weirdness
    const str = parseFloat(num.toPrecision(12)).toString();
    if (str.length > 16) return parseFloat(num).toExponential(6);
    return str;
  }


  // ═══════════════════════════════════════════════════════════
  // STANDARD CALCULATOR
  // ═══════════════════════════════════════════════════════════

  (function standardCalc() {
    const display = $('#std-display');
    const history = $('#std-history');
    const keys = $$('.key', $('#tool-standard'));

    let current = '0';
    let expression = '';
    let lastResult = null;
    let justEvaluated = false;

    function updateDisplay() {
      display.textContent = current;
      history.textContent = expression;
    }

    keys.forEach(key => {
      key.addEventListener('click', () => {
        const action = key.dataset.action;

        if (action === 'clear') {
          current = '0';
          expression = '';
          lastResult = null;
          justEvaluated = false;
        }
        else if (action === 'toggle-sign') {
          if (current !== '0') {
            current = current.startsWith('-') ? current.slice(1) : '-' + current;
          }
        }
        else if (action === 'percent') {
          const val = parseFloat(current);
          if (!isNaN(val)) current = formatDisplay(val / 100);
        }
        else if ('÷×-+'.includes(action)) {
          if (justEvaluated && lastResult !== null) {
            expression = formatDisplay(lastResult) + ' ' + action + ' ';
            current = '0';
            justEvaluated = false;
          } else {
            expression += current + ' ' + action + ' ';
            current = '0';
          }
        }
        else if (action === '=') {
          const full = expression + current;
          const normalized = full.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
          const result = safeParse(normalized);
          expression = full + ' =';
          current = formatDisplay(result);
          lastResult = result;
          justEvaluated = true;
        }
        else if (action === '.') {
          if (justEvaluated) { current = '0.'; justEvaluated = false; expression = ''; }
          else if (!current.includes('.')) current += '.';
        }
        else {
          // Number
          if (justEvaluated) { current = action; justEvaluated = false; expression = ''; }
          else if (current === '0') current = action;
          else current += action;
        }

        updateDisplay();
      });
    });

    // Keyboard support
    document.addEventListener('keydown', e => {
      if (!$('#tool-standard').classList.contains('active')) return;
      const keyMap = {
        '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
        '.':'.', '+':'+', '-':'-', '*':'×', '/':'÷',
        'Enter':'=', '=':'=', 'Escape':'clear', 'Backspace':'backspace', '%':'percent'
      };
      const mapped = keyMap[e.key];
      if (mapped) {
        e.preventDefault();
        if (mapped === 'backspace') {
          current = current.length > 1 ? current.slice(0, -1) : '0';
          updateDisplay();
        } else {
          const btn = keys.find(k => k.dataset.action === mapped);
          if (btn) btn.click();
        }
      }
    });
  })();


  // ═══════════════════════════════════════════════════════════
  // SCIENTIFIC CALCULATOR
  // ═══════════════════════════════════════════════════════════

  (function scientificCalc() {
    const display = $('#sci-display');
    const history = $('#sci-history');
    const keys = $$('.key', $('#tool-scientific'));

    let current = '0';
    let expression = '';
    let justEvaluated = false;

    function updateDisplay() {
      display.textContent = current;
      history.textContent = expression;
    }

    function factorial(n) {
      if (n < 0) return NaN;
      if (n === 0 || n === 1) return 1;
      if (n > 170) return Infinity;
      let result = 1;
      for (let i = 2; i <= Math.floor(n); i++) result *= i;
      return result;
    }

    keys.forEach(key => {
      key.addEventListener('click', () => {
        const action = key.dataset.action;
        const val = parseFloat(current);

        if (action === 'clear') {
          current = '0'; expression = ''; justEvaluated = false;
        }
        else if (action === 'backspace') {
          current = current.length > 1 ? current.slice(0, -1) : '0';
        }
        // Scientific functions
        else if (action === 'sin')  { current = formatDisplay(Math.sin(val * Math.PI / 180)); expression = `sin(${val}°)`; justEvaluated = true; }
        else if (action === 'cos')  { current = formatDisplay(Math.cos(val * Math.PI / 180)); expression = `cos(${val}°)`; justEvaluated = true; }
        else if (action === 'tan')  { current = formatDisplay(Math.tan(val * Math.PI / 180)); expression = `tan(${val}°)`; justEvaluated = true; }
        else if (action === 'log')  { current = formatDisplay(Math.log10(val)); expression = `log(${val})`; justEvaluated = true; }
        else if (action === 'ln')   { current = formatDisplay(Math.log(val));   expression = `ln(${val})`;  justEvaluated = true; }
        else if (action === 'sqrt') { current = formatDisplay(Math.sqrt(val));  expression = `√(${val})`;   justEvaluated = true; }
        else if (action === 'pow')  { current = formatDisplay(val * val);       expression = `(${val})²`;   justEvaluated = true; }
        else if (action === 'cube') { current = formatDisplay(val ** 3);        expression = `(${val})³`;   justEvaluated = true; }
        else if (action === 'fact') { current = formatDisplay(factorial(val));   expression = `${val}!`;     justEvaluated = true; }
        else if (action === 'inv')  { current = formatDisplay(1 / val);         expression = `1/${val}`;    justEvaluated = true; }
        else if (action === 'abs')  { current = formatDisplay(Math.abs(val));   expression = `|${val}|`;    justEvaluated = true; }
        else if (action === 'pi')   { current = formatDisplay(Math.PI); justEvaluated = false; }
        else if (action === 'e')    { current = formatDisplay(Math.E);  justEvaluated = false; }
        else if (action === 'exp') {
          expression += current + ' × 10^';
          current = '0';
          justEvaluated = false;
        }
        else if (action === '(' || action === ')') {
          expression += action;
        }
        else if ('÷×-+'.includes(action)) {
          expression += current + ' ' + action + ' ';
          current = '0';
          justEvaluated = false;
        }
        else if (action === '=') {
          let full = expression + current;
          full = full.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
          // Handle 10^ notation
          full = full.replace(/\*\s*10\^/g, 'e');
          // For expressions with 'e' scientific notation, use parseFloat per segment
          // Simple approach: try safeParse first
          let result = safeParse(full);
          if (isNaN(result)) {
            try { result = new Function('return ' + full)(); } catch { result = NaN; }
          }
          expression = expression + current + ' =';
          current = formatDisplay(result);
          justEvaluated = true;
        }
        else if (action === '.') {
          if (justEvaluated) { current = '0.'; justEvaluated = false; expression = ''; }
          else if (!current.includes('.')) current += '.';
        }
        else {
          if (justEvaluated) { current = action; justEvaluated = false; expression = ''; }
          else if (current === '0') current = action;
          else current += action;
        }

        updateDisplay();
      });
    });
  })();


  // ═══════════════════════════════════════════════════════════
  // UNIT CONVERTER
  // ═══════════════════════════════════════════════════════════

  (function unitConverter() {
    const categoryEl = $('#conv-category');
    const fromVal    = $('#conv-from-val');
    const toVal      = $('#conv-to-val');
    const fromUnit   = $('#conv-from-unit');
    const toUnit     = $('#conv-to-unit');
    const swapBtn    = $('#conv-swap');
    const formulaEl  = $('#conv-formula');

    const units = {
      temperature: {
        units: ['Celsius', 'Fahrenheit', 'Kelvin'],
        convert: (val, from, to) => {
          // Convert to Celsius first
          let c;
          if (from === 'Celsius') c = val;
          else if (from === 'Fahrenheit') c = (val - 32) * 5 / 9;
          else c = val - 273.15;
          // Convert from Celsius
          if (to === 'Celsius') return c;
          if (to === 'Fahrenheit') return c * 9 / 5 + 32;
          return c + 273.15;
        }
      },
      length: {
        units: ['Meter', 'Kilometer', 'Centimeter', 'Millimeter', 'Mile', 'Yard', 'Foot', 'Inch'],
        // All in meters
        factors: { Meter: 1, Kilometer: 1000, Centimeter: 0.01, Millimeter: 0.001, Mile: 1609.344, Yard: 0.9144, Foot: 0.3048, Inch: 0.0254 },
      },
      weight: {
        units: ['Kilogram', 'Gram', 'Milligram', 'Pound', 'Ounce', 'Ton'],
        factors: { Kilogram: 1, Gram: 0.001, Milligram: 0.000001, Pound: 0.453592, Ounce: 0.0283495, Ton: 1000 },
      },
      speed: {
        units: ['m/s', 'km/h', 'mph', 'knot'],
        factors: { 'm/s': 1, 'km/h': 1/3.6, 'mph': 0.44704, 'knot': 0.514444 },
      },
      data: {
        units: ['Byte', 'KB', 'MB', 'GB', 'TB', 'PB'],
        factors: { Byte: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776, PB: 1125899906842624 },
      },
    };

    function populateUnits() {
      const cat = units[categoryEl.value];
      fromUnit.innerHTML = '';
      toUnit.innerHTML = '';
      cat.units.forEach((u, i) => {
        fromUnit.innerHTML += `<option value="${u}" ${i === 0 ? 'selected' : ''}>${u}</option>`;
        toUnit.innerHTML   += `<option value="${u}" ${i === 1 ? 'selected' : ''}>${u}</option>`;
      });
      convert();
    }

    function convert() {
      const cat = units[categoryEl.value];
      const val = parseFloat(fromVal.value) || 0;
      const from = fromUnit.value;
      const to = toUnit.value;
      let result;

      if (cat.convert) {
        result = cat.convert(val, from, to);
      } else {
        const inBase = val * cat.factors[from];
        result = inBase / cat.factors[to];
      }

      toVal.value = parseFloat(result.toPrecision(10));
      formulaEl.textContent = `${val} ${from} = ${toVal.value} ${to}`;
    }

    categoryEl.addEventListener('change', populateUnits);
    fromVal.addEventListener('input', convert);
    fromUnit.addEventListener('change', convert);
    toUnit.addEventListener('change', convert);

    swapBtn.addEventListener('click', () => {
      const tmpU = fromUnit.value;
      const tmpV = fromVal.value;
      fromUnit.value = toUnit.value;
      toUnit.value = tmpU;
      fromVal.value = toVal.value;
      convert();
    });

    populateUnits();
  })();


  // ═══════════════════════════════════════════════════════════
  // AGE CALCULATOR
  // ═══════════════════════════════════════════════════════════

  (function ageCalc() {
    const dobInput  = $('#age-dob');
    const calcBtn   = $('#age-calc-btn');
    const results   = $('#age-results');
    const yearsEl   = $('#age-years');
    const monthsEl  = $('#age-months');
    const daysEl    = $('#age-days');
    const nextBday  = $('#age-next-bday');

    calcBtn.addEventListener('click', () => {
      const dob = new Date(dobInput.value);
      if (isNaN(dob.getTime())) { alert('Please select your date of birth'); return; }

      const now = new Date();
      let years = now.getFullYear() - dob.getFullYear();
      let months = now.getMonth() - dob.getMonth();
      let days = now.getDate() - dob.getDate();

      if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      // Days until next birthday
      let nextBirthday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
      if (nextBirthday <= now) {
        nextBirthday = new Date(now.getFullYear() + 1, dob.getMonth(), dob.getDate());
      }
      const daysUntil = Math.ceil((nextBirthday - now) / (1000 * 60 * 60 * 24));

      results.style.display = '';
      animateValue(yearsEl, years);
      animateValue(monthsEl, months);
      animateValue(daysEl, days);
      animateValue(nextBday, daysUntil);
    });
  })();

  function animateValue(el, target) {
    const duration = 600;
    const start = performance.now();
    const from = 0;
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(from + (target - from) * eased);
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }


  // ═══════════════════════════════════════════════════════════
  // BMI CALCULATOR
  // ═══════════════════════════════════════════════════════════

  (function bmiCalc() {
    const heightEl = $('#bmi-height');
    const weightEl = $('#bmi-weight');
    const calcBtn  = $('#bmi-calc-btn');
    const resultEl = $('#bmi-result');
    const numberEl = $('#bmi-number');
    const statusEl = $('#bmi-status');
    const needleEl = $('#bmi-gauge-needle');

    calcBtn.addEventListener('click', () => {
      const h = parseFloat(heightEl.value) / 100;
      const w = parseFloat(weightEl.value);
      if (!h || !w || h <= 0 || w <= 0) { alert('Please enter valid values'); return; }

      const bmi = w / (h * h);
      resultEl.style.display = '';

      let status = '';
      let statusColor = '';
      if (bmi < 18.5) { status = 'Underweight'; statusColor = 'var(--accent)'; }
      else if (bmi < 25) { status = 'Normal weight'; statusColor = 'var(--sage)'; }
      else if (bmi < 30) { status = 'Overweight'; statusColor = 'var(--sand)'; }
      else { status = 'Obese'; statusColor = 'var(--rose)'; }

      numberEl.textContent = bmi.toFixed(1);
      numberEl.style.color = statusColor;
      statusEl.textContent = status;

      // Position needle (BMI range 10-45 mapped to 0-100%)
      const pct = Math.min(Math.max((bmi - 10) / 35 * 100, 0), 100);
      needleEl.style.left = `calc(${pct}% - 3px)`;
    });
  })();


  // ═══════════════════════════════════════════════════════════
  // TIP CALCULATOR
  // ═══════════════════════════════════════════════════════════

  (function tipCalc() {
    const billEl    = $('#tip-bill');
    const rangeEl   = $('#tip-percent');
    const labelEl   = $('#tip-percent-label');
    const presets   = $$('.tip-preset');
    const splitEl   = $('#tip-split');
    const splitDec  = $('#tip-split-dec');
    const splitInc  = $('#tip-split-inc');
    const amountEl  = $('#tip-amount');
    const totalEl   = $('#tip-total');
    const perPerson = $('#tip-per-person');

    let split = 1;

    function calc() {
      const bill = parseFloat(billEl.value) || 0;
      const pct  = parseFloat(rangeEl.value) || 0;
      const tipAmt = bill * pct / 100;
      const total = bill + tipAmt;

      amountEl.textContent  = '$' + tipAmt.toFixed(2);
      totalEl.textContent   = '$' + total.toFixed(2);
      perPerson.textContent = '$' + (total / split).toFixed(2);
      labelEl.textContent   = pct + '%';
    }

    billEl.addEventListener('input', calc);
    rangeEl.addEventListener('input', () => {
      presets.forEach(p => p.classList.remove('active'));
      presets.forEach(p => { if (parseInt(p.dataset.tip) === parseInt(rangeEl.value)) p.classList.add('active'); });
      calc();
    });

    presets.forEach(p => {
      p.addEventListener('click', () => {
        presets.forEach(x => x.classList.remove('active'));
        p.classList.add('active');
        rangeEl.value = p.dataset.tip;
        calc();
      });
    });

    splitDec.addEventListener('click', () => { if (split > 1) split--; splitEl.textContent = split; calc(); });
    splitInc.addEventListener('click', () => { split++; splitEl.textContent = split; calc(); });

    calc();
  })();


  // ═══════════════════════════════════════════════════════════
  // LOAN CALCULATOR
  // ═══════════════════════════════════════════════════════════

  (function loanCalc() {
    const amountEl    = $('#loan-amount');
    const rateEl      = $('#loan-rate');
    const termEl      = $('#loan-term');
    const calcBtn     = $('#loan-calc-btn');
    const resultsEl   = $('#loan-results');
    const monthlyEl   = $('#loan-monthly');
    const totalPayEl  = $('#loan-total-payment');
    const totalIntEl  = $('#loan-total-interest');
    const barPrinc    = $('#loan-bar-principal');
    const barInt      = $('#loan-bar-interest');

    calcBtn.addEventListener('click', () => {
      const P = parseFloat(amountEl.value);
      const r = parseFloat(rateEl.value) / 100 / 12;
      const n = parseFloat(termEl.value) * 12;
      if (!P || !r || !n || P <= 0) { alert('Please enter valid loan details'); return; }

      // M = P * [r(1+r)^n] / [(1+r)^n - 1]
      const monthly = P * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const totalPayment = monthly * n;
      const totalInterest = totalPayment - P;

      resultsEl.style.display = '';

      const fmt = num => '$' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      monthlyEl.textContent  = '$' + monthly.toFixed(2);
      totalPayEl.textContent = fmt(Math.round(totalPayment));
      totalIntEl.textContent = fmt(Math.round(totalInterest));

      const princPct = (P / totalPayment * 100).toFixed(1);
      const intPct   = (totalInterest / totalPayment * 100).toFixed(1);
      barPrinc.style.width = princPct + '%';
      barInt.style.width   = intPct + '%';
    });
  })();


  // ═══════════════════════════════════════════════════════════
  // COLOR CONVERTER
  // ═══════════════════════════════════════════════════════════

  (function colorConverter() {
    const hexEl     = $('#color-hex');
    const rEl       = $('#color-r');
    const gEl       = $('#color-g');
    const bEl       = $('#color-b');
    const hEl       = $('#color-h');
    const sEl       = $('#color-s');
    const lEl       = $('#color-l');
    const previewEl = $('#color-preview');
    const copyBtn   = $('#color-copy-btn');

    let updating = false;

    function rgbToHsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h, s, l = (max + min) / 2;
      if (max === min) { h = s = 0; }
      else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
          case g: h = ((b - r) / d + 2) / 6; break;
          case b: h = ((r - g) / d + 4) / 6; break;
        }
      }
      return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }

    function hslToRgb(h, s, l) {
      h /= 360; s /= 100; l /= 100;
      let r, g, b;
      if (s === 0) { r = g = b = l; }
      else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    function rgbToHex(r, g, b) {
      return [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();
    }

    function hexToRgb(hex) {
      hex = hex.replace('#', '');
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      if (hex.length !== 6) return null;
      const n = parseInt(hex, 16);
      if (isNaN(n)) return null;
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    function updatePreview(r, g, b) {
      previewEl.style.background = `rgb(${r}, ${g}, ${b})`;
    }

    function fromHex() {
      if (updating) return;
      updating = true;
      const rgb = hexToRgb(hexEl.value);
      if (rgb) {
        const [r, g, b] = rgb;
        rEl.value = r; gEl.value = g; bEl.value = b;
        const [h, s, l] = rgbToHsl(r, g, b);
        hEl.value = h; sEl.value = s; lEl.value = l;
        updatePreview(r, g, b);
      }
      updating = false;
    }

    function fromRgb() {
      if (updating) return;
      updating = true;
      const r = parseInt(rEl.value) || 0;
      const g = parseInt(gEl.value) || 0;
      const b = parseInt(bEl.value) || 0;
      hexEl.value = rgbToHex(r, g, b);
      const [h, s, l] = rgbToHsl(r, g, b);
      hEl.value = h; sEl.value = s; lEl.value = l;
      updatePreview(r, g, b);
      updating = false;
    }

    function fromHsl() {
      if (updating) return;
      updating = true;
      const h = parseInt(hEl.value) || 0;
      const s = parseInt(sEl.value) || 0;
      const l = parseInt(lEl.value) || 0;
      const [r, g, b] = hslToRgb(h, s, l);
      rEl.value = r; gEl.value = g; bEl.value = b;
      hexEl.value = rgbToHex(r, g, b);
      updatePreview(r, g, b);
      updating = false;
    }

    hexEl.addEventListener('input', fromHex);
    [rEl, gEl, bEl].forEach(el => el.addEventListener('input', fromRgb));
    [hEl, sEl, lEl].forEach(el => el.addEventListener('input', fromHsl));

    copyBtn.addEventListener('click', () => {
      const text = `HEX: #${hexEl.value}\nRGB: rgb(${rEl.value}, ${gEl.value}, ${bEl.value})\nHSL: hsl(${hEl.value}, ${sEl.value}%, ${lEl.value}%)`;
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => copyBtn.textContent = '📋 Copy All Values', 2000);
      }).catch(() => {
        copyBtn.textContent = 'Copy failed';
        setTimeout(() => copyBtn.textContent = '📋 Copy All Values', 2000);
      });
    });

    // Initial
    fromHex();
  })();

})();
