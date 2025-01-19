document.getElementById('run-code').addEventListener('click', () => {
    const htmlCode = document.getElementById('html-code').value;
    const cssCode = `<style>${document.getElementById('css-code').value}</style>`;
    const jsCode = `<script>${document.getElementById('js-code').value}</script>`;
    const output = document.getElementById('output');
  
    output.srcdoc = `${htmlCode}${cssCode}${jsCode}`;
  });
  
  // Save code to localStorage
  function saveToLocalStorage() {
      localStorage.setItem('htmlCode', document.getElementById('html-code').value);
      localStorage.setItem('cssCode', document.getElementById('css-code').value);
      localStorage.setItem('jsCode', document.getElementById('js-code').value);
  }
  
  // Load saved code
  function loadFromLocalStorage() {
      document.getElementById('html-code').value = localStorage.getItem('htmlCode') || '';
      document.getElementById('css-code').value = localStorage.getItem('cssCode') || '';
      document.getElementById('js-code').value = localStorage.getItem('jsCode') || '';
  }
  
  // Add auto-save event listeners
  document.getElementById('html-code').addEventListener('input', saveToLocalStorage);
  document.getElementById('css-code').addEventListener('input', saveToLocalStorage);
  document.getElementById('js-code').addEventListener('input', saveToLocalStorage);
  
  // Load saved code on page load
  document.addEventListener('DOMContentLoaded', loadFromLocalStorage);
  // Share functionality
  document.getElementById('share-code').addEventListener('click', async () => {
      const htmlCode = document.getElementById('html-code').value;
      const cssCode = document.getElementById('css-code').value;
      const jsCode = document.getElementById('js-code').value;
    
      // Create a formatted string with all code
      const formattedCode = `<!-- HTML -->
  ${htmlCode}

  /* CSS */
  ${cssCode}

  // JavaScript
  ${jsCode}`;
    
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

  // Reset functionality
  document.getElementById('reset-code').addEventListener('click', () => {
      document.getElementById('html-code').value = '';
      document.getElementById('css-code').value = '';
      document.getElementById('js-code').value = '';
      document.getElementById('output').srcdoc = '';
    
      // Clear localStorage if you're using it
      localStorage.removeItem('htmlCode');
      localStorage.removeItem('cssCode');
      localStorage.removeItem('jsCode');
    
      const resetBtn = document.getElementById('reset-code');
      resetBtn.innerHTML = '✓ Cleared!';
      setTimeout(() => {
          resetBtn.innerHTML = '<i class="fas fa-undo"></i> Reset';
      }, 2000);
  });

  // Add this to load shared code when page loads
  window.addEventListener('load', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedCode = urlParams.get('code');
    
      if (sharedCode) {
          try {
              const codeData = JSON.parse(atob(sharedCode));
              document.getElementById('html-code').value = codeData.html || '';
              document.getElementById('css-code').value = codeData.css || '';
              document.getElementById('js-code').value = codeData.js || '';
          } catch (err) {
              console.error('Failed to load shared code:', err);
          }
      }
});