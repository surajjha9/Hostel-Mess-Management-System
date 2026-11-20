/* ============================================================
   HOSTEL-MESS – APP LOGIC
   Front-end demo prototype. Data persists in localStorage.
   ============================================================ */

/* ---------- CONSTANTS & STATE ---------- */
const today = new Date().toISOString().slice(0, 10);

const defaultMenu = {
  Breakfast: "Poha, Tea, Banana",
  Lunch: "Dal, Rice, Roti, Sabzi",
  Dinner: "Paneer, Roti, Rice, Kheer"
};

let role = "STUDENT";
let currentUser = null;

/* ---------- STORAGE HELPERS ---------- */
function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* ---------- SEED DEFAULT DATA ---------- */
function seed() {
  if (!localStorage.getItem("hm_menu")) write("hm_menu", defaultMenu);
  if (!localStorage.getItem("hm_orders")) write("hm_orders", []);
}
seed();

/* ---------- AUTH – ROLE & LOGIN ---------- */
function setRole(r) {
  role = r;

  document.getElementById("studentTab").classList.toggle("active", r === "STUDENT");
  document.getElementById("kitchenTab").classList.toggle("active", r === "KITCHEN");

  document.getElementById("username").value = r === "STUDENT" ? "suraj" : "kitchen";
}

function login() {
  const u = document.getElementById("username").value.trim();
  const p = document.getElementById("password").value;

  const invalid =
    p !== "1234" ||
    (role === "STUDENT" && u !== "suraj") ||
    (role === "KITCHEN" && u !== "kitchen");

  if (invalid) {
    document.getElementById("loginError").textContent =
      "Invalid demo credentials. Please try again.";
    return;
  }

  currentUser = { username: u, role };

  document.getElementById("loginView").classList.add("hidden");
  document.getElementById("topUser").textContent = u + " · " + role;

  if (role === "STUDENT") {
    document.getElementById("studentView").classList.remove("hidden");
    renderStudent();
  } else {
    document.getElementById("kitchenView").classList.remove("hidden");
    renderKitchen();
  }
}

function logout() {
  currentUser = null;

  ["studentView", "kitchenView"].forEach(id =>
    document.getElementById(id).classList.add("hidden")
  );

  document.getElementById("loginView").classList.remove("hidden");
  document.getElementById("topUser").textContent = "Online Food Managing System";
}

/* ---------- DATA ACCESSORS ---------- */
function menu() {
  return read("hm_menu", defaultMenu);
}

function orders() {
  return read("hm_orders", []);
}

/* ---------- STUDENT – MEAL ACTIONS (UPDATED) ---------- */
function act(meal, action) {
  const all = orders();
  const existingIndex = all.findIndex(
    o => o.user === "suraj" && o.date === today && o.meal === meal
  );

  // Agar pehle se koi response hai (Order ya Skip)
  if (existingIndex !== -1) {
    // Agar wahi button dobara dabaya hai jaisa pehle tha, toh kuch mat karo
    if (all[existingIndex].action === action) return; 
    
    // Nahi toh purane response ko update kar do
    all[existingIndex].action = action;
    all[existingIndex].status = action === "ORDER" ? "Pending" : "Skipped";
  } else {
    // Agar naya response hai, toh list mein naya entry add karo
    all.push({
      user: "suraj",
      room: "204",
      date: today,
      meal,
      action,
      status: action === "ORDER" ? "Pending" : "Skipped"
    });
  }

  write("hm_orders", all);
  renderStudent();
}

/* ---------- STUDENT – RENDER VIEW (UPDATED) ---------- */
function renderStudent() {
  const m = menu();
  const myOrders = orders().filter(o => o.date === today && o.user === "suraj");

  document.getElementById("studentMeals").innerHTML = ["Breakfast", "Lunch", "Dinner"]
    .map(meal => {
      const found = myOrders.find(o => o.meal === meal);
      const items = escapeHtml(m[meal] || "Menu not updated yet");

      if (found) {
        // Agar order/skip ho chuka hai, toh status ke saath 'Change' buttons dikhao
        const label = found.action === "ORDER"
          ? "Ordered · " + found.status
          : "Skipped";

        return `<article class="meal">
          <h3>${meal}</h3>
          <p>${items}</p>
          <span class="status" style="margin-bottom:12px; display:inline-block;">${label}</span>
          <div class="actions" style="margin-top:10px; gap:8px;">
            <!-- Agar ordered hai toh Skip ka option, agar skip hai toh Order ka option -->
            ${found.action === "ORDER" 
              ? `<button class="skip" style="width:100%; font-size:12px; padding:8px;" onclick="act('${meal}','SKIP')">Cancel & Skip</button>`
              : `<button class="primary" style="width:100%; font-size:12px; padding:8px;" onclick="act('${meal}','ORDER')">Order instead</button>`
            }
          </div>
        </article>`;
      }

      // Agar abhi tak kuch nahi kiya, toh normal buttons dikhao
      return `<article class="meal">
        <h3>${meal}</h3>
        <p>${items}</p>
        <div class="actions">
          <button class="primary" onclick="act('${meal}','ORDER')">Order</button>
          <button class="skip" onclick="act('${meal}','SKIP')">Skip</button>
        </div>
      </article>`;
    })
    .join("");

  document.getElementById("myActivity").innerHTML = myOrders.length
    ? myOrders.map(o => `<p><b>${o.meal}:</b> ${o.action} ${o.status ? "· " + o.status : ""}</p>`).join("")
    : "No activity yet. Choose Order or Skip above.";
}

/* ---------- KITCHEN – MENU EDITOR ---------- */
function saveMenu() {
  const meal = document.getElementById("menuMeal").value;
  const items = document.getElementById("menuItems").value.trim();

  if (!items) {
    alert("Please enter menu items.");
    return;
  }

  const m = menu();
  m[meal] = items;
  write("hm_menu", m);

  document.getElementById("menuItems").value = "";
  renderKitchen();

  alert(meal + " menu saved.");
}

/* ---------- KITCHEN – ORDER STATUS ---------- */
function setStatus(index, status) {
  const all = orders();
  all[index].status = status;
  write("hm_orders", all);
  renderKitchen();
}

/* ---------- KITCHEN – RENDER VIEW ---------- */
function renderKitchen() {
  const todaysOrders = orders().filter(o => o.date === today);

  /* Stats */
  const count = meal =>
    todaysOrders.filter(o => o.meal === meal && o.action === "ORDER").length;

  document.getElementById("stats").innerHTML = ["Breakfast", "Lunch", "Dinner"]
    .map(m => `
      <div class="stat">
        ${m}
        <b>${count(m)}</b>
        <small class="muted">confirmed orders</small>
      </div>
    `)
    .join("");

  /* Orders table */
  document.getElementById("ordersTable").innerHTML = todaysOrders.length
    ? `<table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Room</th>
            <th>Meal</th>
            <th>Response</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          ${todaysOrders
            .map((o, i) => {
              const updateCell =
                o.action === "ORDER"
                  ? `<button class="small-btn" onclick="setStatus(${i},'Cooking')">Cooking</button>
                     <button class="small-btn" onclick="setStatus(${i},'Ready')">Ready</button>`
                  : "—";

              return `<tr>
                <td>${escapeHtml(o.user)}</td>
                <td>${o.room}</td>
                <td>${o.meal}</td>
                <td>${o.action}</td>
                <td>${o.status}</td>
                <td>${updateCell}</td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>`
    : "No meal responses yet.";
}

/* ---------- UTILITY – ESCAPE HTML ---------- */
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}