'use strict';

const Fixtures = require('../fixtures');
const JWT = require('jsonwebtoken');
const Config = require('getconfig');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');

describe('PUT Lists:', () => {

    let server;
    const user = Fixtures.user_id();
    const adminUser = Fixtures.user_admin();
    let token;
    let query;

    before(async () => {

        server = await Server;
        await Promise.all([
            db.users.insert(user),
            db.users.insert(adminUser)
        ]);
        token = JWT.sign(
            { id: user.id, username: user.username, timestamp: new Date() },
            Config.auth.secret,
            Config.auth.options
        );
        query = {
            method: 'PUT',
            headers: {
                Authorization: token
            }
        };
    });

    after(async () => {

        await Promise.all([
            db.users.destroy(),
            db.lists.destroy()
        ]);
    });

    it('update list', async () => {

        const list = await db.lists.insert(Fixtures.list({ owner: user.username }));
        const updatedList = Fixtures.list();
        const updateQuery = Object.assign({}, query, {
            url: `/lists/${list.id}`,
            payload: updatedList
        });
        const response = await server.inject(updateQuery);
        expect(response.result.data.name).to.equal(updatedList.name);
        expect(response.result.data.description).to.equal(updatedList.description);
        expect(response.statusCode).to.equal(200);
    });

    it('update list with no name', async () => {

        const list = await db.lists.insert(Fixtures.list({ owner: user.username }));
        const updatedList = Fixtures.list();
        delete updatedList.name;
        const updateQuery = Object.assign({}, query, {
            url: `/lists/${list.id}`,
            payload: updatedList
        });
        const response = await server.inject(updateQuery);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.match(
            /"name" is required/
        );
    });

    it('Unauthorized update list', async () => {

        const list = await db.lists.insert(Fixtures.list({ owner: user.username }));
        const newToken = JWT.sign(
            { id: adminUser.id, username: adminUser.username, timestamp: new Date() },
            Config.auth.secret,
            Config.auth.options
        );
        const updatedList = Fixtures.list();
        const updateQuery = Object.assign({}, query, {
            url: `/lists/${list.id}`,
            payload: updatedList,
            headers: { Authorization: newToken }
        });
        const response = await server.inject(updateQuery);
        expect(response.statusCode).to.equal(401);
        expect(response.result.message).to.equal(
            'Not permitted to edit item'
        );
    });
});
