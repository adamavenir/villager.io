'use strict';

const Boom = require('boom');

const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate(['404']);

module.exports = {
    description: 'Returns users starred items',
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

        const user_starred_items = await this.db.items.getstarredbyuser({ username: user.username });
        return reply({ data: user_starred_items });
    },
    response: {
        status: {
            200: Schema.simple_items_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
