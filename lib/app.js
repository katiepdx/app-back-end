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
  try {
    const data = await client.query(`
      SELECT dogs.id, name, age_years, is_adopted, sizes.size
      FROM dogs
      JOIN sizes
      ON dogs.size_id = sizes.id
      `);
    
    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

// sizes end point
app.get('/sizes', async(req, res) => {
  try {
    const data = await client.query(`
      SELECT * FROM sizes
      `);
    
    res.json(data.rows);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

// get a dog by id
app.get('/dogs/:id', async(req, res) => {
  try {
    // get the dog id off of the params
    const dogId = req.params.id;
  
    // use the users req (dogId) to find the dog in the database
    // sanitize inputs 
    const data = await client.query(`
        SELECT dogs.id, name, age_years, is_adopted, size
        FROM dogs
        JOIN sizes
        ON dogs.size_id = sizes.id
        WHERE dogs.id=$1
      `, [dogId]);
  
    res.json(data.rows[0]);

  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

// DELETE a dog by id
app.delete('/dogs/:id', async(req, res) => {
  try {
    // get the dog id off of the params
    const dogId = req.params.id;
  
    // use the users req (dogId) to find the dog in the database
    // delete the dog id
    // sanitize inputs
    const data = await client.query(`
        DELETE FROM dogs WHERE dogs.id=$1
      `, [dogId]);
  
    res.json(data.rows[0]);

  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});


// make a post req and add the users dog tile to list page using form data
app.post('/dogs', async(req, res) => {
  try {
    // get the dog info off the body
    const newDogTile = {
      name: req.body.name,
      age_years: req.body.age_years,
      is_adopted: req.body.is_adopted,
      size: req.body.size_id
    };
  
    // insert newDogTile data into database
    const data = await client.query(`
    INSERT INTO dogs(name, age_years, is_adopted, owner_id, size_id)
    VALUES($1, $2, $3, $4, $5)
    RETURNING *
    `, [newDogTile.name, newDogTile.age_years, newDogTile.is_adopted, userAccount.id, newDogTile.size]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});

// update using the form data from the detail page
app.put('/dogs/:id', async(req, res) => {
  const dogId = req.params.id;
  try {
    // get the dog info off the body
    const updatedDogTile = {
      name: req.body.name,
      age_years: req.body.age_years,
      is_adopted: req.body.is_adopted,
      size: req.body.size_id
    };
  
    // update data in database
    const data = await client.query(`
    UPDATE dogs
    SET name=$1, age_years=$2, is_adopted=$3, owner_id=$4, size_id=$5
    WHERE dogs.id=$6
    RETURNING *
    `, [updatedDogTile.name, updatedDogTile.age_years, updatedDogTile.is_adopted, userAccount.id, updatedDogTile.size, dogId]);
  
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ message: e.message });
  }
});
app.use(require('./middleware/error'));

module.exports = app;
