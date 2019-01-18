'use strict';

const Fixtures = require('../fixtures');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');


describe('POST /users', () => {

    let server;
    const user = Fixtures.user();
    before(async () => {

        server = await Server;
    });


    after(async () => {

        await Promise.all([
            db.users.destroy({ username: user.username })
        ]);
    });

    it('Create user', () => {

        const payload = user;
        return server.inject({ method: 'post', url: '/users', payload }).then((res) => {

            expect(res.statusCode).to.equal(201);
        });
    });
    it('Should not store password as plain text', async () => {

        const currentUser = Fixtures.user();
        const payload = currentUser;
        const response = await server.inject({ method: 'post', url: '/users', payload });
        expect(response.statusCode).to.equal(201);
        expect(currentUser.password).not.to.equal(response.result.data.password);
    });
    it('Create user duplicate', () => {

        const payload = user;
        return server.inject({ method: 'post', url: '/users', payload }).then((res) => {

            expect(res.statusCode).to.equal(409);
        });
    });
    it('Create user duplicate email', () => {

        const payload = Fixtures.user();
        payload.email = user.email;
        return server.inject({ method: 'post', url: '/users', payload }).then((res) => {

            expect(res.statusCode).to.equal(409);
        });
    });
});
