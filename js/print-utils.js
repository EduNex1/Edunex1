(function (window, document) {
    function toAbsoluteUrl(value) {
        if (!value) return value;
        if (/^(data:|blob:|https?:)/i.test(value)) return value;
        if (value.startsWith('//')) return window.location.protocol + value;
        return new URL(value, window.location.href).href;
    }

    function normalizePrintContent(html) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = html || '';

        wrapper.querySelectorAll('img[src]').forEach(function (img) {
            img.setAttribute('src', toAbsoluteUrl(img.getAttribute('src')));
            img.setAttribute('loading', 'eager');
            img.setAttribute('decoding', 'sync');
            img.setAttribute('referrerpolicy', 'no-referrer');
        });

        wrapper.querySelectorAll('link[href]').forEach(function (link) {
            link.setAttribute('href', toAbsoluteUrl(link.getAttribute('href')));
        });

        wrapper.querySelectorAll('[srcset]').forEach(function (el) {
            el.removeAttribute('srcset');
        });

        return wrapper.innerHTML;
    }

    function buildPrintScript(autoClose, delay) {
        return "<script>(function(){" +
            "function done(){setTimeout(function(){window.focus();window.print();" +
            (autoClose ? "setTimeout(function(){window.close();},150);" : "") +
            "}," + delay + ");}" +
            "function waitForAssets(){var images=Array.prototype.slice.call(document.images||[]);" +
            "var jobs=images.map(function(img){if(img.complete&&img.naturalWidth!==0){return Promise.resolve();}" +
            "return new Promise(function(resolve){var settled=false;function finish(){if(settled)return;settled=true;resolve();}" +
            "img.addEventListener('load',finish,{once:true});img.addEventListener('error',finish,{once:true});setTimeout(finish,3000);});});" +
            "Promise.all(jobs).then(function(){if(document.fonts&&document.fonts.ready){document.fonts.ready.then(done).catch(done);}else{done();}});}" +
            "if(document.readyState==='complete'){waitForAssets();}else{window.addEventListener('load',waitForAssets,{once:true});setTimeout(waitForAssets,1200);}" +
            "})();<\/script>";
    }

    function openPrintWindow(options) {
        var settings = options || {};
        var printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow pop-ups to print this document.');
            return null;
        }

        var title = settings.title || 'Print';
        var pageSize = settings.pageSize || 'A4';
        var orientation = settings.orientation || 'portrait';
        var pageCss = settings.pageCss || '';
        var bodyClass = settings.bodyClass || '';
        var content = normalizePrintContent(settings.content || '');
        var autoClose = settings.autoClose !== false;
        var delay = Number(settings.delay || 350);
        var cssHref = toAbsoluteUrl('css/print-document.css');
        var faHref = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';

        printWindow.document.open();
        printWindow.document.write(
            '<!DOCTYPE html><html><head><meta charset="utf-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1">' +
            '<title>' + title + '</title>' +
            '<link rel="stylesheet" href="' + cssHref + '">' +
            '<link rel="stylesheet" href="' + faHref + '">' +
            '<style>@page{size:' + pageSize + ' ' + orientation + ';margin:10mm;}html,body{background:#fff !important;}body.print-window-body{padding:10mm;}'+ pageCss + '</style>' +
            '</head><body class="print-window-body ' + bodyClass + '"><div class="print-sheet">' + content + '</div>' + buildPrintScript(autoClose, delay) + '</body></html>'
        );
        printWindow.document.close();
        return printWindow;
    }

    window.printUtils = {
        openPrintWindow: openPrintWindow,
        toAbsoluteUrl: toAbsoluteUrl,
        normalizePrintContent: normalizePrintContent
    };
    window.openPrintWindow = openPrintWindow;
})(window, document);
