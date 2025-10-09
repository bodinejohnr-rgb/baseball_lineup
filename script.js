/***************************************************
 * Baseball Lineup Creator — complete working script
 **************************************************/

// DOM references
const POS_LIST   = document.getElementById("positionPlayers");
const ORDER      = document.getElementById("battingOrder");
const FIELD_WRAP = document.querySelector(".field-container");
const ADD_BTN    = document.getElementById("addPlayerBtn");
const TOGGLE_BTN = document.getElementById("switchFieldBtn");
const DH_AREA    = document.getElementById("dhArea");
const DH_SLOTS   = document.getElementById("dhSlots");

// State
let isTen = false;                 // 9 vs 10 player mode
let playersOnField = {};           // { positionLabel: playerName }

/* =========================
   Field coordinates
   ========================= */
const nineField = [
  { label:"C",  x:330, y:480 },
  { label:"P",  x:330, y:380 },
  { label:"1B", x:500, y:355 },
  { label:"2B", x:415, y:280 },
  { label:"SS", x:245, y:280 },
  { label:"3B", x:160, y:345 },
  { label:"LF", x:130, y:190 },
  { label:"CF", x:330, y:130 },
  { label:"RF", x:550, y:190 }
];

const tenField = [
  { label:"C",  x:330, y:480 },
  { label:"P",  x:330, y:380 },
  { label:"1B", x:500, y:355 },
  { label:"2B", x:415, y:280 },
  { label:"SS", x:245, y:280 },
  { label:"3B", x:160, y:345 },
  { label:"LF", x:110, y:210 },
  { label:"LC", x:245, y:140 },
  { label:"RC", x:415, y:140 },
  { label:"RF", x:530, y:210 }
];

/* =========================
   Field building
   ========================= */
function buildField(){
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

/* =========================
   Player card helper
   ========================= */
function makePlayerCard(name){
  const el = document.createElement("div");
  el.className   = "player";
  el.textContent = name;
  el.draggable   = true;
  el.dataset.name = name;

  el.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", name);
    const parentZone = el.closest(".drop-zone");
    e.dataTransfer.setData("fromZone", parentZone ? parentZone.dataset.pos : "");
  });

  return el;
}

/* =========================
   Add to lineup
   ========================= */
function addToLineup(name){
  const row = document.createElement("div");
  row.className   = "order-item";
  row.dataset.name = name;
  row.textContent = name;

  const remove = document.createElement("button");
  remove.className = "remove-player";
  remove.title = "Remove";
  remove.textContent = "✖";
  remove.addEventListener("click", e => {
    e.stopPropagation();
    row.remove();
    const inList = POS_LIST.querySelector(`[data-name="${name}"]`);
    if (inList) inList.remove();
    for (const pos in playersOnField){
      if (playersOnField[pos] === name){
        const zone = FIELD_WRAP.querySelector(`.drop-zone[data-pos="${pos}"]`);
        if (zone) zone.innerHTML = "";
        delete playersOnField[pos];
      }
    }
    updateLineupTag(name, null);
    updateDHSlots(); // ✅ update DH box after removal
  });

  row.appendChild(remove);
  ORDER.appendChild(row);
  updateDHSlots(); // ✅ update DH box after addition
}

/* =========================
   DH slot management
   ========================= */
function updateDHSlots() {
  const totalPlayers = ORDER.querySelectorAll(".order-item").length;

  if (totalPlayers > 10) {
    DH_AREA.style.display = "block";
    const numExtra = totalPlayers - 10;
    DH_SLOTS.innerHTML = "";

    const players = [...ORDER.querySelectorAll(".order-item")].map(p => p.dataset.name);
    const dhPlayers = players.slice(10); // players after 10th spot

    dhPlayers.forEach((player, i) => {
      const slot = document.createElement("div");
      slot.className = "dh-slot";
      slot.textContent = `DH: ${player}`;
      DH_SLOTS.appendChild(slot);
    });
  } else {
    DH_AREA.style.display = "none";
  }
}

/* =========================
   Lineup position tags
   ========================= */
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
   Drag/drop logic
   ========================= */
function handleDropToZone(e, targetZone){
  e.preventDefault();
  const name = e.dataTransfer.getData("text/plain");
  if (!name) return;

  const fromPos   = e.dataTransfer.getData("fromZone");
  const targetPos = targetZone.dataset.pos;
  const targetName = playersOnField[targetPos] || "";

  if (fromPos){
    if (fromPos === targetPos) return;
    const fromZone = FIELD_WRAP.querySelector(`.drop-zone[data-pos="${fromPos}"]`);
    playersOnField[targetPos] = name;
    targetZone.innerHTML = "";
    targetZone.appendChild(makePlayerCard(name));
    updateLineupTag(name, targetPos);

    if (targetName){
      playersOnField[fromPos] = targetName;
      fromZone.innerHTML = "";
      fromZone.appendChild(makePlayerCard(targetName));
      updateLineupTag(targetName, fromPos);
    } else {
      delete playersOnField[fromPos];
      fromZone.innerHTML = "";
    }
    return;
  }

  if (targetName){
    POS_LIST.appendChild(makePlayerCard(targetName));
  }

  playersOnField[targetPos] = name;
  targetZone.innerHTML = "";
  targetZone.appendChild(makePlayerCard(name));
  updateLineupTag(name, targetPos);

  const inList = POS_LIST.querySelector(`[data-name="${name}"]`);
  if (inList) inList.remove();
}

POS_LIST.addEventListener("dragover", e => e.preventDefault());
POS_LIST.addEventListener("drop", e => {
  e.preventDefault();
  const name = e.dataTransfer.getData("text/plain");
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
   UI Buttons
   ========================= */
ADD_BTN.addEventListener("click", () => {
  const name = (prompt("Enter player name:") || "").trim();
  if (!name) return;
  addToLineup(name);
  POS_LIST.appendChild(makePlayerCard(name));
});

TOGGLE_BTN.addEventListener("click", () => {
  isTen = !isTen;
  TOGGLE_BTN.textContent = isTen
    ? "Switch to 9-Player Field"
    : "Switch to 10-Player Field";

  for (const pos in playersOnField) {
    const name = playersOnField[pos];
    if (!POS_LIST.querySelector(`[data-name="${name}"]`)) {
      POS_LIST.appendChild(makePlayerCard(name));
    }
  }
  playersOnField = {};
  buildField();
});

/* =========================
   Sortable lineup
   ========================= */
new Sortable(ORDER, {
  animation: 150,
  draggable: ".order-item",
  handle: ".order-item",
  filter: ".remove-player",
  onSort: updateDHSlots // ✅ update DH slots when order changes
});

buildField();
updateDHSlots(); // hide initially

/* =========================
   Save lineup image
   ========================= */
document.getElementById("saveOrderBtn")?.addEventListener("click", async () => {
  const header = document.querySelector(".batting-header");
  const orderList = document.querySelector("#battingOrder");
  if (!header || !orderList) return alert("Couldn't find batting order!");

  const clone = document.createElement("div");
  clone.style.background = "#ffffff";
  clone.style.padding = "25px";
  clone.style.borderRadius = "10px";
  clone.style.width = `${orderList.offsetWidth + 50}px`;
  clone.style.fontFamily = "Roboto, sans-serif";

  const headerClone = header.cloneNode(true);
  clone.appendChild(headerClone);

  const orderClone = orderList.cloneNode(true);
  orderClone.querySelectorAll(".remove-player").forEach(btn => btn.remove());
  clone.appendChild(orderClone);

  document.body.appendChild(clone);
  clone.style.position = "absolute";
  clone.style.top = "-9999px";

  const canvas = await html2canvas(clone, {
    backgroundColor: "#ffffff",
    scale: 2,
  });

  document.body.removeChild(clone);
  const imgData = canvas.toDataURL("image/png");

  const dateText = document.getElementById("lineupDate")?.textContent.trim() || "NoDate";
  const formattedDate = dateText.replace(/[\/\-]/g, ".");
  const fileName = `Bambinos Lineup ${formattedDate}.png`;

  const link = document.createElement("a");
  link.download = fileName;
  link.href = imgData;
  link.click();

  if (navigator.clipboard && window.ClipboardItem) {
    const blob = await (await fetch(imgData)).blob();
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    alert(`✅ "${fileName}" saved & copied to clipboard!`);
  } else {
    alert(`✅ "${fileName}" downloaded!`);
  }
});

