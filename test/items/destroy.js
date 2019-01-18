'use strict';

const JWT = require('jsonwebtoken');
const Config = require('getconfig');
const Fixtures = require('../fixtures');
const Faker = require('faker');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, beforeEach, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');


describe('DELETE /items/{id}', () => {

    let server;
    const user = Fixtures.user_id();
    const userTwo = Fixtures.user();
    const adminUser = Fixtures.user_admin();
    let token;
    let query;

    before(async () => {

        await Promise.all([
            db.users.insert(user),
            db.users.insert(userTwo),
            db.users.insert(adminUser)
        ]);
        server = await Server;
        token = JWT.sign({ id: user.id, username: user.username, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        query = {
            method: 'DELETE',
            headers: { 'Authorization': token }
        };
    });

    beforeEach(async () => {

        await Promise.all([
            db.item_owners.destroy(),
            db.items.destroy(),
            db.lists.destroy(),
            db.list_items.destroy()
        ]);
    });

    after(async () => {

        await Promise.all([
            db.users.destroy(),
            db.item_owners.destroy(),
            db.items.destroy(),
            db.lists.destroy(),
            db.list_items.destroy()
        ]);
    });

    it('Destroy item', async () => {

        const item = await db.items.insert(Fixtures.place());
        await db.item_owners.insert({ username: user.username, item_id: item.id });
        query.url = `/items/${item.id}`;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(204);
    });

    it('Invalid user destroy item', async () => {

        const item = await db.items.insert(Fixtures.place());
        await db.item_owners.insert({ username: userTwo.username, item_id: item.id });
        query.url = `/items/${item.id}`;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(401);
        expect(response.result.message).to.equal(
            'Not permitted to edit item'
        );
    });

    it('Destroy item with multiple owners', async () => {

        const item = await db.items.insert(Fixtures.place());
        await db.item_owners.insert({ username: user.username, item_id: item.id });
        await db.item_owners.insert({ username: userTwo.username, item_id: item.id });
        query.url = `/items/${item.id}`;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(412);
        expect(response.result.message).to.equal(
            'Cannot Delete Item with additional Owner'
        );
    });

    it('Non-user (admin) destroy item', async () => {

        const item = await db.items.insert(Fixtures.place());
        await db.item_owners.insert({ username: user.username, item_id: item.id });
        const newToken = JWT.sign(
            { id: adminUser.id, username: adminUser.username, timestamp: new Date() },
            Config.auth.secret,
            Config.auth.options
        );
        const newQuery = {
            method: 'DELETE',
            url: `/items/${item.id}`,
            headers: {
                Authorization: newToken
            }
        };
        const response = await server.inject(newQuery);
        expect(response.statusCode).to.equal(204);
    });

    it('Item does not exist', async () => {

        query.url = `/items/${Faker.random.uuid()}`;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal(
            'Item not found'
        );
    });

    it('Item in a list', async () => {

        const item = await db.items.insert(Fixtures.place());
        const list = await db.lists.insert(Fixtures.list());
        await db.list_items.insert({ list_id: list.id, item_id: item.id });
        await db.item_owners.insert({ username: user.username, item_id: item.id });
        query.url = `/items/${item.id}`;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(412);
        expect(response.result.message).to.equal(
            'Unable to delete item. Item in a list.'
        );
    });
});
