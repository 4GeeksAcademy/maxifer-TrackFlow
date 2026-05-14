const form = document.querySelector("#applicationForm");
const statusBox = document.querySelector("#formStatus");

const fields = {
  companyName: {
    validate: (value) => value.trim().length >= 2,
    message: "Indica el nombre legal o comercial de la empresa."
  },
  contactName: {
    validate: (value) => value.trim().length >= 2,
    message: "Indica el nombre de la persona de contacto."
  },
  email: {
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()),
    message: "Usa un email válido, por ejemplo ops@empresa.com."
  },
  notes: {
    validate: (value) => value.trim().length >= 10,
    message: "Cuéntanos brevemente qué necesitas resolver."
  },
  consent: {
    validate: (_, input) => input.checked,
    message: "Confirma la autorización para responder tu consulta."
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
  setFieldState(input, isValid, isValid ? "" : rule.message);
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
    showStatus("error", "Revisa los campos marcados antes de enviar el formulario.");
    const firstInvalid = form.querySelector('[aria-invalid="true"]');
    firstInvalid?.focus();
    return;
  }

  showStatus(
    "success",
    "Gracias. Recibimos tu consulta y el equipo de TrackFlow revisará tu contexto operativo antes de coordinar una conversación."
  );
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
