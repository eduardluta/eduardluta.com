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
        nav.classList.add('site-nav');

        let header = nav.querySelector('.logo');
        if (!header) {
            header = document.createElement('header');
            header.className = 'logo';
            header.textContent = 'Eduard Luta';
            nav.prepend(header);
        } else {
            header.textContent = 'Eduard Luta';
        }

        let menu = nav.querySelector('.nav-menu');
        if (!menu) {
            menu = document.createElement('ul');
            menu.className = 'nav-menu';
            nav.appendChild(menu);
        }

        const fragment = document.createDocumentFragment();

        NAV_ITEMS.forEach((item) => {
            const li = document.createElement('li');
            const link = document.createElement('a');
            const href = `${root}${item.href}`;
            const isActive = item.isActive(currentPath);

            link.href = href;
            link.textContent = `${item.icon} ${item.label}`;

            if (isActive) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }

            li.appendChild(link);
            fragment.appendChild(li);
        });

        menu.replaceChildren(fragment);
    });
})();
