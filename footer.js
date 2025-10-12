(function () {
    // Footer component - automatically adds footer to pages with [data-footer] attribute
    document.querySelectorAll('[data-footer]').forEach((footerContainer) => {
        const footer = document.createElement('footer');
        footer.className = 'site-footer';

        footer.innerHTML = `
            <div class="footer-title">Connect</div>
            <div class="footer-links">
                <a href="https://x.com/eduardluta" target="_blank" rel="noopener noreferrer">X</a> ·
                <a href="https://github.com/eduardluta" target="_blank" rel="noopener noreferrer">GitHub</a> ·
                <a href="https://linkedin.com/in/eduardluta" target="_blank" rel="noopener noreferrer">LinkedIn</a> ·
                <a href="mailto:hello@eduardluta.com">Email</a>
            </div>
        `;

        footerContainer.appendChild(footer);
    });
})();
