module.exports = async (app, openai) => {
  app.get("/joke", async (req, res) => {
    const jokeSubject = "dog"; // replace with your actual subject

    try {
      const response = await openai.chat.completions.create({
        messages: [
          { role: "user", content: `Conte uma piada sobre ${jokeSubject}` },
        ],
        model: "gpt-3.5-turbo",
      });

      const joke = response.choices[0].message.content;
      console.log(`Here is a ${jokeSubject} joke: ${joke}`);
      res.json({ data: joke });
    } catch (e) {
      console.error(e);
      res.status(500).send("An error occurred while fetching a joke");
    }
  });
};
