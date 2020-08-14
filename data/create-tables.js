const client = require('../lib/client');
const { getEmoji } = require('../lib/emoji.js');

// async/await needs to run in a function
run();

async function run() {

  try {
    // initiate connecting to db
    await client.connect();

    // run a query to create tables
    await client.query(`
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    email VARCHAR(256) NOT NULL,
                    hash VARCHAR(512) NOT NULL
                );           
                CREATE TABLE sizes (
                    id SERIAL PRIMARY KEY,
                    size VARCHAR(20) NOT NULL 
                );
                CREATE TABLE dogs (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(20) NOT NULL,
                    age_years INTEGER NOT NULL,
                    is_adopted BOOLEAN NOT NULL,
                    owner_id INTEGER NOT NULL REFERENCES users(id),
                    size_id INTEGER NOT NULL REFERENCES sizes(id)
                );
        `);

    console.log('create tables complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    // problem? let's see the error...
    console.log(err);
  }
  finally {
    // success or failure, need to close the db connection
    client.end();
  }

}
