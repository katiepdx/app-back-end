const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

// create a user account 
const userAccount = {
  id: 1,
  email: 'user1@email.com',
  hash: '23oi4urwedn'
};

app.get('/dogs', async(req, res) => {
  const data = await client.query('SELECT * from dogs');

  res.json(data.rows);
});

// get a dog by id
app.get('/dogs/:id', async(req, res) => {
  // get the dog id off of the params
  const dogId = req.params.id;

  // use the users req (dogId) to find the dog in the database
  const data = await client.query(`SELECT * from dogs WHERE id=${dogId}`);

  res.json(data.rows[0]);
});

// make a post req and add the users dog tile to list page using form data
app.post('/dogs', async(req, res) => {
  // get the dog info off the body
  const newDogTile = {
    name: req.body.name,
    age_years: req.body.age_years,
    size: req.body.size,
    is_adopted: req.body.is_adopted
  };

  // insert newDogTile data into database
  const data = await client.query(`
  INSERT INTO dogs(name, age_years, size, is_adopted, owner_id)
  VALUES($1, $2, $3, $4, $5)
  RETURNING *
  `, [newDogTile.name, newDogTile.age_years, newDogTile.size, newDogTile.is_adopted, userAccount.id]);

  res.json(data.rows[0]);
});

app.use(require('./middleware/error'));

module.exports = app;
