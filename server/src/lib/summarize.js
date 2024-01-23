const OpenAI = require("openai").default;
const openai = new OpenAI(process.env.OPENAI_KEY);

async function summarizeText(text, prompt = "Summarize this text") {
  try {
    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: `${prompt}: "${text}"` }],
      model: "gpt-3.5-turbo",
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error while summarizing text:", error);
    throw error;
  }
}

module.exports = {
  summarizeText,
};
