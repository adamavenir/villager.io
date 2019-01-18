'use strict';

const JWT = require('jsonwebtoken');
const Config = require('getconfig');
const Fixtures = require('../fixtures');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');

describe('GET /users', () => {

    let server;
    const admin = Fixtures.user_admin();
    const user = Fixtures.user_id();

    before(async () => {

        server = await Server;

        await Promise.all([
            db.users.insert(admin),
            db.users.insert(user)
        ]);
    });

    after(async () => {

        await Promise.all([
            db.users.destroy({ id: admin.id }),
            db.users.destroy({ id: user.id })
        ]);

    });
    it('Get users', () => {

        const token = JWT.sign({ id: admin.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        const query = {
            method: 'GET',
            url: '/users',
            headers: { 'authorization': token }
        };

        return server.inject(query)
            .then((response) => {

                expect(response.statusCode).to.equal(200);
            });
    });

    it('Unauthorized Get users', () => {

        const token = JWT.sign({ id: user.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        const query = {
            method: 'GET',
            url: '/users',
            headers: { 'authorization': token }
        };

        return server.inject(query)
            .then((response) => {

                expect(response.statusCode).to.equal(401);
            });
    });
});
