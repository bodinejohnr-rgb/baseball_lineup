const positions = [
  { name: "P", x: 135, y: 180 },
  { name: "C", x: 135, y: 230 },
  { name: "1B", x: 220, y: 150 },
  { name: "2B", x: 160, y: 110 },
  { name: "SS", x: 110, y: 110 },
  { name: "3B", x: 50, y: 150 },
  { name: "LF", x: 40, y: 60 },
  { name: "CF", x: 135, y: 40 },
  { name: "RF", x: 230, y: 60 }
];

document.getElementById("generateBtn").addEventListener("click", () => {
  const names = document.getElementById("playerInput").value
    .split("\n")
    .map(n => n.trim())
    .filter(n => n !== "");

  const positionsContainer = document.getElementById("positions");
  positionsContainer.innerHTML = "";

  positions.forEach(pos => {
    const div = document.createElement("div");
    div.className = "position";
    div.style.left = `${pos.x}px`;
    div.style.top = `${pos.y}px`;
    div.textContent = pos.name;
    positionsContainer.appendChild(div);
  });

  const orderList = document.getElementById("battingOrder");
  orderList.innerHTML = "";

  names.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    li.draggable = true;
    orderList.appendChild(li);
  });

  new Sortable(orderList, {
    animation: 150
  });

  let dragged = null;
  orderList.addEventListener("dragstart", e => {
    dragged = e.target;
  });

  positionsContainer.querySelectorAll(".position").forEach(pos => {
    pos.addEventListener("dragover", e => e.preventDefault());
    pos.addEventListener("drop", e => {
      pos.textContent = `${pos.textContent.split(":")[0]}: ${dragged.textContent}`;
    });
  });
});
