(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");
  const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
  const printButtons = document.querySelectorAll("[data-print]");
  const copyEmailButton = document.querySelector("[data-copy-email]");
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  function closeMenu() {
    if (!navMenu || !navToggle) return;
    navMenu.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });
      history.pushState(null, "", link.getAttribute("href"));
      closeMenu();
    });
  });

  printButtons.forEach((button) => {
    button.addEventListener("click", () => window.print());
  });

  if (copyEmailButton) {
    copyEmailButton.addEventListener("click", async () => {
      const email = document.body.dataset.email || "[email]";
      const originalText = copyEmailButton.textContent;

      try {
        await navigator.clipboard.writeText(email);
        copyEmailButton.textContent = "Copied";
        copyEmailButton.classList.add("copied");
      } catch (error) {
        copyEmailButton.textContent = "Copy unavailable";
      }

      window.setTimeout(() => {
        copyEmailButton.textContent = originalText;
        copyEmailButton.classList.remove("copied");
      }, 1800);
    });
  }

  if ("IntersectionObserver" in window && sections.length > 0) {
    const activeObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${entry.target.id}`;
            link.classList.toggle("is-active", isActive);
            if (isActive) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0.01
      }
    );

    sections.forEach((section) => activeObserver.observe(section));
  }

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealItems = document.querySelectorAll(".reveal");
    document.body.classList.add("reveal-ready");

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12
      }
    );

    revealItems.forEach((item) => revealObserver.observe(item));
  }

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
})();
