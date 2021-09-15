const requestLib = require('supertest');

const app = require('../src/app');
const User = require('../src/models/user');
const { userOne, userOneId, setupDatabase } = require('./fixtures/db.js');

beforeEach(setupDatabase);

test('Should signup a new user.', async () => {
    const response = await requestLib(app).post('/api/users/signup').send({
        name: 'Demiri',
        email: 'astritdemiri94@gmail.com',
        password: '20212021'
    }).expect(201);

    // Assert that the database was changed correctly
    const user = await User.findById(response.body.user._id);
    expect(user).not.toBeNull();

    // Assertions about the response
    expect(response.body).toMatchObject({
        user: {
            name: 'Demiri',
            email: 'astritdemiri94@gmail.com'
        },
        token: user.tokens[0].token
    });

    expect(user.password).not.toBe('20212021');
});

test('Should login existing user.', async () => {
    const response = await requestLib(app).post('/api/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200);

    const user = await User.findById(userOneId);
    expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login nonexistent user.', async () => {
    await requestLib(app).post('/api/users/login').send({
        email: 'test@test.com',
        password: 'test-test'
    }).expect(400);
});

test('Should get profile for user.', async () => {
    await requestLib(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
});

test('Should not get profile for unauthenticated user.', async () => {
    await requestLib(app)
        .get('/api/users/me')
        .send()
        .expect(401);
});

test('Should delete profile for user.', async () => {
    await requestLib(app)
        .delete('/api/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user).toBeNull();
});

test('Should not delete profile for non unauthenticated user.', async () => {
    await requestLib(app)
        .delete('/api/users/me')
        .send()
        .expect(401);
});

test('Should upload avatar image.', async () => {
    await requestLib(app)
        .post('/api/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .attach('img', 'tests/fixtures/img/profile-pic.jpg')
        .expect(201);

    const user = await User.findById(userOneId);
    expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update valid user fields.', async () => {
    const userUpdate = {
        name: 'Titi'
    };

    await requestLib(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send(userUpdate)
        .expect(200);

    const user = await User.findById(userOneId);
    expect(user.name).toEqual(userUpdate.name);
});

test('Should not update invalid user fields.', async () => {
    const userUpdate = {
        location: 'Unknown'
    };

    await requestLib(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send(userUpdate)
        .expect(400);
});