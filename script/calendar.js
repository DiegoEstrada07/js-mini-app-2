// main.js (single-module, no imports) — Calendar arrows + localStorage reminders

const STORAGE_KEY = "expense_tracker_items_v1";

// --- DOM
const monthLabel = document.querySelector(".month strong");
const daysContainer = document.querySelector(".days");
const prevBtn = document.querySelector('[aria-label="Previous month"]');
const nextBtn = document.querySelector('[aria-label="Next month"]');

// form (right panel)
const form = document.querySelector(".add-form");
const dateInput = form?.querySelector('input[type="date"]');
const textInput = form?.querySelector('input[type="text"]');
const chips = form ? Array.from(form.querySelectorAll(".chip")) : [];



// --- selected day panel (top summary)
const selectedDayTitle = document.getElementById("selectedDayTitle");
const selectedDayTotal = document.getElementById("selectedDayTotal");
const selectedDayList  = document.getElementById("selectedDayList");

// use the dedicated id if you added it in HTML
const selectedDateInput = document.getElementById("selectedDateInput");

// app state: selected day
let selectedDate = new Date(); // default = today

// --- DELETE ITEM (trash icon)
function deleteItemById(id){
  const all = loadItems();
  const filtered = all.filter(item => item.id !== id);
  saveItems(filtered);
}

// Event delegation for dynamically created trash buttons
selectedDayList?.addEventListener("click", (e) => {
  const btn = e.target.closest(".trash");
  if (!btn) return;

  const id = btn.dataset.id;
  if (!id) return;

  deleteItemById(id);

  // re-render day panel + calendar
  renderSelectedDay(toISODate(selectedDate));
  render();
});



if (!monthLabel || !daysContainer || !prevBtn || !nextBtn) {
  console.error("Calendar DOM not found. Check your HTML selectors/classes.");
}

// --- categories (icons)
const categories = {
  groceries: { label: "Groceries", icon: "../assets/images/groceries.png" },
  bills:     { label: "Bills",     icon: "../assets/images/home-bills.png" },
  free_time: { label: "Free time", icon: "../assets/images/free-time.png" },
  car:       { label: "Car",       icon: "../assets/images/car.png" },
};

const monthNames = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

let current = new Date();          // visible month
current = new Date(current.getFullYear(), current.getMonth(), 1);

let selectedCategory = "groceries";

// --- storage helpers
function loadItems() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
  catch { return []; }
}
function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function toISODate(d){
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// --- calendar 42 cells
function getCalendarDays(year, month){
  const first = new Date(year, month, 1);
  const startDay = first.getDay(); // Sun=0
  const days = [];

  // previous month fillers
  for (let i = startDay - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, muted: true });
  }

  // current month
  const lastDate = new Date(year, month + 1, 0).getDate();
  for (let day = 1; day <= lastDate; day++){
    days.push({ date: new Date(year, month, day), muted: false });
  }

  // next month fillers until 42
  while (days.length < 42){
    const extra = days.length - (startDay + lastDate) + 1;
    const d = new Date(year, month, lastDate + extra);
    days.push({ date: d, muted: true });
  }

  return days;
}

function itemsByDate(allItems) {
  const map = new Map();
  for (const it of allItems) {
    if (!map.has(it.date)) map.set(it.date, []);
    map.get(it.date).push(it);
  }
  return map;
}


function renderSelectedDay(dateStr){
  // dateStr: "YYYY-MM-DD"
  const all = loadItems();
  const items = all.filter(x => x.date === dateStr);

  // title
  const d = new Date(dateStr + "T00:00:00");
  const nice = d.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });

  // total
  const total = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);

  if (selectedDayTitle) selectedDayTitle.textContent = nice;
  if (selectedDayTotal) selectedDayTotal.textContent = `$${Math.abs(total).toFixed(2)}`;

  // sync form date
  if (selectedDateInput) selectedDateInput.value = dateStr;
  else if (dateInput) dateInput.value = dateStr;

  // list (reuse your existing .row styling)
  if (selectedDayList){
    selectedDayList.innerHTML = items.length
      ? items.map(it => {
          const cat = categories[it.category] ?? categories.groceries;
          const amt = Number(it.amount) || 0;

          // map category -> badge class you already have in CSS
          const badgeClass =
            it.category === "bills" ? "bill" :
            it.category === "groceries" ? "groceries" :
            it.category === "free_time" ? "fun" :
            "car";

          return `
            <div class="row">
              <span class="badge ${badgeClass}">${cat.label}</span>
              <div class="row-mid">
                <span class="row-title">${it.name}</span>
                <span class="row-meta">${it.category}</span>
              </div>
              <div class="row-amt">${amt < 0 ? "-" : ""}$${Math.abs(amt).toFixed(2)}</div>
              <button class="trash" type="button" title="Delete" data-id="${it.id}">🗑️</button>
            </div>
          `;
        }).join("")
      : `<p class="card-hint">No items for this day.</p>`;
  }
}


function render(){
  if (!monthLabel || !daysContainer) return;

  const y = current.getFullYear();
  const m = current.getMonth();

  monthLabel.textContent = `${monthNames[m]} ${y}`;
  daysContainer.innerHTML = "";

  const all = loadItems();
  const byDate = itemsByDate(all);

  const days = getCalendarDays(y, m);

  for (const entry of days){
    const d = entry.date;
    const iso = toISODate(d);
    const items = byDate.get(iso) ?? [];

    const total = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);

    const cell = document.createElement("div");
    cell.className = `dayCell ${entry.muted ? "muted" : ""}`;

    // build items HTML
    const itemsHTML = items.map(it => {
      const cat = categories[it.category] ?? categories.groceries;
      const amt = Number(it.amount) || 0;
      const amtClass = amt < 0 ? "neg" : "pos";
      return `
        <div class="item">
          <img class="catIcon" src="${cat.icon}" alt="${cat.label}">
          <span class="catName">${it.name}</span>
          <span class="amt ${amtClass}">${amt}</span>
        </div>
      `;
    }).join("");

    // footer: only if there are items (no "0")
    const footerHTML = items.length ? `
      <div class="dayFooter">
        <span class="totalLabel">Total:</span>
        <span class="dayTotal ${total < 0 ? "neg" : "pos"}">${total}</span>
      </div>
    ` : `<div class="dayFooter"></div>`;

    cell.innerHTML = `
      <div class="dnum">${d.getDate()}</div>
      <div class="items">${itemsHTML}</div>
      ${footerHTML}
    `;

    // click = select day and update the top summary panel
    cell.addEventListener("click", () => {
      selectedDate = entry.date;
      renderSelectedDay(toISODate(selectedDate));
    });


    daysContainer.appendChild(cell);

    // keep summary panel in sync (default: selectedDate)
  renderSelectedDay(toISODate(selectedDate));

  }
}

// --- arrows
prevBtn?.addEventListener("click", () => {
  current = new Date(current.getFullYear(), current.getMonth() - 1, 1);
  render();
});
nextBtn?.addEventListener("click", () => {
  current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  render();
});

// --- chips (category)
chips.forEach(chip => {
  chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    // recommended: <button data-category="groceries">
    selectedCategory = chip.dataset.category || selectedCategory;
  });
});

// --- add reminder
form?.addEventListener("submit", (e) => {
  e.preventDefault();
  const date = dateInput?.value;
  const name = textInput?.value.trim();

  if (!date || !name) return;

  const all = loadItems();
  all.push({
    id: (crypto.randomUUID?.() ?? String(Date.now())),
    date,
    category: selectedCategory,
    name,
    amount: 0,
    type: "reminder",
  });
  saveItems(all);

  function deleteItemById(id){
  const all = loadItems();
  const filtered = all.filter(item => item.id !== id);
  saveItems(filtered);
}


  textInput.value = "";
  renderSelectedDay(date); // update panel to the date you added
  render();                // rebuild calendar cells to show the reminder on that day
});

// init
render();
