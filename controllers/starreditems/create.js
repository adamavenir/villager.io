'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['400','401', '404','409']);

module.exports = {
    description: 'Add star to an item',
    tags: ['api', 'items'],
    validate: {
        payload: RequestSchema.starredItemPayload,
        headers: RequestSchema.tokenRequired
    },
    handler: async function (request, reply) {

        const item = await this.db.items.findOne({ id: request.payload.item_id });

        if (!item) {
            throw Boom.notFound('Item not found');
        }

        const credentials = request.auth.credentials;
        const { username } = credentials;
        const relation = await this.db.starred_items.findOne(
            { item_id: item.id, username }
        );
        if (relation) {
            throw Boom.conflict(`${username} has already starred this item!`);
        }

        await this.db.starred_items.insert({ item_id: item.id, username });
        return reply({ message: 'Item starred by user' }).code(201);
    },
    response: {
        status: {
            201: Schema.message_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
