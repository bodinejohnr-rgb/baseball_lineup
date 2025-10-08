// Coordinates for 9 field positions
const fieldZones = [
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

const battingOrder = document.getElementById("battingOrder");
const playerList = document.getElementById("playerList");
const positionsDiv = document.getElementById("positions");
const addPlayerBtn = document.getElementById("addPlayerBtn");

// Initialize drag/drop and dropzones
function initField() {
  positionsDiv.innerHTML = "";
  fieldZones.forEach(pos => {
    const zone = document.createElement("div");
    zone.className = "dropzone";
    zone.style.left = `${pos.x}px`;
    zone.style.top = `${pos.y}px`;
    positionsDiv.appendChild(zone);
  });
  enableDragDrop();
}

// Create drag/drop behavior
function enableDragDrop() {
  let dragged = null;

  playerList.addEventListener("dragstart", e => (dragged = e.target));

  document.querySelectorAll(".dropzone").forEach(zone => {
    zone.addEventListener("dragover", e => e.preventDefault());

    zone.addEventListener("drop", e => {
      e.preventDefault();
      if (!dragged) return;

      const currentName = zone.textContent.trim();

      // If a player already exists, swap them
      if (currentName && currentName !== dragged.textContent) {
        const otherZone = Array.from(document.querySelectorAll(".dropzone"))
          .find(z => z.textContent.trim() === dragged.textContent);
        if (otherZone) otherZone.textContent = currentName;
        zone.textContent = dragged.textContent;
      } else {
        // Normal drop
        zone.textContent = dragged.textContent;
        dragged.remove(); // remove from list
      }
    });
  });
}

// Add player dynamically
addPlayerBtn.addEventListener("click", () => {
  const name = prompt("Enter player name:");
  if (!name) return;

  // Create new batting order entry
  const li1 = document.createElement("li");
  li1.textContent = name;
  battingOrder.appendChild(li1);

  // Create new position player entry
  const li2 = document.createElement("li");
  li2.textContent = name;
  playerList.appendChild(li2);
});

// Make lists sortable (draggable)
new Sortable(battingOrder, { animation: 150 });
new Sortable(playerList, { animation: 150 });

// Initialize field on load
initField();
