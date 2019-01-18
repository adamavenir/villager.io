'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['400','401','404']);

module.exports = {
    description: 'Add list item',
    tags: ['api', 'lists'],
    validate: {
        payload: RequestSchema.listItemPayload,
        headers: RequestSchema.tokenRequired
    },
    handler: async function (request, reply) {

        const credentials = request.auth.credentials;
        const { list_id, item_id } = request.payload;
        const foundlist = await this.db.lists.findOne({ id: list_id });
        const founditem = await this.db.items.findOne({ id: item_id });

        if (!founditem) {
            throw Boom.notFound('Item not found');
        }

        if (!foundlist) {
            throw Boom.notFound('List not found');
        }

        if (foundlist.owner !== credentials.username) {
            throw Boom.unauthorized();
        }

        const foundlistitem = await this.db.list_items.findOne({ item_id, list_id });

        await this.db.list_items.destroy({ id: foundlistitem.id });
        return reply({ message: 'Item deleted from list' });
    },
    response: {
        status: {
            200: Schema.message_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
