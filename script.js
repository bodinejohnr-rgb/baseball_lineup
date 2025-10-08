let tenPlayerMode = false;

// Coordinates for 9-player and 10-player fields
const nineFieldZones = [
  { x: 340, y: 480 }, // C
  { x: 340, y: 420 }, // P
  { x: 530, y: 350 }, // 1B
  { x: 400, y: 280 }, // 2B
  { x: 250, y: 280 }, // SS
  { x: 150, y: 350 }, // 3B
  { x: 100, y: 170 }, // LF
  { x: 340, y: 110 }, // CF
  { x: 550, y: 170 }  // RF
];

const tenFieldZones = [
  { x: 340, y: 480 }, // C
  { x: 340, y: 420 }, // P
  { x: 530, y: 350 }, // 1B
  { x: 400, y: 280 }, // 2B
  { x: 250, y: 280 }, // SS
  { x: 150, y: 350 }, // 3B
  { x: 80,  y: 170 }, // LF
  { x: 230, y: 140 }, // LCF (extra)
  { x: 400, y: 110 }, // CF
  { x: 570, y: 170 }  // RF
];

const battingOrder = document.getElementById("battingOrder");
const playerList = document.getElementById("playerList");
const positionsDiv = document.getElementById("positions");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const toggleFieldBtn = document.getElementById("toggleFieldBtn");

let dragged = null;

// 🟢 Build the field layout
function buildField() {
  positionsDiv.innerHTML = "";

  const zones = tenPlayerMode ? tenFieldZones : nineFieldZones;

  zones.forEach((pos, i) => {
    const zone = document.createElement("div");
    zone.className = "dropzone";
    zone.draggable = true;
    zone.style.left = `${pos.x}px`;
    zone.style.top = `${pos.y}px`;
    zone.dataset.zone = i;
    zone.addEventListener("dragstart", handleDragStart);
    positionsDiv.appendChild(zone);
  });

  setupDragDrop();
}

// 🟢 Enable drag/drop logic
function setupDragDrop() {
  // Field zones
  document.querySelectorAll(".dropzone").forEach(zone => {
    zone.addEventListener("dragover", e => e.preventDefault());
    zone.addEventListener("drop", handleDrop);
  });

  // Position player list
  playerList.addEventListener("dragover", e => e.preventDefault());
  playerList.addEventListener("drop", handleDrop);
}

// 🟢 Drag start event
function handleDragStart(e) {
  dragged = e.target;
  e.dataTransfer.setData("text/plain", e.target.textContent);
}

// 🟢 Handle drop logic (field <-> list)
function handleDrop(e) {
  e.preventDefault();
  const target = e.currentTarget;
  const draggedText = e.dataTransfer.getData("text/plain");

  // Dropping on field zone
  if (target.classList.contains("dropzone")) {
    if (target.textContent.trim()) {
      const temp = target.textContent;
      target.textContent = draggedText;

      if (dragged.classList.contains("dropzone")) {
        dragged.textContent = temp;
      } else if (dragged.parentElement === playerList) {
        dragged.remove();
        createListItem(temp);
      }
    } else {
      target.textContent = draggedText;
      if (dragged.classList.contains("dropzone")) dragged.textContent = "";
      else dragged.remove();
    }
  }

  // Dropping back to list
  else if (target.id === "playerList") {
    if (![...playerList.children].some(li => li.textContent === draggedText)) {
      createListItem(draggedText);
    }
    if (dragged.classList.contains("dropzone")) dragged.textContent = "";
    else dragged.remove();
  }
}

// 🟢 Create new draggable list item
function createListItem(name) {
  const li = document.createElement("li");
  li.textContent = name;
  li.draggable = true;
  li.addEventListener("dragstart", handleDragStart);
  playerList.appendChild(li);
}

// 🟢 Add new player
addPlayerBtn.addEventListener("click", () => {
  const name = prompt("Enter player name:");
  if (!name) return;

  createListItem(name);

  const liOrder = document.createElement("li");
  liOrder.classList.add("order-item");
  liOrder.textContent = name;

  // Add delete button ❌
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "❌";
  removeBtn.className = "remove-btn";
  removeBtn.addEventListener("click", () => removePlayer(name));

  liOrder.appendChild(removeBtn);
  battingOrder.appendChild(liOrder);

  liOrder.draggable = true;
  liOrder.addEventListener("dragstart", handleDragStart);
});

// 🟢 Remove player entirely (from lists and field)
function removePlayer(name) {
  // Remove from batting order
  [...battingOrder.children].forEach(li => {
    if (li.textContent.includes(name)) li.remove();
  });

  // Remove from position player list
  [...playerList.children].forEach(li => {
    if (li.textContent === name) li.remove();
  });

  // Clear from field if currently placed
  [...document.querySelectorAll(".dropzone")].forEach(zone => {
    if (zone.textContent === name) zone.textContent = "";
  });
}

// 🟢 Toggle between 9 and 10 player modes
toggleFieldBtn.addEventListener("click", () => {
  // Get all players currently on field
  const fieldPlayers = [...document.querySelectorAll(".dropzone")]
    .map(zone => zone.textContent)
    .filter(n => n.trim() !== "");

  // Add them back to the player list
  fieldPlayers.forEach(p => {
    if (![...playerList.children].some(li => li.textContent === p)) {
      createListItem(p);
    }
  });

  // Switch field mode
  tenPlayerMode = !tenPlayerMode;
  toggleFieldBtn.textContent = tenPlayerMode
    ? "Switch to 9-Player Field"
    : "Switch to 10-Player Field";

  // Rebuild the field (clears all zones)
  buildField();
});

new Sortable(battingOrder, { animation: 150 });
new Sortable(playerList, { animation: 150 });

// 🟢 Build initial 9-player field
buildField();
