const http = require("http");
const info = require("./app.js");
const hostname = "127.0.0.1";
const port = 3000;
const fs = require("fs");
// const jsonFs =

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  info
    .then(i => {
      //   console.log(i);
      urls = [];
      i.map(el => {
        el.map(e => {
          urls.push(e);
        });
      });

      const json = JSON.stringify(urls);
      //   const json = i;
      return json;
    })
    .then(json => {
      fs.writeFile("myjsonfile.json", json, "utf8", err => {
        if (err) throw err;
        console.log("The file has been saved!");
      });
      console.log("Archivo JSON creado");
    })
    .catch(err => {
      console.log("ESTE ES EL ERROR:");
      console.error(err);
    });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
