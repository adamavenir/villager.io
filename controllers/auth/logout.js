'use strict';

const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate([]);

module.exports = {
    description: 'Log out',
    tags: ['api', 'auth'],
    validate: {
        headers: RequestSchema.tokenRequired
    },
    handler: async function (request, reply) {

        const user = request.auth.credentials;
        const logout = new Date();

        await this.db.users.updateOne({ id: user.id }, { logout });

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
