(function () {
    // Footer component - automatically adds footer to pages with [data-footer] attribute
    // Uses homepage footer as master template
    document.querySelectorAll('[data-footer]').forEach((footerContainer) => {
        const footer = document.createElement('footer');
        footer.className = 'footer site-footer';

        footer.innerHTML = `
            <h2 class="footer-title">reach</h2>
            <p class="footer-text">
                connect on <a href="https://github.com/eduardluta" target="_blank" rel="noopener noreferrer">GitHub</a>
                <a href="https://www.linkedin.com/in/eduard-luta/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            </p>
        `;

        footerContainer.appendChild(footer);
    });
})();
