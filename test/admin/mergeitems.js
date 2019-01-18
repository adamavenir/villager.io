'use strict';

const Fixtures = require('../fixtures');
const JWT = require('jsonwebtoken');
const Config = require('getconfig');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');


describe('PUT /merge', () => {

    let server;

    const mod = Fixtures.user_mod();
    const user = Fixtures.user_id();
    before(async () => {

        server = await Server;

        await Promise.all([
            db.users.insert(mod),
            db.users.insert(user)
        ]);
    });

    after(async () => {

        await Promise.all([
            db.items.destroy(),
            db.users.destroy(),
            db.item_owners.destroy()
        ]);
    });

    it('Merge, Correct', async () => {

        const token = JWT.sign(
            { id: mod.id, username: mod.username, timestamp: new Date() },
            Config.auth.secret,
            Config.auth.options
        );
        const place = Fixtures.place();
        const item1 = await db.items.insert(place);
        const item2 = await db.items.insert(place);
        const query = {
            method: 'PUT',
            url: `/merge`,
            headers: { 'Authorization': token },
            payload: {
                'item_id': [
                    item1.id, item2.id
                ]
            }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
    });

    it('Merge, User Token', async () => {

        const token = JWT.sign(
            { id: user.id, username: user.username, timestamp: new Date() },
            Config.auth.secret,
            Config.auth.options
        );
        const place = Fixtures.place();
        const item1 = await db.items.insert(place);
        const item2 = await db.items.insert(place);
        const query = {
            method: 'PUT',
            url: `/merge`,
            headers: { 'Authorization': token },
            payload: {
                'item_id': [
                    item1.id, item2.id
                ]
            }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(401);
        expect(response.result.message).to.equal(
            'Not permitted use this feature'
        );
    });

});
