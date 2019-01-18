'use strict';

const Fixtures = require('../fixtures');
const JWT = require('jsonwebtoken');
const Config = require('getconfig');
const Faker = require('faker');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');

describe('DELETE Lists:', () => {

    let server;
    const user1 = Fixtures.user_id();
    const user2 = Fixtures.user_id();
    let token;
    let query;

    before(async () => {

        await Promise.all([
            db.users.insert(user1),
            db.users.insert(user2)
        ]);

        server = await Server;

        token = JWT.sign(
            { id: user1.id, username: user1.username, timestamp: new Date() },
            Config.auth.secret,
            Config.auth.options
        );
        query = {
            method: 'DELETE',
            headers: {
                Authorization: token
            }
        };
    });

    after(async () => {

        await Promise.all([
            db.lists.destroy(),
            db.users.destroy()
        ]);
    });

    it('delete list', async () => {

        const list = await db.lists.insert(Fixtures.list({ owner: user1.username }));
        query.url = `/lists/${list.id}`;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(204);
    });

    it('unauthorized delete list', async () => {

        const list = await db.lists.insert(Fixtures.list({ owner: user1.username }));
        const newToken = JWT.sign(
            { id: user2.id, username: user2.username, timestamp: new Date() },
            Config.auth.secret,
            Config.auth.options
        );
        const newQuery = Object.assign({}, query, {
            headers: { Authorization: newToken },
            url: `/lists/${list.id}`
        });
        const response = await server.inject(newQuery);
        expect(response.statusCode).to.equal(401);
        expect(response.result.message).to.equal(
            'Unauthorized to delete list.'
        );
    });

    it('delete non-existing list', async () => {

        query.url = `/lists/${Faker.random.uuid()}`;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal(
            'List was not found.'
        );
    });
});
