'use strict';

const Fixtures = require('../fixtures');
const JWT = require('jsonwebtoken');
const Config = require('getconfig');
const Faker = require('faker');

const Server = Fixtures.server;
const db = Fixtures.db;
const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');

describe('Destroy List Items:', () => {

    let server;
    let token;
    let query;

    const adminUser = Fixtures.user_admin();
    const user = Fixtures.user_id();

    let item;
    let list;

    before(async () => {

        server = await Server;
        await db.users.insert(user);
        await db.users.insert(adminUser);
        item = await db.items.insert(Fixtures.place());
        list = await db.lists.insert(Fixtures.list({ owner: user.username }));

        token = JWT.sign(
            { id: user.id, username: user.username, timestamp: new Date() },
            Config.auth.secret,
            Config.auth.options
        );

        query = {
            method: 'DELETE',
            url:    `/lists/listitems`,
            headers: { 'Authorization': token }
        };
    });

    after(async () => {

        await Promise.all([
            db.users.destroy(),
            db.lists.destroy(),
            db.items.destroy()
        ]);
    });

    it('Delete List Item - 200', async () => {

        await db.list_items.insert({ list_id: list.id, item_id: item.id });
        const payload = {
            list_id: list.id,
            item_id: item.id
        };
        query.payload = payload;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
    });

    it('Delete List Item - Item 404', async () => {

        const payload = {
            list_id: list.id,
            item_id: Faker.random.uuid()
        };
        query.payload = payload;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal(
            'Item not found'
        );
    });

    it('Delete List Item - List 404', async () => {

        const payload = {
            list_id: Faker.random.uuid(),
            item_id: item.id
        };
        query.payload = payload;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal(
            'List not found'
        );
    });

    it('Delete List Item - User 401', async () => {

        const payload = {
            list_id: list.id,
            item_id: item.id
        };
        const adminToken = JWT.sign(
            { id: adminUser.id, username: adminUser.username, timestamp: new Date() },
            Config.auth.secret,
            Config.auth.options
        );
        const adminQuery = Object.assign({}, query, {
            headers: { 'authorization': adminToken },
            payload
        });
        const response = await server.inject(adminQuery);
        expect(response.statusCode).to.equal(401);
    });
});
