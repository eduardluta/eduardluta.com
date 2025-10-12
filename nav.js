(function () {
    const NAV_ITEMS = [
        {
            href: 'index.html',
            label: 'Home',
            icon: '🏠',
            isActive: (path) => path === '/' || path.endsWith('/index.html')
        },
        {
            href: 'about.html',
            label: 'About Me',
            icon: '👤',
            isActive: (path) => path.endsWith('/about.html')
        },
        {
            href: 'blog.html',
            label: 'Blog',
            icon: '✍️',
            isActive: (path) => path.includes('/blog') || path.endsWith('/blog.html')
        },
        {
            href: 'principles.html',
            label: 'Principles',
            icon: '💎',
            isActive: (path) => path.endsWith('/principles.html')
        },
        {
            href: 'worth-the-time.html',
            label: 'Worth the time',
            icon: '⭐',
            isActive: (path) => path.endsWith('/worth-the-time.html')
        }
    ];

    function normalizePath(pathname) {
        if (!pathname) {
            return '';
        }
        try {
            return decodeURIComponent(pathname).toLowerCase();
        } catch (error) {
            return pathname.toLowerCase();
        }
    }

    const currentPath = normalizePath(window.location.pathname || '');

    document.querySelectorAll('[data-nav]').forEach((nav) => {
        const root = nav.dataset.navRoot || '';
        const itemsMarkup = NAV_ITEMS.map((item) => {
            const href = `${root}${item.href}`;
            const isActive = item.isActive(currentPath);
            const activeClass = isActive ? ' class="active"' : '';
            const ariaCurrent = isActive ? ' aria-current="page"' : '';
            return `<li><a href="${href}"${activeClass}${ariaCurrent}>${item.icon} ${item.label}</a></li>`;
        }).join('');

        nav.innerHTML = `
            <header class="logo">Eduard Luta</header>
            <ul class="nav-menu">
                ${itemsMarkup}
            </ul>
        `;
    });
})();
