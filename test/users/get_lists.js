'use strict';

const Fixtures = require('../fixtures');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');


describe('GET /users/{username}/lists', () => {

    let server;
    before(async () => {

        server = await Server;
    });

    after(async () => {

        await Promise.all([
            db.items.destroy(),
            db.lists.destroy(),
            db.users.destroy()
        ]);
    });

    it('Get lists', async () => {

        const user = await db.users.insert(Fixtures.user());
        const list = await db.lists.insert(Fixtures.list({ owner: user.username }));
        const query = {
            method: 'GET',
            url: `/users/${user.username}/lists`
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data[0].name).to.equal(list.name);
    });

    it('Get lists empty', async () => {

        const user = await db.users.insert(Fixtures.user());
        const query = {
            method: 'GET',
            url: `/users/${user.username}/lists`
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.length).to.equal(0);
    });

    it('Get list fake user', async () => {

        const query = {
            method: 'GET',
            url: `/users/mruser/lists`
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal(
            'Not Found'
        );
    });
});
