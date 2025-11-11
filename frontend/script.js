// --- Auth Check ---
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

// --- Global State & Config ---
let currentPath = '';
let selectedItems = new Set();
let lastSelectedItemPath = null;
let currentLang = 'zh-TW';
const currentUser = {
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role')
};
let viewingAsUser = currentUser.username; // For admins viewing other users' files

// --- Internationalization (i18n) ---
const locales = {
    'zh-TW': {
        'title': '個人雲端', 'logout': '登出', 'upload': '上傳', 'newFolder': '新增資料夾',
        'selectFiles': '選擇檔案', 'fileListTitle': '文件列表', 'ctxRename': '✏️ 重新命名',
        'ctxDelete': '🗑️ 刪除', 'ctxDownload': '⬇️ 下載', 'ctxMove': '➡️ 移動',
        'ctxShare': '🔗 分享', 'close': '關閉', 'settingsTitle': '設定',
        'themeLabel': '主題', 'themeSystem': '跟隨系統', 'themeLight': '亮色',
        'themeDark': '暗色', 'bgLabel': '背景圖片 URL', 'apply': '套用',
        'clear': '清除', 'langLabel': '語言', 'root': '根目錄',
        'folderPrompt': '請輸入新資料夾名稱:', 'uploadPrompt': '請選擇要上傳的檔案',
        'uploadSuccess': '✅ 檔案上傳成功', 'uploadFail': '❌ 上傳失敗',
        'deleteConfirm': (count) => `確定要刪除這 ${count} 個項目嗎？`,
        'deleteSuccess': '✅ 刪除成功', 'deleteFail': '❌ 刪除失敗',
        'renamePrompt': '請輸入新名稱:', 'renameFail': '❌ 重新命名失敗',
        'movePrompt': '請輸入目標資料夾路徑：', 'moveSingleItem': '請選擇單一項目進行移動',
        'moveFolderInsideItself': '❌ 無法將資料夾移動到其自身或其子資料夾內部。',
        'movePathSame': '來源和目標路徑相同。', 'moveFail': '❌ 移動失敗',
        'downloadSingleItem': '請選擇單一檔案下載', 'downloadFail': '❌ 下載失敗',
        'previewError': '❌ 無法預覽此類型的文件', 'previewLoadFail': '❌ 載入預覽失敗',
        'apiUnknownError': '發生未知錯誤', 'loadFileListFail': '❌ 載入文件列表失敗',
        'createFolderFail': '❌ 建立資料夾失敗', 'greeting': (name) => `你好, ${name}`,
        'adminPanel': '管理面板', 'userViewLabel': '檢視使用者:', 'username': '使用者名稱',
        'role': '角色', 'actions': '動作', 'admin': '管理員', 'user': '使用者',
        'promote': '升級', 'demote': '降級', 'delete': '刪除',
        'userDeleteConfirm': (name) => `確定要刪除使用者 ${name} 嗎？此操作無法復原！`,
        'createUser': '建立新使用者', 'create': '建立', 'roleUser': '一般用戶', 'roleAdmin': '管理員',
        'createUserSuccess': '✅ 使用者建立成功！', 'createUserFail': '❌ 建立使用者失敗:',
        'newUsernamePlaceholder': '新使用者名稱', 'newPasswordPlaceholder': '新密碼',
        'loading': '載入中...', 'me': '我', 'roleChangeFail': '變更角色失敗',
        'userDeleteFail': '刪除使用者失敗', 'uploading': '上傳中...', 'downloading': '下載中...',
        'userGuide': '使用指南', 'userGuideLoadFail': '❌ 無法載入使用指南',
    },
    'en': {
        'title': 'Personal Cloud', 'logout': 'Logout', 'upload': 'Upload', 'newFolder': 'New Folder',
        'selectFiles': 'Select Files', 'fileListTitle': 'File List', 'ctxRename': '✏️ Rename',
        'ctxDelete': '🗑️ Delete', 'ctxDownload': '⬇️ Download', 'ctxMove': '➡️ Move',
        'ctxShare': '🔗 Share', 'close': 'Close', 'settingsTitle': 'Settings',
        'themeLabel': 'Theme', 'themeSystem': 'System', 'themeLight': 'Light',
        'themeDark': 'Dark', 'bgLabel': 'Background Image URL', 'apply': 'Apply',
        'clear': 'Clear', 'langLabel': 'Language', 'root': 'Root',
        'folderPrompt': 'Please enter the new folder name:', 'uploadPrompt': 'Please select files to upload',
        'uploadSuccess': '✅ Files uploaded successfully', 'uploadFail': '❌ Upload failed',
        'deleteConfirm': (count) => `Are you sure you want to delete ${count} item(s)?`,
        'deleteSuccess': '✅ Delete successful', 'deleteFail': '❌ Delete failed',
        'renamePrompt': 'Please enter the new name:', 'renameFail': '❌ Rename failed',
        'movePrompt': 'Please enter the destination folder path:', 'moveSingleItem': 'Please select a single item to move',
        'moveFolderInsideItself': '❌ Cannot move a folder into itself or a subdirectory.',
        'movePathSame': 'Source and destination paths are the same.', 'moveFail': '❌ Move failed',
        'downloadSingleItem': 'Please select a single file to download', 'downloadFail': '❌ Download failed',
        'previewError': '❌ Cannot preview this file type', 'previewLoadFail': '❌ Failed to load preview',
        'apiUnknownError': 'An unknown error occurred', 'loadFileListFail': '❌ Failed to load file list',
        'createFolderFail': '❌ Failed to create folder', 'greeting': (name) => `Hello, ${name}`,
        'adminPanel': 'Admin Panel', 'userViewLabel': 'Viewing as:', 'username': 'Username',
        'role': 'Role', 'actions': 'Actions', 'admin': 'Admin', 'user': 'User',
        'promote': 'Promote', 'demote': 'Demote', 'delete': 'Delete',
        'userDeleteConfirm': (name) => `Are you sure you want to delete user ${name}? This action cannot be undone!`,
        'createUser': 'Create New User', 'create': 'Create', 'roleUser': 'User', 'roleAdmin': 'Admin',
        'createUserSuccess': '✅ User created successfully!', 'createUserFail': '❌ Failed to create user:',
        'newUsernamePlaceholder': 'New Username', 'newPasswordPlaceholder': 'New Password',
        'loading': 'Loading...', 'me': 'Me', 'roleChangeFail': 'Failed to change role',
        'userDeleteFail': 'Failed to delete user', 'uploading': 'Uploading...', 'downloading': 'Downloading...',
        'userGuide': 'User Guide', 'userGuideLoadFail': '❌ Failed to load user guide',
    }
};

function t(key, ...args) {
    const string = locales[currentLang]?.[key] || locales['en'][key];
    if (typeof string === 'function') {
        return string(...args);
    }
    return string;
}

function updateUIText() {
    document.querySelectorAll('[data-i18n-key]').forEach(el => {
        const key = el.dataset.i18nKey;
        if (el.id === 'actionsDropdownBtn') return; // Don't set text for the + button
        el.textContent = t(key);
    });
    document.getElementById('bg-url-input').placeholder = t('bgLabel');
    document.getElementById('create-username').placeholder = t('newUsernamePlaceholder');
    document.getElementById('create-password').placeholder = t('newPasswordPlaceholder');
}

// --- Settings & Theme ---
function applyTheme(theme) {
    if (theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.dataset.theme = prefersDark ? 'dark' : 'light';
    } else {
        document.body.dataset.theme = theme;
    }
    localStorage.setItem('theme', theme);
}

function applyBackground(url) {
    if (url) {
        document.body.style.backgroundImage = `url('${url}')`;
        localStorage.setItem('backgroundImage', url);
    } else {
        document.body.style.backgroundImage = 'none';
        localStorage.removeItem('backgroundImage');
    }
}

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    updateUIText();
    renderBreadcrumb();
}

// --- API Helper ---
async function apiFetch(url, options = {}) {
    const headers = { ...options.headers, 'Authorization': `Bearer ${token}` };
    if (options.body instanceof FormData) {
        delete headers['Content-Type'];
    } else if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
        logout();
        return;
    }
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: t('apiUnknownError') }));
        throw new Error(errorData.error);
    }
    return response;
}

// --- Admin Functions ---
async function openAdminPanel() {
    const modal = document.getElementById('adminPanelModal');
    modal.style.display = 'flex';
    await populateUserManagementTable();
}

async function populateUserManagementTable() {
    const tableBody = document.querySelector('#user-management-table tbody');
    tableBody.innerHTML = `<tr><td colspan="3">${t('loading')}</td></tr>`;
    try {
        const users = await apiFetch('/api/admin/users').then(res => res.json());
        tableBody.innerHTML = '';
        users.forEach(user => {
            const row = document.createElement('tr');
            const isCurrentUser = user.username === currentUser.username;
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${t(user.role)}</td>
                <td class="actions">
                    ${!isCurrentUser && user.role === 'user' ? `<button class="action-btn promote-btn" data-username="${user.username}">${t('promote')}</button>` : ''}
                    ${!isCurrentUser && user.role === 'admin' ? `<button class="action-btn demote-btn" data-username="${user.username}">${t('demote')}</button>` : ''}
                    ${!isCurrentUser ? `<button class="action-btn delete-btn" data-username="${user.username}">${t('delete')}</button>` : ''}
                </td>
            `;
            tableBody.appendChild(row);
        });

        document.querySelectorAll('.promote-btn').forEach(btn => btn.addEventListener('click', (e) => changeUserRole(e.target.dataset.username, 'admin')));
        document.querySelectorAll('.demote-btn').forEach(btn => btn.addEventListener('click', (e) => changeUserRole(e.target.dataset.username, 'user')));
        document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => deleteUser(e.target.dataset.username)));

    } catch (error) {
        tableBody.innerHTML = `<tr><td colspan="3" style="color: red;">${error.message}</td></tr>`;
    }
}

async function changeUserRole(username, role) {
    try {
        await apiFetch(`/api/admin/users/${username}/role`, {
            method: 'PUT',
            body: JSON.stringify({ role })
        });
        await populateUserManagementTable();
        await populateUserViewSelect();
    } catch (error) {
        alert(`${t('roleChangeFail')}: ${error.message}`);
    }
}

async function deleteUser(username) {
    if (!confirm(t('userDeleteConfirm', username))) return;
    try {
        await apiFetch(`/api/admin/users/${username}`, { method: 'DELETE' });
        await populateUserManagementTable();
        await populateUserViewSelect();
    } catch (error) {
        alert(`${t('userDeleteFail')}: ${error.message}`);
    }
}

async function populateUserViewSelect() {
    const select = document.getElementById('user-view-select');
    select.innerHTML = '';
    try {
        const users = await apiFetch('/api/admin/users').then(res => res.json());
        // Add self first
        const selfOption = document.createElement('option');
        selfOption.value = currentUser.username;
        selfOption.textContent = `${currentUser.username} (${t('me')})`;
        select.appendChild(selfOption);

        users.forEach(user => {
            if (user.username === currentUser.username) return;
            const option = document.createElement('option');
            option.value = user.username;
            option.textContent = user.username;
            select.appendChild(option);
        });
        select.value = viewingAsUser;
    } catch (error) {
        console.error("Failed to populate user view select:", error);
    }
}

async function createNewUser(event) {
    event.preventDefault();
    const usernameInput = document.getElementById('create-username');
    const passwordInput = document.getElementById('create-password');
    const roleSelect = document.getElementById('create-role');
    const messageDiv = document.getElementById('create-user-message');

    const username = usernameInput.value;
    const password = passwordInput.value;
    const role = roleSelect.value;

    messageDiv.textContent = ''; // Clear previous messages

    try {
        await apiFetch('/api/admin/users', {
            method: 'POST',
            body: JSON.stringify({ username, password, role })
        });
        messageDiv.textContent = t('createUserSuccess');
        messageDiv.style.color = 'green';
        usernameInput.value = '';
        passwordInput.value = '';
        roleSelect.value = 'user'; // Reset to default
        await populateUserManagementTable(); // Refresh user list
        await populateUserViewSelect(); // Refresh user view dropdown
    } catch (error) {
        messageDiv.textContent = `${t('createUserFail')} ${error.message}`;
        messageDiv.style.color = 'red';
    }
}


// --- File & Folder Operations (Modified for Admin View) ---
function getRequestParams(body = {}) {
    const isAdminView = currentUser.role === 'admin' && viewingAsUser !== currentUser.username;
    if (isAdminView) {
        return { ...body, targetUser: viewingAsUser };
    }
    return body;
}

function getQueryString() {
    const isAdminView = currentUser.role === 'admin' && viewingAsUser !== currentUser.username;
    const params = new URLSearchParams();
    params.append('path', currentPath);
    if (isAdminView) {
        params.append('targetUser', viewingAsUser);
    }
    return params.toString();
}

async function loadFileList(path = '') {
    currentPath = path;
    selectedItems.clear();
    try {
        const response = await apiFetch(`/files?${getQueryString()}`);
        const files = await response.json();
        renderFileList(files);
        renderBreadcrumb();
    } catch (error) {
        alert(`${t('loadFileListFail')}: ${error.message}`);
    }
}

async function createFolder() {
    const folderName = prompt(t('folderPrompt'));
    if (!folderName) return;
    const newPath = `${currentPath}/${folderName}`.replace(/^\//, '');
    try {
        await apiFetch('/mkdir', {
            method: 'POST',
            body: JSON.stringify(getRequestParams({ path: newPath }))
        });
        loadFileList(currentPath);
    } catch (error) {
        alert(`${t('createFolderFail')}: ${error.message}`);
    }
}

function uploadFile() {
    document.getElementById('fileInput').click();
}

function handleFileInputChange() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    if (files.length === 0) return;
    
    const formData = new FormData();
    const params = getRequestParams();
    Object.keys(params).forEach(key => formData.append(key, params[key]));
    formData.append('path', currentPath);

    for (const file of files) {
        formData.append('files', file);
    }

    // Show progress bar
    const progressBarContainer = document.getElementById('progressBarContainer');
    const progressBar = document.getElementById('progressBar');
    progressBarContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload', true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = function(e) {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            progressBar.style.width = percent + '%';
            progressBar.textContent = percent + '%';
        }
    };

    xhr.onload = function() {
        progressBarContainer.style.display = 'none';
        if (xhr.status === 200) {
            alert(t('uploadSuccess'));
            loadFileList(currentPath);
        } else {
            const errorData = JSON.parse(xhr.responseText);
            alert(`${t('uploadFail')}: ${errorData.error || t('apiUnknownError')}`);
        }
        fileInput.value = ''; // Clear the input
    };

    xhr.onerror = function() {
        progressBarContainer.style.display = 'none';
        alert(`${t('uploadFail')}: ${t('apiUnknownError')}`);
        fileInput.value = '';
    };

    xhr.send(formData);
}

async function deleteSelectedItems() {
    if (selectedItems.size === 0) return;
    if (!confirm(t('deleteConfirm', selectedItems.size))) return;
    const promises = Array.from(selectedItems).map(itemPath => {
        return apiFetch(`/files/${encodeURIComponent(itemPath)}?${getQueryString()}`, { method: 'DELETE' });
    });
    try {
        await Promise.all(promises);
        alert(t('deleteSuccess'));
        loadFileList(currentPath);
    } catch (error) {
        alert(`${t('deleteFail')}: ${error.message}`);
    }
}

async function renameSelectedItem() {
    if (selectedItems.size !== 1) return;
    const oldPath = selectedItems.values().next().value;
    const oldName = oldPath.split('/').pop();
    const newName = prompt(t('renamePrompt'), oldName);
    if (!newName || newName === oldName) return;
    const newPath = `${currentPath}/${newName}`.replace(/^\//, '');
    try {
        await apiFetch('/rename', {
            method: 'PUT',
            body: JSON.stringify(getRequestParams({ oldPath, newPath }))
        });
        loadFileList(currentPath);
    } catch (error) {
        alert(`${t('renameFail')}: ${error.message}`);
    }
}

async function moveSelectedItem() {
    if (selectedItems.size !== 1) {
        alert(t('moveSingleItem'));
        return;
    }
    const oldPath = selectedItems.values().next().value;
    const itemName = oldPath.split('/').pop();
    const destinationPath = prompt(t('movePrompt'), currentPath);
    if (!destinationPath && destinationPath !== "") return;
    const normalizedDestPath = destinationPath.replace(/\/$/, '');
    if (oldPath === normalizedDestPath || normalizedDestPath.startsWith(oldPath + '/')) {
        alert(t('moveFolderInsideItself'));
        return;
    }
    const newPath = `${normalizedDestPath}/${itemName}`.replace(/^\//, '');
    if (newPath === oldPath) {
        alert(t('movePathSame'));
        return;
    }
    try {
        await apiFetch('/rename', {
            method: 'PUT',
            body: JSON.stringify(getRequestParams({ oldPath, newPath }))
        });
        loadFileList(currentPath);
    } catch (error) {
        alert(`${t('moveFail')}: ${error.message}`);
    }
}

function downloadSelectedItem() {
    if (selectedItems.size !== 1) {
        alert(t('downloadSingleItem'));
        return;
    }
    const filePath = selectedItems.values().next().value;
    const fileName = filePath.split('/').pop();
    
    // Show progress bar
    const progressBarContainer = document.getElementById('progressBarContainer');
    const progressBar = document.getElementById('progressBar');
    progressBarContainer.style.display = 'block';
    progressBar.style.width = '0%';
    progressBar.textContent = '0%';

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/download/${encodeURIComponent(filePath)}?${getQueryString()}`, true);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.responseType = 'blob'; // Important for downloading files

    xhr.onprogress = function(e) {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            progressBar.style.width = percent + '%';
            progressBar.textContent = percent + '%';
        }
    };

    xhr.onload = function() {
        progressBarContainer.style.display = 'none';
        if (xhr.status === 200) {
            const blob = xhr.response;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } else {
            alert(`${t('downloadFail')}: ${xhr.statusText || t('apiUnknownError')}`);
        }
    };

    xhr.onerror = function() {
        progressBarContainer.style.display = 'none';
        alert(`${t('downloadFail')}: ${t('apiUnknownError')}`);
    };

    xhr.send();
}

// --- UI Rendering ---
function renderFileList(files) {
    const fileList = document.getElementById('fileList');
    fileList.innerHTML = '';
    files.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
    });
    files.forEach(file => {
        const li = document.createElement('li');
        li.dataset.path = file.path;
        li.dataset.type = file.type;
        const icon = file.type === 'folder' ? '📁' : '📄';
        const name = file.name;
        li.innerHTML = `<div class="icon">${icon}</div><div class="name">${name}</div>`;
        li.draggable = true;
        if (selectedItems.has(file.path)) {
            li.classList.add('selected');
        }
        li.addEventListener('dragstart', handleDragStart);
        if (file.type === 'folder') {
            li.addEventListener('dragover', handleDragOver);
            li.addEventListener('dragenter', handleDragEnter);
            li.addEventListener('dragleave', handleDragLeave);
            li.addEventListener('drop', handleDrop);
        }
        li.addEventListener('click', (e) => handleItemClick(e, file.path));
        li.addEventListener('dblclick', () => {
            if (file.type === 'folder') {
                loadFileList(file.path);
            } else {
                previewFile(file.path);
            }
        });
        li.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (!selectedItems.has(file.path)) {
                selectedItems.clear();
                selectedItems.add(file.path);
                updateSelectionUI();
            }
            showContextMenu(e.clientX, e.clientY);
        });
        fileList.appendChild(li);
    });
}

function renderBreadcrumb() {
    const breadcrumb = document.getElementById('breadcrumb');
    breadcrumb.innerHTML = '';
    const parts = ['/', ...currentPath.split('/').filter(p => p)];
    let path = '';
    parts.forEach((part, index) => {
        if (index > 0) {
            path += (path ? '/' : '') + part;
        }
        const isLast = index === parts.length - 1;
        const link = document.createElement(isLast ? 'span' : 'a');
        link.textContent = part === '/' ? t('root') : part;
        if (!isLast) {
            const currentLinkPath = path;
            link.href = '#';
            link.onclick = (e) => {
                e.preventDefault();
                loadFileList(currentLinkPath);
            };
            breadcrumb.appendChild(link);
            breadcrumb.append(' / ');
        } else {
            breadcrumb.appendChild(link);
        }
    });
}

// --- Event Handlers ---
function handleItemClick(event, path) {
    const fileListItems = Array.from(document.querySelectorAll('#fileList li'));
    const allPaths = fileListItems.map(li => li.dataset.path);
    const isShiftPressed = event.shiftKey;
    const isCtrlPressed = event.ctrlKey || event.metaKey;

    if (isShiftPressed && lastSelectedItemPath) {
        const lastIndex = allPaths.indexOf(lastSelectedItemPath);
        const currentIndex = allPaths.indexOf(path);
        if (lastIndex !== -1 && currentIndex !== -1) {
            const start = Math.min(lastIndex, currentIndex);
            const end = Math.max(lastIndex, currentIndex);
            if (!isCtrlPressed) {
                selectedItems.clear();
            }
            for (let i = start; i <= end; i++) {
                selectedItems.add(allPaths[i]);
            }
        }
    } else if (isCtrlPressed) {
        if (selectedItems.has(path)) {
            selectedItems.delete(path);
        } else {
            selectedItems.add(path);
        }
        lastSelectedItemPath = path;
    } else {
        selectedItems.clear();
        selectedItems.add(path);
        lastSelectedItemPath = path;
    }
    updateSelectionUI();
}

function updateSelectionUI() {
    document.querySelectorAll('#fileList li').forEach(li => {
        if (selectedItems.has(li.dataset.path)) {
            li.classList.add('selected');
        } else {
            li.classList.remove('selected');
        }
    });
}

function showContextMenu(x, y) {
    const menu = document.getElementById('contextMenu');
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.style.display = 'block';
}

function hideContextMenu() {
    document.getElementById('contextMenu').style.display = 'none';
}

// --- Drag and Drop Handlers ---
function handleDragStart(e) {
    if (!selectedItems.has(e.target.closest('li').dataset.path)) {
        selectedItems.clear();
        selectedItems.add(e.target.closest('li').dataset.path);
        updateSelectionUI();
    }
    e.dataTransfer.setData('application/json', JSON.stringify(Array.from(selectedItems)));
    e.dataTransfer.effectAllowed = 'move';
}
function handleDragOver(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }
function handleDragEnter(e) {
    e.preventDefault();
    const target = e.target.closest('li[data-type="folder"]');
    if (target) target.classList.add('drag-over');
}
function handleDragLeave(e) {
    e.preventDefault();
    const target = e.target.closest('li[data-type="folder"]');
    if (target) target.classList.remove('drag-over');
}
async function handleDrop(e) {
    e.preventDefault();
    const target = e.target.closest('li[data-type="folder"]');
    if (!target) return;
    target.classList.remove('drag-over');
    const destinationPath = target.dataset.path;
    const sourcePaths = JSON.parse(e.dataTransfer.getData('application/json'));
    const movePromises = sourcePaths.map(oldPath => {
        const itemName = oldPath.split('/').pop();
        const newPath = `${destinationPath}/${itemName}`.replace(/^\//, '');
        if (oldPath === newPath || destinationPath.startsWith(oldPath)) {
            return Promise.resolve();
        }
        return apiFetch('/rename', {
            method: 'PUT',
            body: JSON.stringify(getRequestParams({ oldPath, newPath }))
        });
    });
    try {
        await Promise.all(movePromises);
    } catch (error) {
        alert(`${t('moveFail')}: ${error.message}`);
    } finally {
        loadFileList(currentPath);
    }
}

// --- Preview ---
async function previewFile(filePath) {
    const previewContainer = document.getElementById('previewContainer');
    const previewContent = document.getElementById('previewContent');
    const fileExt = filePath.split('.').pop().toLowerCase();
    const previewUrl = `/preview/${encodeURIComponent(filePath)}?${getQueryString()}`;
    previewContainer.style.display = 'flex';
    previewContent.innerHTML = 'Loading preview...';
    try {
        const response = await apiFetch(previewUrl);
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(fileExt)) {
            previewContent.innerHTML = `<img src="${objectUrl}" style="max-width:100%; max-height: 100%;">`;
        } else if (['mp4', 'webm', 'ogg'].includes(fileExt)) {
            previewContent.innerHTML = `<video src="${objectUrl}" controls style="max-width:100%;"></video>`;
        } else if (fileExt === 'pdf') {
            previewContent.innerHTML = `<iframe src="${objectUrl}" width="100%" height="100%"></iframe>`;
        } else if (['txt', 'log', 'json', 'js', 'css', 'html', 'md'].includes(fileExt)) {
            const text = await blob.text();
            previewContent.innerHTML = `<pre style="white-space:pre-wrap; word-wrap:break-word; color: var(--text-color);">${text}</pre>`;
        } else {
             previewContent.innerHTML = `<p>${t('previewError')}</p><p><a href="#" onclick="downloadSelectedItem()">${t('ctxDownload')}</a></p>`;
        }
    } catch (error) {
        previewContent.innerHTML = `<p style="color:red;">${t('previewLoadFail')}: ${error.message}</p>`;
    }
}
function closePreview() {
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.style.display = 'none';
    previewContent.innerHTML = '';
}

// --- Auth ---
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = 'login.html';
}

// --- Initializer ---
document.addEventListener('DOMContentLoaded', () => {
    // Modals
    const settingsModal = document.getElementById('settingsModal');
    const adminPanelModal = document.getElementById('adminPanelModal');
    const userGuideModal = document.getElementById('userGuideModal');
    
    // Buttons
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    const closeAdminPanelBtn = document.getElementById('closeAdminPanelBtn');
    const userGuideBtn = document.getElementById('userGuideBtn');
    const closeUserGuideBtn = document.getElementById('closeUserGuideBtn');
    
    // Settings Controls
    const themeSelect = document.getElementById('theme-select');
    const bgUrlInput = document.getElementById('bg-url-input');
    const applyBgBtn = document.getElementById('applyBgBtn');
    const clearBgBtn = document.getElementById('clearBgBtn');
    const langSelect = document.getElementById('lang-select');

    // Actions Dropdown
    const actionsDropdownBtn = document.getElementById('actionsDropdownBtn');
    const actionsDropdownContent = document.getElementById('actionsDropdownContent');
    const dropdownSelectFiles = document.getElementById('dropdownSelectFiles');
    const dropdownUpload = document.getElementById('dropdownUpload');
    const dropdownCreateFolder = document.getElementById('dropdownCreateFolder');
    const fileInput = document.getElementById('fileInput');

    // Admin Controls
    const adminUserView = document.getElementById('adminUserView');
    const userViewSelect = document.getElementById('user-view-select');
    const createUserForm = document.getElementById('create-user-form');
    const createUsernameInput = document.getElementById('create-username');
    const createPasswordInput = document.getElementById('create-password');
    const createRoleSelect = document.getElementById('create-role');
    const createUserMessageDiv = document.getElementById('create-user-message');

    // User Guide
    const userGuideContentDiv = document.getElementById('userGuideContent');


    // --- Conditional UI Visibility ---
    if (currentUser.role === 'admin') {
        adminPanelBtn.style.display = 'inline-block';
        adminUserView.style.display = 'flex';
        populateUserViewSelect();
    }

    // --- Event Listeners ---

    // Modals
    settingsBtn.addEventListener('click', () => settingsModal.style.display = 'flex');
    closeSettingsBtn.addEventListener('click', () => settingsModal.style.display = 'none');
    adminPanelBtn.addEventListener('click', openAdminPanel);
    closeAdminPanelBtn.addEventListener('click', () => adminPanelModal.style.display = 'none');
    userGuideBtn.addEventListener('click', () => loadUserGuide());
    closeUserGuideBtn.addEventListener('click', () => userGuideModal.style.display = 'none');

    // Settings
    themeSelect.addEventListener('change', () => applyTheme(themeSelect.value));
    applyBgBtn.addEventListener('click', () => applyBackground(bgUrlInput.value));
    clearBgBtn.addEventListener('click', () => {
        bgUrlInput.value = '';
        applyBackground(null);
    });
    langSelect.addEventListener('change', () => applyLanguage(langSelect.value));

    // Actions Dropdown
    actionsDropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        actionsDropdownContent.classList.toggle('show');
    });
    dropdownSelectFiles.addEventListener('click', (e) => { e.preventDefault(); uploadFile(); actionsDropdownContent.classList.remove('show'); });
    dropdownUpload.addEventListener('click', (e) => { e.preventDefault(); uploadFile(); actionsDropdownContent.classList.remove('show'); });
    dropdownCreateFolder.addEventListener('click', (e) => { e.preventDefault(); createFolder(); actionsDropdownContent.classList.remove('show'); });
    fileInput.addEventListener('change', handleFileInputChange);

    // Admin View
    userViewSelect.addEventListener('change', () => {
        viewingAsUser = userViewSelect.value;
        loadFileList(''); // Load root of the selected user
    });

    // Create User Form
    createUserForm.addEventListener('submit', createNewUser);


    // Global Click Listener
    document.addEventListener('click', (e) => {
        hideContextMenu();
        if (e.target === settingsModal) settingsModal.style.display = 'none';
        if (e.target === adminPanelModal) adminPanelModal.style.display = 'none';
        if (e.target === userGuideModal) userGuideModal.style.display = 'none'; // Close user guide modal
        if (!actionsDropdownBtn.contains(e.target)) {
            actionsDropdownContent.classList.remove('show');
        }
    });

    // Context Menu
    document.getElementById('context-rename').addEventListener('click', renameSelectedItem);
    document.getElementById('context-delete').addEventListener('click', deleteSelectedItems);
    document.getElementById('context-download').addEventListener('click', downloadSelectedItem);
    document.getElementById('context-move').addEventListener('click', moveSelectedItem);

    // --- Initial Load & Apply Settings ---
    document.getElementById('username-display').textContent = t('greeting', currentUser.username);
    
    const savedLang = localStorage.getItem('language') || 'zh-TW';
    langSelect.value = savedLang;
    applyLanguage(savedLang);

    const savedTheme = localStorage.getItem('theme') || 'system';
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);

    const savedBg = localStorage.getItem('backgroundImage');
    if (savedBg) {
        bgUrlInput.value = savedBg;
        applyBackground(savedBg);
    }
    
    loadFileList('');
});

// --- User Guide Functions ---
async function loadUserGuide() {
    const userGuideModal = document.getElementById('userGuideModal');
    const userGuideContentDiv = document.getElementById('userGuideContent');
    userGuideModal.style.display = 'flex';
    userGuideContentDiv.innerHTML = `<p>${t('loading')}</p>`; // Show loading message

    try {
        const response = await fetch('/api/guide');
        if (!response.ok) {
            throw new Error(response.statusText);
        }
        const markdownText = await response.text();
        userGuideContentDiv.innerHTML = marked.parse(markdownText);
    } catch (error) {
        userGuideContentDiv.innerHTML = `<p style="color:red;">${t('userGuideLoadFail')}: ${error.message}</p>`;
    }
}
