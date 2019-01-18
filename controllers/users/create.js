'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');
const Bcrypt = require('bcrypt');

const swagger = Schema.generate(['409']);

module.exports = {
    description: 'Create a new user',
    tags: ['api', 'users'],
    auth: false,
    validate: {
        payload: RequestSchema.userPayload
    },
    handler: async function (request, reply) {

        const takenUsername = await this.db.users.findOne({ username: request.payload.username }, ['username']);
        if (takenUsername) {
            throw Boom.conflict(`Username ${takenUsername.username} already exists`);
        }

        const takenEmail = await this.db.users.findOne({ email: request.payload.email }, ['email']);
        if (takenEmail) {
            throw Boom.conflict(`Email ${takenEmail.email} already exists`);
        }

        request.payload.password = await Bcrypt.hash(request.payload.password, 10);

        const user = await this.db.users.insert(request.payload);
        delete user.password;
        return reply({ data: user }).code(201);
    },
    response: {
        status: {
            201: Schema.private_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
