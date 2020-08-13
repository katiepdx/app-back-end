require('dotenv').config();

const { execSync } = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  beforeAll(done => {
    return client.connect(done);
  });

  beforeEach(() => {
    // TODO: ADD DROP SETUP DB SCRIPT
    execSync('npm run setup-db');
  });

  afterAll(done => {
    return client.end(done);
  });

  test('returns dogs', async() => {

    const expectation = [
      {
        name: 'Cookie',
        id: 1,
        age_years: 3,
        is_adopted: true,
        size: 'small'
      },
      {
        name: 'Jonan',
        id: 2,
        age_years: 4,
        is_adopted: true,
        size: 'small'
      },
      {
        name: 'Lulu',
        id: 3,
        age_years: 4,
        is_adopted: true,
        size: 'small'
      },
      {
        name: 'Logan',
        id: 4,
        age_years: 5,
        is_adopted: true,
        size: 'small'
      }
    ];

    const data = await fakeRequest(app)
      .get('/dogs')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(expectation);
  });
});
