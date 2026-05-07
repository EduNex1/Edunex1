(function () {
    var visible = false;
    var buttonEl = null;

    function resolveElement(target) {
        if (!target) return null;
        if (typeof target === 'string') {
            return document.getElementById(target) || document.querySelector(target);
        }
        return target;
    }

    function ensureStoredValue(el) {
        if (!el) return;
        if (!el.dataset.privateType) el.dataset.privateType = 'text';
        if (el.dataset.privateType === 'html') {
            if (typeof el.__privateHtml === 'undefined') el.__privateHtml = el.innerHTML;
        } else if (typeof el.dataset.privateValue === 'undefined') {
            el.dataset.privateValue = el.textContent || '';
        }
        if (!el.dataset.privateMask) el.dataset.privateMask = '****';
    }

    function applyElement(el) {
        ensureStoredValue(el);
        if (!el) return;
        el.classList.toggle('is-private-hidden', !visible);
        if (visible) {
            if (el.dataset.privateType === 'html') el.innerHTML = el.__privateHtml || '';
            else el.textContent = el.dataset.privateValue || '';
        } else {
            el.textContent = el.dataset.privateMask || '****';
        }
    }

    function updateButton() {
        if (!buttonEl) return;
        buttonEl.classList.toggle('is-visible', visible);
        buttonEl.setAttribute('aria-pressed', visible ? 'true' : 'false');
        buttonEl.setAttribute('title', visible ? 'Hide financial data' : 'Show financial data');
        buttonEl.innerHTML = visible
            ? '<i class="fas fa-eye-slash"></i><span>Hide Financial Data</span>'
            : '<i class="fas fa-eye"></i><span>Show Financial Data</span>';
    }

    function applyVisibility() {
        document.querySelectorAll('.privacy-sensitive').forEach(applyElement);
        document.querySelectorAll('.finance-sensitive-card').forEach(function (card) {
            card.classList.toggle('finance-hidden', !visible);
        });
        updateButton();
    }

    function init(options) {
        options = options || {};
        visible = !!options.defaultVisible;
        buttonEl = resolveElement(options.button);
        if (buttonEl && !buttonEl.dataset.privacyBound) {
            buttonEl.dataset.privacyBound = '1';
            buttonEl.addEventListener('click', function () {
                visible = !visible;
                applyVisibility();
            });
        }
        applyVisibility();
    }

    function setText(target, value, mask) {
        var el = resolveElement(target);
        if (!el) return;
        el.classList.add('privacy-sensitive');
        el.dataset.privateType = 'text';
        el.dataset.privateValue = value == null ? '' : String(value);
        el.dataset.privateMask = mask || '****';
        applyElement(el);
    }

    function setHtml(target, html, mask) {
        var el = resolveElement(target);
        if (!el) return;
        el.classList.add('privacy-sensitive');
        el.dataset.privateType = 'html';
        el.__privateHtml = html == null ? '' : String(html);
        el.dataset.privateMask = mask || 'Hidden';
        applyElement(el);
    }

    window.SensitiveVisibility = {
        init: init,
        apply: applyVisibility,
        setText: setText,
        setHtml: setHtml,
        isVisible: function () { return visible; }
    };
})();
