// Coordinates adjusted for larger field (700px wide)
const fieldZones = [
  { x: 310, y: 410 }, // C
  { x: 310, y: 330 }, // P
  { x: 480, y: 250 }, // 1B
  { x: 360, y: 180 }, // 2B
  { x: 250, y: 180 }, // SS
  { x: 140, y: 250 }, // 3B
  { x: 80, y: 90 },   // LF
  { x: 310, y: 30 },  // CF
  { x: 530, y: 90 }   // RF
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
    li2.draggable = true;
    playerList.appendChild(li2);
  });

  // Make batting order sortable
  new Sortable(battingOrder, { animation: 150 });

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

  // Logic for dragging players onto field & swapping
  let dragged = null;

  // From list
  playerList.addEventListener("dragstart", e => {
    dragged = e.target;
  });

  // From field
  document.getElementById("positions").addEventListener("dragstart", e => {
    if (e.target.classList.contains("dropzone") && e.target.textContent.trim() !== "") {
      dragged = e.target;
      e.dataTransfer.setData("text/plain", e.target.textContent);
    }
  });

  // Handle drop
  document.querySelectorAll(".dropzone").forEach(zone => {
    zone.addEventListener("dragover", e => e.preventDefault());
    zone.addEventListener("drop", e => {
      e.preventDefault();
      if (!

