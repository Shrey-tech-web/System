let data = JSON.parse(localStorage.getItem("systemData")) || {
  xp: 0,
  rank: "E",
  stats: {
    strength: 0,
    stamina: 0,
    intelligence: 0,
    focus: 0,
    discipline: 0,
    consistency: 0
  },
  quests: [],
  lastLogin: null,
  penalty: false
};

// BOOT SYSTEM
const bootLines = [
  "Initializing System...",
  "Loading Player Data...",
  "Synchronizing Daily Protocol..."
];

let i = 0;
function boot() {
  if (i < bootLines.length) {
    document.getElementById("bootText").innerText = bootLines[i];
    i++;
    setTimeout(boot, 1000);
  } else {
    document.getElementById("bootScreen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    init();
  }
}
boot();

// INIT SYSTEM
function init() {
  checkDayReset();
  renderStats();
  renderQuests();

  if (data.penalty) activatePenalty();
}

// DAY RESET
function checkDayReset() {
  const today = new Date().toDateString();

  if (data.lastLogin !== today) {
    if (!allTasksCompleted()) {
      data.penalty = true;
    } else {
      generateQuests();
    }
    data.lastLogin = today;
    save();
  }
}

// QUEST GENERATOR
function generateQuests() {
  data.quests = [
    createTask("Homework", ["intelligence", "focus"], 5),
    createTask("Workout", ["strength", "stamina"], 5),
    createTask("Deep Work", ["focus", "discipline"], 5)
  ];
}

function createTask(name, stats, target) {
  return {
    name,
    stats,
    progress: 0,
    target,
    done: false
  };
}

// RENDER
function renderStats() {
  for (let stat in data.stats) {
    document.getElementById(stat).innerText = data.stats[stat];
  }
  document.getElementById("xp").innerText = "XP: " + data.xp;
  document.getElementById("rank").innerText = "Rank: " + data.rank;
}

function renderQuests() {
  const container = document.getElementById("quests");
  container.innerHTML = "";

  data.quests.forEach((q, index) => {
    const div = document.createElement("div");
    div.innerHTML = `
      ${q.name} (${q.progress}/${q.target})
      <button onclick="completeTask(${index})">Complete</button>
    `;
    container.appendChild(div);
  });
}

// COMPLETE TASK
function completeTask(index) {
  let q = data.quests[index];
  if (q.done) return;

  q.done = true;

  data.xp += 10;
  q.stats.forEach(stat => {
    data.stats[stat] += 2;
  });

  showNotification(`+XP Gained | ${q.name} Completed`);
  checkRank();

  save();
  renderStats();
  renderQuests();
}

// RANK SYSTEM
function checkRank() {
  if (data.xp > 50) data.rank = "D";
  if (data.xp > 150) data.rank = "C";
}

// PENALTY SYSTEM
function allTasksCompleted() {
  return data.quests.every(q => q.done);
}

function activatePenalty() {
  document.getElementById("penalty").classList.remove("hidden");
  document.getElementById("penaltyTask").innerText =
    "SYSTEM: 50 Push-ups Required";
}

function completePenalty() {
  data.penalty = false;
  generateQuests();
  save();
  location.reload();
}

// NOTIFICATIONS
function showNotification(msg) {
  const n = document.getElementById("notification");
  n.innerText = msg;
}

// SAVE
function save() {
  localStorage.setItem("systemData", JSON.stringify(data));
}

// CUSTOM TASK
function addCustomTask() {
  const name = prompt("Task name?");
  data.quests.push(createTask(name, ["discipline"], 5));
  save();
  renderQuests();
}
