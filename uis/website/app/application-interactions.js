const menuButton = document.querySelector("[data-menu-button]");
      const mobileMenu = document.querySelector("[data-mobile-menu]");
      const mobileMenuContent = document.querySelector("[data-mobile-menu-content]");
      const header = document.querySelector("header");
      const menuLines = {
        top: document.querySelector('[data-menu-line="top"]'),
        middle: document.querySelector('[data-menu-line="middle"]'),
        bottom: document.querySelector('[data-menu-line="bottom"]')
      };

      function getMenuLabel(open) {
        const i18n = window.TrackFlowI18n;
        if (i18n) {
          return i18n.t(open ? "common.menuClose" : "common.menuOpen");
        }

        return open ? "Cerrar menú" : "Abrir menú";
      }

      function setMobileMenu(open) {
        if (!menuButton || !mobileMenu || !mobileMenuContent) return;

        menuButton.setAttribute("aria-expanded", String(open));
        const menuLabel = getMenuLabel(open);
        menuButton.setAttribute("aria-label", menuLabel);

        const srMenuLabel = menuButton.querySelector("[data-menu-label]");
        if (srMenuLabel) {
          srMenuLabel.textContent = menuLabel;
        }

        mobileMenu.setAttribute("aria-hidden", String(!open));
        mobileMenu.inert = !open;
        mobileMenu.classList.toggle("pointer-events-none", !open);
        mobileMenu.classList.toggle("grid-rows-[0fr]", !open);
        mobileMenu.classList.toggle("grid-rows-[1fr]", open);
        mobileMenu.classList.toggle("opacity-0", !open);
        mobileMenu.classList.toggle("opacity-100", open);
        mobileMenuContent.classList.toggle("-translate-y-3", !open);
        mobileMenuContent.classList.toggle("translate-y-0", open);
        mobileMenuContent.classList.toggle("pb-0", !open);
        mobileMenuContent.classList.toggle("pt-0", !open);
        mobileMenuContent.classList.toggle("pb-5", open);
        mobileMenuContent.classList.toggle("pt-2", open);

        if (menuLines.top && menuLines.middle && menuLines.bottom) {
          menuLines.top.classList.toggle("translate-y-1.5", open);
          menuLines.top.classList.toggle("rotate-45", open);
          menuLines.middle.classList.toggle("opacity-0", open);
          menuLines.bottom.classList.toggle("-translate-y-1.5", open);
          menuLines.bottom.classList.toggle("-rotate-45", open);
        }
      }

      if (menuButton) {
        menuButton.addEventListener("click", () => {
          const open = menuButton.getAttribute("aria-expanded") === "true";
          setMobileMenu(!open);
        });

        document.querySelectorAll('[data-mobile-menu] [data-nav-link]').forEach((link) => {
          link.addEventListener("click", () => setMobileMenu(false));
        });

        document.addEventListener("click", (event) => {
          const open = menuButton.getAttribute("aria-expanded") === "true";
          if (!open || !header) return;
          if (!header.contains(event.target)) {
            setMobileMenu(false);
          }
        });

        window.matchMedia("(min-width: 768px)").addEventListener("change", (event) => {
          if (event.matches) {
            setMobileMenu(false);
          }
        });
      }

export {};
