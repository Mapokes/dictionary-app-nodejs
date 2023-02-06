const express = require("express");
require("dotenv").config();

const app = express();

const app_id = process.env.REACT_APP_OXFORD_ID;
const app_key = process.env.REACT_APP_OXFORD_KEY;
const language = "en-us";

app.set("port", process.env.PORT || 3001);

app.get("/api", function (req, res) {
  const word = req.query.word;
  const url = `https://od-api.oxforddictionaries.com/api/v2/entries/${language}/${word}`;

  fetch(url, {
    method: "GET",
    node: "no-cors",
    headers: {
      app_key: app_key,
      app_id: app_id,
    },
  })
    .then((response) => response.json())
    .then((data) => res.send(data));
});

app.listen(app.get("port"));

module.exports = app;
