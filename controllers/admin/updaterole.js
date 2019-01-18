'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['401', '404']);

module.exports = {
    description: 'update user role',
    tags: ['api', 'admin'],
    validate: {
        params: RequestSchema.usernameParam,
        payload: RequestSchema.updateRolePayload,
        headers: RequestSchema.tokenRequired
    },

    handler: async function (request, reply) {

        const credentials = request.auth.credentials;

        if (credentials.role === 'user') {
            throw Boom.unauthorized('Unauthorized to change roles of users.');
        }
        else if (credentials.role === 'mod') {
            if (request.payload.role === 'admin') {
                throw Boom.unauthorized('Unauthorized to set role of admin.');
            }
        }

        let foundUser = await this.db.users.findOne({ username: request.params.username });
        if (!foundUser) {
            throw Boom.notFound('Username not found.');
        }

        await this.db.users.updateOne({ id: foundUser.id }, request.payload);
        foundUser = await this.db.users.get_public_by_username({ username: request.params.username });

        return reply({ data: foundUser });
    },
    response: {
        status: {
            200: Schema.user_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
