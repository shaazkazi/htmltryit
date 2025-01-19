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
    const formattedCode = `<!-- HTML -->
${htmlEditor.getValue()}

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