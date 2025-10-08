/***************************************************
 * Baseball Lineup Creator — complete working script
 **************************************************/

// State
let isTen = false;                         // 9- vs 10-player mode
let playersOnField = {};                   // { positionLabel: playerName }
const POS_LIST = document.getElementById("positionPlayers");
const ORDER = document.getElementById("battingOrder");
const FIELD_WRAP = document.querySelector(".field-container");
const ADD_BTN = document.getElementById("addPlayerBtn");
const TOGGLE_BTN = document.getElementById("switchFieldBtn");

// Field coordinates (tuned to match your screenshot)
const nineField = [
  { label:"C",  x:340, y:480 },
  { label:"P",  x:340, y:420 },
  { label:"1B", x:550, y:355 },
  { label:"2B", x:415, y:280 },
  { label:"SS", x:245, y:280 },
  { label:"3B", x:130, y:345 },
  { label:"LF", x: 80, y:190 },
  { label:"CF", x:340, y:100 },
  { label:"RF", x:580, y:190 }
];
const tenField = [
  { label:"C",   x:340, y:480 },
  { label:"P",   x:340, y:420 },
  { label:"1B",  x:550, y:355 },
  { label:"2B",  x:415, y:280 },
  { label:"SS",  x:245, y:280 },
  { label:"3B",  x:130, y:345 },
  { label:"LF",  x: 60, y:190 },
  { label:"LCF", x:230, y:140 },  // extra OF
  { label:"CF",  x:410, y:100 },
  { label:"RF",  x:590, y:190 }
];

// Build the field (clears zones and draws fresh)
function buildField(){
  // keep the image, clear only zones
  [...FIELD_WRAP.querySelectorAll(".drop-zone")].forEach(z => z.remove());

  const layout = isTen ? tenField : nineField;
  layout.forEach(pos=>{
    const z = document.createElement("div");
    z.className = "drop-zone";
    z.dataset.pos = pos.label;
    z.style.left = `${pos.x}px`;
    z.style.top  = `${pos.y}px`;

    // Allow dropping
    z.addEventListener("dragover", e=>e.preventDefault());
    z.addEventListener("drop", e=>handleDropToZone(e, z));

    FIELD_WRAP.appendChild(z);
  });
}

// Create a draggable player card (used in list and field)
function makePlayerCard(name){
  const el = document.createElement("div");
  el.className = "player";
  el.textContent = name;
  el.draggable = true;
  el.dataset.name = name;
  el.addEventListener("dragstart", e=>{
    e.dataTransfer.setData("text/plain", name);
    // mark where it came from
    const parentZone = el.closest(".drop-zone");
    e.dataTransfer.setData("fromZone", parentZone ? parentZone.dataset.pos : "");
  });
  return el;
}

// Add lineup row with delete (and right-aligned position slot)
function addToLineup(name){
  const row = document.createElement("div");
  row.className = "order-item";
  row.dataset.name = name;
  row.textContent = name;

  const remove = document.createElement("button");
  remove.className = "remove-player";
  remove.title = "Remove";
  remove.textContent = "✖";
  remove.addEventListener("click", ()=>{
    // remove from lineup
    row.remove();
    // remove from position list
    const inList = POS_LIST.querySelector(`[data-name="${name}"]`);
    if (inList) inList.remove();
    // clear from any field zone
    for (const pos in playersOnField){
      if (playersOnField[pos] === name){
        const zone = FIELD_WRAP.querySelector(`.drop-zone[data-pos="${pos}"]`);
        if (zone) zone.textContent = ""; // clear box
        delete playersOnField[pos];
      }
    }
    // clear lineup position tag
    updateLineupTag(name, null);
  });

  row.appendChild(remove);
  ORDER.appendChild(row);
}

// Update / clear the right-aligned position tag in lineup
function updateLineupTag(name, posLabel){
  const row = ORDER.querySelector(`.order-item[data-name="${name}"]`);
  if (!row) return;
  const existing = row.querySelector(".lineup-position");
  if (existing) existing.remove();
  if (posLabel){
    const tag = document.createElement("span");
    tag.className = "lineup-position";
    tag.textContent = posLabel;
    row.appendChild(tag);
  }
}

// Handle drop onto a field zone (supports swapping and list->zone)
function handleDropToZone(e, targetZone){
  e.preventDefault();
  const name = e.dataTransfer.getData("text/plain");
  if (!name) return;

  const fromPos = e.dataTransfer.getData("fromZone"); // "" if from list
  const targetPos = targetZone.dataset.pos;
  const targetName = playersOnField[targetPos] || "";

  // If dragging from another zone → swap
  if (fromPos){
    if (fromPos === targetPos) return; // same spot
    const fromZone = FIELD_WRAP.querySelector(`.drop-zone[data-pos="${fromPos}"]`);

    // Place dragged in target
    playersOnField[targetPos] = name;
    targetZone.innerHTML = "";
    targetZone.appendChild(makePlayerCard(name));
    updateLineupTag(name, targetPos);

    // If target had someone, move them back to fromZone
    if (targetName){
      playersOnField[fromPos] = targetName;
      fromZone.innerHTML = "";
      fromZone.appendChild(makePlayerCard(targetName));
      updateLineupTag(targetName, fromPos);
    } else {
      // target was empty, clear fromZone
      delete playersOnField[fromPos];
      fromZone.innerHTML = "";
      updateLineupTag(name, targetPos); // already set
    }
    return;
  }

  // Dragging from Position Players list
  // If zone already occupied, put that player back to list
  if (targetName){
    const back = makePlayerCard(targetName);
    POS_LIST.appendChild(back);
  }

  // Place new player
  playersOnField[targetPos] = name;
  targetZone.innerHTML = "";
  targetZone.appendChild(makePlayerCard(name));
  updateLineupTag(name, targetPos);

  // Remove from list (if present)
  const inList = POS_LIST.querySelector(`[data-name="${name}"]`);
  if (inList) inList.remove();
}

// Allow dropping back to Position Players list (from zones)
POS_LIST.addEventListener("dragover", e=>e.preventDefault());
POS_LIST.addEventListener("drop", e=>{
  e.preventDefault();
  const name = e.dataTransfer.getData("text/plain");
  const fromPos = e.dataTransfer.getData("fromZone");
  if (!name) return;

  // If came from a zone, clear that zone/mapping
  if (fromPos){
    const zone = FIELD_WRAP.querySelector(`.drop-zone[data-pos="${fromPos}"]`);
    if (zone) zone.innerHTML = "";
    delete playersOnField[fromPos];
    updateLineupTag(name, null);
  }
  // Add back to list if not already there
  if (!POS_LIST.querySelector(`[data-name="${name}"]`)){
    POS_LIST.appendChild(makePlayerCard(name));
  }
});

// Add Player (prompt)
ADD_BTN.addEventListener("click", ()=>{
  const name = (prompt("Enter player name:") || "").trim();
  if (!name) return;
  // lineup row
  addToLineup(name);
  // players list card
  POS_LIST.appendChild(makePlayerCard(name));
});

// Toggle 9/10 players
TOGGLE_BTN.addEventListener("click", ()=>{
  // Return all fielded players to list first
  Object.values(playersOnField).forEach(n=>{
    if (!POS_LIST.querySelector(`[data-name="${n}"]`)){
      POS_LIST.appendChild(makePlayerCard(n));
    }
    updateLineupTag(n, null);
  });
  playersOnField = {};

  isTen = !isTen;
  TOGGLE_BTN.textContent = isTen ? "Switch to 9-Player Field" : "Switch to 10-Player Field";
  buildField();
});

// Build initial field once the image is in DOM
window.addEventListener("load", buildField);
