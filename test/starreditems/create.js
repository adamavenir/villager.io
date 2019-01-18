'use strict';

const Fixtures = require('../fixtures');
const JWT = require('jsonwebtoken');
const Config = require('getconfig');
const Faker = require('faker');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');

describe('POST Starred Items:', () => {

    let server;
    let token;
    const user = Fixtures.user_id();
    let item;
    let query;

    before(async () => {

        server = await Server;
        await db.users.insert(user),
        item = await db.items.insert(Fixtures.place());
        token = JWT.sign(
            { id: user.id, username: user.username, timestamp: new Date() },
            Config.auth.secret,
            Config.auth.options
        );
        query = {
            method: 'POST',
            url: '/starred_items',
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

    it('Add Starred Item', async () => {

        query.payload = {
            item_id: item.id
        };
        const response = await server.inject(query);
        console.log(response.result);
        expect(response.statusCode).to.equal(201);
        expect(response.result.message).to.equal(
            'Item starred by user'
        );
    });

    it('Add Starred Item - Item Not Found', async () => {

        query.payload = {
            item_id: Faker.random.uuid()
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal(
            'Item not found'
        );
    });

    it('Add Starred Item - Item already starred', async () => {

        const item2 = await db.items.insert(Fixtures.place());
        await db.starred_items.insert({ username: user.username, item_id: item2.id });
        query.payload = {
            item_id: item2.id
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(409);
        expect(response.result.message).to.equal(
            `${user.username} has already starred this item!`
        );
    });
});
