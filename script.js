// Coordinates for 9 field positions
const fieldZones = [
  { x: 310, y: 440 }, // C
  { x: 310, y: 390 }, // P
  { x: 470, y: 330 }, // 1B
  { x: 370, y: 270 }, // 2B
  { x: 240, y: 270 }, // SS
  { x: 160, y: 330 }, // 3B
  { x: 120, y: 180 }, // LF
  { x: 310, y: 130 }, // CF
  { x: 500, y: 180 }  // RF
];

document.getElementById("generateBtn").addEventListener("click", () => {
  const names = document.getElementById("playerInput").value
    .split("\n")
    .map(n => n.trim())
    .filter(n => n !== "");

  if (names.length === 0) return alert("Please enter at least one player.");

  const battingOrder = document.getElementById("battingOrder");
  const playerList = document.getElementById("playerList");
  const positionsDiv = document.getElementById("positions");

  battingOrder.innerHTML = "";
  playerList.innerHTML = "";
  positionsDiv.innerHTML = "";

  // Add players to lists
  names.forEach(name => {
    const li1 = document.createElement("li");
    li1.textContent = name;
    battingOrder.appendChild(li1);

    const li2 = document.createElement("li");
    li2.textContent = name;
    playerList.appendChild(li2);
  });

  // Make both lists draggable
  new Sortable(battingOrder, { animation: 150 });
  new Sortable(playerList, { animation: 150 });

  // Create blank dropzones
  fieldZones.forEach(pos => {
    const zone = document.createElement("div");
    zone.className = "dropzone";
    zone.style.left = `${pos.x}px`;
    zone.style.top = `${pos.y}px`;
    positionsDiv.appendChild(zone);
  });

  // Drag/drop logic
  let dragged = null;

  // When dragging from list
  playerList.addEventListener("dragstart", e => {
    dragged = e.target;
  });

  // Make zones accept drops
  document.querySelectorAll(".dropzone").forEach(zone => {
    zone.addEventListener("dragover", e => e.preventDefault());

    zone.addEventListener("drop", e => {
      e.preventDefault();

      if (!dragged) return;

      const currentName = zone.textContent.trim();

      // If this zone already has a player, swap them
      if (currentName && currentName !== dragged.textContent) {
        // Find the zone that currently holds the dragged name
        const allZones = document.querySelectorAll(".dropzone");
        const otherZone = Array.from(allZones).find(z => z.textContent.trim() === dragged.textContent);

        if (otherZone) otherZone.textContent = currentName;
        zone.textContent = dragged.textContent;
      } else {
        // Normal drop
        zone.textContent = dragged.textContent;
        dragged.remove(); // remove from list
      }
    });
  });
});

