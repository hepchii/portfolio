const menuButton = document.querySelector(".menu-toggle");
const navLinks = document.querySelector(".nav-links");
const year = document.querySelector("#year");
const contactForm = document.querySelector("#contactForm");
const formStatus = document.querySelector("#formStatus");
const navItems = document.querySelectorAll(".nav-links a[href*='#']");

if (year) {
  year.textContent = new Date().getFullYear();
}

if (menuButton && navLinks) {
  menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    const link = event.target.closest("a");

    if (link) {
      navLinks.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

navItems.forEach((link) => {
  link.addEventListener("click", (event) => {
    const url = new URL(link.href, window.location.href);
    const isSamePage = url.pathname === window.location.pathname;

    if (!isSamePage || !url.hash) {
      return;
    }

    const target = document.querySelector(url.hash);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });

    if (history.pushState) {
      history.pushState(null, "", url.hash);
    }

    if (menuButton && navLinks) {
      navLinks.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
});

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function setFieldError(name, message) {
  const error = document.querySelector(`[data-error-for="${name}"]`);

  if (error) {
    error.textContent = message;
  }
}

function getContactValues(form) {
  const formData = new FormData(form);

  return {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    message: String(formData.get("message") || "").trim()
  };
}

function validateContactForm(values) {
  const errors = {};

  if (values.name.length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (!emailPattern.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (values.message.length < 10) {
    errors.message = "Message must be at least 10 characters.";
  }

  return errors;
}

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const values = getContactValues(contactForm);
    const errors = validateContactForm(values);

    ["name", "email", "message"].forEach((field) => {
      setFieldError(field, errors[field] || "");
    });

    formStatus.className = "form-status";

    if (Object.keys(errors).length > 0) {
      formStatus.textContent = "Please fix the highlighted fields.";
      formStatus.classList.add("error");
      return;
    }

    formStatus.textContent = "Sending...";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const rawResponse = await response.text();
      let result = {};

      if (rawResponse.trim()) {
        try {
          result = JSON.parse(rawResponse);
        } catch {
          result = { message: rawResponse };
        }
      }

      if (!response.ok) {
        throw new Error(result.message || `Could not send your message (${response.status}).`);
      }

      contactForm.reset();
      formStatus.textContent = "Message saved. Thank you for reaching out.";
      formStatus.classList.add("success");
    } catch (error) {
      formStatus.textContent = error.message;
      formStatus.classList.add("error");
    }
  });
}
