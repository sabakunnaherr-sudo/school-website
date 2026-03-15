// Shared interactions for all pages: menu toggle, sticky header, active links, and smooth scrolling.
document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const siteNav = document.querySelector(".site-nav");
  const navLinks = document.querySelectorAll(".site-nav a");
  const mobileBreakpoint = 900;

  const closeMenu = () => {
    if (!siteNav || !navToggle) {
      return;
    }
    siteNav.classList.remove("open");
    navToggle.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
  };

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("open");
      navToggle.classList.toggle("active", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= mobileBreakpoint) {
        closeMenu();
      }
    });
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > mobileBreakpoint) {
      closeMenu();
    }
  });

  const setHeaderState = () => {
    if (!header) {
      return;
    }
    header.classList.toggle("scrolled", window.scrollY > 16);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const linkPage = href.split("#")[0] || "index.html";
    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });

  const scrollToHash = (hash) => {
    if (!hash) {
      return;
    }

    const target = document.querySelector(hash);
    if (!target) {
      return;
    }

    const offset = header ? header.offsetHeight + 12 : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // Support smooth scrolling for in-page links and index-page hash links.
  document.querySelectorAll('a[href*="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const rawHref = anchor.getAttribute("href");
      if (!rawHref || !rawHref.includes("#")) {
        return;
      }

      const [pathPart, hashPart] = rawHref.split("#");
      if (!hashPart) {
        return;
      }

      const normalizedPath = pathPart || currentPage;
      const isCurrentPageLink =
        normalizedPath === currentPage ||
        normalizedPath === "" ||
        normalizedPath === "./" ||
        (normalizedPath === "index.html" && currentPage === "index.html");

      if (isCurrentPageLink) {
        const hash = `#${hashPart}`;
        if (document.querySelector(hash)) {
          event.preventDefault();
          closeMenu();
          scrollToHash(hash);
          history.replaceState(null, "", hash);
        }
      }
    });
  });

  if (window.location.hash) {
    setTimeout(() => scrollToHash(window.location.hash), 120);
  }

  const yearNode = document.getElementById("current-year");
  if (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  }

  // EmailJS contact form integration.
  const contactForm = document.getElementById("contact-form");
  const formFeedback = contactForm ? contactForm.querySelector(".form-feedback") : null;
  const submitButton = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

  const setFormFeedback = (message, status) => {
    if (!formFeedback) {
      return;
    }
    formFeedback.textContent = message;
    formFeedback.classList.remove("success", "error");
    if (status) {
      formFeedback.classList.add(status);
    }
    formFeedback.style.display = "block";
  };

  const setSubmitLoading = (isLoading) => {
    if (!submitButton) {
      return;
    }

    if (!submitButton.dataset.defaultLabel) {
      submitButton.dataset.defaultLabel = submitButton.textContent.trim() || "Send Message";
    }

    submitButton.disabled = isLoading;
    submitButton.classList.toggle("is-loading", isLoading);
    submitButton.setAttribute("aria-busy", String(isLoading));
    submitButton.textContent = isLoading ? "Sending..." : submitButton.dataset.defaultLabel;
  };

  if (contactForm && formFeedback && submitButton) {
    const SERVICE_ID = "service_k431wvo";
    const TEMPLATE_ID = "template_aiy37eb";
    const PUBLIC_KEY = "MFG8Pkx7Aicn5-LxR";
    const isConfigured = ![SERVICE_ID, TEMPLATE_ID, PUBLIC_KEY].some((value) =>
      ["SERVICE_ID", "TEMPLATE_ID", "PUBLIC_KEY"].includes(value)
    );

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      formFeedback.style.display = "none";
      formFeedback.classList.remove("success", "error");

      if (!window.emailjs || typeof window.emailjs.sendForm !== "function") {
        setFormFeedback("Email service is unavailable right now. Please try again later.", "error");
        return;
      }

      if (!isConfigured) {
        setFormFeedback("Email service is not configured yet. Add your EmailJS keys in js/script.js.", "error");
        return;
      }

      setSubmitLoading(true);

      try {
        await window.emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, contactForm, { publicKey: PUBLIC_KEY });
        setFormFeedback("Thank you. Your message has been sent successfully.", "success");
        contactForm.reset();
      } catch (error) {
        console.error("EmailJS send error:", error);
        setFormFeedback("Sorry, your message could not be sent. Please try again.", "error");
      } finally {
        setSubmitLoading(false);
      }
    });
  }

  // Contact page map switcher for multiple branch locations.
  const branchMap = document.getElementById("branch-map");
  const mapOptions = document.querySelectorAll(".map-option");

  if (branchMap && mapOptions.length) {
    const setBranchMap = ({ query, src }) => {
      if (src) {
        branchMap.src = src;
        return;
      }

      if (!query) {
        return;
      }
      branchMap.src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
    };

    mapOptions.forEach((option) => {
      option.addEventListener("click", () => {
        const mapQuery = option.getAttribute("data-map-query");
        const mapSrc = option.getAttribute("data-map-src");
        if (!mapQuery && !mapSrc) {
          return;
        }

        mapOptions.forEach((item) => {
          item.classList.remove("active");
          item.setAttribute("aria-pressed", "false");
        });

        option.classList.add("active");
        option.setAttribute("aria-pressed", "true");
        setBranchMap({ query: mapQuery, src: mapSrc });
      });
    });
  }

  // Teachers page branch switcher.
  const facultyOptions = document.querySelectorAll(".faculty-option");
  const facultyPanels = document.querySelectorAll(".faculty-panel");

  if (facultyOptions.length && facultyPanels.length) {
    const activateFacultyPanel = (targetId) => {
      if (!targetId) {
        return;
      }

      facultyPanels.forEach((panel) => {
        const isActive = panel.id === targetId;
        panel.classList.toggle("active", isActive);
        panel.setAttribute("aria-hidden", String(!isActive));
      });

      facultyOptions.forEach((option) => {
        const isActive = option.getAttribute("data-faculty-target") === targetId;
        option.classList.toggle("active", isActive);
        option.setAttribute("aria-pressed", String(isActive));
      });
    };

    const defaultOption = Array.from(facultyOptions).find((item) => item.classList.contains("active")) || facultyOptions[0];
    activateFacultyPanel(defaultOption.getAttribute("data-faculty-target"));

    facultyOptions.forEach((option) => {
      option.addEventListener("click", () => {
        activateFacultyPanel(option.getAttribute("data-faculty-target"));
      });
    });
  }

  // Subtle scroll-reveal animation for modern section transitions.
  const revealTargets = Array.from(
    document.querySelectorAll(
      ".section, .section-heading, .card, .teacher-card, .gallery-item, .contact-card, .cta-banner, .page-hero .container"
    )
  );

  revealTargets.forEach((node, index) => {
    if (node.closest(".hero")) {
      return;
    }
    node.classList.add("reveal");
    node.style.transitionDelay = `${Math.min((index % 8) * 40, 220)}ms`;
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealTargets.forEach((node) => {
      if (!node.classList.contains("reveal")) {
        return;
      }
      revealObserver.observe(node);
    });
  } else {
    revealTargets.forEach((node) => node.classList.add("in-view"));
  }
});
