const path = require('path');
const express = require('express');
const shortid = require('shortid');
const MongoClient = require('mongodb').MongoClient;
const validUrl = require('valid-url');

// Config
const environment = process.env.production || 'dev';
const config = {
  baseUrl: environment === 'dev' ? 'http://localhost:3000' : process.env.baseUrl,
  dbConnection: process.env.dbConnection,
  dbName: process.env.dbName,
  dbCollection:  process.env.dbCollection,
};

// Setup Express
const app = express();
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));

// Model: Setup Database Connection
MongoClient.connect(config.dbConnection, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    const db = client.db(config.dbName);
    const collection = db.collection(config.dbCollection);
    app.locals.collection = collection;
  })
  .catch(error => {
    throw error;
  });

// Controllers
const homeCtrl = (req, res, next) => {
  res.render('index');
};

const createCtrl = (req, res, next) => {
  const longUrl  = req.body.longUrl;

  if (!validUrl.isUri(longUrl)) {
    return res.status(400).json({ message: 'Not a valid url' });
  }

  const shortId = shortid.generate();
  const collection = req.app.locals.collection;
  const newDocument = {
    longUrl: longUrl,
    shortId: shortId,
  };
  collection.insertOne(newDocument)
    .then(() =>  res.json({ shortUrl: `${config.baseUrl}/${shortId}`}))
    .catch(error => res.status(500).json({ error: error }));
};

const redirectCtrl = (req, res, next) => {
  const shortId = req.params.shortId;
  const collection = req.app.locals.collection;

  collection.findOne({ shortId: shortId })
    .then((results) => {
      if (!results) {
        return res.status(404).json({ message: 'No short url found'} );
      }

      return res.redirect(results.longUrl);
    })
    .catch(error => res.status(500).json({ error: error }));
};

// Views: Routing 
const router = express.Router();

router.post('/create', createCtrl);
router.get('/:shortId', redirectCtrl);
router.get('/', homeCtrl);

app.use('/', router);

app.listen(3000);