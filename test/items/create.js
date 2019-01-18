'use strict';

const Fixtures = require('../fixtures');
const JWT = require('jsonwebtoken');
const Config = require('getconfig');
const Faker = require('faker');

const Server = Fixtures.server;
const db = Fixtures.db;

const {
    after,
    before,
    beforeEach,
    describe,
    it
} = exports.lab = require('lab').script();
const { expect } = require('code');

describe('POST Items:', () => {

    const tag = Fixtures.tag();
    const user = Fixtures.user_id();
    let token;
    let server;
    let query;

    before(async () => {

        await Promise.all([
            db.tags.insert(tag),
            db.users.insert(user)
        ]);
        token = JWT.sign({ id: user.id, timestamp: new Date() }, Config.auth.secret, Config.auth.options);
        server = await Server;
        query = {
            method: 'POST',
            url: '/items',
            headers: { 'Authorization': token }
        };
    });

    beforeEach(async () => {

        await db.items.destroy();
    });

    after(async () => {

        await Promise.all([
            db.tags.destroy(),
            db.users.destroy(),
            db.items.destroy()
        ]);
    });

    it('Create item, Correct', async () => {

        const place = await db.items.insert(Fixtures.place());
        const event = Fixtures.event({ tags: [tag.name], linked_items: [place.id] });

        query.payload = event;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(201);
    });

    it('Create item duplicate', async () => {

        const place = Fixtures.place();
        await db.items.insert(place);

        query.payload = place;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(409);
        expect(response.result.message).to.equal(
            'Item already exists'
        );
    });

    it('Create Item: Not Event, With Dates', async () => {

        const place = Fixtures.place({ start_date: Faker.date.future() });
        query.payload = place;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            'Only event can have start and end dates'
        );
    });

    it('Create Item: Event, No Start Date', async () => {

        const event = Fixtures.event();
        delete event.start_date;

        query.payload = event;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            'Event must have a start date'
        );
    });

    it('Create Item: Non-Event, End-Date', async () => {

        const group = Fixtures.group();
        group.end_date = Faker.date.future();

        query.payload = group;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            'Only event can have start and end dates'
        );
    });

    it('Create Item: Wrong Type', async () => {

        const place = Fixtures.place();
        place.type = 'carnival';

        query.payload = place;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.match(
            /"type" must be one of/
        );
    });

    it('Create Item: No Name', async () => {

        const place = Fixtures.place();
        place.name = '';

        query.payload = place;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.match(
            /"name" is not allowed to be empty/
        );
    });

    it('Create Place: Linked Items', async () => {

        const place = Fixtures.place();
        place.linked_items = [Faker.random.uuid()];

        query.payload = place;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            'Can\'t link place to other Items'
        );
    });

    it('Link Non-existent Item', async () => {

        const event = Fixtures.event();
        event.linked_items = [Faker.random.uuid()];

        query.payload = event;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(404);
        expect(response.result.message).to.equal(
            'Attempting to link item that does not exist'
        );
    });

    it('Link Event to Event', async () => {

        const eventOne = await db.items.insert(Fixtures.event());
        const eventTwo = Fixtures.event();
        eventTwo.linked_items = [eventOne.id];

        query.payload = eventTwo;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            'Can\'t link Event to Item type'
        );
    });

    it('Link Group to Place', async () => {

        const place = await db.items.insert(Fixtures.place());
        const group = Fixtures.group();
        group.linked_items = [place.id];

        query.payload = group;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(201);
    });

    it('Link Group to not Place', async () => {

        const activity = await db.items.insert(Fixtures.activity());
        const group = Fixtures.group();
        group.linked_items = [activity.id];

        query.payload = group;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            'Can\'t link group to anything but Place'
        );
    });

    it('Link Activity to Place', async () => {

        const place = await db.items.insert(Fixtures.place());
        const activity = Fixtures.activity();
        activity.linked_items = [place.id];

        query.payload = activity;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(201);
    });

    it('Link Activity to not Place', async () => {

        const group = await db.items.insert(Fixtures.group());
        const activity = Fixtures.activity();
        activity.linked_items = [group.id];

        query.payload = activity;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            'Can\'t link activity to anything but Place'
        );
    });

    it('Incorrect Tags', async () => {

        const falseTag = Faker.lorem.word();
        const place = Fixtures.place();
        place.tags = [falseTag];

        query.payload = place;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            `Tag ${falseTag} does not exist`
        );
    });

    it('Place without links', async () => {

        const place = Fixtures.place();

        query.payload = place;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(201);
    });

    it('Event without place', async () => {

        const group = await db.items.insert(Fixtures.group());
        const event = Fixtures.event();
        event.linked_items = [group.id];

        query.payload = event;
        const response = await server.inject(query);
        expect(response.statusCode).to.equal(400);
        expect(response.result.message).to.equal(
            `Event required to be linked to Place`
        );
    });
});
