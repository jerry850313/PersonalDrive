const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const TEMP_DIR = path.join(__dirname, 'temp');
const USERS_DB = path.join(__dirname, 'users.json');
const JWT_SECRET = 'your_super_secret_key'; // 應該使用更安全的密鑰，例如從環境變數讀取

// 確保目錄存在
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

// --- User Management ---
const readUsers = () => {
    if (!fs.existsSync(USERS_DB)) return [];
    const users = fs.readFileSync(USERS_DB);
    return JSON.parse(users);
};

const writeUsers = (users) => {
    fs.writeFileSync(USERS_DB, JSON.stringify(users, null, 2));
};

// --- Middleware ---
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: '未授權：缺少 token' });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: '未授權：無效的 token' });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: '權限不足：需要管理員權限' });
    }
    next();
};

// --- Multer Setup ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Admin can upload to other users' directories
        const username = (req.user.role === 'admin' && req.body.targetUser) ? req.body.targetUser : req.user.username;
        const userPath = path.join(UPLOAD_DIR, username, req.body.path || '');
        if (!fs.existsSync(userPath)) {
            fs.mkdirSync(userPath, { recursive: true });
        }
        cb(null, userPath);
    },
    filename: (req, file, cb) => {
        // 解決中文檔名亂碼問題
        const decodedFilename = Buffer.from(file.originalname, 'latin1').toString('utf8');
        cb(null, decodedFilename);
    }
});
const upload = multer({ storage: storage });

app.use(require('cors')());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static Serving ---
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/temp', express.static(TEMP_DIR));


// --- Auth Routes ---
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: '請提供使用者名稱和密碼' });
    }

    const users = readUsers();
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: '使用者名稱已存在' });
    }

    // The first user to register becomes an admin
    const role = users.length === 0 ? 'admin' : 'user';
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword, role });
    writeUsers(users);

    // 為新使用者建立專屬資料夾
    fs.mkdirSync(path.join(UPLOAD_DIR, username), { recursive: true });

    res.status(201).json({ message: '註冊成功' });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (!user || !await bcrypt.compare(password, user.password)) {
        return res.status(401).json({ error: '使用者名稱或密碼錯誤' });
    }

    const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: '登入成功', token, role: user.role });
});


// --- Admin Routes ---
app.get('/api/admin/users', authMiddleware, adminMiddleware, (req, res) => {
    const users = readUsers().map(u => ({ username: u.username, role: u.role }));
    res.json(users);
});

app.put('/api/admin/users/:username/role', authMiddleware, adminMiddleware, (req, res) => {
    const { username } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ error: '無效的角色' });
    }

    let users = readUsers();
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex === -1) {
        return res.status(404).json({ error: '找不到使用者' });
    }

    users[userIndex].role = role;
    writeUsers(users);
    res.json({ message: '角色更新成功' });
});

app.delete('/api/admin/users/:username', authMiddleware, adminMiddleware, (req, res) => {
    const { username } = req.params;
    
    // Prevent admin from deleting themselves
    if (req.user.username === username) {
        return res.status(400).json({ error: '無法刪除自己' });
    }

    let users = readUsers();
    const initialLength = users.length;
    users = users.filter(u => u.username !== username);

    if (users.length === initialLength) {
        return res.status(404).json({ error: '找不到使用者' });
    }

    writeUsers(users);

    // Also delete user's data directory
    const userDirPath = path.join(UPLOAD_DIR, username);
    if (fs.existsSync(userDirPath)) {
        fs.rmSync(userDirPath, { recursive: true, force: true });
    }

    res.json({ message: '使用者刪除成功' });
});

app.post('/api/admin/users', authMiddleware, adminMiddleware, async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ error: '請提供使用者名稱、密碼和角色' });
    }
    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ error: '無效的角色' });
    }

    const users = readUsers();
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ error: '使用者名稱已存在' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword, role });
    writeUsers(users);

    // Create directory for the new user
    try {
        fs.mkdirSync(path.join(UPLOAD_DIR, username), { recursive: true });
    } catch (dirError) {
        console.error(`Failed to create user directory for ${username}:`, dirError);
        return res.status(500).json({ error: `無法建立使用者目錄: ${dirError.message}` });
    }

    res.status(201).json({ message: '使用者建立成功' });
});


// --- File Management Routes (Protected) ---

// 取得使用者根目錄路徑
const getUserRoot = (username) => path.join(UPLOAD_DIR, username);

// 取得安全路徑，防止目錄遍歷 (Admins can access other users' paths)
const getSafePath = (userPath, sessionUser, targetUser) => {
    const isAdmin = sessionUser.role === 'admin';
    const effectiveUsername = (isAdmin && targetUser) ? targetUser : sessionUser.username;
    
    const userRoot = getUserRoot(effectiveUsername);
    const safeSubPath = path.normalize(userPath).replace(/^(\.\.[\/\\])+/, '');
    const fullPath = path.join(userRoot, safeSubPath);

    if (!fullPath.startsWith(userRoot)) {
        throw new Error('無效的路徑');
    }
    return fullPath;
};

// 取得文件列表
app.get('/files', authMiddleware, (req, res) => {
    try {
        const { path: requestedPath = '', targetUser } = req.query;
        const targetDir = getSafePath(requestedPath, req.user, targetUser);

        if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
            return res.status(404).json({ error: '目錄不存在' });
        }

        const files = fs.readdirSync(targetDir).map(file => {
            const filePath = path.join(targetDir, file);
            const stat = fs.statSync(filePath);
            return {
                name: file,
                path: path.join(requestedPath, file).replace(/\\/g, '/'),
                type: stat.isDirectory() ? 'folder' : 'file',
                size: stat.size,
                mtime: stat.mtime.getTime(),
            };
        });
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: `無法讀取文件: ${error.message}` });
    }
});

// 上傳文件
app.post('/upload', authMiddleware, upload.array('files', 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send({ error: '沒有上傳檔案' });
    }
    const filenames = req.files.map(f => f.originalname);
    res.json({ message: '文件上傳成功', filenames: filenames });
});

// 建立資料夾
app.post('/mkdir', authMiddleware, (req, res) => {
    const { path: newPath, targetUser } = req.body;
    if (!newPath) {
        return res.status(400).json({ error: '請提供資料夾路徑' });
    }
    try {
        const fullPath = getSafePath(newPath, req.user, targetUser);
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath, { recursive: true });
            res.json({ message: '資料夾建立成功' });
        } else {
            res.status(400).json({ error: '資料夾已存在' });
        }
    } catch (error) {
        res.status(500).json({ error: `無法建立資料夾: ${error.message}` });
    }
});

// 刪除文件或資料夾
app.delete("/files/*", authMiddleware, (req, res) => {
    const relativePath = req.params[0];
    const { targetUser } = req.query;
    try {
        const fullPath = getSafePath(relativePath, req.user, targetUser);
        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({ error: "文件或資料夾不存在" });
        }
        fs.rmSync(fullPath, { recursive: true, force: true });
        res.json({ success: true, message: '刪除成功' });
    } catch (error) {
        res.status(500).json({ error: `刪除失敗: ${error.message}` });
    }
});

// 重新命名
app.put('/rename', authMiddleware, (req, res) => {
    const { oldPath, newPath, targetUser } = req.body;
    if (!oldPath || !newPath) {
        return res.status(400).json({ error: '請提供舊路徑和新路徑' });
    }
    try {
        const oldFullPath = getSafePath(oldPath, req.user, targetUser);
        const newFullPath = getSafePath(newPath, req.user, targetUser);

        if (!fs.existsSync(oldFullPath)) {
            return res.status(404).json({ error: '來源不存在' });
        }
        if (fs.existsSync(newFullPath)) {
            return res.status(400).json({ error: '目標名稱已存在' });
        }
        fs.renameSync(oldFullPath, newFullPath);
        res.json({ message: '名稱變更成功' });
    } catch (error) {
        res.status(500).json({ error: `無法變更名稱: ${error.message}` });
    }
});

// 下載文件
app.get('/download/*', authMiddleware, (req, res) => {
    const relativePath = req.params[0];
    const { targetUser } = req.query;
    try {
        const fullPath = getSafePath(relativePath, req.user, targetUser);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            res.download(fullPath);
        } else {
            res.status(404).json({ error: '文件不存在' });
        }
    } catch (error) {
        res.status(404).json({ error: `文件不存在: ${error.message}` });
    }
});

// 預覽文件 (取代直接的 static serving)
app.get('/preview/*', authMiddleware, (req, res) => {
    const relativePath = req.params[0];
    const { targetUser } = req.query;
    try {
        const fullPath = getSafePath(relativePath, req.user, targetUser);
        if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
            res.sendFile(fullPath);
        } else {
            res.status(404).json({ error: '文件不存在' });
        }
    } catch (error) {
        res.status(404).json({ error: `文件不存在: ${error.message}` });
    }
});


// 影片轉檔
app.get('/convert', authMiddleware, (req, res) => {
    const relativePath = req.query.file;
    const { targetUser } = req.query;
    try {
        const fullPath = getSafePath(relativePath, req.user, targetUser);
        const outputName = `${path.parse(relativePath).name}.mp4`;
        const outputPath = path.join(TEMP_DIR, outputName);

        if (fs.existsSync(outputPath)) {
             return res.json({ url: `/temp/${outputName}` });
        }

        ffmpeg(fullPath)
            .output(outputPath)
            .on('end', () => {
                res.json({ url: `/temp/${outputName}` });
            })
            .on('error', (err) => {
                console.error('轉換失敗:', err);
                res.status(500).json({ error: '轉換失敗' });
            })
            .run();
    } catch (error) {
        res.status(500).json({ error: `轉檔失敗: ${error.message}` });
        }
    });
    
    // New endpoint to serve the user manual
    app.get('/api/guide', (req, res) => {
        const guidePath = path.join(__dirname, '../USER_MANUAL.md'); // Corrected path
        fs.readFile(guidePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Failed to read USER_MANUAL.md:', err);
                return res.status(500).send('無法讀取使用者說明書');
            }
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.send(data);
        });
    });    
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`NAS is working on http://localhost:${PORT}`);
    });