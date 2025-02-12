const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path')
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite3'), (err) => {
    if (err) {
        console.error(err.message);
    } else {
        initializeDatabase();
    }
});

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
    win.maximize();
    win.show();
    win.loadFile('src/index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
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
    
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error(err.message);
            event.reply('search-results', {error: err.message});
        } else {
            if (rows.length === 0) {
                event.reply('search-results', {error: 'No results found.'});
            } else {
                event.reply('search-results', {results: rows});
            }
        }
    });
});

ipcMain.on('get-cities', (event, arg) => {
    db.all(`SELECT DISTINCT city FROM cases`, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            event.reply('cities', {error: err.message});
        } else {
            if (rows.length === 0) {
                event.reply('cities', {error: 'No cities found.'});
            } else {
                event.reply('cities', {cities: rows});
            }
        }
    });
});