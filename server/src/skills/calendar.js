const { summarizeText } = require("../lib/summarize");

function getStartAndEndTimes(date, range = "day") {
  const now = date ? new Date(date) : new Date();
  let start;
  let end;

  if (range === "day") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
    );
  } else if (range === "week") {
    const dayOfWeek = now.getDay();
    start = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - dayOfWeek,
    );
    end = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + (6 - dayOfWeek),
      23,
      59,
      59,
    );
  }

  return {
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
  };
}

module.exports = (app, openai, calendar) => {
  // Calendar: List events
  app.get("/calendar", async (req, res) => {
    console.log("Checking calendar events");
    try {
      const { timeMax, timeMin } = getStartAndEndTimes();
      const response = await calendar.events.list({
        calendarId: "primary",
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime",
      });
      const eventsSummary = await Promise.all(
        response.data.items.map(async (item) => {
          const startTime = new Date(
            item.start.dateTime || item.start.date,
          ).toLocaleString("en-US", {
            weekday: "long",
            hour: "numeric",
            minute: "numeric",
          });
          const attendeesNames = item.attendees
            ? item.attendees
                .filter((attendee) => !attendee.self)
                .map(
                  (attendee) =>
                    attendee.displayName || attendee.email.split("@")[0],
                )
                .join(" and ")
            : "No other attendees";
          return `On ${startTime} you have a ${item.eventType === "default" ? "meeting" : item.eventType} about ${item.summary}, with ${attendeesNames}.`;
        }),
      );
      res.json(eventsSummary);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // Calendar: Create a new event
  app.post("/calendar/events", async (req, res) => {
    try {
      const event = req.body; // You'll need to validate and structure the event object correctly
      const response = await calendar.events.insert({
        calendarId: "primary",
        resource: event,
      });
      res.status(201).json(response.data);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // Calendar: Update an event
  app.put("/calendar/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const event = req.body; // You'll need to validate and structure the event object correctly
      const response = await calendar.events.update({
        calendarId: "primary",
        eventId: id,
        resource: event,
      });
      res.json(response.data);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // Calendar: Delete an event
  app.delete("/calendar/events/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await calendar.events.delete({
        calendarId: "primary",
        eventId: id,
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // Calendar: Get an event
  app.get("/calendar/events/:id", async (req, res) => {
    // ... code for getting a single event ...
  });
};
