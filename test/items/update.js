'use strict';

const Fixtures = require('../fixtures');
const JWT = require('jsonwebtoken');
const Config = require('getconfig');
const Faker = require('faker');

const Server = Fixtures.server;
const db = Fixtures.db;

const { after, before, describe, it } = exports.lab = require('lab').script();
const { expect } = require('code');

describe('PUT Items:', () => {

    let place;
    let group;
    let event;
    let activity;
    let server;

    const user = Fixtures.user_id();
    const mod = Fixtures.user_mod();

    const tag = Fixtures.tag();

    let userToken;
    let modToken;

    before(async () => {

        place = await db.items.insert(Fixtures.place());
        group = await db.items.insert(Fixtures.group());
        event = await db.items.insert(Fixtures.event());
        activity = await db.items.insert(Fixtures.activity());
        await Promise.all([
            db.users.insert(user),
            db.users.insert(mod)
        ]);

        await Promise.all([
            db.item_owners.insert({ username: user.username, item_id: event.id })
        ]);

        await Promise.all([
            db.tags.insert(tag)
        ]);

        server = await Server;
        userToken = JWT.sign({ id: user.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        modToken = JWT.sign({ id: mod.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
    });

    after(async () => {

        await Promise.all([
            db.users.destroy(),
            db.items.destroy(),
            db.item_owners.destroy(),
            db.tags.destroy()
        ]);
    });

    it('Update item', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${event.id}`,
            headers: { 'Authorization': userToken },
            payload: { 'name': 'THIS IS A TEST' }
        };
        const response = await server.inject(query);
        expect(response.result.data.name).to.equal('THIS IS A TEST');
        expect(response.statusCode).to.equal(200);
    });

    it('Update item: mod', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${place.id}`,
            headers: { 'Authorization': modToken },
            payload: { location: 'Somewhere' }
        };
        const response = await server.inject(query);
        expect(response.result.data.location).to.equal('Somewhere');
        expect(response.statusCode).to.equal(200);
    });

    it('Update item: non-owner', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${place.id}`,
            headers: { 'Authorization': userToken },
            payload: { name: 'Test' }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(401);
        expect(response.result.message).to.equal('Not permitted to edit item');
    });

    it('Update item: Item does not exist', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${Faker.random.uuid()}`,
            headers: { 'Authorization': userToken },
            payload: { name: 'Super test' }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(404);
    });

    it('Update item: Individual item elements', async () => {

        const startDate = Faker.date.past();
        const endDate = Faker.date.future();
        const query = {
            method: 'PUT',
            url: `/items/${event.id}`,
            headers: { 'Authorization': userToken },
            payload: {
                'name': 'TOO TEST TOO FURIOUS',
                'start_date': startDate,
                'end_date': endDate,
                'location': 'here'
            }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.location).to.equal('here');
        expect(response.result.data.start_date).to.equal(startDate);
        expect(response.result.data.end_date).to.equal(endDate);
        expect(response.result.data.name).to.equal('TOO TEST TOO FURIOUS');
    });

    it('Update item: name already exists', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${event.id}`,
            headers: { 'Authorization': userToken },
            payload: { name: place.name }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(409);
        expect(response.result.message).to.equal(
            'Item already exists with name.'
        );
    });

    it('Update item: Non-Event with dates', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${event.id}`,
            headers: { 'Authorization': userToken },
            payload: { 'type': 'place' }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            'Only event can have start and end dates'
        );
    });

    it('Update item: Event without dates', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${place.id}`,
            headers: { 'Authorization': modToken },
            payload: { 'type': 'event' }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            'Event must have a start date'
        );
    });

    it('Update item: Add Linked Item', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${event.id}`,
            headers: { 'Authorization': userToken },
            payload: { 'linked_items': [place.id] }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.linked_items[0]).to.equal(place.id);
    });

    it('Update item: Add Non-Item Link', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${event.id}`,
            headers: { 'Authorization': userToken },
            payload: { 'linked_items': [Faker.random.uuid()] }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal(
            'Attempting to link item that does not exist'
        );
    });

    it('Update item: Add place link to place', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${place.id}`,
            headers: { 'Authorization': modToken },
            payload: { 'linked_items': [place.id] }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            'Can\'t link place to other Items'
        );
    });

    it('Update item: Add group link to place', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${place.id}`,
            headers: { 'Authorization': modToken },
            payload: { 'linked_items': [group.id] }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            'Can\'t link place to other Items'
        );
    });

    it('Update item: Add group link to activity', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${activity.id}`,
            headers: { 'Authorization': modToken },
            payload: { 'linked_items': [group.id] }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            'Can\'t link activity to anything but Place'
        );
    });

    it('Update item: Add place link to activity', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${activity.id}`,
            headers: { 'Authorization': modToken },
            payload: { 'linked_items': [place.id] }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
    });

    it('Update item: Add group link to group', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${group.id}`,
            headers: { 'Authorization': modToken },
            payload: { 'linked_items': [group.id] }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            'Can\'t link group to anything but Place'
        );
    });

    it('Update item: Add place link to group', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${group.id}`,
            headers: { 'Authorization': modToken },
            payload: { 'linked_items': [place.id] }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.linked_items[0]).to.equal(place.id);
    });

    it('Update item: Add event link to event', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${event.id}`,
            headers: { 'Authorization': modToken },
            payload: { 'linked_items': [event.id] }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            'Can\'t link Event to Item type'
        );
    });

    it('Update item: No place linked to event', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${event.id}`,
            headers: { 'Authorization': modToken },
            payload: { 'linked_items': [] }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            'No place linked to event'
        );
    });

    it('Update item: Add Tag', async () => {

        const query = {
            method: 'PUT',
            url: `/items/${place.id}`,
            headers: { 'Authorization': modToken },
            payload: { 'tags': [tag.name] }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.tags[0]).to.equal(tag.name);
    });

    it('Update item: Add Non-Tag', async () => {

        const nonTag = Faker.lorem.word();
        const query = {
            method: 'PUT',
            url: `/items/${place.id}`,
            headers: { 'Authorization': modToken },
            payload: { 'tags': [nonTag] }
        };
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            `Tag ${nonTag} does not exist`
        );
    });
});
