'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['404']);

module.exports = {
    description: 'Deletes item from users list of starred items',
    tags: ['api', 'items'],
    validate: {
        payload: RequestSchema.starredItemPayload,
        headers: RequestSchema.tokenRequired
    },
    handler: async function (request, reply) {

        const { item_id } = request.payload;
        const credentials = request.auth.credentials;
        const { username } = credentials;

        const relation = await this.db.starred_items.findOne({ username, item_id });

        /**
         * If relation does not exist, throw an error.
         * Else, remove relation from the table and output a message.
         */
        if (!relation) {
            throw Boom.notFound('Item not starred by user');
        }

        await this.db.starred_items.destroy({ username, item_id });
        return reply(null).code(204);
    },
    response: {
        status: {
            204: Schema.null_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
