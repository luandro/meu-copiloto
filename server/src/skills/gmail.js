const { summarizeText } = require("../lib/summarize");

// TODO: add to .env
const prompt = process.env.PROMPT_EMAIL_SUMMARY;

const parseHtmlToPlainText = (html) => {
  // This function converts HTML content to plain text by removing HTML tags
  return html.replace(/<[^>]*>/g, "");
};

const sendEmail = async (gmail, rawMessage) => {
  const response = await gmail.users.messages.send({
    userId: "me",
    resource: {
      raw: rawMessage,
    },
  });
  return response.data;
};

const deleteEmail = async (gmail, id) => {
  await gmail.users.messages.delete({
    userId: "me",
    id: id,
  });
};

const readEmail = async (gmail, id) => {
  const response = await gmail.users.messages.get({
    userId: "me",
    id: id,
  });
  return response.data;
};

const listEmails = async (gmail, userEmail, DEBUG) => {
  if (DEBUG)
    console.log("Listing unread emails in inbox excluding certain categories");
  const response = await gmail.users.messages.list({
    userId: "me",
    q: "in:inbox is:unread -category:(social OR promotions OR updates OR forums)",
    maxResults: 10,
  });
  const messages = response.data.messages;
  if (DEBUG) console.log(`Found ${messages.length} messages`);
  return messages;
};

const getEmailDetails = async (gmail, messages, DEBUG) => {
  const emailDetails = await Promise.all(
    messages.map(async (message) => {
      if (DEBUG)
        console.log(
          `Fetching full message details for message ID: ${message.id}`,
        );
      const fullMessageResponse = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "full",
      });
      const payload = fullMessageResponse.data.payload;
      let bodyData = "";
      let isTextPlainFound = false;
      let isTextHtmlFound = false;
      if (payload.parts && payload.parts.length > 0) {
        for (const part of payload.parts) {
          if (part.mimeType === "text/plain" && part.body.data) {
            let buff = Buffer.from(part.body.data, "base64");
            bodyData += buff.toString("utf-8");
            isTextPlainFound = true;
            if (DEBUG)
              console.log(
                `Found text/plain part for message ID: ${message.id}`,
              );
            break; // Stop after finding the first text/plain part with data
          } else if (part.mimeType === "text/html" && part.body.data) {
            let buff = Buffer.from(part.body.data, "base64");
            let htmlData = buff.toString("utf-8");
            // Parse the HTML content to plain text
            bodyData = parseHtmlToPlainText(htmlData);
            isTextHtmlFound = true;
            if (DEBUG)
              console.log(`Found text/html part for message ID: ${message.id}`);
            break; // Stop after finding the first text/html part with data
          }
        }
      }
      const headers = payload.headers;
      const subjectHeader = headers.find((header) => header.name === "Subject");
      if (!isTextPlainFound && !isTextHtmlFound) {
        // If neither text/plain nor text/html parts are found, set bodyData to the subject
        bodyData = subjectHeader ? subjectHeader.value : "";
        if (DEBUG)
          console.log(
            `No text/plain or text/html parts found for message ID: ${message.id}`,
          );
      }
      const fromHeader = headers.find((header) => header.name === "From");
      const toHeader = headers.find((header) => header.name === "To");
      const summary = await summarizeText(bodyData, prompt);
      return {
        id: message.id,
        threadId: message.threadId,
        labelIds: message.labelIds,
        subject: subjectHeader ? subjectHeader.value : "",
        from: fromHeader ? fromHeader.value : "",
        to: toHeader ? toHeader.value.split(",") : [],
        summary: summary,
        timestamp: fullMessageResponse.data.internalDate,
      };
    }),
  );
  return emailDetails;
};

const groupEmailsByThreadId = (emailDetails, DEBUG) => {
  if (DEBUG)
    console.log("Grouping emails by threadId and sorting by timestamp");
  const groupedEmails = emailDetails.reduce((acc, email) => {
    if (!acc[email.threadId]) {
      acc[email.threadId] = [];
    }
    acc[email.threadId].push(email);
    return acc;
  }, {});

  for (const threadId in groupedEmails) {
    groupedEmails[threadId].sort((a, b) => a.timestamp - b.timestamp);
  }
  return groupedEmails;
};

const combineEmailsFromSameThread = (groupedEmails, DEBUG) => {
  if (DEBUG) console.log("Combining emails from the same thread");
  const summarizedEmails = Object.values(groupedEmails).map((threadEmails) => {
    return threadEmails.reduce((combinedEmail, email, index) => {
      if (index === 0) {
        return email;
      } else {
        const fromName = email.from.split("<")[0].trim();
        combinedEmail.summary += ` Next email in the thread is from ${fromName}: ${email.summary}`;
        return combinedEmail;
      }
    });
  });
  return summarizedEmails;
};

const formatSummarizedEmails = (summarizedEmails, userEmail, DEBUG) => {
  if (DEBUG) console.log("Formatting the summarized emails");
  const formattedSummaries = summarizedEmails.map((email, index) => {
    const toList = email.to
      .filter((person) => !person.includes(userEmail) && person !== email.from)
      .map((person) => person.split("<")[0].trim());
    const fromName = email.from.split("<")[0].trim();
    const summary = email.summary
      ? `${email.summary}`
      : "No summary available.";
    return (
      `Email ${index + 1} is from ${fromName}` +
      (toList.length > 0
        ? ` with ${toList.join(" and ")} also included in the thread. `
        : ".") +
      ` ${summary}`
    );
  });
  return formattedSummaries;
};

module.exports = (app, openai, gmail) => {
  // Gmail: Send an email
  app.post("/gmail/send", async (req, res) => {
    try {
      const rawMessage = req.body; // You'll need to create the raw MIME message
      const responseData = await sendEmail(gmail, rawMessage);
      res.json(responseData);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // Gmail: Delete an email
  app.delete("/gmail/emails/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await deleteEmail(gmail, id);
      res.status(204).send();
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // Gmail: Read an email
  app.get("/gmail/emails/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const responseData = await readEmail(gmail, id);
      res.json(responseData);
    } catch (error) {
      res.status(500).send(error);
    }
  });

  // Gmail: List all emails
  app.get("/gmail", async (req, res) => {
    const DEBUG = process.env.DEBUG === "true";
    try {
      if (DEBUG) console.log("Fetching user profile for email address");
      const profileRes = await gmail.users.getProfile({ userId: "me" });
      const userEmail = profileRes.data.emailAddress;
      if (DEBUG) console.log(`User email address: ${userEmail}`);

      const messages = await listEmails(gmail, userEmail, DEBUG);
      const emailDetails = await getEmailDetails(gmail, messages, DEBUG);
      const groupedEmails = groupEmailsByThreadId(emailDetails, DEBUG);
      const summarizedEmails = combineEmailsFromSameThread(
        groupedEmails,
        DEBUG,
      );
      const formattedSummaries = formatSummarizedEmails(
        summarizedEmails,
        userEmail,
        DEBUG,
      );
      res.json(formattedSummaries);
    } catch (error) {
      if (DEBUG) console.error("Error in /gmail route:", error);
      res.status(500).send(error);
    }
  });

  // Gmail: Filter emails
  app.get("/gmail/emails/filter", async (req, res) => {
    try {
      const { query } = req.query;
      const response = await gmail.users.messages.list({
        userId: "me",
        q: query,
      });
      res.json(response.data);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  // Gmail: Get an attachment from an email
  app.get(
    "/gmail/emails/:messageId/attachments/:attachmentId",
    async (req, res) => {
      try {
        const { messageId, attachmentId } = req.params;
        const response = await gmail.users.messages.attachments.get({
          userId: "me",
          messageId: messageId,
          id: attachmentId,
        });
        res.json(response.data);
      } catch (error) {
        res.status(500).send(error);
      }
    },
  );
};
