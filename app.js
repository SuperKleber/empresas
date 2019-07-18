const rp = require("request-promise");
const ch = require("cheerio");
const fs = require("fs");
const potusParse = require("./potusParse");
const url = "http://amarillas.bo/departamento/la-paz";
let errorPages = [];
let numErrorPages = 0;
const recolectorUrl = (pageUrl, intentos) => {
  return rp(pageUrl)
    .then(pageHtml => {
      let info = ch(".info > .name > h2 > a", pageHtml);
      let urls = [];
      for (let i = 0; i < info.length; i++) {
        urls.push(info[i].attribs.href);
      }
      return urls;
    })
    .catch(err => {
      if (intentos != 0) {
        return recolectorUrl(pageUrl, intentos - 1);
      }
      numErrorPages++;
    });
};
const recolectorUrlRegional = (urlRegional, intentos = 10) => {
  console.log("Empezando Proceso...");
  let departamento = urlRegional.split("http://amarillas.bo/departamento/")[1];
  rp(urlRegional)
    .then(function(html) {
      let pages = ch(".pagination > li > *", html);
      let finalPage = parseInt(pages[pages.length - 2].children[0].data);
      let pagesUrl = [];
      for (let i = 1; i <= finalPage; i++) {
        pagesUrl.push(`${urlRegional}?page=${i}`);
      }
      return Promise.all(
        pagesUrl.map(async (pageUrl, i) => {
          return await recolectorUrl(pageUrl, 10);
        })
      ).catch(() => {
        console.log("Error en Promise All");
      });
    })
    .then(businessUrl => {
      console.log("----------------");
      console.log("URLS CARGADAS en: " + departamento);

      let urls = [];
      businessUrl.map(el => el.map(e => urls.push(e)));
      //   console.log(businessUrl);
      const json = JSON.stringify(urls);
      return json;
    })
    .then(json => {
      fs.writeFile(
        `./departamentos/${departamento}.json`,
        json,
        "utf8",
        err => {
          if (err) throw err;
          console.log("The file has been saved!");
        }
      );
      console.log("Archivo JSON creado " + departamento);
      console.log("----------------");
    })
    .catch(function(err) {
      // console.log("intento número: " + intentos);
      console.error(
        "falló: " + urlRegional.split("http://amarillas.bo/departamento/")[1]
      );
      console.log("----------------");
      // return [null];
      // if (intentos != 0) {
      //   return recolectorUrlRegional(intentos - 1);
      // }
      // rej(err);
    });
};
const boliviaUrlsRecolector = urlsRegional => {
  urlsRegional.map(async urlRegional => {
    return await recolectorUrlRegional(urlRegional, 10);
  });
};
const urlsRegional = [
  "http://amarillas.bo/departamento/beni",
  "http://amarillas.bo/departamento/pando",
  "http://amarillas.bo/departamento/oruro",
  "http://amarillas.bo/departamento/cochabamba",
  "http://amarillas.bo/departamento/la-paz",
  "http://amarillas.bo/departamento/potosi",
  "http://amarillas.bo/departamento/santa-cruz",
  "http://amarillas.bo/departamento/sucre",
  "http://amarillas.bo/departamento/tarija"
];
boliviaUrlsRecolector(urlsRegional);

module.exports = boliviaUrlsRecolector;
