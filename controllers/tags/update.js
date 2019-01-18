'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['401', '404', '400']);

module.exports = {
    description: 'Update tag',
    tags: ['api', 'tags'],
    validate: {
        params: RequestSchema.tagParam,
        payload: RequestSchema.tagPayload,
        headers: RequestSchema.tokenRequired
    },
    handler: async function (request, reply) {

        const credentials = request.auth.credentials;

        if (credentials.role === 'user') {
            throw Boom.unauthorized('Not permitted to edit tags');
        }

        let tag = await this.db.tags.findOne({ name: request.params.name });
        if (!tag){
            throw Boom.notFound('No tag by that name');
        }

        tag = await this.db.tags.updateOne({ name: request.params.name }, { name: request.payload.name });

        return reply({ data: tag });
    },
    response: {
        status: {
            200: Schema.tag_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
