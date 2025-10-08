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

// Initialize field
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

// Handle drag start
function handleDragStart(e) {
  dragged = e.target;
  e.dataTransfer.setData("text/plain", e.target.textContent);
}

// Setup drag-and-drop between zones and list
function setupDragDrop() {
  // All drop zones on field
  document.querySelectorAll(".dropzone").forEach(zone => {
    zone.addEventListener("dragover", e => e.preventDefault());
    zone.addEventListener("drop", handleDrop);
  });

  // Make playerList a drop target
  playerList.addEventListener("dragover", e => e.preventDefault());
  playerList.addEventListener("drop", handleDrop);
}

function handleDrop(e) {
  e.preventDefault();
  const target = e.currentTarget;
  const draggedText = e.dataTransfer.getData("text/plain");

  // Dropping onto a field position
  if (target.classList.contains("dropzone")) {
    if (target.textContent.trim()) {
      // Swap players
      const temp = target.textContent;
      target.textContent = draggedText;

      // Find the original zone that had the dragged player
      if (dragged.classList.contains("dropzone")) {
        dragged.textContent = temp;
      } else if (dragged.parentElement === playerList) {
        dragged.remove();
        createListItem(temp);
      }
    } else {
      // Empty zone
      target.textContent = draggedText;
      if (dragged.classList.contains("dropzone")) dragged.textContent = "";
      else dragged.remove();
    }
  }

  // Dropping back to the list
  else if (target.id === "playerList") {
    // Add player back to list if not already there
    if (![...playerList.children].some(li => li.textContent === draggedText)) {
      createListItem(draggedText);
    }
    if (dragged.classList.contains("dropzone")) dragged.textContent = "";
    else dragged.remove();
  }
}

// Helper to create draggable list items
function createListItem(name) {
  const li = document.createElement("li");
  li.textContent = name;
  li.draggable = true;
  li.addEventListener("dragstart", handleDragStart);
  playerList.appendChild(li);
}

// Add player dynamically
addPlayerBtn.addEventListener("click", () => {
  const name = prompt("Enter player name:");
  if (!name) return;

  createListItem(name);

  const liOrder = document.createElement("li");
  liOrder.textContent = name;
  liOrder.draggable = true;
  liOrder.addEventListener("dragstart", handleDragStart);
  battingOrder.appendChild(liOrder);
});

// Toggle between 9 and 10 player modes
toggleFieldBtn.addEventListener("click", () => {
  tenPlayerMode = !tenPlayerMode;
  toggleFieldBtn.textContent = tenPlayerMode
    ? "Switch to 9-Player Field"
    : "Switch to 10-Player Field";
  buildField();
});

new Sortable(battingOrder, { animation: 150 });
new Sortable(playerList, { animation: 150 });

// Initial load
buildField();
