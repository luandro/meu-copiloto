const Parser = require("rss-parser");
const parser = new Parser();

module.exports = (app, openai, newsapi) => {
  app.get("/news/br", async (req, res) => {
    newsapi.v2
      .topHeadlines({
        sources: "globo,google-news-br,",
      })
      .then((response) => {
        const filtered = response.articles.filter((artitcle) => {
          const excludeTerms = ["bbb", "esporte"];
          return !excludeTerms.some((term) =>
            artitcle.title.toLowerCase().includes(term),
          );
        });

        res.json(filtered);
      });
  });
  app.get("/news/us", async (req, res) => {
    newsapi.v2
      .topHeadlines({
        sources: "bbc-news,cnn,al-jazeera-english",
      })
      .then((response) => {
        const filtered = response.articles.filter((artitcle) => {
          const excludeTerms = ["sport"];
          return !excludeTerms.some((term) =>
            artitcle.author.toLowerCase().includes(term),
          );
        });

        res.json(filtered);
      });
  });

  app.get("/news/environment", async (req, res) => {
    const rssFeeds = ["https://www.mongabay.com/feed/"];

    const articles = [];
    for (const feedUrl of rssFeeds) {
      const feed = await parser.parseURL(feedUrl);
      const feedArticles = feed.items
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
        .map((item) => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          contentSnippet: item.contentSnippet,
        }));
      articles.push(...feedArticles);
    }

    res.json(articles);
  });

  app.get("/news/ambiente", async (req, res) => {
    const rssFeeds = [
      "https://infoamazonia.org/feed/",
      "https://brasil.mongabay.com/feed/",
      "https://sumauma.com/feed/",
    ];

    const articles = [];
    for (const feedUrl of rssFeeds) {
      const feed = await parser.parseURL(feedUrl);
      const feedArticles = feed.items.map((item) => ({
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        contentSnippet: item.contentSnippet,
      }));
      articles.push(...feedArticles);
    }

    res.json(
      articles.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate)),
    );
  });

  app.get("/news/query", async (req, res) => {
    // To call this endpoint, send a GET request to /news/query with a 'q' query parameter
    // Example URL: http://localhost:3000/news/query?q=technology
    const query = req.query.q;
    newsapi.v2
      .everything({
        q: query,
      })
      .then((response) => {
        res.json(response.articles);
      });
  });
};
