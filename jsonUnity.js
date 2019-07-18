const fs = require("fs");
const laPaz = require("./departamentos/la-paz.json");
const beni = require("./departamentos/beni.json");
const cochabamba = require("./departamentos/cochabamba.json");
const oruro = require("./departamentos/oruro.json");
const pando = require("./departamentos/pando.json");
const potosi = require("./departamentos/potosi.json");
const santaCruz = require("./departamentos/santa-cruz.json");
const sucre = require("./departamentos/sucre.json");
const tarija = require("./departamentos/tarija.json");
const bolivia = laPaz.concat(
  beni,
  cochabamba,
  oruro,
  pando,
  potosi,
  santaCruz,
  sucre,
  tarija
);
const json = JSON.stringify(bolivia);
fs.writeFile(`./departamentos/bolivia.json`, json, "utf8", err => {
  if (err) throw err;
  console.log("The file has been saved!");
});
