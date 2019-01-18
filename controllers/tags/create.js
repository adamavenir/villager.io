'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['400', '409', '401']);

module.exports = {
    description: 'Add a category to tag items with',
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

        if (await this.db.tags.findOne(request.payload)) {
            throw Boom.conflict(`Tag ${ request.payload.name } already exists`);
        }

        await this.db.tags.insert(request.payload);

        return reply({ message: 'Tag added successfully' }).code(201);
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
