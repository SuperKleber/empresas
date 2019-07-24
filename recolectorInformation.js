require("events").EventEmitter.defaultMaxListeners = 999999;
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
let totalIntentos = 0;
const intentosRecolector = async (url, intentos) => {
  return await recolectorInformation(url)
    .then(info => {
      // loader++;
      // console.log(
      //   Math.round(((loader * 100) / bolivia.length) * 100) / 100 + "%"
      // );
      return info;
    })
    .catch(err => {
      if (intentos > 0) {
        totalIntentos++;
        intentosRecolector(url, intentos - 1);
      } else {
        // loader++;
        // console.log(
        //   Math.round(((loader * 100) / bolivia.length) * 100) / 100 + "%"
        // );
        errors++;
        return {};
      }
    });
};

let allData = [];
const limitHilos = 1000;
let loader = 0;
let status = 0;
function PassToPass(counter = 0, limit, urls) {
  if (counter >= limit) {
    if (loader >= urls.length) {
      console.log("El ciclo ha terminado");
      const json = JSON.stringify(allData);
      fs.writeFile("./data/data.json", json, "utf8", err => {
        if (err) throw err;
        console.log("Toda la información guardada");
        console.log("Número de errores: " + errors);
        console.log("Número de intentos: " + totalIntentos);
      });
    }
  } else {
    console.log("...");
    // console.log(urls);
    intentosRecolector(urls[counter], 1000)
      .then(info => {
        allData.push(info);
        loader++;
        console.log(
          Math.round(((loader * 100) / urls.length) * 100) / 100 + "%"
        );
        console.log(
          "Éxito: " + urls[counter].split("http://amarillas.bo/empresa")[1]
        );
        PassToPass(counter + 1, limit, urls);
      })
      .catch(err => {
        console.log("While: Error en: " + urls[counter]);
        console.log(err);
        allData.push({});
        PassToPass(counter + 1, limit, urls);
      });
  }
}
function MultiPassToPass(hilos = limitHilos, urls) {
  const passNum = Math.round(urls.length / hilos);
  let counter = 0;
  let limit = passNum;
  for (let i = 0; i < hilos; i++) {
    PassToPass(counter, limit, urls);
    counter = counter + limit;
    limit = counter + passNum <= urls.length ? counter + passNum : urls.length;
  }
}
const recolectorForce = async urls => {
  const data = await Promise.all(
    bolivia.map(async url => {
      return await intentosRecolector(url, 1000);
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
recolectorForce();
// MultiPassToPass(1000, bolivia);
// const arrayc = [
//   "http://amarillas.bo/empresa/litoral-bermejo",
//   "http://amarillas.bo/empresa/lidia-atahuichi-mamani"
// ];
// PassToPass(0, 2, arrayc);
