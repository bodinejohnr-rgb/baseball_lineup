/***************************************************
 * Baseball Lineup Creator — complete working script
 **************************************************/

// DOM references
const POS_LIST   = document.getElementById("positionPlayers");
const ORDER      = document.getElementById("battingOrder");
const FIELD_WRAP = document.querySelector(".field-container");
const ADD_BTN    = document.getElementById("addPlayerBtn");
const TOGGLE_BTN = document.getElementById("switchFieldBtn");

// State
let isTen = false;                 // 9 vs 10 player mode
let playersOnField = {};           // { positionLabel: playerName }

// Field coordinates (tuned to your screenshot)
const nineField = [
  { label:"C",  x:330, y:480 },
  { label:"P",  x:330, y:380 },
  { label:"1B", x:500, y:355 },
  { label:"2B", x:415, y:280 },
  { label:"SS", x:245, y:280 },
  { label:"3B", x:160, y:345 },
  { label:"LF", x: 130, y:190 },
  { label:"CF", x:330, y:130 },
  { label:"RF", x:550, y:190 }
];

// 10-player: add **LC** and rename center to **RC**
const tenField = [
  { label:"C",  x:330, y:480 },
  { label:"P",  x:330, y:380 },
  { label:"1B", x:500, y:355 },
  { label:"2B", x:415, y:280 },
  { label:"SS", x:245, y:280 },
  { label:"3B", x:160, y:345 },
  { label:"LF", x: 110, y:210 },
  { label:"LC", x:245, y:140 },  
  { label:"RC", x:415, y:140 },   
  { label:"RF", x:530, y:210 }
];

/* =========================
   Field building & helpers
   ========================= */

function buildField(){
  // Remove any existing drop-zones but keep the image
  [...FIELD_WRAP.querySelectorAll(".drop-zone")].forEach(z => z.remove());

  const layout = isTen ? tenField : nineField;
  layout.forEach(pos => {
    const z = document.createElement("div");
    z.className  = "drop-zone";
    z.dataset.pos = pos.label;
    z.style.left = `${pos.x}px`;
    z.style.top  = `${pos.y}px`;

    z.addEventListener("dragover", e => e.preventDefault());
    z.addEventListener("drop", e => handleDropToZone(e, z));

    FIELD_WRAP.appendChild(z);
  });
}

// Create a draggable player card (used in list & on field)
function makePlayerCard(name){
  const el = document.createElement("div");
  el.className   = "player";
  el.textContent = name;
  el.draggable   = true;
  el.dataset.name = name;

  el.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", name);
    // mark the origin (zone label if from a zone)
    const parentZone = el.closest(".drop-zone");
    e.dataTransfer.setData("fromZone", parentZone ? parentZone.dataset.pos : "");
  });

  return el;
}

/* =========================
   Batting order (lineup)
   ========================= */

function addToLineup(name){
  const row = document.createElement("div");
  row.className   = "order-item";
  row.dataset.name = name;
  row.textContent = name;        // numbers are added by CSS ::before

  // tiny black ❌ outside the card
  const remove = document.createElement("button");
  remove.className = "remove-player";
  remove.title = "Remove";
  remove.textContent = "✖";
  remove.addEventListener("click", e => {
    e.stopPropagation(); // don't start a drag
    // remove from lineup
    row.remove();
    // remove from position list
    const inList = POS_LIST.querySelector(`[data-name="${name}"]`);
    if (inList) inList.remove();
    // clear from any field zone
    for (const pos in playersOnField){
      if (playersOnField[pos] === name){
        const zone = FIELD_WRAP.querySelector(`.drop-zone[data-pos="${pos}"]`);
        if (zone) zone.innerHTML = "";
        delete playersOnField[pos];
      }
    }
    // clear lineup position tag
    updateLineupTag(name, null);
  });

  row.appendChild(remove);
  ORDER.appendChild(row);
}

// Right-aligned position label in lineup
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

/* =========================
   Drag-Drop logic
   ========================= */

function handleDropToZone(e, targetZone){
  e.preventDefault();
  const name    = e.dataTransfer.getData("text/plain");
  if (!name) return;

  const fromPos   = e.dataTransfer.getData("fromZone");   // "" if from list
  const targetPos = targetZone.dataset.pos;
  const targetName = playersOnField[targetPos] || "";

  // From another zone → swap
  if (fromPos){
    if (fromPos === targetPos) return;
    const fromZone = FIELD_WRAP.querySelector(`.drop-zone[data-pos="${fromPos}"]`);

    // place dragged into target
    playersOnField[targetPos] = name;
    targetZone.innerHTML = "";
    targetZone.appendChild(makePlayerCard(name));
    updateLineupTag(name, targetPos);

    // if target had someone, move them back to fromZone
    if (targetName){
      playersOnField[fromPos] = targetName;
      fromZone.innerHTML = "";
      fromZone.appendChild(makePlayerCard(targetName));
      updateLineupTag(targetName, fromPos);
    } else {
      // target was empty → clear original
      delete playersOnField[fromPos];
      fromZone.innerHTML = "";
    }
    return;
  }

  // From Position Players list
  if (targetName){
    // zone occupied → send that player back to list
    POS_LIST.appendChild(makePlayerCard(targetName));
  }

  playersOnField[targetPos] = name;
  targetZone.innerHTML = "";
  targetZone.appendChild(makePlayerCard(name));
  updateLineupTag(name, targetPos);

  // remove from list if present
  const inList = POS_LIST.querySelector(`[data-name="${name}"]`);
  if (inList) inList.remove();
}

// Drop back onto Position Players list
POS_LIST.addEventListener("dragover", e => e.preventDefault());
POS_LIST.addEventListener("drop", e => {
  e.preventDefault();
  const name    = e.dataTransfer.getData("text/plain");
  const fromPos = e.dataTransfer.getData("fromZone");
  if (!name) return;

  if (fromPos){
    const zone = FIELD_WRAP.querySelector(`.drop-zone[data-pos="${fromPos}"]`);
    if (zone) zone.innerHTML = "";
    delete playersOnField[fromPos];
    updateLineupTag(name, null);
  }
  if (!POS_LIST.querySelector(`[data-name="${name}"]`)){
    POS_LIST.appendChild(makePlayerCard(name));
  }
});

/* =========================
   UI: Add player & toggle
   ========================= */
ADD_BTN.addEventListener("click", () => {
  const name = (prompt("Enter player name:") || "").trim();
  if (!name) return;
  addToLineup(name);
  POS_LIST.appendChild(makePlayerCard(name));
});

// toggle between 9 and 10-player field
TOGGLE_BTN.addEventListener("click", () => {
  isTen = !isTen;
  TOGGLE_BTN.textContent = isTen
    ? "Switch to 9-Player Field"
    : "Switch to 10-Player Field";

  // move any players on field back to list before rebuild
  for (const pos in playersOnField) {
    const name = playersOnField[pos];
    if (!POS_LIST.querySelector(`[data-name="${name}"]`)) {
      POS_LIST.appendChild(makePlayerCard(name));
    }
  }
  playersOnField = {};
  buildField();
});

// enable drag-to-reorder for batting order
new Sortable(ORDER, {
  animation: 150,
  draggable: ".order-item",
  handle: ".order-item",
  filter: ".remove-player",
});

buildField();

/***************************************************
 * Save lineup (Batting Order + Date) as image — clean version
 **************************************************/
document.getElementById("saveOrderBtn")?.addEventListener("click", async () => {
  const container = document.querySelector(".batting-header").parentElement; // Only batting section
  if (!container) return alert("Couldn't find lineup container!");

  // Get date text
  const dateText = document.getElementById("lineupDate")?.textContent.trim() || "NoDate";

  // Clone container so we can safely add padding just for the screenshot
  const clone = container.cloneNode(true);
  clone.style.background = "#ffffff";
  clone.style.padding = "20px";         // ✅ adds a white border margin
  clone.style.borderRadius = "10px";    // ✅ rounded edges for cleaner look
  clone.style.width = `${container.offsetWidth + 40}px`;

  document.body.appendChild(clone);
  clone.style.position = "absolute";
  clone.style.top = "-9999px"; // hide it off-screen while rendering

  const canvas = await html2canvas(clone, {
    backgroundColor: "#ffffff",
    scale: 2,
  });

  document.body.removeChild(clone); // remove the temporary clone

  const imgData = canvas.toDataURL("image/png");

  // ✅ "Bambinos Lineup 10.9.25.png"
  const formattedDate = dateText.replace(/[\/\-]/g, ".");
  const fileName = `Bambinos Lineup ${formattedDate}.png`;

  // Download automatically
  const link = document.createElement("a");
  link.download = fileName;
  link.href = imgData;
  link.click();

  // Optional: copy to clipboard
  if (navigator.clipboard && window.ClipboardItem) {
    const blob = await (await fetch(imgData)).blob();
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    alert(`✅ "${fileName}" saved & copied to clipboard!`);
  } else {
    alert(`✅ "${fileName}" downloaded!`);
  }
});

