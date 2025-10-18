import fs from "fs";
const url = "http://localhost:4004/rest/api/products";
setInterval(() => {
  fetch(url, {
    headers: {
      Authorization: "Basic " + Buffer.from("alice:alice").toString("base64"),
    },
  })
    .then((res) => res.text())
    .then((data) => fs.writeFileSync("frontend/import/products.json", data));
}, 60000); // runs every 60 seconds
//to execute it -> node frontend/src/download-products.js
