'use strict';

const Fixtures = require('../fixtures');
const JWT = require('jsonwebtoken');
const Config = require('getconfig');
const Faker = require('faker');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');

describe('POST List Items:', () => {

    let server;
    let token;
    const user = Fixtures.user_id();
    const adminUser = Fixtures.user_admin();
    const list1 = Fixtures.list_id();
    let item1;
    let query;

    before(async () => {

        server = await Server;
        await db.users.insert(user),
        await db.users.insert(adminUser);
        list1.owner = user.username;
        await db.lists.insert(list1);
        item1 = await db.items.insert(Fixtures.place());
        token = JWT.sign(
            { id: user.id, username: user.username, timestamp: new Date() },
            Config.auth.secret,
            Config.auth.options
        );
        query = {
            method: 'POST',
            url: '/lists/listitems',
            headers: { 'Authorization': token }
        };
    });

    after(async () => {

        await Promise.all([
            db.users.destroy(),
            db.lists.destroy(),
            db.items.destroy(),
            db.list_items.destroy()
        ]);
    });

    it('Add List Item - Pass', async () => {

        query.payload = {
            item_id: item1.id,
            list_id: list1.id
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(201);
        expect(response.result.message).to.equal(
            'item inserted into list'
        );
    });

    it('Add List Item - Forbidden', async () => {

        const adminToken = JWT.sign(
            { id: adminUser.id, username: adminUser.username, timestamp: new Date() },
            Config.auth.secret,
            Config.auth.options
        );
        const adminQuery = Object.assign({}, query, {
            payload: {
                item_id: item1.id,
                list_id: list1.id
            },
            headers: { Authorization: adminToken }
        });
        const response = await server.inject(adminQuery);
        expect(response.statusCode).to.equal(401);
    });

    it('Add List Item - Item Not Found', async () => {

        query.payload = {
            item_id: Faker.random.uuid(),
            list_id: list1.id
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal(
            'Item not found'
        );
    });

    it('Add List Item - List Not Found', async () => {

        query.payload = {
            item_id: item1.id,
            list_id: Faker.random.uuid()
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal(
            'List not found'
        );
    });
});
