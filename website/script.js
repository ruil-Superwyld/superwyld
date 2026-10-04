function loadOptionalAssets() {
  document.querySelectorAll("[data-asset-src]").forEach((element) => {
    const source = element.dataset.assetSrc;
    const image = new Image();

    image.addEventListener("load", () => {
      element.style.backgroundImage = `url("${source}")`;
      element.classList.add("is-loaded");
    });

    image.src = source;
  });
}

loadOptionalAssets();

const calendarTitle = document.querySelector("[data-calendar-title]");
const calendarGrid = document.querySelector("[data-calendar-grid]");
const prevButton = document.querySelector("[data-calendar-prev]");
const nextButton = document.querySelector("[data-calendar-next]");
const selectedDateInput = document.querySelector("#selectedDate");
const form = document.querySelector("#visitForm");
const formStatus = document.querySelector("[data-form-status]");

const today = new Date();
today.setHours(0, 0, 0, 0);

let visibleDate = new Date(today.getFullYear(), today.getMonth(), 1);
let selectedDate = new Date(today);

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(date);
}

function toInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function renderCalendar() {
  const monthName = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric"
  }).format(visibleDate);
  const firstDay = new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1);
  const lastDay = new Date(visibleDate.getFullYear(), visibleDate.getMonth() + 1, 0);

  calendarTitle.textContent = monthName;
  calendarGrid.innerHTML = "";

  for (let i = 0; i < firstDay.getDay(); i += 1) {
    const spacer = document.createElement("button");
    spacer.className = "calendar-day empty";
    spacer.type = "button";
    spacer.tabIndex = -1;
    calendarGrid.appendChild(spacer);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    const date = new Date(visibleDate.getFullYear(), visibleDate.getMonth(), day);
    const button = document.createElement("button");
    button.className = "calendar-day";
    button.type = "button";
    button.textContent = String(day);
    button.disabled = date < today;
    button.setAttribute("aria-label", `Select ${formatDate(date)}`);

    if (isSameDay(date, selectedDate)) {
      button.classList.add("selected");
      selectedDateInput.value = toInputValue(date);
    }

    button.addEventListener("click", () => {
      selectedDate = date;
      selectedDateInput.value = toInputValue(date);
      formStatus.textContent = `Selected ${formatDate(date)}.`;
      renderCalendar();
    });

    calendarGrid.appendChild(button);
  }
}

prevButton.addEventListener("click", () => {
  const previous = new Date(visibleDate.getFullYear(), visibleDate.getMonth() - 1, 1);
  if (previous >= new Date(today.getFullYear(), today.getMonth(), 1)) {
    visibleDate = previous;
    renderCalendar();
  }
});

nextButton.addEventListener("click", () => {
  visibleDate = new Date(visibleDate.getFullYear(), visibleDate.getMonth() + 1, 1);
  renderCalendar();
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const name = data.get("name");
  const email = data.get("email");
  const visitType = data.get("visitType");
  const guests = data.get("guests");
  const notes = data.get("notes") || "None";
  const date = selectedDateInput.value;
  const subject = encodeURIComponent(`Super WYLD visit request: ${date}`);
  const body = encodeURIComponent(
    [
      `Name: ${name}`,
      `Email: ${email}`,
      `Visit type: ${visitType}`,
      `Date: ${date}`,
      `Guests: ${guests}`,
      `Notes: ${notes}`
    ].join("\n")
  );

  formStatus.textContent = `Thanks, ${name}. Opening an email draft for ${date}.`;
  window.location.href = `mailto:hello@superwyld.com?subject=${subject}&body=${body}`;
});

renderCalendar();
