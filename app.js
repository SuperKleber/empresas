const rp = require("request-promise");
const ch = require("cheerio");
const potusParse = require("./potusParse");
const url = "http://amarillas.bo/departamento/la-paz";
// const url = "http://amarillas.bo/departamento/santa-cruz";
//   "http://amarillas.bo/";

let info = new Promise((res, rej) => {
  let errorPages = 0;
  rp(url)
    .then(function(html) {
      let pages = ch(".pagination > li > *", html);
      let finalPage = parseInt(pages[pages.length - 2].children[0].data);
      let pagesUrl = [];
      for (let i = 1; i <= finalPage; i++) {
        pagesUrl.push(`${url}?page=${i}`);
      }
      return Promise.all(
        pagesUrl.map(async (pageUrl, i) => {
          return await rp(pageUrl)
            .then(pageHtml => {
              let info = ch(".info > .name > h2 > a", pageHtml);
              let urls = [];
              for (let i = 0; i < info.length; i++) {
                // console.log(pageUrl.split("page=")[1] + "oneBusinessUrl:");
                // console.log(info[i].attribs.href);
                urls.push(info[i].attribs.href);
              }
              return urls;
            })
            .catch(err => {
              console.log("Page Error: " + pageUrl);
              errorPages++;
              console.log(err);
            });
        })
      ).catch(() => {
        console.log("Error en Promise All");
      });
    })
    .then(businessUrl => {
      console.log("URLS CARGADAS");
      console.log(errorPages);
      //   console.log(businessUrl);
      res(businessUrl);
    })
    .catch(function(err) {
      console.log("Error en INFO");
      rej(err);
    });
});
module.exports = info;