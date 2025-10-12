(function () {
    // Footer component - automatically adds footer to pages with [data-footer] attribute
    // Uses homepage footer as master template
    document.querySelectorAll('[data-footer]').forEach((footerContainer) => {
        const footer = document.createElement('footer');
        footer.className = 'footer site-footer';

        footer.innerHTML = `
            <h2 class="footer-title">reach</h2>
            <p class="footer-text">
                connect on <a href="https://x.com/eduardluta" target="_blank" rel="noopener noreferrer">X</a>
                <a href="https://github.com/eduardluta" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="https://linkedin.com/in/eduardluta" target="_blank" rel="noopener noreferrer">LinkedIn</a>
                - or send me an email at <a href="mailto:hello@eduardluta.com">hello@eduardluta.com</a>
            </p>
        `;

        footerContainer.appendChild(footer);
    });
})();
