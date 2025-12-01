const express = require("express");
const axios = require("axios");

const app = express();

app.get("/api/DramaList/Upcoming", async (req, res) => {
  try {
    const upstreamResponse = await axios.get(
      "https://kisskh.do/api/DramaList/Upcoming",
      {
        params: req.query
      }
    );

    res.json(upstreamResponse.data);
  } catch (error) {
    console.error("Upstream error:", error.message);
    res.status(500).json({ error: "Failed to fetch upcoming dramas" });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "KissKh Upcoming Drama proxy API" });
});

if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Local server listening on port ${port}`);
  });
}

module.exports = app;
