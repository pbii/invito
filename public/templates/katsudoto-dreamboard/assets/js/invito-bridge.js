/* Invito bridge: routes the Katsudoto template's RSVP + wish forms to the invito backend.
   Loaded after the template's own scripts. Reads config from window.__INVITO_* vars
   set by the React component at render time. */
(function () {
    'use strict';

    var SLUG = window.__INVITO_SLUG__ || '';
    var TS_KEY = window.__INVITO_TURNSTILE_KEY__ || '';
    var tsReady = !!TS_KEY;
    var tsWidgets = {};

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function alertMsg(msg, type) {
        if (typeof showAlert === 'function') showAlert(msg, type || 'error');
    }

    function csrfHeaders() {
        var h = {};
        try {
            var meta = window.parent && window.parent.document.querySelector('meta[name="csrf-token"]');
            var content = meta && meta.getAttribute('content');
            if (content) {
                h['X-CSRF-TOKEN'] = content;
                return h;
            }
        } catch (e) { /* cross-origin: fall through */ }
        var m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
        if (m) h['X-XSRF-TOKEN'] = m[1];
        return h;
    }

    function apiHeaders() {
        var h = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
        var c = csrfHeaders();
        for (var k in c) h[k] = c[k];
        return h;
    }

    function firstError(errors) {
        for (var k in errors) {
            if (errors[k] && errors[k][0]) return errors[k][0];
        }
        return '';
    }

    /* ---------- Turnstile (explicit render, one widget per form) ---------- */

    function renderTsWidget(formId) {
        if (!tsReady || typeof turnstile === 'undefined') return;
        if (tsWidgets[formId] !== undefined) return;
        var form = document.getElementById(formId);
        if (!form) return;
        var ref = form.querySelector('button[type="submit"]');
        var box = document.createElement('div');
        box.className = 'invito-turnstile';
        box.style.cssText = 'margin:12px 0;display:flex;justify-content:center;';
        if (ref && ref.parentNode) ref.parentNode.insertBefore(box, ref);
        else form.appendChild(box);
        try {
            tsWidgets[formId] = turnstile.render(box, { sitekey: TS_KEY });
        } catch (e) {
            tsWidgets[formId] = null;
        }
    }

    function tsToken(formId) {
        if (!tsReady || typeof turnstile === 'undefined' || tsWidgets[formId] == null) return '';
        try {
            return turnstile.getResponse(tsWidgets[formId]) || '';
        } catch (e) {
            return '';
        }
    }

    function tsReset(formId) {
        if (typeof turnstile === 'undefined' || tsWidgets[formId] == null) return;
        try {
            turnstile.reset(tsWidgets[formId]);
        } catch (e) {}
    }

    function ensureTsApi() {
        if (!tsReady || typeof turnstile !== 'undefined') {
            renderTsWidget('weddingWishForm');
            return;
        }
        var s = document.createElement('script');
        s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        s.async = true;
        s.defer = true;
        s.onload = function () {
            renderTsWidget('weddingWishForm');
            renderTsWidget('RSVPForm');
        };
        document.head.appendChild(s);
    }

    /* ---------- $.ajax wrapper: serve template ajax from invito ---------- */

    function fakeXhr() {
        var x = {};
        x.done = x.fail = x.always = x.then = function () { return x; };
        return x;
    }

    function wrapAjax() {
        if (typeof $ === 'undefined' || !$.ajax || $.ajax.__invitoWrapped) return;
        var orig = $.ajax;
        var wrapped = function (a, b) {
            var options = b || a;
            var data = options && options.data;
            if (data && typeof data.get === 'function') {
                var post = data.get('post');
                var req = data.get('request');
                if (post === 'rsvp_request' && req === 'get_rsvp') {
                    var snippet = window.__RSVP_SNIPPET__ || '';
                    setTimeout(function () {
                        if (typeof options.beforeSend === 'function') { try { options.beforeSend(); } catch (e) {} }
                        if (typeof options.success === 'function') options.success({ error: false, rsvp_content: snippet });
                    }, 0);
                    return fakeXhr();
                }
                if (post === 'loadComment') {
                    setTimeout(function () {
                        var cur = '';
                        try { cur = document.querySelector('.comment-wrap').innerHTML || ''; } catch (e) {}
                        if (typeof options.success === 'function') options.success({ error: false, commentItems: cur, nextComment: 0 });
                    }, 0);
                    return fakeXhr();
                }
                if (post === 'moreComment') {
                    setTimeout(function () {
                        if (typeof options.success === 'function') options.success({ error: false, nextComment: 0 });
                    }, 0);
                    return fakeXhr();
                }
            }
            return orig.apply(this, arguments);
        };
        wrapped.__invitoWrapped = true;
        $.ajax = wrapped;
    }

    /* ---------- RSVP submit ---------- */

    function submitRsvp(form) {
        var picked = form.querySelector('input[name="rsvp_status"]:checked');
        var going = !!(picked && picked.value === 'going');
        var nameInput = form.querySelector('input[name="rsvp_name"]');
        var name = nameInput ? nameInput.value.trim() : '';
        if (!name) {
            alertMsg('Please enter your name');
            if (nameInput) nameInput.focus();
            return;
        }
        if (tsReady && !tsToken('RSVPForm')) {
            alertMsg('Please complete the captcha verification');
            return;
        }
        var amountInput = form.querySelector('input[name="rsvp_amount"]');
        var amount = amountInput ? parseInt(amountInput.value, 10) : 1;
        if (!going) amount = 1;
        amount = Math.min(Math.max(amount || 1, 1), 10);

        var events = [];
        form.querySelectorAll('input[name="selected_event[]"]').forEach(function (cb) {
            events.push({ event_id: cb.value, is_attending: !!(going && cb.checked) });
        });
        if (!events.length) {
            alertMsg('No events available for RSVP');
            return;
        }

        var btn = form.querySelector('button[type="submit"]');
        var btnHtml = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.innerHTML = 'Sending...'; }

        fetch('/' + SLUG + '/rsvp', {
            method: 'POST',
            headers: apiHeaders(),
            credentials: 'same-origin',
            body: JSON.stringify({
                name: name,
                is_attending: going,
                number_of_guests: amount,
                events: events,
                turnstile_token: tsToken('RSVPForm'),
                honeypot: ''
            })
        }).then(function (res) {
            if (res.ok) return { ok: true };
            if (res.status === 422) {
                return res.json().then(function (j) { return { ok: false, errors: (j && j.errors) || {} }; })
                    .catch(function () { return { ok: false, errors: {} }; });
            }
            return { ok: false, errors: {} };
        }).then(function (out) {
            if (btn) { btn.disabled = false; btn.innerHTML = btnHtml; }
            if (out.ok) {
                if (typeof showAlert === 'function') showAlert('Thank you! Your RSVP has been recorded.', 'success');
                else {
                    var body = document.querySelector('.rsvp-body');
                    if (body) body.innerHTML = '<p style="text-align:center;padding:24px;">Thank you! Your RSVP has been recorded.</p>';
                }
                try { form.reset(); } catch (e) {}
                tsReset('RSVPForm');
            } else {
                alertMsg(firstError(out.errors) || 'Submission failed. Please try again.');
            }
        }).catch(function () {
            if (btn) { btn.disabled = false; btn.innerHTML = btnHtml; }
            alertMsg('Network error. Please try again.');
        });
    }

    /* ---------- Wish submit ---------- */

    function prependWish(wish) {
        var tpl = window.__WISH_ITEM_HTML__ || '';
        if (!tpl) return;
        var dateStr = '';
        try {
            dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        } catch (e) {}
        var html = tpl.split('{name}').join(esc(wish.name))
            .split('{message}').join(esc(wish.message).replace(/\n/g, '<br />'))
            .split('{date}').join(esc(dateStr));
        var wrap = document.querySelector('.comment-wrap');
        if (wrap) {
            wrap.classList.add('show');
            wrap.insertAdjacentHTML('afterbegin', html);
            var swiperEl = document.querySelector('.comment-swiper');
            if (swiperEl && swiperEl.swiper && typeof swiperEl.swiper.update === 'function') {
                try { swiperEl.swiper.update(); } catch (e) {}
            }
        }
    }

    function submitWish(form) {
        var nameInput = form.querySelector('input[name="name"]');
        var msgInput = form.querySelector('textarea[name="comment"]');
        var name = nameInput ? nameInput.value.trim() : '';
        var message = msgInput ? msgInput.value.trim() : '';
        if (!name) {
            alertMsg('Please enter your name');
            if (nameInput) nameInput.focus();
            return;
        }
        if (!message) {
            alertMsg('Please write your wish');
            if (msgInput) msgInput.focus();
            return;
        }
        if (tsReady && !tsToken('weddingWishForm')) {
            alertMsg('Please complete the captcha verification');
            return;
        }
        var btn = form.querySelector('button[type="submit"]');
        var btnHtml = btn ? btn.innerHTML : '';
        if (btn) { btn.disabled = true; btn.innerHTML = 'Sending...'; }

        fetch('/' + SLUG + '/wishes', {
            method: 'POST',
            headers: apiHeaders(),
            credentials: 'same-origin',
            body: JSON.stringify({
                name: name,
                message: message,
                turnstile_token: tsToken('weddingWishForm'),
                honeypot: ''
            })
        }).then(function (res) {
            if (res.status === 201) {
                return res.json().then(function (j) { return { ok: true, wish: (j && j.wish) || { name: name, message: message } }; });
            }
            if (res.status === 422) {
                return res.json().then(function (j) { return { ok: false, errors: (j && j.errors) || {} }; })
                    .catch(function () { return { ok: false, errors: {} }; });
            }
            return { ok: false, errors: {} };
        }).then(function (out) {
            if (btn) { btn.disabled = false; btn.innerHTML = btnHtml; }
            if (out.ok) {
                prependWish(out.wish);
                if (msgInput) msgInput.value = '';
                tsReset('weddingWishForm');
                if (typeof showAlert === 'function') showAlert('Thank you! Your wish has been sent.', 'success');
            } else {
                alertMsg(firstError(out.errors) || 'Submission failed. Please try again.');
            }
        }).catch(function () {
            if (btn) { btn.disabled = false; btn.innerHTML = btnHtml; }
            alertMsg('Network error. Please try again.');
        });
    }

    /* ---------- wire up ---------- */

    document.addEventListener('submit', function (e) {
        var form = e.target;
        if (!form || !form.id) return;
        if (form.id === 'RSVPForm') {
            e.preventDefault();
            e.stopImmediatePropagation();
            submitRsvp(form);
        } else if (form.id === 'weddingWishForm') {
            e.preventDefault();
            e.stopImmediatePropagation();
            submitWish(form);
        }
    }, true);

    // Hide the "show more comments" button (it used to fetch from Katsudoto)
    var hideStyle = document.createElement('style');
    hideStyle.textContent = '#moreComment,.more-comment-wrap{display:none!important}';
    document.head.appendChild(hideStyle);

    // Bind check-all + RSVP turnstile widget when the RSVP form is injected
    if (typeof MutationObserver !== 'undefined') {
        var obs = new MutationObserver(function () {
            var ca = document.getElementById('check-all');
            if (ca && !ca.__invitoBound) {
                ca.__invitoBound = true;
                ca.addEventListener('change', function () {
                    document.querySelectorAll('input[name="selected_event[]"]').forEach(function (b) {
                        b.checked = ca.checked;
                    });
                });
            }
            var rf = document.getElementById('RSVPForm');
            if (rf && !rf.__invitoTs) {
                rf.__invitoTs = true;
                renderTsWidget('RSVPForm');
            }
        });
        obs.observe(document.documentElement, { childList: true, subtree: true });
    }

    wrapAjax();
    ensureTsApi();
})();
