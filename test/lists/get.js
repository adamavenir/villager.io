'use strict';

const Fixtures = require('../fixtures');
const Faker = require('faker');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');

describe('GET Lists:', () => {

    let server;
    const user = Fixtures.user_id();
    let query;

    before(async () => {

        server = await Server;
        await db.users.insert(user);
        query = {
            method: 'GET'
        };
    });

    after(async () => {

        await Promise.all([
            db.lists.destroy(),
            db.list_items.destroy(),
            db.items.destroy(),
            db.users.destroy()
        ]);
    });

    it('get list', async () => {

        const list = await db.lists.insert(Fixtures.list({ owner: user.username }));
        query.url = `/lists/${list.id}`;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.id).to.equal(list.id);
    });

    it('Get list w/ items', async () => {

        const list = await db.lists.insert(Fixtures.list({ owner: user.username }));
        const item = await db.items.insert(Fixtures.place());
        await db.list_items.insert({ list_id: list.id, item_id: item.id });
        query.url = `/lists/${list.id}`;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.items[0]).to.equal(item);
    });

    it('get invalid list', async () => {

        query.url = `/lists/${Faker.random.uuid()}`;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal(
            'List was not found.'
        );
    });
});
