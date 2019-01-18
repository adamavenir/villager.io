'use strict';

const Fixtures = require('../fixtures');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');


describe('GET /users/{username}/starred', () => {

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

    it('Get starred items', async () => {

        const user = await db.users.insert(Fixtures.user());
        const item = await db.items.insert(Fixtures.place());
        const item2 = await db.items.insert(Fixtures.place());
        await db.starred_items.insert({ username: user.username, item_id: item.id });
        await db.starred_items.insert({ username: user.username, item_id: item2.id });
        const query = {
            method: 'GET',
            url: `/users/${user.username}/starred`
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.length).to.equal(2);
        expect(response.result.data[0].name).to.equal(item.name);
    });

    it('Get starred items empty', async () => {

        const user = await db.users.insert(Fixtures.user());
        const query = {
            method: 'GET',
            url: `/users/${user.username}/starred`
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.length).to.equal(0);
    });

    it('Get starred items fake user', async () => {

        const query = {
            method: 'GET',
            url: `/users/mruser/starred`
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal(
            'Not Found'
        );
    });
});
