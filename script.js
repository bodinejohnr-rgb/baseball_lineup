// ===============================
// Baseball Lineup Creator Script
// ===============================

let playerCount = 0;
let isTenPlayerField = false;
let fieldZones = [];
let playersOnField = {};

// ⚾ Coordinates for 9- and 10-player layouts (tuned for spacing)
const nineFieldZones = [
  { label: "C", x: 340, y: 480 },
  { label: "P", x: 340, y: 420 },
  { label: "1B", x: 550, y: 355 },
  { label: "2B", x: 415, y: 280 },
  { label: "SS", x: 245, y: 280 },
  { label: "3B", x: 130, y: 345 },
  { label: "LF", x: 80, y: 190 },
  { label: "CF", x: 340, y: 100 },
  { label: "RF", x: 580, y: 190 }
];

const tenFieldZones = [
  { label: "C", x: 340, y: 480 },
  { label: "P", x: 340, y: 420 },
  { label: "1B", x: 550, y: 355 },
  { label: "2B", x: 415, y: 280 },
  { label: "SS", x: 245, y: 280 },
  { label: "3B", x: 130, y: 345 },
  { label: "LF", x: 60, y: 190 },
  { label: "LCF", x: 230, y: 140 },
  { label: "CF", x: 410, y: 100 },
  { label: "RF", x: 590, y: 190 }
];

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
  fieldZones = [...nineFieldZones];
  createField();
  setupAddPlayerButton();
  setupSwitchButton();
});

// ------------------------------
// Create draggable player block
// ------------------------------
function createDraggablePlayer(name) {
  const playerDiv = document.createElement("div");
  playerDiv.classList.add("player");
  playerDiv.textContent = name;
  playerDiv.draggable = true;
  playerDiv.dataset.name = name;

  playerDiv.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", name);
  });

  return playerDiv;
}

// ------------------------------
// Create the field layout
// ------------------------------
function createField() {
  const fieldContainer = document.querySelector(".field-container");
  fieldContainer.innerHTML = "";

  const fieldImage = document.createElement("img");
  fieldImage.src = "Baseball Field.jpg";
  fieldImage.classList.add("field");
  fieldContainer.appendChild(fieldImage);

  fieldZones.forEach((pos) => {
    const zone = document.createElement("div");
    zone.classList.add("drop-zone");
    zone.dataset.position = pos.label;
    zone.style.left = `${pos.x}px`;
    zone.style.top = `${pos.y}px`;

    // Allow drops
    zone.addEventListener("dragover", (e) => e.preventDefault());
    zone.addEventListener("drop", handleDrop);

    fieldContainer.appendChild(zone);
  });
}

// ------------------------------
// Handle drop onto the field
// ------------------------------
function handleDrop(e) {
  e.preventDefault();
  const playerName = e.dataTransfer.getData("text/plain");
  const dropZone = e.target.closest(".drop-zone");
  if (!dropZone || !playerName) return;

  // Remove player from old position if already placed
  for (const pos in playersOnField) {
    if (playersOnField[pos] === playerName) {
      delete playersOnField[pos];
      break;
    }
  }

  playersOnField[dropZone.dataset.position] = playerName;

  // Remove from Position Players list
  const positionList = document.getElementById("positionPlayers");
  const playerItem = positionList.querySelector(`[data-name="${playerName}"]`);
  if (playerItem) playerItem.remove();

  // Show on field
  dropZone.innerHTML = "";
  const playerDiv = createDraggablePlayer(playerName);
  playerDiv.classList.add("on-field");
  dropZone.appendChild(playerDiv);

  // Make draggable back off field
  playerDiv.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", playerName);
    dropZone.innerHTML = ""; // clear field slot
    delete playersOnField[dropZone.dataset.position];
    updatePlayerPositionInLineup(playerName, null);

    // put back in list
    const newPlayer = createDraggablePlayer(playerName);
    document.getElementById("positionPlayers").appendChild(newPlayer);
  });

  // Update lineup with position
  updatePlayerPositionInLineup(playerName, dropZone.dataset.position);
}

// ------------------------------
// Update lineup position tag
// ------------------------------
function updatePlayerPositionInLineup(playerName, positionName) {
  const orderItems = document.querySelectorAll(".order-item");
  orderItems.forEach((item) => {
    if (item.dataset.name === playerName) {
      const existing = item.querySelector(".lineup-position");
      if (existing) existing.remove();

      if (positionName) {
        const posLabel = document.createElement("span");
        posLabel.classList.add(
