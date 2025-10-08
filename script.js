let tenPlayerMode = false;

// Field layouts
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
  ...nineFieldZones,
  { x: 225, y: 150 }  // LCF (extra outfielder)
];

const battingOrder = document.getElementById("battingOrder");
const playerList = document.getElementById("playerList");
const positionsDiv = document.getElementById("positions");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const toggleFieldBtn = document.getElementById("toggleFieldBtn");

// Create or rebuild field
function buildField() {
  positionsDiv.innerHTML = "";
  const zones = tenPlayerMode ? tenFieldZones : nineFieldZones;

  zones.forEach(pos => {
    const zone = document.createElement("div");
    zone.className = "dropzone";
    zone.draggable = true;
    zone.style.left = `${pos.x}px`;
    zone.style.top = `${pos.y}px`;
    zone.addEventListener("dragstart", handleDragStart);
    positionsDiv.appendChild(zone);
  });

  enableDragDrop();
}

// Allow drag/drop between all areas
function enableDragDrop() {
  const allZones = document.querySelectorAll(".dropzone");
  const allLists = [playerList, ...allZones];

  allLists.forEach(zone => {
    zone.addEventListener("dragover", e => e.preventDefault());
    zone.addEventListener("drop", handleDrop);
  });
}

// Store dragged element globally
let dragged = null;

// Handle drag start for any draggable
function handleDragStart(e) {
  dragged = e.target;
  e.dataTransfer.setData("text/plain", e.target.textContent);
}

// Handle drop logic
function handleDrop(e) {
  e.preventDefault();
  const target = e.currentTarget;
  const draggedText = e.dataTransfer.getData("text/plain");

  // Swapping players between field zones
  if (target.classList.contains("dropzone")) {
    if (target.textContent.trim()) {
      const temp = target.textContent;
      target.textContent = draggedText;

      // Find the zone or list where the dragged item came from
      if (dragged.classList.contains("dropzone")) {
        dragged.textContent = temp;
      } else if (dragged.parentElement === playerList) {
        // If dragged from list, replace the list entry
        dragged.remove();
        const li = document.createElement("li");
        li.textContent = temp;
        li.draggable = true;
        li.addEventListener("dragstart", handleDragStart);
        playerList.appendChild(li);
      }
    } else {
      // Normal drop (empty zone)
      target.textContent = draggedText;
      if (dragged.classList.contains("dropzone")) {
        dragged.textContent = "";
      } else {
        dragged.remove();
      }
    }
  }

  // Dropping a player back to the list
  else if (target.id === "playerList") {
    if (!Array.from(playerList.children).some(li => li.textContent === draggedText)) {
      const li = document.createElement("li");
      li.textContent = draggedText;
      li.draggable = true;
      li.addEventListener("dragstart", handleDragStart);
      playerList.appendChild(li);
    }

    if (dragged.classList.contains("dropzone")) {
      dragged.textContent = "";
    } else {
      dragged.remove();
    }
  }
}

// Add player dynamically
addPlayerBtn.addEventListener("click", () => {
  const name = prompt("Enter player name:");
  if (!name) return;

  const li1 = document.createElement("li");
  li1.textContent = name;
  li1.draggable = true;
  li1.addEventListener("dragstart", handleDragStart);
  battingOrder.appendChild(li1);

  const li2 = document.createElement("li");
  li2.textContent = name;
  li2.draggable = true;
  li2.addEventListener("dragstart", handleDragStart);
  playerList.appendChild(li2);
});

// Toggle between 9 and 10 player fields
toggleFieldBtn.addEventListener("click", () => {
  tenPlayerMode = !tenPlayerMode;
  toggleFieldBtn.textContent = tenPlayerMode
    ? "Switch to 9-Player Field"
    : "Switch to 10-Player Field";
  buildField();
});

new Sortable(battingOrder, { animation: 150 });
new Sortable(playerList, { animation: 150 });

// Build initial 9-player field
buildField();
