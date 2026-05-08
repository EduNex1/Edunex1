(function (window) {
    function html(value) {
        if (typeof escHtml === 'function') return escHtml(value);
        return String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function uniqueRows(rows) {
        var seen = {};
        return (rows || []).filter(function (row) {
            var key = row && row.serial_number;
            if (!key || seen[key]) return false;
            seen[key] = true;
            return true;
        });
    }

    async function fetchDevicesForSelector(mode, branchId) {
        if (typeof getDevices !== 'function') return [];
        var user = typeof getUser === 'function' ? getUser() : null;
        var selectedBranch = branchId || (typeof getSelectedBranch === 'function' ? getSelectedBranch() : '');
        var branchIds = [];

        if (mode === 'staff' && user && user.role !== 'super_admin') {
            if (Array.isArray(user.branch_ids) && user.branch_ids.length) branchIds = user.branch_ids;
            else if (selectedBranch) branchIds = [selectedBranch];
            else if (user.branch_id) branchIds = [user.branch_id];
        } else if (selectedBranch) {
            branchIds = [selectedBranch];
        }

        if (branchIds.length > 1) {
            var all = [];
            for (var i = 0; i < branchIds.length; i++) {
                try {
                    var rows = await getDevices({ branch_id: branchIds[i] });
                    all = all.concat(Array.isArray(rows) ? rows : []);
                } catch (e) {}
            }
            return uniqueRows(all);
        }

        var filters = branchIds.length === 1 ? { branch_id: branchIds[0] } : {};
        var devices = await getDevices(filters);
        return uniqueRows(Array.isArray(devices) ? devices : []);
    }

    function renderDeviceRow(device) {
        var used = Math.max(0, Number(device.face_registered_count || 0));
        var capacity = Math.max(1, Number(device.face_capacity || 800));
        var available = Math.max(0, capacity - used);
        var pct = Math.min(100, Math.round((used / capacity) * 100));
        var full = used >= capacity || device.face_capacity_status === 'full';
        var nearFull = !full && pct >= 90;
        var checked = full ? '' : ' checked';
        var state = full ? 'full' : (nearFull ? 'near-full' : 'available');
        var statusText = full ? 'Full' : (nearFull ? 'Nearly full' : available + ' slots free');
        return '<label class="face-device-row ' + state + '">' +
            '<input type="checkbox" class="face-device-input" value="' + html(device.serial_number) + '"' + checked + '>' +
            '<span class="face-device-main">' +
                '<span class="face-device-name">' + html(device.device_name || 'Device') + '</span>' +
                '<span class="face-device-meta">' + html(device.branch_name || device.location || '-') + ' / ' + html(device.serial_number || '') + '</span>' +
                '<span class="face-device-capacity">' +
                    '<span class="face-device-capacity-text">' + used + ' / ' + capacity + ' faces</span>' +
                    '<span class="face-device-bar"><span style="width:' + pct + '%"></span></span>' +
                '</span>' +
            '</span>' +
            '<span class="face-device-side">' +
                '<span class="face-device-status ' + (device.status === 'online' ? 'online' : 'offline') + '">' + (device.status === 'online' ? 'Online' : 'Offline') + '</span>' +
                '<span class="face-device-badge">' + statusText + '</span>' +
            '</span>' +
        '</label>';
    }

    function bindSelectorActions(container) {
        var selectBtn = container.querySelector('[data-face-device-action="select-available"]');
        var clearBtn = container.querySelector('[data-face-device-action="clear"]');
        if (selectBtn) {
            selectBtn.addEventListener('click', function () {
                container.querySelectorAll('.face-device-row').forEach(function (row) {
                    var input = row.querySelector('.face-device-input');
                    if (input) input.checked = !row.classList.contains('full');
                });
            });
        }
        if (clearBtn) {
            clearBtn.addEventListener('click', function () {
                container.querySelectorAll('.face-device-input').forEach(function (input) { input.checked = false; });
            });
        }
    }

    window.loadFaceDeviceSelector = async function (options) {
        options = options || {};
        var container = document.getElementById(options.containerId);
        if (!container) return [];
        container.setAttribute('data-loaded', 'false');
        container.setAttribute('data-has-devices', 'false');
        container.innerHTML = '<div class="face-device-selector is-loading"><i class="fas fa-spinner fa-spin"></i> Loading devices...</div>';
        try {
            var devices = await fetchDevicesForSelector(options.mode || 'student', options.branchId || '');
            container.setAttribute('data-loaded', 'true');
            container.setAttribute('data-has-devices', devices.length ? 'true' : 'false');
            if (!devices.length) {
                container.innerHTML = '<div class="face-device-selector is-empty"><i class="fas fa-circle-info"></i> No ZKTeco device found for this branch yet.</div>';
                return [];
            }
            container.innerHTML = '<div class="face-device-selector">' +
                '<div class="face-device-selector-head">' +
                    '<div><strong>Register face on devices</strong><span>Select only the device(s) that have capacity.</span></div>' +
                    '<div><button type="button" data-face-device-action="select-available"><i class="fas fa-check-double"></i> Available</button><button type="button" data-face-device-action="clear"><i class="fas fa-times"></i> Clear</button></div>' +
                '</div>' +
                '<div class="face-device-list">' + devices.map(renderDeviceRow).join('') + '</div>' +
            '</div>';
            bindSelectorActions(container);
            return devices;
        } catch (error) {
            container.innerHTML = '<div class="face-device-selector is-empty"><i class="fas fa-triangle-exclamation"></i> Device list could not be loaded.</div>';
            return [];
        }
    };

    window.getSelectedFaceDeviceSerials = function (containerId) {
        var container = document.getElementById(containerId);
        if (!container) return [];
        return Array.from(container.querySelectorAll('.face-device-input:checked')).map(function (input) {
            return input.value;
        }).filter(Boolean);
    };

    window.faceDeviceSelectorHasDevices = function (containerId) {
        var container = document.getElementById(containerId);
        return !!container && container.getAttribute('data-has-devices') === 'true';
    };

    window.showFaceRegistrationQueueResult = function (result, label) {
        result = result || {};
        var total = Number(result.total || 0);
        var skipped = Array.isArray(result.skipped) ? result.skipped : [];
        if (total > 0 && typeof showToast === 'function') {
            showToast((label || 'Face') + ' registration queued for ' + total + ' device' + (total === 1 ? '' : 's'), 'success');
        }
        if (skipped.length && typeof showToast === 'function') {
            var message = skipped.length + ' device' + (skipped.length === 1 ? '' : 's') + ' skipped because face capacity is full.';
            if (!total) message = 'No face queued. Selected device face capacity is full.';
            showToast(message, 'warning');
        }
    };
})(window);
