'use strict';

const Fixtures = require('../fixtures');
const JWT = require('jsonwebtoken');
const Config = require('getconfig');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');

describe('PUT Tags:', () => {

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

        await Promise.all([
            db.tags.insert(tag1)
        ]);
    });

    after(async () => {

        await Promise.all([
            db.users.destroy({ id: user.id }),
            db.users.destroy({ id: mod.id }),
            db.tags.destroy({ name: tag2.name })
        ]);
    });

    it('Update tag unauthorized', () => {

        const token = JWT.sign({ id: user.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        const query = {
            method: 'PUT',
            url:    `/tags/${tag2.name}`,
            headers: { 'authorization': token },
            payload: tag1
        };

        return (
            server.inject(query)
                .then((response) => {

                    expect(response.statusCode).to.equal(401);
                })
        );
    });

    it('Update tag non-existing', () => {

        const token = JWT.sign({ id: mod.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        const query = {
            method: 'PUT',
            url:    `/tags/${tag2.name}`,
            headers: { 'authorization': token },
            payload: tag1
        };
        return (
            server.inject(query)
                .then((response) => {

                    expect(response.statusCode).to.equal(404);
                })
        );
    });

    it('Update tag', () => {

        const token = JWT.sign({ id: mod.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        const query = {
            method: 'PUT',
            url:    `/tags/${tag1.name}`,
            headers: { 'authorization': token },
            payload: tag2
        };
        return (
            server.inject(query)
                .then((response) => {

                    expect(response.result.data.name).to.equal(tag2.name);
                    expect(response.statusCode).to.equal(200);
                })
        );
    });
});
