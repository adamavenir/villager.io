'use strict';

const Boom = require('boom');
const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['400', '401', '404']);

module.exports = {
    description: 'Deletes user from table',
    tags: ['api', 'mod'],
    validate: {
        params: RequestSchema.usernameParam,
        headers: RequestSchema.tokenRequired
    },
    handler: async function (request, reply) {

        // -------------------- Variables --------------------------------------------- //
        const credentials = request.auth.credentials;
        const user = await this.db.users.findOne({ username: request.params.username },['id']);
        // -------------------- Checks if user exists in table ------------------- //

        if (!user) {
            throw Boom.notFound();
        }

        if (credentials.role === 'admin' || credentials.id === user.id) {
            await this.db.users.destroy({ id: user.id });
        }
        else {
            throw Boom.unauthorized('The user is not permitted to delete this user!');
        }

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
