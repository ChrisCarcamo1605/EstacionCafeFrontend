const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace window.location.href = '/path'
    content = content.replace(/window\.location\.href\s*=\s*'\/([^']+)'/g, 'window.location.href = import.meta.env.BASE_URL + \'$1\'');
    // Replace window.location.href = "/path"
    content = content.replace(/window\.location\.href\s*=\s*"\/([^"]+)"/g, 'window.location.href = import.meta.env.BASE_URL + "$1"');
    
    // Replace inline object map paths like : "/administracion/..." -> : import.meta.env.BASE_URL + "administracion/..."
    content = content.replace(/:\s*"\/([^"]+)"/g, ': import.meta.env.BASE_URL + "$1"');
    content = content.replace(/:\s*'\/([^']+)'/g, ': import.meta.env.BASE_URL + \'$1\'');

    // Replace returnPath="/path" to returnPath={import.meta.env.BASE_URL + "path"}
    content = content.replace(/returnPath="\/([^"]+)"/g, 'returnPath={import.meta.env.BASE_URL + "$1"}');

    // Also just in case: href="/path" -> href={import.meta.env.BASE_URL + "path"}
    // But be careful to not replace something we already replaced. Our previous replacements did href={import.meta.env.BASE_URL + "path"}
    // So something like `<a href="/path"`
    content = content.replace(/href="\/([^"]+)"/g, 'href={import.meta.env.BASE_URL + "$1"}');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated: ' + filePath);
    }
}

function walkDir(dir) {
    for (const file of fs.readdirSync(dir)) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (file.match(/\.(astro|ts|js|jsx|tsx|vue|svelte)$/)) {
            processFile(fullPath);
        }
    }
}

walkDir('src');
console.log('Done mapping routes.');
