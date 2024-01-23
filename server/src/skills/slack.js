// Slack: List messages from a channel
module.exports = (app, openai, slackClient) => {
  app.get("/slack/messages/:channel", async (req, res) => {
    try {
      const { channel } = req.params;
      const response = await slackClient.conversations.history({
        channel: channel,
      });
      res.json(response.messages);
    } catch (error) {
      res.status(500).send(error);
    }
  });
};
