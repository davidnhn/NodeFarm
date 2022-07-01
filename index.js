// import { replaceTemplate } from './modules/replaceTemplate';
// fs pour file system , module qui gere les fichier
//*core Nodejs module
const fs = require('fs');
// http module permit building http server
const http = require('http');
//
const url = require('url');

//*Third party modules
const slugify = require('slugify'); //va les chercher dans dossier node module
//*Our own module
const replaceTemplate = require('./modules/replaceTemplate');
//!==============FILES================

//* BLOCKING

// fs object qui contient des methodes , ici lire fichier en synchron,
/**
 * @param {path}
 * @param {encoding}
 */
const textIn = fs.readFileSync('./txt/input.txt', 'utf-8');
// console.log(textIn);

const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on ${Date.now()}`;
/**
 * @param {path}
 * @param {value} ici la variable textOut sera contenu dans le nouveau fichier
 */
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("File written");

//* NON BLOCKING

fs.readFile('./txt/start.txt', 'utf-8', (err, data1) => {
  if (err) return console.log('ERROR');
  fs.readFile(`./txt/${data1}.txt`, 'utf-8', (err, data2) => {
    console.log(data2);
    fs.readFile(`./txt/append.txt`, 'utf-8', (err, data3) => {
      console.log(data3);
      fs.writeFile('./txt/final.txt', `${data2}\n${data3}`, 'utf-8', (err) => {
        console.log('Your file has been writtent');
      });
    });
  });
});
console.log('will read file');

//!===========SERVER=============

// s'execute q'une seule fois au chargement de l'applciation
const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);
const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);
//*1) Creating the server
console.log(slugify('Fresh Avocado', { lower: true }));
//callback qui se declenche a chaque requete reçue
const server = http.createServer((req, res) => {
  // console.log(req.url);
  //modul url, methode parse, true pour convertir query (url) en objet URL
  // console.log(url.parse(req.url, true));
  const { query, pathname } = url.parse(req.url, true);
  // const pathName = req.url;

  // Overview page
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, {
      'Content-type': 'text/html',
    });

    const cardsHtml = dataObj.map((el) => replaceTemplate(tempCard, el)).join('');
    // console.log(cardsHtml);
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
    res.end(output);

    // Product page
  } else if (pathname === '/product') {
    res.writeHead(200, {
      'Content-type': 'text/html',
    });
    // console.log(query);
    const product = dataObj[query.id]; // dataobj array d'object de recette
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    // API
  } else if (pathname === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    // console.log(productData);
    res.end(data);
    // ./ current dirrectory d'ou on appelle node dans console

    // Not found
  } else {
    res.writeHead(404, {
      //header , piece of information about the request, ici la navigateur s'attend a recevoir du html
      'Content-type': 'text/html',
      'my-own-header': 'hello-world', //utile pour envoyer metadat concernant la reponse
    });
    res.end('<h1>This page could not be found</h1>');
  }

  //.end renvoie une simple reponse
  // res.end('Hello from the server');
});

// a l'ecoute des requete
server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
