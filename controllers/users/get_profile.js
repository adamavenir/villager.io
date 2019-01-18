'use strict';

const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate([]);

module.exports = {
    description: 'Returns private user profile',
    tags: ['api', 'users'],
    validate: {
        headers: RequestSchema.tokenRequired
    },
    handler: async function (request, reply) {

        const credentials = request.auth.credentials;
        const user = await this.db.users.byusername({ username: credentials.username });

        return reply({ data: user });
    },
    response: {
        status: {
            200: Schema.private_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
