const form = document.querySelector("#applicationForm");
const statusBox = document.querySelector("#formStatus");

const fields = {
  companyName: {
    validate: (value) => value.trim().length >= 2,
    message: "Indica el nombre legal o comercial de la empresa."
  },
  contactName: {
    validate: (value) => value.trim().split(/\s+/).length >= 2,
    message: "Escribe nombre y apellido de la persona responsable."
  },
  role: {
    validate: (value) => value.trim().length >= 2,
    message: "Indica el cargo para entender tu rol en la operación."
  },
  email: {
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()),
    message: "Usa un email válido, por ejemplo ops@empresa.com."
  },
  phone: {
    validate: (value) => /^\+?[0-9\s().-]{8,20}$/.test(value.trim()),
    message: "Usa un teléfono válido con 8 a 20 dígitos."
  },
  market: {
    validate: (value) => ["us", "es", "both"].includes(value),
    message: "Selecciona el mercado donde opera tu logística."
  },
  monthlyOrders: {
    validate: (value) => Number(value) >= 100 && Number(value) <= 250000,
    message: "Indica un volumen entre 100 y 250.000 pedidos mensuales."
  },
  skuCount: {
    validate: (value) => Number(value) >= 5 && Number(value) <= 50000,
    message: "Indica entre 5 y 50.000 SKUs activos."
  },
  returnRate: {
    validate: (value) => value.trim() !== "" && Number(value) >= 0 && Number(value) <= 60,
    message: "La tasa debe estar entre 0% y 60%."
  },
  carrierStack: {
    validate: (value) => value.trim().length >= 3,
    message: "Nombra al menos un transportista o integración actual."
  },
  priority: {
    validate: (value) =>
      ["storage", "fulfillment", "last-mile", "incidents", "returns", "support"].includes(value),
    message: "Selecciona la prioridad que más impacto tendría ahora."
  },
  launchDate: {
    validate: (value) => {
      if (!value) return false;
      const selected = new Date(`${value}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selected >= today;
    },
    message: "La fecha objetivo debe ser hoy o una fecha futura."
  },
  notes: {
    validate: (value) => value.trim().length >= 30,
    message: "Describe el contexto con al menos 30 caracteres."
  },
  consent: {
    validate: (_, input) => input.checked,
    message: "Confirma la autorización para revisar la prioridad operativa indicada."
  }
};

function getErrorElement(name) {
  return document.querySelector(`[data-error-for="${name}"]`);
}

function setFieldState(input, isValid, message = "") {
  const errorElement = getErrorElement(input.name);
  input.setAttribute("aria-invalid", String(!isValid));
  input.classList.toggle("border-rose-400", !isValid);
  input.classList.toggle("border-emerald-300", isValid);

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
      ? "rounded border border-emerald-300/40 bg-emerald-300/10 p-4 text-sm text-emerald-100"
      : "rounded border border-rose-300/40 bg-rose-300/10 p-4 text-sm text-rose-100";
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
    "Formulario validado. La prioridad se clasifica según volumen, mercado, transportistas y dolor operativo principal."
  );
  form.scrollIntoView({ behavior: "smooth", block: "start" });
});

form.addEventListener("reset", () => {
  setTimeout(() => {
    Object.keys(fields).forEach((name) => {
      const input = form.elements[name];
      if (input) {
        input.removeAttribute("aria-invalid");
        input.classList.remove("border-rose-400", "border-emerald-300");
      }
      const errorElement = getErrorElement(name);
      if (errorElement) errorElement.textContent = "";
    });
    statusBox.className = "hidden rounded border p-4 text-sm";
    statusBox.textContent = "";
  });
});
