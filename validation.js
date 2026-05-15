const form = document.querySelector("#applicationForm");
const statusBox = document.querySelector("#formStatus");

if (!form || !statusBox) {
  console.warn("TrackFlow form could not be initialized.");
} else {

const stepNodes = Array.from(form.querySelectorAll("[data-form-step]"));
const progressBar = form.querySelector("[data-progress-bar]");
const progressLabel = form.querySelector("[data-application-progress-label]");
const progressSection = form.querySelector("[data-form-progress]");
const stepIndicators = Array.from(form.querySelectorAll("[data-step-indicator]"));
const summaryBox = form.querySelector("[data-summary-box]");
const summaryList = form.querySelector("[data-summary-list]");
const formActions = form.querySelector("[data-form-actions]");
const postSubmitActions = form.querySelector("[data-post-submit-actions]");
const nextButton = form.querySelector("[data-step-next]");
const prevButton = form.querySelector("[data-step-prev]");
const submitButton = form.querySelector("[data-step-submit]");
const resetButton = form.querySelector("[data-step-reset]");
const newInquiryButton = form.querySelector("[data-post-submit-new]");

let currentStep = 1;
let hasSubmitted = false;

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

const stepFields = {
  1: ["companyName", "contactName", "email"],
  2: ["country", "operationType", "monthlyOrders", "urgency"],
  3: ["notes"],
  4: ["consent"]
};

const summaryKeys = [
  "companyName",
  "contactName",
  "email",
  "country",
  "operationType",
  "monthlyOrders",
  "urgency",
  "notes"
];

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
    email: "Usa un email corporativo válido, por ejemplo ops@empresa.com.",
    country: "Selecciona el país de operación principal.",
    operationType: "Selecciona el tipo de operación que quieres optimizar.",
    monthlyOrders: "Selecciona el volumen mensual estimado.",
    urgency: "Selecciona la urgencia de tu proyecto.",
    notes: "Cuéntanos brevemente qué necesitas resolver.",
    consent: "Confirma la autorización para responder tu consulta.",
    invalidForm: "Revisa los campos marcados antes de avanzar o enviar el formulario.",
    success:
      "Gracias. Recibimos tu consulta y el equipo de TrackFlow revisará tu contexto operativo antes de coordinar una conversación.",
    progress: "Paso {current} de {total}",
    summaryTitle: "Resumen de tu solicitud"
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
  operationType: {
    validate: (value) => value.trim().length > 0,
    message: () => getValidationTexts().operationType
  },
  monthlyOrders: {
    validate: (value) => value.trim().length > 0,
    message: () => getValidationTexts().monthlyOrders
  },
  urgency: {
    validate: (value) => value.trim().length > 0,
    message: () => getValidationTexts().urgency
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
  return form.querySelector(`[data-error-for="${name}"]`);
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

function validateStep(step) {
  const names = stepFields[step] || [];
  return names
    .map((name) => form.elements[name])
    .filter(Boolean)
    .map(validateField)
    .every(Boolean);
}

function isStepValid(step) {
  const names = stepFields[step] || [];
  return names
    .map((name) => {
      const input = form.elements[name];
      const rule = fields[name];
      if (!input || !rule) return true;
      return rule.validate(input.value, input);
    })
    .every(Boolean);
}

function getFieldDisplayValue(name) {
  const input = form.elements[name];
  if (!input) return "-";

  if (input.type === "checkbox") {
    return input.checked ? "Sí" : "No";
  }

  if (input.tagName === "SELECT") {
    const selected = input.selectedOptions?.[0];
    return selected && selected.value ? selected.textContent : "-";
  }

  const value = input.value.trim();
  return value.length ? value : "-";
}

function summarizeLongText(value, maxLength = 140) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

function setExpandablePanelState(panel, open) {
  panel.classList.toggle("opacity-100", open);
  panel.classList.toggle("translate-y-0", open);
  panel.classList.toggle("pointer-events-auto", open);
  panel.classList.toggle("opacity-0", !open);
  panel.classList.toggle("translate-y-1", !open);
  panel.classList.toggle("pointer-events-none", !open);
}

function createExpandableNotesNode(fullValue) {
  const wrapper = document.createElement("div");
  wrapper.className = "relative";

  const preview = document.createElement("button");
  preview.type = "button";
  preview.className = "block w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-left text-[0.8rem] text-[var(--tf-text)] decoration-dotted underline-offset-4 transition hover:text-white hover:underline focus:underline focus:outline-none";
  preview.textContent = summarizeLongText(fullValue, 85);

  const panel = document.createElement("div");
  panel.className = "absolute right-0 top-[calc(100%+0.35rem)] z-20 w-[min(34rem,82vw)] rounded border border-[color:rgb(var(--tf-brand-rgb)/0.38)] bg-[color:rgb(var(--tf-bg-rgb)/0.98)] p-3 text-[0.82rem] leading-5 text-[var(--tf-text)] shadow-[0_16px_40px_-24px_rgb(0_0_0/0.95)] transition-all duration-200 ease-out opacity-0 translate-y-1 pointer-events-none";
  panel.textContent = fullValue;
  panel.setAttribute("role", "tooltip");

  const togglePanel = () => {
    const isOpen = panel.classList.contains("opacity-100");
    setExpandablePanelState(panel, !isOpen);
  };

  const openPanel = () => setExpandablePanelState(panel, true);
  const closePanel = () => setExpandablePanelState(panel, false);

  preview.addEventListener("mouseenter", openPanel);
  preview.addEventListener("focus", openPanel);
  preview.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    togglePanel();
  });

  wrapper.addEventListener("mouseleave", closePanel);
  wrapper.addEventListener("focusout", (event) => {
    if (!wrapper.contains(event.relatedTarget)) {
      closePanel();
    }
  });

  preview.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closePanel();
    }
  });

  wrapper.append(preview, panel);
  return wrapper;
}

function getFieldLabel(name) {
  const label = form.querySelector(`label[for="${name}"]`);
  return label ? label.textContent.replace(/\s*\*\s*$/, "") : name;
}

function updateSummary() {
  if (!summaryList) return;

  summaryList.innerHTML = "";

  summaryKeys.forEach((name) => {
    const dt = document.createElement("dt");
    dt.className = "font-semibold text-[0.8rem] text-[var(--tf-text-muted)]";
    dt.textContent = getFieldLabel(name);

    const dd = document.createElement("dd");
    dd.className = "min-w-0 break-words text-[0.8rem] text-[var(--tf-text)]";
    const fullValue = getFieldDisplayValue(name);
    if (name === "notes" && fullValue !== "-") {
      dd.appendChild(createExpandableNotesNode(fullValue));
    } else {
      dd.textContent = fullValue;
    }

    summaryList.append(dt, dd);
  });
}

function showStatus(type, message) {
  statusBox.className =
    type === "success"
      ? "rounded border border-[color:rgb(var(--tf-brand-rgb)/0.4)] bg-[color:rgb(var(--tf-brand-rgb)/0.1)] p-4 text-sm text-[var(--tf-text)]"
      : "rounded border border-[color:rgb(var(--tf-error-rgb)/0.4)] bg-[color:rgb(var(--tf-error-rgb)/0.1)] p-4 text-sm text-[var(--tf-text)]";
  statusBox.textContent = message;
}

function clearStatus() {
  statusBox.className = "hidden rounded border p-4 text-sm";
  statusBox.textContent = "";
}

function setSubmissionState(submitted) {
  hasSubmitted = submitted;

  if (progressSection) {
    progressSection.classList.toggle("hidden", submitted);
  }

  if (summaryBox) {
    summaryBox.classList.toggle("hidden", submitted);
  }

  if (submitted) {
    stepNodes.forEach((node) => node.classList.add("hidden"));
    formActions?.classList.add("hidden");
    postSubmitActions?.classList.remove("hidden");
    postSubmitActions?.classList.add("flex");
    prevButton?.classList.add("hidden");
    resetButton?.classList.add("hidden");

    if (nextButton) {
      nextButton.classList.add("hidden");
      nextButton.disabled = true;
      nextButton.classList.add("opacity-50", "cursor-not-allowed");
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-disabled", "true");
      submitButton.classList.add("hidden", "opacity-50", "cursor-not-allowed");
    }
    return;
  }

  formActions?.classList.remove("hidden");
  postSubmitActions?.classList.add("hidden");
  postSubmitActions?.classList.remove("flex");

  if (nextButton) {
    nextButton.disabled = false;
    nextButton.classList.remove("opacity-50", "cursor-not-allowed");
  }

  resetButton?.classList.remove("hidden");

  if (submitButton) {
    submitButton.disabled = false;
    submitButton.removeAttribute("aria-disabled");
    submitButton.classList.remove("opacity-50", "cursor-not-allowed");
  }
}

function setStepIndicatorState(step, isCurrent, isDone) {
  const indicator = stepIndicators.find((node) => Number(node.dataset.stepIndicator) === step);
  if (!indicator) return;

  indicator.classList.toggle("border-[color:rgb(var(--tf-brand-rgb)/0.45)]", isCurrent || isDone);
  indicator.classList.toggle("bg-[color:rgb(var(--tf-brand-rgb)/0.14)]", isCurrent || isDone);
  indicator.classList.toggle("text-[var(--tf-text)]", isCurrent || isDone);
  indicator.classList.toggle("font-semibold", isCurrent || isDone);
  indicator.classList.toggle("border-[color:rgb(var(--tf-text-rgb)/0.18)]", !isCurrent && !isDone);
  indicator.classList.toggle("text-[var(--tf-text-soft)]", !isCurrent && !isDone);
  indicator.setAttribute("aria-current", isCurrent ? "step" : "false");
}

function attemptStepNavigation(targetStep) {
  if (hasSubmitted) return;
  if (targetStep === currentStep) return;

  if (targetStep < currentStep) {
    clearStatus();
    goToStep(targetStep);
    return;
  }

  for (let step = currentStep; step < targetStep; step += 1) {
    if (!validateStep(step)) {
      showStatus("error", getValidationTexts().invalidForm);
      focusFirstInvalid(step);
      return;
    }
  }

  clearStatus();
  goToStep(targetStep);
}

function renderProgress() {
  if (hasSubmitted) {
    return;
  }

  const total = stepNodes.length;
  const percent = Math.round((currentStep / total) * 100);

  if (progressBar) {
    progressBar.style.width = `${percent}%`;
  }

  if (progressLabel) {
    const template = getValidationTexts().progress || "Paso {current} de {total}";
    progressLabel.textContent = template
      .replace("{current}", String(currentStep))
      .replace("{total}", String(total));
  }

  stepNodes.forEach((node, index) => {
    const step = index + 1;
    const isVisible = step === currentStep;
    node.classList.toggle("hidden", !isVisible);
    setStepIndicatorState(step, isVisible, step < currentStep);
  });

  if (prevButton) {
    prevButton.classList.toggle("hidden", currentStep === 1);
  }

  if (nextButton) {
    nextButton.classList.toggle("hidden", currentStep === total);
  }

  if (submitButton) {
    submitButton.classList.toggle("hidden", currentStep !== total);
    const disableSubmit = currentStep !== total || !isStepValid(currentStep);
    submitButton.disabled = disableSubmit;
    submitButton.classList.toggle("opacity-50", disableSubmit);
    submitButton.classList.toggle("cursor-not-allowed", disableSubmit);

    if (disableSubmit) {
      submitButton.setAttribute("aria-disabled", "true");
    } else {
      submitButton.removeAttribute("aria-disabled");
    }
  }

  if (nextButton) {
    const disableNext = currentStep === total || !isStepValid(currentStep);
    nextButton.disabled = disableNext;
    nextButton.classList.toggle("opacity-50", disableNext);
    nextButton.classList.toggle("cursor-not-allowed", disableNext);
  }

  if (currentStep === total) {
    updateSummary();
  }
}

function goToStep(step) {
  currentStep = Math.min(Math.max(step, 1), stepNodes.length);
  renderProgress();
}

function focusFirstInvalid(step) {
  const names = stepFields[step] || [];
  const invalid = names
    .map((name) => form.elements[name])
    .find((input) => input && input.getAttribute("aria-invalid") === "true");

  invalid?.focus();
}

form.addEventListener("input", (event) => {
  if (fields[event.target.name]) {
    validateField(event.target);
    if (event.target.closest("[data-form-step]")) {
      const step = Number(event.target.closest("[data-form-step]")?.dataset.formStep || currentStep);
      if (step === currentStep) {
        const disableCurrentAction = !isStepValid(currentStep);

        if (currentStep === stepNodes.length) {
          if (submitButton) {
            submitButton.disabled = disableCurrentAction;
            submitButton.classList.toggle("opacity-50", disableCurrentAction);
            submitButton.classList.toggle("cursor-not-allowed", disableCurrentAction);
            if (disableCurrentAction) {
              submitButton.setAttribute("aria-disabled", "true");
            } else {
              submitButton.removeAttribute("aria-disabled");
            }
          }
        } else if (nextButton) {
          nextButton.disabled = disableCurrentAction;
          nextButton.classList.toggle("opacity-50", disableCurrentAction);
          nextButton.classList.toggle("cursor-not-allowed", disableCurrentAction);
        }
      }
    }
  }
});

form.addEventListener(
  "blur",
  (event) => {
    if (fields[event.target.name]) {
      validateField(event.target);
      if (event.target.closest("[data-form-step]")) {
        const step = Number(event.target.closest("[data-form-step]")?.dataset.formStep || currentStep);
        if (step === currentStep) {
          const disableCurrentAction = !isStepValid(currentStep);

          if (currentStep === stepNodes.length) {
            if (submitButton) {
              submitButton.disabled = disableCurrentAction;
              submitButton.classList.toggle("opacity-50", disableCurrentAction);
              submitButton.classList.toggle("cursor-not-allowed", disableCurrentAction);
              if (disableCurrentAction) {
                submitButton.setAttribute("aria-disabled", "true");
              } else {
                submitButton.removeAttribute("aria-disabled");
              }
            }
          } else if (nextButton) {
            nextButton.disabled = disableCurrentAction;
            nextButton.classList.toggle("opacity-50", disableCurrentAction);
            nextButton.classList.toggle("cursor-not-allowed", disableCurrentAction);
          }
        }
      }
    }
  },
  true
);

nextButton?.addEventListener("click", () => {
  if (!validateStep(currentStep)) {
    showStatus("error", getValidationTexts().invalidForm);
    focusFirstInvalid(currentStep);
    return;
  }

  clearStatus();
  goToStep(currentStep + 1);
});

prevButton?.addEventListener("click", () => {
  clearStatus();
  goToStep(currentStep - 1);
});

stepIndicators.forEach((indicator) => {
  const targetStep = Number(indicator.dataset.stepIndicator || 0);
  if (!targetStep) return;

  indicator.addEventListener("click", () => {
    attemptStepNavigation(targetStep);
  });

  indicator.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      attemptStepNavigation(targetStep);
    }
  });
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (currentStep < stepNodes.length) {
    if (!validateStep(currentStep)) {
      showStatus("error", getValidationTexts().invalidForm);
      focusFirstInvalid(currentStep);
      return;
    }

    clearStatus();
    goToStep(currentStep + 1);
    return;
  }

  const allStepsValid = Object.keys(stepFields)
    .map((step) => Number(step))
    .every((step) => validateStep(step));

  if (!allStepsValid) {
    showStatus("error", getValidationTexts().invalidForm);

    const firstInvalidStep = Object.keys(stepFields)
      .map((step) => Number(step))
      .find((step) => !validateStep(step));

    if (firstInvalidStep) {
      goToStep(firstInvalidStep);
      focusFirstInvalid(firstInvalidStep);
    }
    return;
  }

  showStatus("success", getValidationTexts().success);
  setSubmissionState(true);
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

    clearStatus();
    setSubmissionState(false);
    goToStep(1);
  });
});

newInquiryButton?.addEventListener("click", () => {
  form.reset();
});

document.addEventListener("trackflow:languagechange", () => {
  const invalidFields = Array.from(form.elements).filter(
    (element) => fields[element.name] && element.getAttribute("aria-invalid") === "true"
  );

  invalidFields.forEach((input) => {
    validateField(input);
  });

  if (!hasSubmitted && currentStep === stepNodes.length) {
    updateSummary();
  }

  if (!statusBox.classList.contains("hidden")) {
    const statusType = statusBox.className.includes("--tf-error-rgb") ? "error" : "success";
    showStatus(statusType, statusType === "error" ? getValidationTexts().invalidForm : getValidationTexts().success);
  }

  renderProgress();
});

setSubmissionState(false);
goToStep(1);
}
