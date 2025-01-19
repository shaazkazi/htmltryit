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
    }
}
document.querySelectorAll('.copy-action').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const editorId = btn.closest('.editor').classList[1];
        const action = btn.dataset.action;
        handleEditorAction(editorId, action);
    });
});

document.getElementById('run-code').addEventListener('click', () => {
    const htmlCode = htmlEditor.getValue();
    const cssCode = `<style>${cssEditor.getValue()}</style>`;
    const jsCode = `<script>${jsEditor.getValue()}</script>`;
    const output = document.getElementById('output');
    
    output.srcdoc = `${htmlCode}${cssCode}${jsCode}`;
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
