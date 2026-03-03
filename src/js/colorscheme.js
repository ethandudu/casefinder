// read settings.ini file and apply colorscheme
async function applyColorScheme() {
    const theme = await window.electronAPI.getTheme();
    document.documentElement.setAttribute('data-bs-theme', theme);
}

window.addEventListener('DOMContentLoaded', () => {
    applyColorScheme();
});