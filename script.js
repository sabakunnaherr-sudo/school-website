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
    document.body.style.overflow = "";
  };

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = siteNav.classList.toggle("open");
      navToggle.classList.toggle("active", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    document.addEventListener("click", (e) => {
      if (siteNav.classList.contains("open") && !siteNav.contains(e.target) && !navToggle.contains(e.target)) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && siteNav.classList.contains("open")) {
        closeMenu();
      }
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= mobileBreakpoint) {
        closeMenu();
      }
    });
  });

  let resizeRaf = null;
  window.addEventListener(
    "resize",
    () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        if (window.innerWidth > mobileBreakpoint) {
          closeMenu();
        }
      });
    },
    { passive: true }
  );

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

  // Phase 2: Homepage Redesign Logic (AOS, GSAP, Lightbox)
  const isHomePage = document.body.classList.contains("home-page");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typeof AOS !== "undefined" && !prefersReducedMotion) {
    AOS.init({
      duration: 650,
      once: true,
      offset: 60,
      easing: "ease-out-cubic"
    });
  }

  if (isHomePage && !prefersReducedMotion) {
    if (typeof Lenis !== "undefined") {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
      });
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    const pillarItems = document.querySelectorAll(".pillar-item");
    pillarItems.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        pillarItems.forEach((p) => p.classList.remove("active"));
        item.classList.add("active");
      });
    });

    if (typeof gsap !== "undefined") {
      const heroLines = document.querySelectorAll(".hero-line");
      if (heroLines.length) {
        gsap.from(heroLines, {
          y: 40,
          opacity: 0,
          duration: 0.75,
          stagger: 0.15,
          ease: "power3.out"
        });
      }

      if (typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);

        // Premium Floating Navbar Links (Organic Drift & Hover Reactivity)
        const navLinks = document.querySelectorAll(".home-page .site-nav a");
        if (navLinks.length) {
          navLinks.forEach((link, i) => {
            let driftTween = null;
            if (!prefersReducedMotion) {
              driftTween = gsap.to(link, {
                x: () => gsap.utils.random(-2.5, 2.5),
                y: () => gsap.utils.random(-2.5, 2.5),
                duration: () => gsap.utils.random(3.5, 5.0),
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: i * 0.35
              });
            }

            link.addEventListener("mouseenter", () => {
              if (driftTween) driftTween.pause();
              gsap.to(link, {
                y: -3,
                scale: 1.03,
                duration: 0.25,
                ease: "power2.out",
                overwrite: "auto"
              });
            });

            link.addEventListener("mouseleave", () => {
              gsap.to(link, {
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.45,
                ease: "power2.out",
                onComplete: () => {
                  if (driftTween) driftTween.restart();
                }
              });
            });
          });
        }

        const trustNumbers = document.querySelectorAll(".trust-num[data-count]");
        if (trustNumbers.length) {
          trustNumbers.forEach((el) => {
            const targetCount = parseFloat(el.getAttribute("data-count")) || 0;
            const suffix = el.getAttribute("data-suffix") || "";
            const counter = { val: 0 };

            gsap.to(counter, {
              val: targetCount,
              duration: 0.8,
              ease: "power2.out",
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                once: true
              },
              onUpdate: () => {
                let text = Math.round(counter.val) + suffix;
                if (document.documentElement.lang === "bn") {
                  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
                  text = text.replace(/[0-9]/g, (w) => bnDigits[+w]);
                }
                el.textContent = text;
              },
              onComplete: () => {
                if (el.hasAttribute("data-i18n") && i18nCache[document.documentElement.lang]) {
                  const val = getNestedValue(i18nCache[document.documentElement.lang], el.getAttribute("data-i18n"));
                  if (val) el.textContent = val;
                }
              }
            });
          });
        }
      }

      document.querySelectorAll(".heritage-card").forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
          card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
        });
      });
    }
  }

  // Interactive Gallery Lightbox Modal
  const lightboxModal = document.getElementById("gallery-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.querySelector(".lightbox-close");
  const galleryItems = document.querySelectorAll(".interactive-gallery-item");

  if (lightboxModal && lightboxImg && galleryItems.length) {
    galleryItems.forEach((item) => {
      item.addEventListener("click", () => {
        const img = item.querySelector("img");
        const captionText = item.getAttribute("data-caption") || img?.alt || "";
        if (img) {
          lightboxImg.src = img.src;
          lightboxImg.alt = captionText;
          if (lightboxCaption) {
            lightboxCaption.textContent = captionText;
          }
          if (typeof lightboxModal.showModal === "function") {
            lightboxModal.showModal();
          }
        }
      });
    });

    const closeLightbox = () => {
      if (typeof lightboxModal.close === "function") {
        lightboxModal.close();
      }
    };

    if (lightboxClose) {
      lightboxClose.addEventListener("click", closeLightbox);
    }

    lightboxModal.addEventListener("click", (e) => {
      const rect = lightboxModal.getBoundingClientRect();
      const isInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;
      if (!isInDialog) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightboxModal.open) {
        closeLightbox();
      }
    });
  }
});

/* ==========================================================================
   PHASE 10 — PROFESSIONAL MULTILINGUAL ARCHITECTURE ENGINE
   ========================================================================== */
const i18nCache = {};

function getPageLocalePath(lang) {
  let page = window.location.pathname.split("/").pop();
  if (!page || page === "" || page === "index.html") {
    return `locales/${lang}/home.json`;
  }
  const name = page.replace(/\.html$/, "");
  return `locales/${lang}/${name}.json`;
}

async function loadLanguage(lang) {
  const filePath = getPageLocalePath(lang);
  if (i18nCache[filePath]) return i18nCache[filePath];
  try {
    const response = await fetch(`${filePath}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load translation file from ${filePath}`);
    const data = await response.json();
    i18nCache[filePath] = data;
    return data;
  } catch (error) {
    console.error("i18n load error:", error);
    return null;
  }
}

function getNestedValue(obj, path) {
  if (!obj || !path) return null;
  const keys = path.split(".");
  let val = obj;
  for (const k of keys) {
    if (val && val[k] !== undefined) val = val[k];
    else return null;
  }
  return typeof val === "string" ? val : null;
}

function translatePage(translations, fallbackTranslations) {
  if (!translations) return;
  
  const resolveVal = (keyPath) => {
    let val = getNestedValue(translations, keyPath);
    if (val === null && fallbackTranslations) {
      console.warn(`[i18n] Missing translation key: "${keyPath}". Falling back to English.`);
      val = getNestedValue(fallbackTranslations, keyPath);
    }
    return val;
  };

  // Translate text elements & document.title
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const keyPath = el.getAttribute("data-i18n");
    const val = resolveVal(keyPath);
    if (val !== null) {
      if (el.tagName === "TITLE") {
        if (document.title !== val) document.title = val;
      } else {
        const spanChild = el.querySelector("span:not(.icon)");
        if (spanChild) {
          if (spanChild.textContent !== val) spanChild.textContent = val;
        } else {
          if (el.textContent !== val) el.textContent = val;
        }
      }
    }
  });

  // Translate placeholders
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const keyPath = el.getAttribute("data-i18n-placeholder");
    const val = resolveVal(keyPath);
    if (val !== null && el.getAttribute("placeholder") !== val) {
      el.setAttribute("placeholder", val);
    }
  });

  // Translate titles
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const keyPath = el.getAttribute("data-i18n-title");
    const val = resolveVal(keyPath);
    if (val !== null && el.getAttribute("title") !== val) {
      el.setAttribute("title", val);
    }
  });

  // Translate alt text
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    const keyPath = el.getAttribute("data-i18n-alt");
    const val = resolveVal(keyPath);
    if (val !== null && el.getAttribute("alt") !== val) {
      el.setAttribute("alt", val);
    }
  });

  // Translate aria-label
  document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
    const keyPath = el.getAttribute("data-i18n-aria-label");
    const val = resolveVal(keyPath);
    if (val !== null && el.getAttribute("aria-label") !== val) {
      el.setAttribute("aria-label", val);
    }
  });

  // Translate aria-description
  document.querySelectorAll("[data-i18n-aria-description], [data-i18n-aria-desc]").forEach((el) => {
    const keyPath = el.getAttribute("data-i18n-aria-description") || el.getAttribute("data-i18n-aria-desc");
    const val = resolveVal(keyPath);
    if (val !== null && el.getAttribute("aria-description") !== val) {
      el.setAttribute("aria-description", val);
    }
  });

  // Translate meta content attribute
  document.querySelectorAll("[data-i18n-content]").forEach((el) => {
    const keyPath = el.getAttribute("data-i18n-content");
    const val = resolveVal(keyPath);
    if (val !== null && el.getAttribute("content") !== val) {
      el.setAttribute("content", val);
    }
  });

  // Translate caption attribute
  document.querySelectorAll("[data-i18n-caption]").forEach((el) => {
    const keyPath = el.getAttribute("data-i18n-caption");
    const val = resolveVal(keyPath);
    if (val !== null && el.getAttribute("data-caption") !== val) {
      el.setAttribute("data-caption", val);
    }
  });

  // Translate data-title attribute
  document.querySelectorAll("[data-i18n-data-title]").forEach((el) => {
    const keyPath = el.getAttribute("data-i18n-data-title");
    const val = resolveVal(keyPath);
    if (val !== null && el.getAttribute("data-title") !== val) {
      el.setAttribute("data-title", val);
    }
  });


  // Update animated stat numbers if language changed
  document.querySelectorAll(".trust-num[data-count]").forEach((el) => {
    const targetCount = el.getAttribute("data-count") || "";
    const suffix = el.getAttribute("data-suffix") || "";
    let text = targetCount + suffix;
    if (document.documentElement.lang === "bn") {
      const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
      text = text.replace(/[0-9]/g, (w) => bnDigits[+w]);
    }
    if (el.textContent !== text) el.textContent = text;
  });
}

async function switchLanguage(lang) {
  localStorage.setItem("preferredLang", lang);
  document.documentElement.lang = lang;

  // Update SEO locale tags dynamically
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) ogLocale.setAttribute("content", lang === "bn" ? "bn_BD" : "en_US");

  // Update dropdown button label
  const langLabel = document.getElementById("current-lang-label");
  if (langLabel) langLabel.textContent = lang === "bn" ? "বাংলা" : "English";

  // Update dropdown options active state
  document.querySelectorAll(".lang-option").forEach((opt) => {
    if (opt.getAttribute("data-lang") === lang) opt.classList.add("active");
    else opt.classList.remove("active");
  });

  const translations = await loadLanguage(lang);
  const fallbackTranslations = lang === "en" ? translations : await loadLanguage("en");
  if (!translations) return;

  // Premium GSAP fade transition
  const translatableSelector = "[data-i18n], [data-i18n-placeholder], [data-i18n-title], [data-i18n-alt], [data-i18n-aria-label], [data-i18n-aria-description], [data-i18n-aria-desc], [data-i18n-content], [data-i18n-caption]";
  const translatableElements = document.querySelectorAll(translatableSelector);
  if (typeof gsap !== "undefined" && translatableElements.length > 0) {
    gsap.to(translatableElements, {
      opacity: 0.15,
      duration: 0.14,
      ease: "power2.inOut",
      onComplete: () => {
        translatePage(translations, fallbackTranslations);
        gsap.to(translatableElements, {
          opacity: 1,
          duration: 0.18,
          ease: "power2.out"
        });
      }
    });
  } else {
    translatePage(translations, fallbackTranslations);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const langToggleBtn = document.getElementById("lang-toggle");
  const langDropdown = document.getElementById("lang-dropdown");

  if (langToggleBtn && langDropdown) {
    langToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isShow = langDropdown.classList.toggle("show");
      langToggleBtn.setAttribute("aria-expanded", isShow ? "true" : "false");
    });

    document.addEventListener("click", (e) => {
      if (!langToggleBtn.contains(e.target) && !langDropdown.contains(e.target)) {
        langDropdown.classList.remove("show");
        langToggleBtn.setAttribute("aria-expanded", "false");
      }
    });

    document.querySelectorAll(".lang-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        const selectedLang = opt.getAttribute("data-lang");
        switchLanguage(selectedLang);
        langDropdown.classList.remove("show");
        langToggleBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  // Auto detection & initialization
  const savedLang = localStorage.getItem("preferredLang");
  let initialLang = "en";
  if (savedLang && (savedLang === "en" || savedLang === "bn")) {
    initialLang = savedLang;
  } else if (navigator.language && navigator.language.toLowerCase().startsWith("bn")) {
    initialLang = "bn";
  }
  switchLanguage(initialLang);
});

