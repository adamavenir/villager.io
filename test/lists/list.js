'use strict';

const Fixtures = require('../fixtures');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');

describe('GET /lists:', () => {

    let server;

    const user = Fixtures.user_id();

    before(async () => {

        server = await Server;
        await db.users.insert(user);
    });

    after(async () => {

        await db.lists.destroy();
    });

    it('List list', async () => {

        await db.lists.insert(Fixtures.list({ owner: user.username }));
        await db.lists.insert(Fixtures.list({ owner: user.username }));
        const listQuery = {
            method: 'GET',
            url: '/lists'
        };
        const response = await server.inject(listQuery);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.length).to.equal(2);
    });
});
