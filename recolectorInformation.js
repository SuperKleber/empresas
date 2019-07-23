require("events").EventEmitter.defaultMaxListeners = 77;
const fs = require("fs");
const rp = require("request-promise");
const ch = require("cheerio");
const bolivia = require("./departamentos/santa-cruz.json");
const puppeteer = require("puppeteer");
const recolectorInformation = async url => {
  const browser = await puppeteer.launch(url);
  const page = await browser.newPage();
  await page.goto(url);
  const pageHtml = await page.content();
  const title = ch(".profile-title", await pageHtml).text();
  const slogan = ch(".profile-slogan", await pageHtml).text();
  const address = ch('span[itemprop="streetAddress"]', await pageHtml).text();
  const telephone = ch('span[itemprop="telephone"]', await pageHtml);
  let phone = [];
  for (let i = 0; i < telephone.length; i++) {
    phone.push(telephone[i].children[0].data);
  }
  const email = ch('span[itemprop="email"]', await pageHtml).text();
  const web = ch('a[itemprop="sameAs"]', await pageHtml).text();
  const categories = ch(".categories", await pageHtml)
    .text()
    // .replace(/\n|-/gi, "/")
    // .split("/");
    .replace(/\n/gi, "")
    .split(" -");
  let socialNetwork = [];
  const social = ch("span[class='network'] > a", await pageHtml);
  for (let i = 0; i < social.length; i++) {
    socialNetwork.push(social[i].attribs.href);
  }
  const info = await {
    title,
    slogan,
    address,
    phone,
    email,
    web,
    categories,
    socialNetwork
  };
  // console.log("Recolectado");
  await browser.close();
  return await info;
};

console.log("Comenzando Proceso...");
let errors = 0;
const intentosRecolector = async (url, intentos) => {
  return await recolectorInformation(url)
    .then(info => {
      // loader++;
      console.log(
        Math.round(((loader * 100) / bolivia.length) * 100) / 100 + "%"
      );
      return info;
    })
    .catch(err => {
      if (intentos > 0) {
        intentosRecolector(url, intentos - 1);
      } else {
        // loader++;
        console.log(
          Math.round(((loader * 100) / bolivia.length) * 100) / 100 + "%"
        );
        errors++;
        return {};
      }
    });
};

let allData = [];
const limitHilos = 77;
let loader = 0;
let status = 0;
function PassToPass(counter = 0, limit) {
  if (counter >= limit) {
    status++;
    if (status == limitHilos) {
      console.log("El ciclo ha terminado");
      const json = JSON.stringify(allData);
      fs.writeFile("./data/data.json", json, "utf8", err => {
        if (err) throw err;
        console.log("Toda la información guardada");
        console.log("Número de errores: " + errors);
      });
    }
  } else {
    console.log("...");
    intentosRecolector(bolivia[counter], 10)
      .then(info => {
        loader++;
        console.log(
          Math.round(((loader * 100) / bolivia.length) * 100) / 100 + "%"
        );
        console.log(
          "Éxito: " + bolivia[counter].split("http://amarillas.bo/empresa")[1]
        );
        allData.push(info);
        PassToPass(counter + 1, limit);
      })
      .catch(err => {
        console.log("While: Error en: " + bolivia[counter]);
        console.log(err);
        allData.push({});
        PassToPass(counter + 1, limit);
      });
  }
}
function MultiPassToPass(hilos = limitHilos) {
  const passNum = Math.round(bolivia.length / hilos);
  let counter = 0;
  let limit = passNum;
  for (let i = 0; i < hilos; i++) {
    PassToPass(counter, limit);
    counter = counter + limit + 1;
    limit =
      counter + passNum <= bolivia.length ? counter + passNum : bolivia.length;
  }
}
MultiPassToPass();
const recolectorForce = async () => {
  const data = await Promise.all(
    bolivia.map(async url => {
      return await intentosRecolector(url, 100);
    })
  );
  console.log(data);
  const json = JSON.stringify(data);
  fs.writeFile("./data/data.json", json, "utf8", err => {
    if (err) throw err;
    console.log("Toda la información guardada");
    console.log("Número de errores: " + errors);
  });
};
// recolectorForce();
