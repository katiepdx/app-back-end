const client = require('../lib/client');
const dogs = require('./dogs.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      dogs.map(dog => {
        return client.query(`
                    INSERT INTO dogs (name, age_years, size, is_adopted, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [dog.name, dog.age_years, dog.size, dog.is_adopted, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
