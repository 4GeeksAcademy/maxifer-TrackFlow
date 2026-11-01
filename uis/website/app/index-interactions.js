const header = document.querySelector("header");
      const menuButton = document.querySelector("[data-menu-button]");
      const mobileMenu = document.querySelector("[data-mobile-menu]");
      const mobileMenuContent = document.querySelector("[data-mobile-menu-content]");
      const navLinks = document.querySelectorAll("[data-nav-link]");
      const menuLines = {
        top: document.querySelector('[data-menu-line="top"]'),
        middle: document.querySelector('[data-menu-line="middle"]'),
        bottom: document.querySelector('[data-menu-line="bottom"]')
      };
      const faqItems = document.querySelectorAll("[data-faq-item]");
      const navSections = Array.from(navLinks)
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);
      const scrollRevealItems = [
        ...document.querySelectorAll("#operacion article"),
        ...document.querySelectorAll("#plataforma > .max-w-3xl > *, #plataforma .mt-10 > article"),
        ...document.querySelectorAll("#mercados > div > div:first-child > *, #mercados article"),
        ...document.querySelectorAll("#faqs > div > .max-w-3xl > *, [data-faq-item]"),
        ...document.querySelectorAll("main > section:not([id]):last-of-type > div"),
        ...document.querySelectorAll("footer > div > *")
      ];

      function setupScrollReveal() {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        scrollRevealItems.forEach((item, index) => {
          item.dataset.scrollReveal = "";
          item.style.setProperty("--reveal-delay", `${Math.min((index % 4) * 55, 165)}ms`);

          if (reduceMotion) {
            item.dataset.revealVisible = "true";
          }
        });

        if (reduceMotion || !("IntersectionObserver" in window)) {
          scrollRevealItems.forEach((item) => {
            item.dataset.revealVisible = "true";
          });
          return;
        }

        const revealObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (!entry.isIntersecting) return;

              entry.target.dataset.revealVisible = "true";
              observer.unobserve(entry.target);
            });
          },
          {
            rootMargin: "0px 0px -12% 0px",
            threshold: 0.12
          }
        );

        scrollRevealItems.forEach((item) => revealObserver.observe(item));
      }

      function getMenuLabel(open) {
        const i18n = window.TrackFlowI18n;
        if (i18n) {
          return i18n.t(open ? "common.menuClose" : "common.menuOpen");
        }

        return open ? "Cerrar menú" : "Abrir menú";
      }

      function setMobileMenu(open) {
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
        menuLines.top.classList.toggle("translate-y-1.5", open);
        menuLines.top.classList.toggle("rotate-45", open);
        menuLines.middle.classList.toggle("opacity-0", open);
        menuLines.bottom.classList.toggle("-translate-y-1.5", open);
        menuLines.bottom.classList.toggle("-rotate-45", open);
      }

      function setFaqOpen(item, open) {
        const trigger = item.querySelector("[data-faq-trigger]");
        const panel = item.querySelector("[data-faq-panel]");
        const icon = item.querySelector("[data-faq-icon]");

        trigger.setAttribute("aria-expanded", String(open));
        item.classList.toggle("border-[color:rgb(var(--tf-brand-rgb)/0.4)]", open);
        item.classList.toggle("border-[var(--tf-border)]", !open);
        item.classList.toggle("shadow-lg", open);
        item.classList.toggle("shadow-[color:rgb(var(--tf-brand-rgb)/0.05)]", open);
        panel.classList.toggle("grid-rows-[1fr]", open);
        panel.classList.toggle("grid-rows-[0fr]", !open);
        panel.classList.toggle("opacity-0", !open);
        icon.classList.toggle("rotate-45", open);
      }

      function setActiveNavLink(sectionId) {
        navLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${sectionId}`;

          if (isActive) {
            link.dataset.active = "true";
            link.setAttribute("aria-current", "page");
          } else {
            delete link.dataset.active;
            link.removeAttribute("aria-current");
          }
        });
      }

      function updateActiveNavLink() {
        const headerOffset = getHeaderOffset();
        const referenceY = window.scrollY + headerOffset + window.innerHeight * 0.25;
        let activeSection = null;

        navSections.forEach((section) => {
          if (section.offsetTop <= referenceY) {
            activeSection = section;
          }
        });

        setActiveNavLink(activeSection?.id);
      }

      faqItems.forEach((item) => {
        const trigger = item.querySelector("[data-faq-trigger]");

        trigger.addEventListener("click", () => {
          const isOpen = trigger.getAttribute("aria-expanded") === "true";

          faqItems.forEach((faqItem) => setFaqOpen(faqItem, false));
          setFaqOpen(item, !isOpen);
        });
      });

      menuButton.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";
        setMobileMenu(!isOpen);
      });

      mobileMenu.addEventListener("click", (event) => {
        if (event.target.closest("a")) {
          setMobileMenu(false);
        }
      });

      const getHeaderOffset = () => header.firstElementChild.getBoundingClientRect().height;

      const scrollToAnchor = (target) => {
        const targetTop = target.getBoundingClientRect().top + window.scrollY;
        const offsetTop = Math.max(targetTop - getHeaderOffset(), 0);

        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      };

      document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
          const hash = link.getAttribute("href");
          const target = hash === "#" ? null : document.querySelector(hash);

          if (!target) return;

          event.preventDefault();
          setMobileMenu(false);

          requestAnimationFrame(() => {
            scrollToAnchor(target);
            history.pushState(null, "", hash);
            setActiveNavLink(target.id);
          });
        });
      });

      window.addEventListener("scroll", updateActiveNavLink, { passive: true });
      window.addEventListener("resize", updateActiveNavLink);
      window.addEventListener("load", updateActiveNavLink);
      setupScrollReveal();
      updateActiveNavLink();

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          setMobileMenu(false);
        }
      });

export {};
