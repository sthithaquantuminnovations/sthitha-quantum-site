/* Interactions: reveals, navigation, demo loop, sticky features, carousel, counters, accordion, forms. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

  /* ---------- Word-by-word reveal ---------- */

  function splitWords(el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var span = document.createElement('span');
            span.className = 'w'; span.style.setProperty('--i', i++); span.textContent = part;
            frag.appendChild(span);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1 && child.tagName !== 'BR') {
          walk(child);
        }
      });
    })(el);
  }

  $$('[data-reveal]').forEach(splitWords);

  var revealer = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      revealer.unobserve(e.target);
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });
  $$('[data-reveal], [data-fade]').forEach(function (el) { revealer.observe(el); });

  /* ---------- Navigation ---------- */

  $$('.nav-item.has-panel').forEach(function (item) {
    var link = $('.nav-link', item), timer;
    function set(open) {
      clearTimeout(timer);
      item.classList.toggle('open', open);
      link.setAttribute('aria-expanded', open);
    }
    item.addEventListener('mouseenter', function () { set(true); });
    item.addEventListener('mouseleave', function () { timer = setTimeout(function () { set(false); }, 120); });
    item.addEventListener('focusin', function () { set(true); });
    item.addEventListener('focusout', function (e) { if (!item.contains(e.relatedTarget)) set(false); });
    item.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); link.focus(); } });
    // On touch, the first tap opens the panel and the second follows the link.
    link.addEventListener('click', function (e) {
      if (window.matchMedia('(hover: none)').matches && !item.classList.contains('open')) { e.preventDefault(); set(true); }
    });
  });

  var toggle = $('.menu-toggle');
  if (toggle) {
    var setMenu = function (open) {
      document.documentElement.classList.toggle('menu-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      toggle.setAttribute('aria-expanded', open);
    };
    toggle.addEventListener('click', function () { setMenu(!document.documentElement.classList.contains('menu-open')); });
    $$('.mobile-menu a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth > 899) setMenu(false); });
  }

  /* ---------- Marquees: duplicate content so the loop is seamless ---------- */

  $$('[data-loop]').forEach(function (el) {
    var clone = el.cloneNode(true);
    clone.removeAttribute('data-loop'); clone.setAttribute('aria-hidden', 'true');
    if (el.tagName === 'UL' && el.parentNode.classList.contains('panel-list')) {
      // vertical list: repeat the items inside the same list
      Array.prototype.slice.call(clone.children).forEach(function (li) { el.appendChild(li); });
    } else {
      el.parentNode.appendChild(clone);
    }
  });

  /* ---------- Discover demo loop ---------- */

  var demo = $('[data-demo]');
  if (demo) {
    var typed = $('.demo-typed', demo), query = typed.getAttribute('data-query');
    var running = false, onScreen = false;

    var play = async function () {
      if (running) return;
      running = true;
      while (onScreen) {
        demo.setAttribute('data-state', 'typing');
        typed.textContent = '';
        await wait(1100);
        for (var i = 1; i <= query.length; i++) {
          typed.textContent = query.slice(0, i);
          await wait(28 + Math.random() * 46);
        }
        await wait(450);
        demo.setAttribute('data-state', 'thinking');
        await wait(1700);
        demo.setAttribute('data-state', 'results');
        await wait(6200);
        demo.setAttribute('data-state', 'out');
        await wait(750);
      }
      running = false;
    };

    if (reduce) {
      typed.textContent = query;
      demo.setAttribute('data-state', 'results');
    } else {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) play();
      }, { threshold: 0.35 }).observe(demo);
    }
  }

  /* ---------- Sticky feature scroller ---------- */

  var features = $('.features');
  if (features) {
    var items = $$('.feature', features), tabs = $$('.features-tabs a', features);
    var tape = $('.ruler-tape', features), labels = [], STEP = 110, MINOR = 10;

    if (tape) {
      items.forEach(function (_, i) {
        var label = document.createElement('span');
        label.className = 'ruler-label'; label.textContent = ('0' + (i + 1)).slice(-2);
        label.style.top = i * STEP + 'px'; label.style.right = '10px';
        tape.appendChild(label); labels.push(label);
        if (i === items.length - 1) return;
        for (var m = 1; m < MINOR; m++) {
          var tick = document.createElement('i');
          tick.className = 'ruler-tick' + (m === 1 || m === MINOR - 1 ? ' major' : '');
          tick.style.top = i * STEP + m * (STEP / MINOR) + 'px';
          tape.appendChild(tick);
        }
      });
    }

    var current = -1;
    var activate = function (idx) {
      if (idx === current) return;
      current = idx;
      window.dispatchEvent(new CustomEvent('features:change', { detail: idx }));
      items.forEach(function (el, i) { el.classList.toggle('active', i === idx); });
      labels.forEach(function (el, i) { el.classList.toggle('active', i === idx); });
      tabs.forEach(function (el, i) { el.classList.toggle('active', i === idx); });
    };

    var desktop = window.matchMedia('(min-width: 900px)');
    var ticking = false;
    var update = function () {
      ticking = false;
      var rect = features.getBoundingClientRect();
      if (desktop.matches) {
        var range = features.offsetHeight - window.innerHeight;
        var p = Math.min(1, Math.max(0, (0 - rect.top) / (range || 1)));
        activate(Math.min(items.length - 1, Math.floor(p * items.length)));
        if (tape) tape.style.transform = 'translateY(' + (-p * STEP * (items.length - 1)).toFixed(1) + 'px)';
      } else {
        // stacked layout: the active tab is the last feature whose top has passed the tab bar
        var idx = 0;
        items.forEach(function (el, i) { if (el.getBoundingClientRect().top < window.innerHeight * 0.45) idx = i; });
        activate(idx);
      }
    };
    var onScroll = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  /* ---------- Capability tiles light up at random ---------- */

  var tiles = $$('.tile');
  if (tiles.length && !reduce) {
    setInterval(function () {
      var t = tiles[Math.floor(Math.random() * tiles.length)];
      t.classList.add('on');
      setTimeout(function () { t.classList.remove('on'); }, 1800);
    }, 650);
  }

  /* ---------- Carousel ---------- */

  $$('[data-carousel]').forEach(function (root) {
    var slides = $$('.proof-slide', root), prev = $('[data-prev]', root), next = $('[data-next]', root), idx = 0;
    function go(n) {
      idx = Math.max(0, Math.min(slides.length - 1, n));
      slides.forEach(function (s, i) {
        var on = i === idx;
        s.classList.toggle('active', on);
        s.setAttribute('aria-hidden', !on);
        $$('[data-reveal]', s).forEach(function (el) {
          el.classList.remove('in');
          if (on) requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('in'); }); });
        });
      });
      prev.disabled = idx === 0; next.disabled = idx === slides.length - 1;
    }
    prev.addEventListener('click', function () { go(idx - 1); });
    next.addEventListener('click', function () { go(idx + 1); });
    slides.forEach(function (s, i) { s.setAttribute('aria-hidden', i !== 0); });
    prev.disabled = true;
    // slides are revealed by the carousel, not by the scroll observer, once it has been used
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') go(idx - 1);
      if (e.key === 'ArrowRight') go(idx + 1);
    });
  });

  /* ---------- Count-up numbers ---------- */

  var counter = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      counter.unobserve(e.target);
      var el = e.target, end = parseFloat(el.getAttribute('data-count')), dec = +(el.getAttribute('data-decimals') || 0);
      var pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
      var fmt = function (v) { return pre + v.toLocaleString('en-IN', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + suf; };
      if (reduce) { el.textContent = fmt(end); return; }
      var t0 = performance.now(), dur = 1600;
      (function step(now) {
        var p = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(end * eased);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach(function (el) { counter.observe(el); });

  /* ---------- Accordion ---------- */

  $$('.faq-item').forEach(function (item) {
    var btn = $('.faq-q', item);
    btn.addEventListener('click', function () {
      var open = !item.classList.contains('open');
      $$('.faq-item.open', item.parentNode).forEach(function (other) {
        other.classList.remove('open'); $('.faq-q', other).setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open);
    });
  });

  /* ---------- Hover: cursor-tracked effects (mouse / trackpad only) ---------- */

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    // Cards carry the cursor position, so CSS can paint a glow and a lit border under it.
    var GLOW = '.cell, .panel, .s-card, .hybrid-box, .alert, .demo-prompt, .demo-results, .media, .hero-stat, .diagram, .post-row, .tile, .nav-card';
    $$(GLOW).forEach(function (el) { el.classList.add('glow'); });
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest ? e.target.closest('.glow') : null;
      while (el) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left).toFixed(1) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top).toFixed(1) + 'px');
        el = el.parentElement ? el.parentElement.closest('.glow') : null;
      }
    }, { passive: true });

    // Primary buttons lean toward the cursor.
    $$('.hero-actions .btn, .cta-actions .btn, .header-cta').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        btn.style.transform = 'translate(' + (((e.clientX - r.left) / r.width - 0.5) * 8).toFixed(2) + 'px,' + (((e.clientY - r.top) / r.height - 0.5) * 6).toFixed(2) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });

    // Pillar cards tilt toward the cursor; the deadline artwork drifts and its colour fringe widens.
    var track = function (root, target, enter) {
      root.addEventListener('pointermove', function (e) {
        var r = root.getBoundingClientRect();
        target.style.setProperty('--tx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
        target.style.setProperty('--ty', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
        if (enter) target.classList.add('live');
      });
      root.addEventListener('pointerleave', function () {
        target.style.setProperty('--tx', 0); target.style.setProperty('--ty', 0); target.classList.remove('live');
      });
    };
    $$('.feature-visual').forEach(function (el) { track(el, el); });
    $$('.proof').forEach(function (el) { track(el, $('.proof-art', el), true); });

    // The footer wordmark lights up under the cursor.
    $$('.footer-mark').forEach(function (mark) {
      var word = $('span', mark);
      mark.addEventListener('pointermove', function (e) {
        var r = word.getBoundingClientRect();
        word.style.setProperty('--mx', (e.clientX - r.left).toFixed(1) + 'px');
        word.style.setProperty('--my', (e.clientY - r.top).toFixed(1) + 'px');
      });
    });
  }

  /* ---------- Forms: post to the PHP handlers, which answer { success, message } ---------- */

  $$('form[data-ajax]').forEach(function (form) {
    var status = form.parentNode.querySelector('.form-status'), button = $('button[type="submit"]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var label = button.textContent;
      button.disabled = true; button.textContent = 'Sending…';
      status.className = 'form-status'; status.textContent = '';
      fetch(form.getAttribute('action'), { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (res) { return res.json().catch(function () { return { success: false, message: 'Unexpected server response.' }; }); })
        .then(function (data) {
          status.textContent = data.message || (data.success ? 'Thanks — your message has been sent.' : 'Something went wrong. Please try again.');
          status.classList.add(data.success ? 'ok' : 'err');
          if (data.success) form.reset();
        })
        .catch(function () {
          status.textContent = 'Network error — please check your connection and try again.';
          status.classList.add('err');
        })
        .then(function () { button.disabled = false; button.textContent = label; });
    });
  });
})();
