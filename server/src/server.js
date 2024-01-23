const express = require("express");
const { google } = require("googleapis");
const { WebClient } = require("@slack/web-api");
const OpenAI = require("openai").default;
const openai = new OpenAI(process.env.OPENAI_KEY);
const NewsAPI = require("newsapi");
const newsapi = new NewsAPI(process.env.NEWSAPI_KEY);

const fs = require("fs");

// require("dotenv").config();

const app = express();
app.setMaxListeners(0); // 0 sets to unlimited. Use a specific number if you know the upper limit of listeners needed.
const userPort = process.env.PORT || 3000;

// Initialize Slack Web API
const slackClient = new WebClient(process.env.SLACK_TOKEN);

// Configure Google API
let refresh_token;
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI,
);

// Check if we're already authenticated

try {
  refresh_token = fs.readFileSync("refresh_token.txt", "utf8");
} catch (err) {
  console.log("Error loading refresh token from file.");
}

if (refresh_token) {
  try {
    oauth2Client.setCredentials({
      refresh_token: refresh_token,
    });
  } catch (err) {
    console.log(
      "Failed to set credentials with the provided refresh token, deleting the token.",
    );
    fs.unlinkSync("refresh_token.txt");
    refresh_token = null;
  }
} else {
  console.log(
    "Not authenticated with Google, please visit the authorization URL.",
  );
}

// Check if the refresh token is set, if not, redirect to the authorization url
if (!refresh_token) {
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/gmail.modify",
      "https://www.googleapis.com/auth/tasks",
    ],
  });
  console.log(`Please visit this URL to authorize the application:  ${url}`);
}

// Google APIs
const calendar = google.calendar({ version: "v3", auth: oauth2Client });
const gmail = google.gmail({ version: "v1", auth: oauth2Client });
const tasks = google.tasks({ version: "v1", auth: oauth2Client });

require("./skills/calendar")(app, openai, calendar);
require("./skills/gmail")(app, openai, gmail);
require("./skills/tasks")(app, openai, tasks);
require("./skills/joke")(app, openai);
require("./skills/news")(app, openai, newsapi);
// Define your REST API endpoints here
// Endpoint for receiving the Google auth token
app.get("/auth/token", (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send("Missing code");
  }
  // Exchange the code for a Google API access token
  oauth2Client.getToken(code, (err, token) => {
    if (err) {
      console.error("Error getting oAuth tokens:", err);
      return res.status(400).send("Error getting oAuth tokens");
    }
    oauth2Client.setCredentials(token);
    fs.writeFileSync("refresh_token.txt", token.refresh_token);
    // Save the token to your database here
    console.log("Authentication successful");
    res.redirect("/");
  });
});

// Endpoint to list all available endpoints with HTML links
app.get("/", (req, res) => {
  res.send(`
    <html>
    <head><title>API Endpoints</title></head>
    <body>
      <h1>Available Endpoints</h1>
      <ul>
        <li><a href="/calendar/events">List Calendar Events</a></li>
        <li><a href="/gmail/emails">List Emails</a></li>
        <li><a href="/tasks">List Tasks</a></li>
        <li><a href="/news">Latest News</a></li>
        <li><a href="/slack/messages/{channel}">List Messages from a Slack Channel</a></li>
        <!-- Add more links to other endpoints here -->
      </ul>
    </body>
    </html>
  `);
});

// Healthcheck endpoint for testing purposes
app.get("/healthcheck", (req, res) => {
  res.status(200).send("OK");
});

// Start the server with error handling for occupied port
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.log(`Port ${port} is in use, trying with port ${port + 1}`);
      startServer(port + 1);
    } else {
      console.error(error);
    }
  });
}

startServer(userPort);
