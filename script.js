const FALLBACK_EMAIL = "bchannelmanagement@proton.me";
const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#nav-menu");
const siteHeader = document.querySelector(".site-header");
let lastScrollY = window.scrollY;
let tickingHeader = false;

function closeMenu() {
  if (!navToggle || !navMenu) return;
  navMenu.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
  siteHeader?.classList.remove("is-hidden");
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

function updateHeaderOnScroll() {
  if (!siteHeader) return;

  const currentScrollY = window.scrollY;
  const menuIsOpen = navMenu?.classList.contains("is-open");

  if (menuIsOpen || currentScrollY < 72) {
    siteHeader.classList.remove("is-hidden");
    lastScrollY = currentScrollY;
    tickingHeader = false;
    return;
  }

  if (currentScrollY > lastScrollY + 2) {
    siteHeader.classList.add("is-hidden");
  } else if (currentScrollY < lastScrollY - 2) {
    siteHeader.classList.remove("is-hidden");
  }

  lastScrollY = currentScrollY;
  tickingHeader = false;
}

window.addEventListener("scroll", () => {
  if (tickingHeader) return;
  tickingHeader = true;
  window.requestAnimationFrame(updateHeaderOnScroll);
}, { passive: true });

document.documentElement.classList.add("has-reveal");

const revealSections = document.querySelectorAll("main > section, footer.site-footer");
const revealCards = document.querySelectorAll([
  ".hero-support-cards > *",
  ".service-card",
  ".case-copy li",
  ".thumbnail-grid > *",
  ".receive-grid > *",
  ".best-list > *",
  ".process-step",
  ".package-card",
  ".expectation-grid > *",
  ".order-card",
  ".order-package-card",
  ".brief-side-card li",
  ".faq-list details"
].join(","));

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        sectionObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

  revealSections.forEach((section) => {
    section.classList.add("reveal-section");
    sectionObserver.observe(section);
  });

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });

  revealCards.forEach((card, index) => {
    card.classList.add("reveal-card");
    card.style.setProperty("--reveal-delay", `${Math.min((index % 8) * 65, 390)}ms`);
    cardObserver.observe(card);
  });
} else {
  revealSections.forEach((section) => section.classList.add("is-visible"));
  revealCards.forEach((card) => card.classList.add("is-visible"));
}

const briefForm = document.querySelector("#channel-brief-form");
const contactEmailForm = document.querySelector("#contact-email-form");
const contactFormStatus = document.querySelector("#contact-form-status");
const selectedService = document.querySelector("#selected-service");
const selectedPackage = document.querySelector("#selected-package");
const formStatus = document.querySelector("#form-status");

function scrollToBrief() {
  document.querySelector("#brief")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setStatus(message, type = "") {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.classList.remove("is-success", "is-error");
  if (type) formStatus.classList.add(`is-${type}`);
}

function setSelectValue(select, value) {
  if (!select || !value) return;
  const optionExists = Array.from(select.options).some((option) => option.value === value || option.text === value);
  if (optionExists) {
    select.value = value;
  }
}

document.querySelectorAll("[data-service]").forEach((button) => {
  button.addEventListener("click", () => {
    setSelectValue(selectedService, button.dataset.service);
    setStatus(`Selected service: ${button.dataset.service}`);
    scrollToBrief();
  });
});

document.querySelectorAll("[data-package]").forEach((button) => {
  button.addEventListener("click", () => {
    setSelectValue(selectedPackage, button.dataset.package);
    setStatus(`Selected package: ${button.dataset.package}`);
    scrollToBrief();
  });
});

const serviceFromUrl = new URLSearchParams(window.location.search).get("service");
if (serviceFromUrl) {
  setSelectValue(selectedService, serviceFromUrl);
}

const packageFromUrl = new URLSearchParams(window.location.search).get("package");
if (packageFromUrl) {
  setSelectValue(selectedPackage, packageFromUrl);
}

if (briefForm) {
  briefForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!briefForm.reportValidity()) return;

    const formData = new FormData(briefForm);
    const entries = Array.from(formData.entries()).filter(([name]) => name !== "consent");
    const subject = "New B Channel Management Project Brief";
    const body = entries
      .map(([name, value]) => {
        const label = name
          .replace(/([A-Z])/g, " $1")
          .replace(/^./, (letter) => letter.toUpperCase());
        return `${label}: ${value || "Not provided"}`;
      })
      .concat("Consent confirmed: Yes")
      .join("\n");

    const mailto = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setStatus("Your email app should open with the project brief prefilled. If it does not open, email bchannelmanagement@proton.me directly.", "success");
  });
}

if (contactEmailForm) {
  contactEmailForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!contactEmailForm.reportValidity()) return;

    const formData = new FormData(contactEmailForm);
    const name = formData.get("name") || "Not provided";
    const email = formData.get("email") || "Not provided";
    const project = formData.get("project") || "Not provided";
    const subject = "New B Channel Management Message";
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      "Project message:",
      `${project}`
    ].join("\n");

    window.location.href = `mailto:${FALLBACK_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    if (contactFormStatus) {
      contactFormStatus.textContent = "Your email app should open with the message prefilled. If it does not open, email bchannelmanagement@proton.me directly.";
      contactFormStatus.classList.remove("is-error");
      contactFormStatus.classList.add("is-success");
    }
  });
}
