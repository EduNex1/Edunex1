(function () {
    var modelPromise = null;
    var widgetCounter = 0;

    function escapeHtml(value) {
        if (typeof escHtml === 'function') return escHtml(value);
        return String(value || '').replace(/[&<>"']/g, function (ch) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
        });
    }

    function loadModels() {
        if (!window.faceapi) return Promise.reject(new Error('Face detection library is not loaded'));
        if (!modelPromise) {
            modelPromise = faceapi.nets.tinyFaceDetector.loadFromUri('/weights');
        }
        return modelPromise;
    }

    function fileToDataUrl(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function (event) { resolve(event.target.result); };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    function blobToDataUrl(blob) {
        return fileToDataUrl(blob);
    }

    function dataUrlToImage(src) {
        return new Promise(function (resolve, reject) {
            var img = new Image();
            img.onload = function () { resolve(img); };
            img.onerror = reject;
            img.src = src;
        });
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function getFaceBox(det) {
        return det && (det.box || (det.detection && det.detection.box)) || null;
    }

    function inspectImageQuality(img, box) {
        var sourceWidth = img.naturalWidth || img.width;
        var sourceHeight = img.naturalHeight || img.height;
        var faceRatio = 1;
        var sx = 0;
        var sy = 0;
        var sw = sourceWidth;
        var sh = sourceHeight;

        if (box && box.width && box.height) {
            var marginX = box.width * 0.35;
            var marginY = box.height * 0.35;
            sx = clamp(box.x - marginX, 0, sourceWidth);
            sy = clamp(box.y - marginY, 0, sourceHeight);
            sw = clamp(box.width + marginX * 2, 1, sourceWidth - sx);
            sh = clamp(box.height + marginY * 2, 1, sourceHeight - sy);
            faceRatio = (box.width * box.height) / Math.max(1, sourceWidth * sourceHeight);
        }

        var targetWidth = Math.max(80, Math.min(220, Math.round(sw)));
        var targetHeight = Math.max(80, Math.round(targetWidth * (sh / sw)));
        var canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        var ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
        var pixels = ctx.getImageData(0, 0, targetWidth, targetHeight).data;
        var gray = new Float32Array(targetWidth * targetHeight);
        var brightnessSum = 0;

        for (var i = 0, j = 0; i < pixels.length; i += 4, j++) {
            var value = pixels[i] * 0.299 + pixels[i + 1] * 0.587 + pixels[i + 2] * 0.114;
            gray[j] = value;
            brightnessSum += value;
        }

        var lapSum = 0;
        var lapSqSum = 0;
        var lapCount = 0;
        for (var y = 1; y < targetHeight - 1; y++) {
            for (var x = 1; x < targetWidth - 1; x++) {
                var idx = y * targetWidth + x;
                var lap = -4 * gray[idx] + gray[idx - 1] + gray[idx + 1] + gray[idx - targetWidth] + gray[idx + targetWidth];
                lapSum += lap;
                lapSqSum += lap * lap;
                lapCount++;
            }
        }

        var lapMean = lapCount ? lapSum / lapCount : 0;
        return {
            brightness: brightnessSum / Math.max(1, gray.length),
            sharpness: lapCount ? Math.max(0, (lapSqSum / lapCount) - (lapMean * lapMean)) : 0,
            faceRatio: faceRatio
        };
    }

    function getQualityError(quality) {
        if (quality.faceRatio < 0.035) return 'Face is too far from the camera - please move closer';
        if (quality.brightness < 45) return 'Photo is too dark - please improve the lighting';
        if (quality.brightness > 235) return 'Photo is too bright - please reduce glare';
        if (quality.sharpness < 14) return 'Photo is blurry - please hold steady and retry';
        return '';
    }

    function validateFile(file, options) {
        var minSize = options.minSize !== undefined ? options.minSize : 200 * 1024;
        var maxSize = options.maxSize !== undefined ? options.maxSize : 2 * 1024 * 1024;
        if (!file) return 'Photo missing';
        if (!['image/jpeg', 'image/png'].includes(file.type)) return 'Only JPG or PNG photo allowed';
        if (file.size < minSize) return 'Photo must be at least 200KB';
        if (file.size > maxSize) return 'Photo must be under 2MB';
        return '';
    }

    function render(container, id, title) {
        container.innerHTML = '' +
            '<div class="face-widget" id="' + id + '">' +
                '<div class="face-preview" data-role="preview"><i class="fas fa-user-check"></i></div>' +
                '<div class="face-controls">' +
                    '<div class="face-title">' + escapeHtml(title || 'Face Capture') + '</div>' +
                    '<div class="face-actions">' +
                        '<button type="button" class="btn-face-action" data-role="camera"><i class="fas fa-camera"></i> Capture With Webcam</button>' +
                        '<button type="button" class="btn-face-action secondary" data-role="upload"><i class="fas fa-folder-open"></i> Upload Photo</button>' +
                        '<input type="file" accept="image/jpeg,image/png" data-role="file" style="display:none">' +
                    '</div>' +
                    '<div class="face-status muted" data-role="status">Upload a clear front-facing photo or capture one with the webcam.</div>' +
                    '<div class="face-rules">Front facing face, eyes visible, sharp focus, good lighting, no sunglasses, JPG/PNG, 200KB to 2MB.</div>' +
                '</div>' +
            '</div>';
    }

    function ensureStyle() {
        if (document.getElementById('face-capture-widget-style')) return;
        var style = document.createElement('style');
        style.id = 'face-capture-widget-style';
        style.textContent = '' +
            '.face-widget{display:flex;gap:14px;align-items:center;border:1px solid #e0e5ef;background:#fff;border-radius:8px;padding:14px 16px;margin-bottom:14px}' +
            '.face-preview{width:104px;height:124px;border:2px dashed #c5cae9;border-radius:8px;background:#f8f9ff;display:flex;align-items:center;justify-content:center;color:#0d1b4a;overflow:hidden;flex-shrink:0}' +
            '.face-preview img{width:100%;height:100%;object-fit:cover}' +
            '.face-preview i{font-size:24px}' +
            '.face-controls{min-width:0;flex:1}' +
            '.face-title{font-size:12px;font-weight:800;color:#0d1b4a;text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px}' +
            '.face-actions{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px}' +
            '.btn-face-action{border:0;border-radius:6px;background:#0d1b4a;color:#fff;font-size:12px;font-weight:700;padding:8px 14px;cursor:pointer}' +
            '.btn-face-action.secondary{background:#eef1f6;color:#0d1b4a}' +
            '.face-status{font-size:12px;font-weight:700;margin-bottom:4px}' +
            '.face-status.ok{color:#168a3a}.face-status.bad{color:#c62828}.face-status.muted{color:#777}' +
            '.face-rules{font-size:10px;color:#747b87;line-height:1.5}' +
            '.face-modal{position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px}' +
            '.face-modal-box{width:min(560px,100%);background:#fff;border-radius:8px;overflow:hidden}' +
            '.face-modal-head{height:46px;background:#0d1b4a;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 14px;font-size:13px;font-weight:800}' +
            '.face-modal-head button{background:transparent;border:0;color:#fff;font-size:18px;cursor:pointer}' +
            '.face-video-wrap{position:relative;background:#000;aspect-ratio:4/3}' +
            '.face-video-wrap video{width:100%;height:100%;object-fit:cover;display:block}' +
            '.face-live-status{position:absolute;left:12px;bottom:12px;background:rgba(0,0,0,.65);color:#fff;border-radius:6px;padding:7px 10px;font-size:12px;font-weight:700}' +
            '.face-modal-actions{display:flex;gap:8px;justify-content:flex-end;padding:12px 14px;background:#f6f7fa}' +
            '.face-modal-actions button{border:0;border-radius:6px;padding:8px 14px;font-size:12px;font-weight:800;cursor:pointer}' +
            '.face-modal-actions .capture{background:#0d1b4a;color:#fff}.face-modal-actions .capture:disabled{background:#a6adba;cursor:not-allowed}.face-modal-actions .cancel{background:#e8ebf1;color:#333}' +
            '@media(max-width:576px){.face-widget{align-items:flex-start}.face-preview{width:86px;height:104px}.btn-face-action{font-size:11px;padding:7px 10px}}';
        document.head.appendChild(style);
    }

    function createFaceCaptureWidget(options) {
        options = options || {};
        var container = typeof options.container === 'string' ? document.querySelector(options.container) : options.container;
        if (!container) return null;
        ensureStyle();
        var id = 'faceWidget' + (++widgetCounter);
        render(container, id, options.title);
        var root = document.getElementById(id);
        var preview = root.querySelector('[data-role="preview"]');
        var fileInput = root.querySelector('[data-role="file"]');
        var status = root.querySelector('[data-role="status"]');
        var selectedBlob = null;
        var selectedFileName = '';
        var selectedValid = false;
        var stream = null;

        function setStatus(text, cls) {
            status.className = 'face-status ' + (cls || 'muted');
            status.textContent = text;
        }

        async function processPhoto(blob, fileName, skipMinSize) {
            selectedValid = false;
            selectedBlob = null;
            selectedFileName = fileName || 'face-photo.jpg';
            var fileError = validateFile(blob, { minSize: skipMinSize ? 0 : undefined });
            if (fileError) {
                setStatus(fileError, 'bad');
                return false;
            }
            setStatus('Checking face quality...', 'muted');
            var dataUrl = await blobToDataUrl(blob);
            preview.innerHTML = '<img src="' + dataUrl + '" alt="Face preview">';
            try {
                await loadModels();
                var img = await dataUrlToImage(dataUrl);
                var det = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.45 }));
                if (!det) {
                    setStatus('Face is not clear - please retry', 'bad');
                    return false;
                }
                var qualityError = getQualityError(inspectImageQuality(img, getFaceBox(det)));
                if (qualityError) {
                    setStatus(qualityError, 'bad');
                    return false;
                }
                selectedBlob = blob;
                selectedValid = true;
                setStatus('Face detected - Good!', 'ok');
                if (typeof options.onChange === 'function') options.onChange({ valid: true, blob: blob });
                return true;
            } catch (error) {
                setStatus('Face detection failed. Please retry with a clear JPG/PNG photo.', 'bad');
                return false;
            }
        }

        fileInput.addEventListener('change', async function () {
            var file = fileInput.files && fileInput.files[0];
            if (!file) return;
            await processPhoto(file, file.name, false);
        });

        root.querySelector('[data-role="upload"]').addEventListener('click', function () {
            fileInput.click();
        });

        root.querySelector('[data-role="camera"]').addEventListener('click', openCamera);

        async function openCamera() {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setStatus('Camera is not available in this browser', 'bad');
                return;
            }
            var modal = document.createElement('div');
            modal.className = 'face-modal';
            modal.innerHTML = '' +
                '<div class="face-modal-box">' +
                    '<div class="face-modal-head"><span><i class="fas fa-camera"></i> Face Capture</span><button type="button" data-close="1">&times;</button></div>' +
                    '<div class="face-video-wrap"><video autoplay muted playsinline></video><div class="face-live-status">Camera starting...</div></div>' +
                    '<div class="face-modal-actions"><button type="button" class="cancel">Cancel</button><button type="button" class="capture" disabled>Capture</button></div>' +
                '</div>';
            document.body.appendChild(modal);
            var video = modal.querySelector('video');
            var liveStatus = modal.querySelector('.face-live-status');
            var captureBtn = modal.querySelector('.capture');
            var detecting = true;
            var faceReady = false;

            function close() {
                detecting = false;
                if (stream) stream.getTracks().forEach(function (track) { track.stop(); });
                stream = null;
                modal.remove();
            }

            modal.querySelector('[data-close]').onclick = close;
            modal.querySelector('.cancel').onclick = close;

            try {
                await loadModels();
                stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } });
                video.srcObject = stream;
                await video.play();
                liveStatus.textContent = 'Keep the face centered';
            } catch (error) {
                liveStatus.textContent = 'Could not open the camera';
                captureBtn.disabled = true;
                return;
            }

            async function loop() {
                if (!detecting) return;
                try {
                    var det = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.45 }));
                    faceReady = !!det;
                    liveStatus.textContent = faceReady ? 'Face detected - capture ready' : 'Face is not clear - adjust light and angle';
                    captureBtn.disabled = !faceReady;
                } catch (e) {
                    faceReady = false;
                    captureBtn.disabled = true;
                }
                setTimeout(loop, 700);
            }
            loop();

            captureBtn.onclick = function () {
                if (!faceReady) return;
                var canvas = document.createElement('canvas');
                canvas.width = 900;
                canvas.height = 1080;
                var ctx = canvas.getContext('2d');
                var sourceRatio = video.videoWidth / video.videoHeight;
                var targetRatio = canvas.width / canvas.height;
                var sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;
                if (sourceRatio > targetRatio) {
                    sw = video.videoHeight * targetRatio;
                    sx = (video.videoWidth - sw) / 2;
                } else {
                    sh = video.videoWidth / targetRatio;
                    sy = (video.videoHeight - sh) / 2;
                }
                ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
                canvas.toBlob(async function (blob) {
                    close();
                    await processPhoto(blob, 'webcam-face-' + Date.now() + '.jpg', true);
                }, 'image/jpeg', 0.98);
            };
        }

        return {
            hasPhoto: function () { return !!selectedBlob; },
            hasValidFace: function () { return selectedValid && !!selectedBlob; },
            getFile: function (namePrefix) {
                if (!selectedBlob || !selectedValid) return null;
                var name = selectedFileName || ((namePrefix || 'face-photo') + '-' + Date.now() + '.jpg');
                return new File([selectedBlob], name, { type: selectedBlob.type || 'image/jpeg' });
            },
            reset: function () {
                selectedBlob = null;
                selectedValid = false;
                selectedFileName = '';
                fileInput.value = '';
                preview.innerHTML = '<i class="fas fa-user-check"></i>';
                setStatus('Upload a clear front-facing photo or capture one with the webcam.', 'muted');
            }
        };
    }

    window.createFaceCaptureWidget = createFaceCaptureWidget;
})();
