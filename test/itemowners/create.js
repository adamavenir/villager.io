'use strict';

const JWT = require('jsonwebtoken');
const Config = require('getconfig');
const Fixtures = require('../fixtures');
const Faker = require('faker');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');


describe('POST /item_owners', () => {

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

    it('Create owner', () => {

        const token = JWT.sign({ id: admin.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        const payload = { username: user.username, item_id: newEvent[0].id };
        return server.inject({ method: 'post', url: '/item_owners', payload, headers: { 'Authorization': token } }).then((res) => {

            expect(res.statusCode).to.equal(201);
        });
    });
    it('Create owner as user', () => {

        const token = JWT.sign({ id: user.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        const payload = { username: user.username, item_id: newEvent[0].id };
        return server.inject({ method: 'post', url: '/item_owners', payload, headers: { 'Authorization': token } }).then((res) => {

            expect(res.statusCode).to.equal(401);
        });
    });
    it('Create owner duplicate', () => {

        const token = JWT.sign({ id: admin.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        const payload = { username: user.username, item_id: newEvent[0].id };
        return server.inject({ method: 'post', url: '/item_owners', payload, headers: { 'Authorization': token } }).then((res) => {

            expect(res.statusCode).to.equal(409);
        });
    });
    it('Create owner fake item', () => {

        const notExist = Faker.random.uuid();

        const token = JWT.sign({ id: admin.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        const payload = { username: user.username, item_id: notExist };
        return server.inject({ method: 'post', url: '/item_owners', payload, headers: { 'Authorization': token } }).then((res) => {

            expect(res.statusCode).to.equal(404);
        });
    });
    it('Create owner fake user', () => {

        const fake = Fixtures.user_id();
        const token = JWT.sign({ id: admin.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        const payload = { username: fake.username, item_id: newEvent[0].id };
        return server.inject({ method: 'post', url: '/item_owners', payload, headers: { 'Authorization': token } }).then((res) => {

            expect(res.statusCode).to.equal(404);
        });
    });
});
