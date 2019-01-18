'use strict';

const Fixtures = require('../fixtures');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');


describe('GET /items', () => {

    let server;
    const place = Fixtures.place();
    let event;

    before(async () => {

        server = await Server;

        await db.items.insert(place);
        event = await db.items.insert(Fixtures.event({ linked_items: [place.id] }));

    });

    after(async () => {

        await Promise.all([
            db.items.destroy()
        ]);

    });
    it('Get items', async () => {

        const query = {
            method: 'GET',
            url: '/items'
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.length).to.equal(2);
    });

    it('GET items by type', async () => {

        const query = {
            method: 'GET',
            url: '/items?type=event'
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data[0].name).to.equal(event.name);
    });

    it('GET items by name', async () => {

        const query = {
            method: 'GET',
            url: `/items?name=${place.name}`
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data[0].name).to.equal(place.name);
    });
});
