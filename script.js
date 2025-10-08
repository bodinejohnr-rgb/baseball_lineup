// Coordinates for 9 dropzones on the field
const fieldZones = [
  { x: 195, y: 230 }, // C
  { x: 195, y: 190 }, // P
  { x: 290, y: 150 }, // 1B
  { x: 235, y: 120 }, // 2B
  { x: 155, y: 120 }, // SS
  { x: 100, y: 150 }, // 3B
  { x: 70, y: 60 },  // LF
  { x: 195, y: 30 }, // CF
  { x: 320, y: 60 }  // RF
];

document.getElementById("generateBtn").addEventListener("click", () => {
  const names = document.getElementById("playerInput").value
    .split("\n")
    .map(n => n.trim())
    .filter(n => n !== "");

  // Clear previous lists
  const battingOrder = document.getElementById("battingOrder");
  const playerList = document.getElementById("playerList");
  battingOrder.innerHTML = "";
  playerList.innerHTML = "";

  // Add players to both lists
  names.forEach(name => {
    const li1 = document.createElement("li");
    li1.textContent = name;
    battingOrder.appendChild(li1);

    const li2 = document.createElement("li");
    li2.textContent = name;
    playerList.appendChild(li2);
  });

  // Make lists draggable
  new Sortable(battingOrder, { animation: 150 });
  new Sortable(playerList, { animation: 150 });

  // Create blank drop zones on field
  const positionsDiv = document.getElementById("positions");
  positionsDiv.innerHTML = "";
  fieldZones.forEach(pos => {
    const drop = document.createElement("div");
    drop.className = "dropzone";
    drop.style.left = `${pos.x}px`;
    drop.style.top = `${pos.y}px`;
    positionsDiv.appendChild(drop);
  });

  // Allow dragging from player list to field
  let dragged = null;
  playerList.addEventListener("dragstart", e => (dragged = e.target));

  document.querySelectorAll(".dropzone").forEach(zone => {
    zone.addEventListener("dragover", e => e.preventDefault());
    zone.addEventListener("drop", e => {
      e.preventDefault();
      zone.textContent = dragged.textContent;
    });
  });
});

