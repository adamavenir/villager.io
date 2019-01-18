'use strict';

const JWT = require('jsonwebtoken');
const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');
const Config = require('getconfig');
const Bcrypt = require('bcrypt');

const swagger = Schema.generate(['401']);

module.exports = {
    description: 'Login user',
    tags: ['api', 'auth'],
    auth: false,
    validate: {
        payload: RequestSchema.authPayload
    },
    handler: async function (request, reply){

        const user = await this.db.users.byIdentifier(
            { username: request.payload.username }
        );
        if (!user) {
            throw Boom.unauthorized('Username/email not found');
        }

        const match = await Bcrypt.compare(request.payload.password, user.password);
        if (!match) {
            throw Boom.unauthorized('Invalid credentials');
        }

        const token = JWT.sign(
            { id: user.id, username: user.username, timestamp: new Date() },
            Config.auth.secret,
            Config.auth.options
        );
        return reply({ data: { token } });

    },
    response: {
        status: {
            200: Schema.token_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
