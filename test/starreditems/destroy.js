'use strict';

const Fixtures = require('../fixtures');
const JWT = require('jsonwebtoken');
const Config = require('getconfig');
const Faker = require('faker');

const Server = Fixtures.server;
const db = Fixtures.db;
const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');

describe('Destroy Starred Items:', () => {

    let server;
    let token;
    let query;

    const user = Fixtures.user_id();

    let item;

    before(async () => {

        server = await Server;
        await db.users.insert(user);
        item = await db.items.insert(Fixtures.place());

        token = JWT.sign(
            { id: user.id, username: user.username, timestamp: new Date() },
            Config.auth.secret,
            Config.auth.options
        );

        query = {
            method: 'DELETE',
            url:    `/starred_items`,
            headers: { 'Authorization': token }
        };
    });

    after(async () => {

        await Promise.all([
            db.users.destroy(),
            db.items.destroy(),
            db.starred_items.destroy()
        ]);
    });

    it('Delete Starred Item - 204', async () => {

        await db.starred_items.insert({ username: user.username, item_id: item.id });
        const payload = {
            item_id: item.id
        };
        query.payload = payload;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(204);
    });

    it('Delete Starred Item - Item 404', async () => {

        const payload = {
            item_id: Faker.random.uuid()
        };
        query.payload = payload;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal(
            'Item not starred by user'
        );
    });
});
