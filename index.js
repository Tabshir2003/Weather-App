import express from 'express';
import fetch from 'node-fetch';

const app = express();
// This allows us to parse JSON data from the request body (if any).
app.use(express.json())
const PORT = 3000;

// This is your root route. Just to used to ensure your ExpressJS server is up and running.
// I've also added an example using fetch from 'node-fetch' to get some data another, unrelated, api.
app.get('/', (req, res) => {
  fetch('https://api.thecatapi.com/v1/images/search')
    // This takes the raw response from the fetch promise and parses it to json data format.
    .then(response => response.json())
    // And then takes THAT promise and does things with the json data.
    .then(data => {
      res.send(`
        <h1>WeatherApp Ready To Go!</h1>
        <img src='${data[0].url}'>
      `);
    })
})

// GET Request to get all the json data retrieved by city name.
app.get("/weather/:city", (req, res) => {
  const { city } = req.params;
  const apiKey = "406a3468740e62be7410c1adc2da1810";
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

  fetch(url)
    .then((response) => response.json())
    .then((data) => res.json(data))
    .catch((error) => {
      console.log(error);
      res.status(500).send("Error retrieving weather data");
    });
});

app.listen(PORT, () => {
    console.log(`ExpressJS server listening on port ${PORT}`);
  })