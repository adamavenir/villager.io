'use strict';

const Fixtures = require('../fixtures');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');


describe('GET /items/tags/{name}', () => {

    let server;

    let place;
    const tag = Fixtures.tag();

    before(async () => {

        server = await Server;

        place = await db.items.insert(Fixtures.place());
        await db.tags.insert(tag);
        await db.item_tags.insert({ item_id: place.id, tag_name: tag.name });
    });

    after(async () => {

        await Promise.all([
            db.items.destroy(),
            db.tags.destroy(),
            db.item_tags.destroy()
        ]);

    });
    it('list by tag', async () => {

        const query = {
            method: 'GET',
            url: `/items/tags/${tag.name}`
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data[0].id).to.equal(place.id);
    });
});
