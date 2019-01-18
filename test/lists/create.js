'use strict';

const Fixtures = require('../fixtures');
const JWT = require('jsonwebtoken');
const Config = require('getconfig');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');

describe('POST Lists:', () => {

    let server;
    const user = Fixtures.user_id();
    let token;
    let query;

    before(async () => {

        server = await Server;

        await db.users.insert(user);
        token = JWT.sign(
            { id: user.id, username: user.username, timestamp: new Date() },
            Config.auth.secret,
            Config.auth.options
        );

        query = {
            method: 'POST',
            url: '/lists',
            headers: { 'authorization': token }
        };
    });

    after(async () => {

        await Promise.all([
            db.users.destroy(),
            db.lists.destroy()
        ]);
    });

    it('Create list', async () => {

        const list = Fixtures.list();
        query.payload = list;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(201);
    });

    it('Create list duplicate', async () => {

        const list = Fixtures.list();
        const dup = Object.assign({}, list);
        list.owner = user.username;
        await db.lists.insert(list);
        query.payload = dup;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(409);
        expect(response.result.message).to.equal(
            'List of that name and owner already exists.'
        );
    });

    it('Create list no name', async () => {

        const list = Fixtures.list();
        list.name = null;
        query.payload = list;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.match(
            /"name" must be a string/
        );
    });
});
