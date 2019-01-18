'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate([401]);

module.exports = {
    description: 'Returns all users',
    tags: ['api', 'admin'],
    validate: { headers: RequestSchema.tokenRequired },

    handler: async function (request, reply) {

        if (request.auth.credentials.role !== 'admin') {
            throw Boom.unauthorized();
        }

        const users = await this.db.users.getall();

        return reply({ data: users });
    },
    response: {
        status: {
            200: Schema.private_users_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
