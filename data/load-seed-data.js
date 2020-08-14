const client = require('../lib/client');
const dogs = require('./dogs.js');
const usersData = require('./users.js');
// import the sizeData for table
const sizeData = require('./sizes.js');
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

    
    // map through dog sizes and insert them into the table
    await Promise.all(
      sizeData.map(size => {
        return client.query(`
        INSERT INTO sizes (size)
        VALUES ($1);
        `,
        [size.size]);
      })
    );
      
    await Promise.all(
      dogs.map(dog => {
        return client.query(`
                    INSERT INTO dogs (name, age_years, is_adopted, owner_id, size_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [dog.name, dog.age_years, dog.is_adopted, user.id, dog.size_id]);
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
