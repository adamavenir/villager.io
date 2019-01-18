'use strict';

const JWT = require('jsonwebtoken');
const Config = require('getconfig');
const Fixtures = require('../fixtures');
const Faker = require('faker');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');


describe('List /item_owners', () => {

    let server;
    const user = Fixtures.user_id();
    const event = Fixtures.event();
    const admin = Fixtures.user_admin();
    let newEvent;

    before(async () => {

        server = await Server;
        newEvent = await Promise.all([
            db.items.insert(event)
        ]);
        await Promise.all([
            db.users.insert(user)
        ]);
        await Promise.all([
            db.users.insert(admin)
        ]);
        await Promise.all([
            db.item_owners.insert({ username: user.username, item_id: newEvent[0].id })
        ]);
    });

    after(async () => {

        await Promise.all([
            db.items.destroy({ id: newEvent[0].id })
        ]);
        await Promise.all([
            db.users.destroy({ id: user.id })
        ]);
        await Promise.all([
            db.users.destroy({ id: admin.id })
        ]);

    });
    it('Get owners of item as user', () => {

        const token = JWT.sign({ id: user.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        return server.inject({ method: 'get', url: `/item_owners/${newEvent[0].id}`, headers: { 'Authorization': token } }).then((res) => {

            expect(res.statusCode).to.equal(401);
        });
    });
    it('Get owners of item', () => {

        const token = JWT.sign({ id: admin.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        return server.inject({ method: 'get', url: `/item_owners/${newEvent[0].id}`, headers: { 'Authorization': token } }).then((res) => {

            expect(res.statusCode).to.equal(200);
        });
    });
    it('Get owners of fake item', () => {

        const fakeItem = Faker.random.uuid();

        const token = JWT.sign({ id: admin.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        return server.inject({ method: 'get', url: `/item_owners/${fakeItem}`, headers: { 'Authorization': token } }).then((res) => {

            expect(res.statusCode).to.equal(404);
        });
    });
});
