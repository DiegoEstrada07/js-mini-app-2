const STORAGE_KEY = "expense_tracker_items_v1";

/* =========================
   DOM
========================= */
const monthLabel = document.querySelector(".month strong");
const daysContainer = document.querySelector(".days");
const prevBtn = document.querySelector('[aria-label="Previous month"]');
const nextBtn = document.querySelector('[aria-label="Next month"]');


const monthWrap = document.querySelector(".month");
const monthChev = document.querySelector(".month .chev");
const monthPicker = document.getElementById("monthPicker");


// form (right panel)
const form = document.querySelector(".add-form");
const dateInput = form?.querySelector('input[type="date"]');
const textInput = form?.querySelector('input[type="text"]');
const chips = form ? Array.from(form.querySelectorAll(".chip")) : [];

// selected day panel (top summary)
const selectedDayTitle = document.getElementById("selectedDayTitle");
const selectedDayTotal = document.getElementById("selectedDayTotal");
const selectedDayList  = document.getElementById("selectedDayList");

// if your HTML has this dedicated input, we sync it too
const selectedDateInput = document.getElementById("selectedDateInput");

// basic DOM sanity check
if (!monthLabel || !daysContainer || !prevBtn || !nextBtn) {
  console.error("Calendar DOM not found. Check your HTML selectors/classes.");
}

/* =========================
   DATA
========================= */
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

/* =========================
   STATE (moved up so pickers can access it)
========================= */
let current = new Date(); // visible month
current = new Date(current.getFullYear(), current.getMonth(), 1);

let selectedCategory = "groceries";
let selectedDate = new Date(); // selected day (default today)

// Year picker removed — no chevron dropdown needed.

/* STATE is declared earlier so pickers can access it */

/* =========================
   STORAGE HELPERS
========================= */
function loadItems() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
  catch { return []; }
}

function saveItems(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function toISODate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* =========================
   CALENDAR HELPERS
========================= */
function getCalendarDays(year, month) {
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
  for (let day = 1; day <= lastDate; day++) {
    days.push({ date: new Date(year, month, day), muted: false });
  }

  // next month fillers until 42 cells
  while (days.length < 42) {
    const extra = days.length - (startDay + lastDate) + 1;
    const d = new Date(year, month, lastDate + extra);
    days.push({ date: d, muted: true });
  }

  return days;
}

/* =========================
   "ui.js" MERGED INTO HERE
   Minimal helpers + renderDayCell
========================= */
function getExpensesByDate(dateStr) {
  const all = loadItems();
  return all.filter(x => x.date === dateStr);
}

function getDailyTotal(dateStr) {
  const items = getExpensesByDate(dateStr);
  return items.reduce((s, it) => s + (Number(it.amount) || 0), 0);
}

// Equivalent to your ui.js renderDayCell, but using this file's data + storage
function renderDayCell(dayEl, date) {
  const dateStr = toISODate(date);
  const items = getExpensesByDate(dateStr);
  const total = getDailyTotal(dateStr);

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

  const itemsBox = dayEl.querySelector(".items");
  if (itemsBox) itemsBox.innerHTML = itemsHTML;

  const footer = dayEl.querySelector(".dayFooter");
  if (footer) {
    footer.innerHTML = items.length
      ? `<span class="totalLabel">Total:</span><span class="dayTotal ${total < 0 ? "neg" : "pos"}">${total}</span>`
      : "";
  }
}

/* =========================
   SELECTED DAY (right panel)
========================= */
function renderSelectedDay(dateStr) {
  const items = getExpensesByDate(dateStr);

  // title
  const d = new Date(dateStr + "T00:00:00");
  const nice = d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });

  // total
  const total = items.reduce((s, it) => s + (Number(it.amount) || 0), 0);

  if (selectedDayTitle) selectedDayTitle.textContent = nice;
  if (selectedDayTotal) selectedDayTotal.textContent = `$${Math.abs(total).toFixed(2)}`;

  // sync form date
  if (selectedDateInput) selectedDateInput.value = dateStr;
  else if (dateInput) dateInput.value = dateStr;

  // list
  if (selectedDayList) {
    selectedDayList.innerHTML = items.length
      ? items.map(it => {
          const cat = categories[it.category] ?? categories.groceries;
          const amt = Number(it.amount) || 0;

          // map category -> badge class (matches your CSS)
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
              <div class="row-amt ${amt < 0 ? 'neg' : 'pos'}">${amt < 0 ? '-' : ''}$${Math.abs(amt).toFixed(2)}</div>
              <button class="trash" type="button" title="Delete" data-id="${it.id}">🗑️</button>
            </div>
          `;
        }).join("")
      : `<p class="card-hint">No items for this day.</p>`;
  }
}

/* =========================
   DELETE ITEM (trash icon)
========================= */
function deleteItemById(id) {
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
  updateSidebarBalance(); 
});

/* =========================
   MAIN RENDER (calendar grid)
========================= */
function render() {
  if (!monthLabel || !daysContainer) return;

  const y = current.getFullYear();
  const m = current.getMonth();

  monthLabel.textContent = `${monthNames[m]} ${y}`;
  daysContainer.innerHTML = "";

  const days = getCalendarDays(y, m);

  for (const entry of days) {
    const d = entry.date;

    const cell = document.createElement("div");
    cell.className = `dayCell ${entry.muted ? "muted" : ""}`;

    // skeleton for ui rendering
    cell.innerHTML = `
      <div class="dnum">${d.getDate()}</div>
      <div class="items"></div>
      <div class="dayFooter"></div>
    `;

    // fill day content (merged from ui.js)
    renderDayCell(cell, d);

    // click selects day and updates right panel
    cell.addEventListener("click", () => {
      selectedDate = entry.date;
      renderSelectedDay(toISODate(selectedDate));
      syncMonthPickerValue();
    });

    daysContainer.appendChild(cell);
  }

  // keep summary panel in sync (default: selectedDate)
  renderSelectedDay(toISODate(selectedDate));
}

// Move due reminders (date <= today) to Expenses via DataManager
async function moveDueItemsToExpenses() {
  if (typeof DataManager === 'undefined') return;
  const all = loadItems();
  const todayStr = toISODate(new Date());

  const due = all.filter(it => {
    const t = it.date;
    // only process reminders (not already persisted transactions)
    return t && (it.type === 'reminder' || !it.type) && t <= todayStr;
  });

  if (!due.length) return;

  for (const it of due) {
    try {
      // Build transaction compatible with DataManager
      const transaction = {
        type: 'expense',
        description: it.name || it.title || '',
        item: it.name || it.title || '',
        category: it.category || 'Other',
        amount: Number(it.amount) || 0,
        date: new Date().toISOString()
      };

      // ensure negative
      if (transaction.amount > 0) transaction.amount = -Math.abs(transaction.amount);

      await DataManager.addTransaction(transaction);
    } catch (err) {
      console.error('Failed moving item to expenses', it, err);
    }
  }

  // remove moved items and persist
  const remaining = all.filter(x => !due.some(d => d.id === x.id));
  saveItems(remaining);
}

/* =========================
   EVENTS
========================= */

function syncMonthPickerValue(){
  if (!monthPicker) return;
  const y = current.getFullYear();
  const m = String(current.getMonth() + 1).padStart(2, "0");
  monthPicker.value = `${y}-${m}`; // YYYY-MM
}

function openNativePicker(inputEl){
  if (!inputEl) return;
  // Chrome/Edge soportan showPicker()
  if (typeof inputEl.showPicker === "function") {
    inputEl.showPicker();
  } else {
    // fallback: focus + click (funciona en varios navegadores)
    inputEl.focus();
    inputEl.click();
  }
}

// Abrir selector de mes al clickear el chevron (o todo el bloque del mes)
monthChev?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  syncMonthPickerValue();
  openNativePicker(monthPicker);
});

// opcional: si querés que clickear "May 2024" también lo abra:
monthWrap?.addEventListener("click", () => {
  syncMonthPickerValue();
  openNativePicker(monthPicker);
});

// Cuando el usuario elige mes/año, actualizamos el calendario visible
monthPicker?.addEventListener("change", () => {
  if (!monthPicker.value) return;
  const [y, m] = monthPicker.value.split("-").map(Number);
  current = new Date(y, m - 1, 1);
  render();
});



// month arrows
prevBtn?.addEventListener("click", () => {
  current = new Date(current.getFullYear(), current.getMonth() - 1, 1);
  render();
});

nextBtn?.addEventListener("click", () => {
  current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
  render();
});

// category chips
chips.forEach(chip => {
  chip.addEventListener("click", () => {
    chips.forEach(c => c.classList.remove("active"));
    chip.classList.add("active");
    selectedCategory = chip.dataset.category || selectedCategory;
  });
});

// amount input: ensure $ prefix visual and force negative values
const amountInput = form?.querySelector('.amt-input');
if (amountInput) {
  // while typing, ensure value starts with a minus sign (user sees negative immediately)
  amountInput.addEventListener('input', () => {
    let v = amountInput.value?.toString() ?? '';
    // remove $ if pasted
    v = v.replace(/\$/g, '').trim();
    if (!v) return;
    if (!v.startsWith('-')) {
      amountInput.value = '-' + v;
    }
  });

  // on blur, parse and format to two decimals, keep negative
  amountInput.addEventListener('blur', () => {
    const v = amountInput.value?.toString().trim();
    if (!v) return;
    const parsed = parseFloat(v.replace(/[^0-9.-]/g, ''));
    if (isNaN(parsed)) return;
    const neg = -Math.abs(parsed);
    amountInput.value = neg.toFixed(2);
  });
}

// add reminder (stores amount=0; treat as reminder)
form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const date = dateInput?.value;
  const name = textInput?.value.trim();
  const amountInput = form.querySelector('.amt-input');
  const rawAmt = amountInput?.value?.trim();
  if (!date || !name) return;

  let amt = 0;
  if (rawAmt) {
    const parsed = parseFloat(rawAmt.replace(/[^0-9.-]/g, ''));
    amt = isNaN(parsed) ? 0 : parsed;
  }
  // Always store as negative value for expenses/reminders
  if (amt > 0) amt = -Math.abs(amt);

  const all = loadItems();
  all.push({
    id: (crypto.randomUUID?.() ?? String(Date.now())),
    date,
    category: selectedCategory,
    name,
    amount: amt,
    type: "reminder",
  });
  saveItems(all);

  textInput.value = "";
  if (amountInput) amountInput.value = "";

  // update panel + calendar
  selectedDate = new Date(date + "T00:00:00");
  renderSelectedDay(date);
  render();
  updateSidebarBalance(); 
});

/* =========================
  Balance in sidebar
========================= */
function formatCurrency(n){
  const num = Number(n) || 0;
  return num.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

async function updateSidebarBalance(){
  const el = document.getElementById("sidebarBalance");
  if (!el) return;

  if (typeof DataManager === "undefined") {
    console.warn("DataManager not found. Did you include dataManager.js?");
    return;
  }

  const totals = await DataManager.calculateTotals();
  el.textContent = formatCurrency(totals.total);
}



/* =========================
   INIT
========================= */
// first, move due reminders to expenses (if DataManager is available), then update Balance, finally render
if (typeof DataManager !== 'undefined') {
  moveDueItemsToExpenses().then(() => {
    render();
    updateSidebarBalance();
  });
} else {
  render();
}

