'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['400', '401', '404']);

module.exports = {
    description: 'Delete tag category from use and all items',
    tags: ['api', 'tags'],
    validate: {
        payload: RequestSchema.tagPayload,
        headers: RequestSchema.tokenRequired
    },
    handler: async function (request, reply) {

        const credentials = request.auth.credentials;
        if (credentials.role === 'user') {
            throw Boom.unauthorized();
        }

        if (!await this.db.tags.findOne({ name: request.payload.name })) {
            throw Boom.notFound('Tag doesn\'t exist');
        }

        await this.db.tags.destroy({ name: request.payload.name });

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
