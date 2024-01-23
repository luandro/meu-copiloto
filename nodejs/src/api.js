const { tts } = require("./tts");
function listCalendar(date) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStartTime = new Date(tomorrow.setHours(0, 0, 0, 0));
  tts("Checando calendário para hoje");
  return fetch("http://localhost:3000/calendar")
    .then((response) => response.json())
    .then(async (events) => {
      if (events.length === 0) {
        tts("Você não tem nada para hoje");
      }
      tts(events, "en");
    })
    .catch((error) => console.error("Error fetching calendar events:", error));
}

async function listEmails() {
  tts("Checando seu correio");
  return fetch("http://localhost:3000/gmail")
    .then((response) => response.json())
    .then(async (emails) => {
      tts(emails, "en");
    })
    .then(() => tts("Finished. Would you like to respond to any emails?", "en"))
    .catch((error) => console.error("Error fetching calendar events:", error));
}

function listTasks() {
  tts("Checando tarefas");
  return fetch("http://localhost:3000/tasks")
    .then((response) => response.json())
    .then(async (events) => {
      tts(events, "pt");
    })
    .catch((error) => console.error("Error fetching calendar events:", error));
}

module.exports = {
  listCalendar,
  listTasks,
  listEmails,
};
