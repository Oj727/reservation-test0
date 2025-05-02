const API_URL = "https://script.google.com/a/macros/student.gs.chiba-u.jp/s/AKfycbycgBBxjC_tL-1xcXxxDcm192--DFq7iS6VyvD_orh3FZj8_6p5GLVEsBvY5XgyOaau8A/exec";

let currentWeek = 0;
const hours = Array.from({ length: 12 }, (_, i) => `${9 + i}:00`);

let reservations = JSON.parse(localStorage.getItem("reservations")) || {};

function saveReservations() {
  localStorage.setItem("reservations", JSON.stringify(reservations));
}

function getWeekDates(offset = 0) {
  const today = new Date();
  const start = new Date(today.setDate(today.getDate() - today.getDay() + 1 + offset * 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function renderCalendar() {
  const calendar = document.getElementById("calendar");
  const dates = getWeekDates(currentWeek);
  calendar.innerHTML = "<table><thead><tr><th>時間</th>" +
    dates.map(d => `<th>${d.getMonth() + 1}/${d.getDate()}（${"日月火水木金土"[d.getDay()]}）</th>`).join("") +
    "</tr></thead><tbody>" +
    hours.map(hour => {
      return `<tr><td>${hour}</td>` +
        dates.map(date => {
          const dateStr = date.toISOString().split('T')[0];
          const key = `${dateStr} ${hour}`;
          const name = reservations[key];
          if (name) {
            return `<td>${name}</td>`;
          } else {
            return `<td class="available" onclick="openModal('${key}')">○</td>`;
          }
        }).join("") + "</tr>";
    }).join("") + "</tbody></table>";
}

function openModal(time) {
  document.getElementById("modal").classList.remove("hidden");
  document.getElementById("modal-time").innerText = time;
  document.getElementById("modal-time").dataset.time = time;
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function reserve() {
  const time = document.getElementById("modal-time").dataset.time;
  const name = document.getElementById("name").value;
  if (name) {
    const [date, hour] = time.split(" ");
    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ date, time: hour, name }),
      headers: { "Content-Type": "application/json" }
    })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      reservations[time] = name;
      saveReservations();
      closeModal();
      renderCalendar();
    });
  }
}

function nextWeek() {
  currentWeek++;
  renderCalendar();
}

window.onload = renderCalendar;