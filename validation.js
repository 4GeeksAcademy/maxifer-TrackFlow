const form = document.querySelector("#applicationForm");
const statusBox = document.querySelector("#formStatus");

const personalEmailDomains = new Set([
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "yahoo.com",
  "yahoo.es",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com"
]);

function isCorporateEmail(value) {
  const email = value.trim().toLowerCase();
  const parts = email.split("@");
  if (parts.length !== 2) return false;

  const domain = parts[1];
  return !personalEmailDomains.has(domain);
}

function getValidationTexts() {
  return window.TrackFlowI18n?.getValidationMessages?.() || {
    companyName: "Indica el nombre legal o comercial de la empresa.",
    contactName: "Indica el nombre de la persona de contacto.",
    email: "Usa un email corporativo valido, por ejemplo ops@empresa.com.",
    country: "Selecciona el pais de operacion principal.",
    notes: "Cuentanos brevemente que necesitas resolver.",
    consent: "Confirma la autorizacion para responder tu consulta.",
    invalidForm: "Revisa los campos marcados antes de enviar el formulario.",
    success:
      "Gracias. Recibimos tu consulta y el equipo de TrackFlow revisara tu contexto operativo antes de coordinar una conversacion."
  };
}

const fields = {
  companyName: {
    validate: (value) => value.trim().length >= 2,
    message: () => getValidationTexts().companyName
  },
  contactName: {
    validate: (value) => value.trim().length >= 2,
    message: () => getValidationTexts().contactName
  },
  email: {
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) && isCorporateEmail(value),
    message: () => getValidationTexts().email
  },
  country: {
    validate: (value) => value.trim().length > 0,
    message: () => getValidationTexts().country
  },
  notes: {
    validate: (value) => value.trim().length >= 10,
    message: () => getValidationTexts().notes
  },
  consent: {
    validate: (_, input) => input.checked,
    message: () => getValidationTexts().consent
  }
};

function getErrorElement(name) {
  return document.querySelector(`[data-error-for="${name}"]`);
}

function setFieldState(input, isValid, message = "") {
  const errorElement = getErrorElement(input.name);
  input.setAttribute("aria-invalid", String(!isValid));
  input.classList.toggle("border-[var(--tf-error)]", !isValid);
  input.classList.toggle("border-[var(--tf-brand)]", isValid);

  if (errorElement) {
    errorElement.textContent = message;
  }
}

function validateField(input) {
  const rule = fields[input.name];
  if (!rule) return true;

  const isValid = rule.validate(input.value, input);
  setFieldState(input, isValid, isValid ? "" : rule.message());
  return isValid;
}

function validateForm() {
  return Array.from(form.elements)
    .filter((element) => fields[element.name])
    .map(validateField)
    .every(Boolean);
}

function showStatus(type, message) {
  statusBox.className =
    type === "success"
      ? "rounded border border-[color:rgb(var(--tf-brand-rgb)/0.4)] bg-[color:rgb(var(--tf-brand-rgb)/0.1)] p-4 text-sm text-[var(--tf-text)]"
      : "rounded border border-[color:rgb(var(--tf-error-rgb)/0.4)] bg-[color:rgb(var(--tf-error-rgb)/0.1)] p-4 text-sm text-[var(--tf-text)]";
  statusBox.textContent = message;
}

form.addEventListener("input", (event) => {
  if (fields[event.target.name]) {
    validateField(event.target);
  }
});

form.addEventListener("blur", (event) => {
  if (fields[event.target.name]) {
    validateField(event.target);
  }
}, true);

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) {
    showStatus("error", getValidationTexts().invalidForm);
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
    return;
  }

  showStatus("success", getValidationTexts().success);
  form.scrollIntoView({ behavior: "smooth", block: "start" });
});

form.addEventListener("reset", () => {
  setTimeout(() => {
    Object.keys(fields).forEach((name) => {
      const input = form.elements[name];
      if (input) {
        input.removeAttribute("aria-invalid");
        input.classList.remove("border-[var(--tf-error)]", "border-[var(--tf-brand)]");
      }
      const errorElement = getErrorElement(name);
      if (errorElement) errorElement.textContent = "";
    });

    statusBox.className = "hidden rounded border p-4 text-sm";
    statusBox.textContent = "";
  });
});

document.addEventListener("trackflow:languagechange", () => {
  const invalidFields = Array.from(form.elements).filter((element) => fields[element.name] && element.getAttribute("aria-invalid") === "true");

  invalidFields.forEach((input) => {
    validateField(input);
  });

  if (!statusBox.classList.contains("hidden")) {
    const statusType = statusBox.className.includes("--tf-error-rgb") ? "error" : "success";
    showStatus(statusType, statusType === "error" ? getValidationTexts().invalidForm : getValidationTexts().success);
  }
});
