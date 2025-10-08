// ===============================
// Baseball Lineup Creator Script
// ===============================

let playerCount = 0;
let isTenPlayerField = false;
let fieldZones = [];
let playersOnField = {};

// ⚾ Coordinates for 9- and 10-player fields
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

// Create draggable player divs
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

// Create field positions
function createField() {
  const fieldContainer = document.querySelector(".field-container");
  fieldContainer.innerHTML = "";

  const fieldImage = document.createElement("img");
  fieldImage.src = "Baseball Field.jpg";
  fieldImage.classList.add("field");
  fieldContainer.appendChild(fieldImage);

  fieldZones.forEach((pos, index) => {
    const zone = document.createElement("div");
    zone.classList.add("drop-zone");
    zone.dataset.position = pos.label;
    zone.style.left = `${pos.x}px`;
    zone.style.top = `${pos.y}px`;

    zone.addEventListener("dragover", (e) => e.preventDefault());
    zone.addEventListener("drop", handleDrop);

    fieldContainer.appendChild(zone);
  });
}

// Handle player drop onto the field
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

  // Add to the field visually
  dropZone.innerHTML = "";
  const playerDiv = createDraggablePlayer(playerName);
  playerDiv.classList.add("on-field");
  dropZone.appendChild(playerDiv);

  // Make the player draggable back off the field
  playerDiv.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", playerName);
    dropZone.innerHTML = ""; // clear from field
    delete playersOnField[dropZone.dataset.position];
    updatePlayerPositionInLineup(playerName, null);
    // put player back in position list
    const newPlayer = createDraggablePlayer(playerName);
    document.getElementById("positionPlayers").appendChild(newPlayer);
  });

  // Update lineup with position label
  updatePlayerPositionInLineup(playerName, dropZone.dataset.position);
}

// Update the position next to a player's name in the batting order
function updatePlayerPositionInLineup(playerName, positionName) {
  const orderItems = document.querySelectorAll(".order-item");
  orderItems.forEach((item) => {
    if (item.dataset.name === playerName) {
      const existing = item.querySelector(".lineup-position");
      if (existing) existing.remove();
      if (positionName) {
        const posLabel = document.createElement("span");
        posLabel.classList.add("lineup-position");
        posLabel.textContent = positionName;
        item.appendChild(posLabel);
      }
    }
  });
}

// Add player button logic
function setupAddPlayerButton() {
  document.getElementById("addPlayerBtn").addEventListener("click", () => {
    const name = prompt("Enter player name:");
    if (name) addPlayerToLists(name);
  });
}

// Add player to lineup and position list
function addPlayerToLists(name) {
  playerCount++;

  const orderList = document.getElementById("battingOrder");
  const orderItem = document.createElement("div");
  orderItem.classList.add("order-item");
  orderItem.dataset.name = name;
  orderItem.textContent = `${playerCount}. ${name}`;

  const removeBtn = document.createElement("span");
  removeBtn.classList.add("remove-player");
  removeBtn.textContent = "✖";
  removeBtn.addEventListener("click", () => removePlayer(name, orderItem));

  orderItem.appendChild(removeBtn);
  orderList.appendChild(orderItem);

  // Add to position players list
  const positionPlayers = document.getElementById("positionPlayers");
  const playerDiv = createDraggablePlayer(name);
  positionPlayers.appendChild(playerDiv);
}

// Remove player from lineup and field
function removePlayer(name, orderItem) {
  orderItem.remove();

  // Remove from field if present
  for (const pos in playersOnField) {
    if (playersOnField[pos] === name) {
      const zone = document.querySelector(`[data-position="${pos}"]`);
      if (zone) zone.innerHTML = "";
      delete playersOnField[pos];
    }
  }

  // Remove from position players list
  const positionList = document.getElementById("positionPlayers");
  const playerItem = positionList.querySelector(`[data-name="${name}"]`);
  if (playerItem) playerItem.remove();
}

// Switch between 9- and 10-player field
function setupSwitchButton() {
  const switchBtn = document.getElementById("switchFieldBtn");
  switchBtn.addEventListener("click", () => {
    // Return any players currently on the field to the position list
    Object.values(playersOnField).forEach((playerName) => {
      const existing = document.querySelector(`#positionPlayers [data-name="${playerName}"]`);
      if (!existing) {
        const playerDiv = createDraggablePlayer(playerName);
        document.getElementById("positionPlayers").appendChild(playerDiv);
      }
      updatePlayerPositionInLineup(playerName, null);
    });
    playersOnField = {};

    // Toggle field type
    isTenPlayerField = !isTenPlayerField;
    fieldZones = isTenPlayerField ? [...tenFieldZones] : [...nineFieldZones];
    createField();
    switchBtn.textContent = isTenPlayerField
      ? "Switch to 9-Player Field"
      : "Switch to 10-Player Field";
  });
}
