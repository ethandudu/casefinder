const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path')
let db;
// Expose app version to renderer via IPC
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

// Expose theme to renderer via IPC
ipcMain.handle('get-theme', () => {
    const fs = require('fs');
    const ini = require('ini');
    const configPath = path.join(__dirname, 'settings.ini');
    if (fs.existsSync(configPath)) {
        return ini.parse(fs.readFileSync(configPath, 'utf-8')).theme || 'light';
    }
    return 'light';
});


function initializeSettings() {
    const configPath = path.join(__dirname, 'settings.ini');
    if (!require('fs').existsSync(configPath)) {
        require('fs').writeFileSync(configPath, 'theme=light; dark or light');
    }
}

function initializeDatabase() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS cases (
            "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            "city" INTEGER NOT NULL DEFAULT 0,
            "section" VARCHAR(2) NOT NULL,
            "plot" VARCHAR(255) NOT NULL,
            "case" VARCHAR(15) NOT NULL,
            "owner" VARCHAR(255) NULL DEFAULT NULL
        )`);
        db.run('CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)');
    });
}

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
        },
        show: false,
        icon: path.join(__dirname, 'app.ico')
    })
    initializeDatabase();
    initializeSettings();
    win.maximize();
    win.show();
    win.loadFile('src/index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        db.close();
        app.quit()
    }
})

ipcMain.on('search', (event, arg) => {
    const {searchtype, city, section, plot, owner} = arg;
    let query, params;
    if (searchtype === 'plot') {
        query = `SELECT * FROM cases WHERE city = ? AND section = ? AND plot LIKE ? LIMIT 50`;
        params = [city, section, `%${plot}%`];
    } else {
        query = `SELECT * FROM cases WHERE city = ? AND owner LIKE ? LIMIT 50`;
        params = [city, `%${owner}%`];
    }
    
    const stmt = db.prepare(query);
    const rows = stmt.all(params);
    if (rows.length === 0) {
        event.reply('search-results', {error: 'No results found.'});
    } else {
        event.reply('search-results', {results: rows});
    }
});

ipcMain.on('add-case', (event, arg) => {
    
});

ipcMain.on('get-cities', (event, arg) => {
    const stmt = db.prepare('SELECT DISTINCT city FROM cases');
    const rows = stmt.all();
    if (rows.length === 0) {
        event.reply('cities', {error: 'No cities found.'});
        return;
    }
    event.reply('cities', {cities: rows});
});