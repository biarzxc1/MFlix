const express = require("express");
const axios = require("axios");

const app = express();

const axiosInstance = axios.create({
  baseURL: "https://kisskh.do",
  timeout: 15000
});

app.get("/api/DramaList/Upcoming", async (req, res) => {
  try {
    const params = { ispc: "true", ...req.query };

    const upstreamResponse = await axiosInstance.get("/api/DramaList/Upcoming", {
      params,
      headers: {
        Host: "kisskh.do",
        Accept: "application/json, text/plain, */*",
        // Removed zstd here because Node cannot decode it; Cloudflare will fall back to gzip or br
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "en-PH,en;q=0.9,fil;q=0.8",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        // You can move this to an env var KISSKH_COOKIE if you want
        Cookie:
          process.env.KISSKH_COOKIE ||
          'g_state={"i_l":0,"i_ll":1764585537545,"i_b":"RMpzPqQX80oiq8g6sN5VRLbCaexLEsMsyYTc2ofUAsw"}',
        Referer: "https://kisskh.do/",
        "Sec-CH-UA":
          '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
        "Sec-CH-UA-Mobile": "?0",
        "Sec-CH-UA-Platform": '"Windows"',
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
      }
    });

    res.status(upstreamResponse.status).json(upstreamResponse.data);
  } catch (error) {
    console.error("Upstream error:", error.message);

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
      res.status(error.response.status).json({
        error: "Upstream error",
        status: error.response.status,
        data: error.response.data
      });
    } else {
      res.status(500).json({ error: "Failed to fetch upcoming dramas" });
    }
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
