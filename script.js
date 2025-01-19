// Initialize CodeMirror editors
const htmlEditor = CodeMirror.fromTextArea(document.getElementById('html-code'), {
    mode: 'xml',
    theme: 'dracula',
    lineNumbers: true,
    autoCloseTags: true,
    lineWrapping: true
});

const cssEditor = CodeMirror.fromTextArea(document.getElementById('css-code'), {
    mode: 'css',
    theme: 'dracula',
    lineNumbers: true,
    autoCloseBrackets: true,
    lineWrapping: true
});

const jsEditor = CodeMirror.fromTextArea(document.getElementById('js-code'), {
    mode: 'javascript',
    theme: 'dracula',
    lineNumbers: true,
    autoCloseBrackets: true,
    lineWrapping: true
});

function handleEditorAction(editorId, action) {
    if (action === 'copy') {
        const content = editorId === 'html' ? htmlEditor.getValue() :
                       editorId === 'css' ? cssEditor.getValue() :
                       jsEditor.getValue();
        
        navigator.clipboard.writeText(content).then(() => {
            const btn = document.querySelector(`.editor.${editorId} .copy-btn i`);
            btn.className = 'fas fa-check';
            setTimeout(() => {
                btn.className = 'fas fa-ellipsis-vertical';
            }, 2000);
        });
    } else if (action === 'paste') {
        navigator.clipboard.readText().then(text => {
            const editor = editorId === 'html' ? htmlEditor :
                          editorId === 'css' ? cssEditor :
                          jsEditor;
            
            const doc = editor.getDoc();
            const cursor = doc.getCursor();
            doc.replaceRange(text, cursor);
        });
    } else if (action === 'clear') {
        const editor = editorId === 'html' ? htmlEditor :
                      editorId === 'css' ? cssEditor :
                      jsEditor;
        editor.setValue('');
        editor.clearHistory();
    }
}document.querySelectorAll('.copy-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const editorId = btn.closest('.editor').classList[1];
        const action = btn.dataset.action;
        handleEditorAction(editorId, action);
    });
});

function showErrors(errors) {
    const toast = document.querySelector('.error-toast');
    const errorList = errors.map(err => 
        `<div><i class="fas fa-exclamation-circle"></i>${err}</div>`
    ).join('');
    
    toast.innerHTML = errorList;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000); // Increased time to read multiple errors
}

document.getElementById('run-code').addEventListener('click', () => {
    const errors = [];
    
    // HTML validation
    const htmlCode = htmlEditor.getValue();
    const voidElements = new Set(['!doctype', 'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
    const openTags = [];
    const tagPattern = /<\/?([^\s>]+)[^>]*>/gi;
    let match;

    while ((match = tagPattern.exec(htmlCode)) !== null) {
        const fullTag = match[0];
        const tag = match[1].toLowerCase();
        
        // Skip comments
        if (fullTag.startsWith('<!--')) continue;
        
        // Skip void elements
        if (voidElements.has(tag)) continue;
        
        const isClosing = fullTag.startsWith('</');
        
        if (!isClosing) {
            openTags.push(tag);
        } else {
            const lastOpenTag = openTags.pop();
            if (lastOpenTag !== tag) {
                errors.push(`HTML: Mismatched tag. Found </${tag}>, expected </${lastOpenTag}>`);
            }
        }
    }

    if (openTags.length > 0) {
        const unclosedTags = openTags.reverse().map(tag => `<${tag}>`).join(', ');
        errors.push(`HTML: Unclosed tags: ${unclosedTags}`);
    }

    // CSS validation
const cssCode = cssEditor.getValue().trim();
if (cssCode && /{[^}]*$/.test(cssCode)) {
    errors.push("CSS: Unclosed bracket detected");
}
if (cssCode && /[^;{\s]\s*}/.test(cssCode)) {
    errors.push("CSS: Missing semicolon");
}

    // JavaScript validation
    const jsCode = jsEditor.getValue();
    try {
        new Function(jsCode);
    } catch (e) {
        errors.push(`JavaScript: ${e.message}`);
    }

    if (errors.length > 0) {
        showErrors(errors);
        return;
    }

    const jsCodeWithErrorHandling = `
        <script>
            window.onerror = function(msg, url, lineNo, columnNo, error) {
                window.parent.postMessage({
                    type: 'error',
                    message: msg,
                    line: lineNo,
                    column: columnNo
                }, '*');
                return false;
            };
            try {
                ${jsCode}
            } catch(e) {
                window.onerror(e.message, null, e.lineNumber);
            }
        </script>
    `;
    
    const output = document.getElementById('output');
    output.srcdoc = `
        <!DOCTYPE html>
        <html>
            <head>
                <style>${cssCode}</style>
            </head>
            <body>
                ${htmlCode}
                ${jsCodeWithErrorHandling}
            </body>
        </html>
    `;
});
window.addEventListener('message', function(event) {
    if (event.data && event.data.type === 'error') {
        const errorMsg = `${event.data.message}${event.data.line ? ` (line ${event.data.line})` : ''}`;
        showError(errorMsg);
    }
});

document.getElementById('reset-code').addEventListener('click', () => {
    htmlEditor.setValue('');
    cssEditor.setValue('');
    jsEditor.setValue('');
    document.getElementById('output').srcdoc = '';
    
    const resetBtn = document.getElementById('reset-code');
    resetBtn.innerHTML = '✓ Cleared!';
    setTimeout(() => {
        resetBtn.innerHTML = '<i class="fas fa-undo"></i> Reset';
    }, 2000);
});

document.getElementById('share-code').addEventListener('click', async () => {
    const formattedCode = `${htmlEditor.getValue()}

/* CSS */
${cssEditor.getValue()}

// JavaScript
${jsEditor.getValue()}`;
    
    try {
        await navigator.clipboard.writeText(formattedCode);
        const shareBtn = document.getElementById('share-code');
        shareBtn.innerHTML = '✓ Copied!';
        setTimeout(() => {
            shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> Share';
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
});

// Add this to handle click-based dropdown
document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const copyOptions = btn.closest('.copy-options');
        copyOptions.classList.toggle('active');
    });
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
    document.querySelectorAll('.copy-options.active').forEach(el => {
        el.classList.remove('active');
    });
});

// Add to script.js
function autoSave() {
    const code = {
        html: htmlEditor.getValue(),
        css: cssEditor.getValue(),
        js: jsEditor.getValue()
    };
    localStorage.setItem('savedCode', JSON.stringify(code));
}

// Auto-save every 30 seconds
setInterval(autoSave, 30000);

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        document.getElementById('run-code').click();
    }
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        autoSave();
    }
});

function formatCode() {
    // Add Prettier formatting
    const formatted = prettier.format(code, {
        parser: "babel",
        plugins: prettierPlugins
    });
}
