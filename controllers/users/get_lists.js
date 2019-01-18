'use strict';

const Boom = require('boom');

const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['404']);

module.exports = {
    description: 'Returns users lists',
    tags: ['api', 'users', 'public'],
    auth: false,
    validate: {
        params: RequestSchema.usernameParam
    },
    handler: async function (request, reply) {

        const user = await this.db.users.findOne({ username: request.params.username });
        if (!user) {
            throw Boom.notFound();
        }

        const userlists = await this.db.lists.getAllByOwner({ owner: user.username });
        return reply({ data: userlists });
    },
    response: {
        status: {
            200: Schema.lists_no_owner_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
