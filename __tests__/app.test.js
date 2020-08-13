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
        id: 1,
        name: 'Cookie',
        age_years: 3,
        size: 'small',
        is_adopted: true
      },
      {
        id: 2,
        name: 'Jonan',
        age_years: 4,
        size: 'small',
        is_adopted: true
      },
      {
        id: 3,
        name: 'Lulu',
        age_years: 4,
        size: 'small',
        is_adopted: true
      },
      {
        id: 4,
        name: 'Logan',
        age_years: 5,
        size: 'small',
        is_adopted: true
      }
    ];

    const data = await fakeRequest(app)
      .get('/dogs')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(data.body).toEqual(expectation);
  });
});
