(() => {
  "use strict";

  const stages = ["invite", "register", "configure", "mappings", "test", "activate"];
  const labels = ["Invite", "Create app", "Configure", "Map claims", "Test & activate", "Ready"];
  const stepLinks = [...document.querySelectorAll("[data-step-select]")];
  const stepPanels = [...document.querySelectorAll("[data-step]")];
  const protocolButtons = [...document.querySelectorAll("[data-protocol-select]")];
  const protocolContent = [...document.querySelectorAll("[data-protocol]")];
  const previous = document.querySelector("[data-previous]");
  const next = document.querySelector("[data-next]");
  const progress = document.querySelector("[data-progress]");
  const announcement = document.querySelector("[data-announcement]");
  let current = Math.max(0, stages.indexOf(window.location.hash.slice(1)));
  let protocol = "oidc";

  function render(announce = false) {
    stepPanels.forEach((panel) => {
      panel.hidden = panel.dataset.step !== stages[current];
    });
    stepLinks.forEach((link) => {
      if (link.dataset.stepSelect === stages[current]) {
        link.setAttribute("aria-current", "step");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    protocolContent.forEach((content) => {
      content.hidden = content.dataset.protocol !== protocol;
    });
    protocolButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.protocolSelect === protocol));
    });
    previous.disabled = current === 0;
    progress.textContent = `Stage ${current + 1} of ${stages.length} · ${labels[current]}`;
    next.textContent = current === stages.length - 1
      ? "Restart walkthrough ↺"
      : `Next: ${labels[current + 1]} →`;
    if (announce) {
      announcement.textContent = `${protocol.toUpperCase()} walkthrough. Stage ${current + 1} of ${stages.length}: ${labels[current]}.`;
    }
  }

  function selectStep(index) {
    current = index;
    render(true);
    window.history.replaceState(null, "", `#${stages[current]}`);
    const heading = document.querySelector(`[data-step="${stages[current]}"] h3`);
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    heading.scrollIntoView({ block: "start", behavior: "auto" });
  }

  stepLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      selectStep(stages.indexOf(link.dataset.stepSelect));
    });
  });
  protocolButtons.forEach((button) => {
    button.addEventListener("click", () => {
      protocol = button.dataset.protocolSelect;
      render(true);
    });
  });
  previous.addEventListener("click", () => selectStep(Math.max(0, current - 1)));
  next.addEventListener("click", () => selectStep((current + 1) % stages.length));
  window.addEventListener("hashchange", () => {
    const index = stages.indexOf(window.location.hash.slice(1));
    if (index !== -1) {
      current = index;
      render(true);
    }
  });

  const dialog = document.querySelector("[data-image-dialog]");
  const dialogImage = document.querySelector("[data-dialog-image]");
  const dialogTitle = document.querySelector("#image-dialog-title");
  const closeImage = document.querySelector("[data-close-image]");
  const imageViewport = dialog.querySelector(".dialog-image-scroll");
  let imageTrigger = null;

  document.querySelectorAll("[data-enlarge]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (typeof dialog.showModal !== "function" || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      imageTrigger = link;
      dialogTitle.textContent = link.dataset.caption;
      dialogImage.alt = link.dataset.caption;
      dialogImage.src = link.href;
      dialog.showModal();
      imageViewport.scrollTo(0, 0);
    });
  });
  closeImage.addEventListener("click", () => dialog.close());
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    if (event.shiftKey && document.activeElement === closeImage) {
      event.preventDefault();
      imageViewport.focus();
    } else if (!event.shiftKey && document.activeElement === imageViewport) {
      event.preventDefault();
      closeImage.focus();
    }
  });
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom)) {
      dialog.close();
    }
  });
  dialog.addEventListener("close", () => {
    dialogImage.removeAttribute("src");
    imageTrigger?.focus({ preventScroll: true });
    imageTrigger = null;
  });
  document.querySelectorAll(".screen-scroll").forEach((frame) => {
    frame.tabIndex = 0;
    frame.setAttribute("role", "region");
    frame.setAttribute("aria-label", "Scrollable product screenshot; use the full screenshot link to enlarge");
  });

  render();
  document.querySelector("[data-protocol-controls]").hidden = false;
  document.querySelector("[data-walkthrough-controls]").hidden = false;
  document.documentElement.classList.add("enhanced");
})();
