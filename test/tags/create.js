'use strict';

const Fixtures = require('../fixtures');
const JWT = require('jsonwebtoken');
const Config = require('getconfig');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');

describe('POST tags:', () => {

    let server;

    const user = Fixtures.user_id();
    const mod = Fixtures.user_mod();

    const tag1 = Fixtures.tag();
    const tag2 = Fixtures.tag();

    before(async () => {

        server = await Server;
        await Promise.all([
            db.users.insert(user),
            db.users.insert(mod)
        ]);
    });

    after(async () => {

        await Promise.all([
            db.users.destroy({ id: user.id }),
            db.users.destroy({ id: mod.id }),
            db.tags.destroy({ name: tag1.name })
        ]);
    });

    it('Create tag', () => {

        const token = JWT.sign({ id: mod.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        const query = {
            method: 'POST',
            url:    `/tags`,
            headers: { 'authorization': token },
            payload: tag1
        };
        return (
            server.inject(query)
                .then((response) => {

                    expect(response.statusCode).to.equal(201);
                })
        );
    });

    it('Create tag duplicate', () => {

        const token = JWT.sign({ id: mod.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        const query = {
            method: 'POST',
            url:    `/tags`,
            headers: { 'authorization': token },
            payload: tag1
        };

        return (
            server.inject(query)
                .then((response) => {

                    expect(response.statusCode).to.equal(409);
                })
        );
    });

    it('Create tag unauthorized', () => {

        const token = JWT.sign({ id: user.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        const query = {
            method: 'POST',
            url:    `/tags`,
            headers: { 'authorization': token },
            payload: tag2
        };
        return (
            server.inject(query)
                .then((response) => {

                    expect(response.statusCode).to.equal(401);
                })
        );
    });
});
