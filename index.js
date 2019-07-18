const http = require("http");
const boliviaUrlsRecolector = require("./app.js");
const hostname = "127.0.0.1";
const port = 3000;
const fs = require("fs");
const urlsRegional = [
  //   "http://amarillas.bo/departamento/beni",
  //   "http://amarillas.bo/departamento/pando",
  //   "http://amarillas.bo/departamento/oruro",
  "http://amarillas.bo/departamento/cochabamba"
  //   "http://amarillas.bo/departamento/la-paz",
  //   "http://amarillas.bo/departamento/potosi",
  //   "http://amarillas.bo/departamento/santa-cruz"
  //   "http://amarillas.bo/departamento/sucre",
  //   "http://amarillas.bo/departamento/tarija"
];

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  boliviaUrlsRecolector(urlsRegional);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
