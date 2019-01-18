'use strict';

const JWT = require('jsonwebtoken');
const Config = require('getconfig');
const Fixtures = require('../fixtures');
const Bcrypt = require('bcrypt');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');

const queryBuilder = (user, token, payload) => {

    return {
        method: 'PUT',
        url: `/users/${user.username}`,
        headers: { Authorization: token },
        payload
    };
};

const tokenBuilder = (user) => {

    return JWT.sign(
        { id: user.id, username: user.username, timestamp: new Date() },
        Config.auth.secret,
        Config.auth.options
    );
};

describe('PUT /users/{username}', () => {

    let server;

    before(async () => {

        server = await Server;
    });

    after(async () => {

        await Promise.all([
            db.users.destroy()
        ]);

    });
    it('Update user', async () => {

        const user = await db.users.insert(Fixtures.user());
        const updatedUser = Fixtures.user();
        delete updatedUser.password;
        const token = tokenBuilder(user);
        const query = queryBuilder(user, token, updatedUser);
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.user).to.include(updatedUser);
    });

    it('Update user without username', async () => {

        const user = await db.users.insert(Fixtures.user());
        const updatedUser = Fixtures.user();
        delete updatedUser.username;
        delete updatedUser.password;
        const token = tokenBuilder(user);
        const query = queryBuilder(user, token, updatedUser);
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.user).to.include(updatedUser);
    });

    it('Update user without email', async () => {

        const user = await db.users.insert(Fixtures.user());
        const updatedUser = Fixtures.user();
        delete updatedUser.email;
        delete updatedUser.password;
        const token = tokenBuilder(user);
        const query = queryBuilder(user, token, updatedUser);
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.user).to.include(updatedUser);
    });

    it('Update user password', async () =>  {

        const rawUser = Fixtures.user();
        const oldPassword = rawUser.password;
        rawUser.password = await Bcrypt.hash(rawUser.password, 1);
        const user = await db.users.insert(rawUser);
        const updatedUser = { oldPassword, password: 'password' };
        const token = tokenBuilder(user);
        const query = queryBuilder(user, token, updatedUser);
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
    });

    it('Failed update user password', async () =>  {

        const user = await db.users.insert(Fixtures.user());
        const updatedUser = { oldPassword: 'wrong', password: 'password' };
        const token = tokenBuilder(user);
        const query = queryBuilder(user, token, updatedUser);
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(401);
        expect(response.result.message).to.equal(
            'Old password invalid'
        );
    });

    it('Update user as different user', async () => {

        const user = await db.users.insert(Fixtures.user());
        const user2 = await db.users.insert(Fixtures.user());
        const updatedUser = Fixtures.user();
        delete updatedUser.password;
        const token = tokenBuilder(user2);
        const query = queryBuilder(user, token, updatedUser);
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(401);
        expect(response.result.message).to.equal(
            'User is not permitted to edit this account'
        );
    });

    it('Update user as duplicate username', async () => {

        const user = await db.users.insert(Fixtures.user());
        const user2 = await db.users.insert(Fixtures.user());
        const updatedUser = { username: user2.username };
        const token = tokenBuilder(user);
        const query = queryBuilder(user, token, updatedUser);
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(409);
        expect(response.result.message).to.equal(
            `Username ${user2.username} already exists`
        );
    });

    it('Update user with duplicate email', async () => {

        const user = await db.users.insert(Fixtures.user());
        const user2 = await db.users.insert(Fixtures.user());
        const updatedUser = { email: user2.email };
        const token = tokenBuilder(user);
        const query = queryBuilder(user, token, updatedUser);
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(409);
        expect(response.result.message).to.equal(
            `Email ${user2.email} already exists`
        );
    });

    it('Update fake user', async () => {

        const user = await db.users.insert(Fixtures.user());
        const updatedUser = { name: 'test' };
        const token = tokenBuilder(user);
        const query = queryBuilder(Fixtures.user(), token, updatedUser);
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal(
            `User not found`
        );
    });

});
