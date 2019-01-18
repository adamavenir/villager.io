'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['400','404']);

module.exports = {
    description: 'Add list item',
    tags: ['api', 'lists'],
    validate: {
        payload: RequestSchema.listItemPayload,
        headers: RequestSchema.tokenRequired
    },
    handler: async function (request, reply) {

        const credentials = request.auth.credentials;
        const founditem = await this.db.items.findOne({ id: request.payload.item_id });
        const foundlist = await this.db.lists.findOne({ id: request.payload.list_id });

        if (!founditem) {
            throw Boom.notFound('Item not found');
        }

        if (!foundlist) {
            throw Boom.notFound('List not found');
        }

        if (foundlist.owner !== credentials.username) {
            throw Boom.unauthorized();
        }

        await this.db.list_items.insert(request.payload);
        return reply({ message: 'item inserted into list' }).code(201);
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
