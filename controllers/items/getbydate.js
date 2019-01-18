'use strict';

const Schema = require('../../lib/responseSchema');
const RequestSchema = require('../../lib/requestSchema');

const swagger = Schema.generate([]);

module.exports = {
    description: 'Returns all items created within time period given.',
    tags: ['api', 'public'],
    auth: false,
    validate: {
        params: RequestSchema.daysParam
    },
    handler: async function (request, reply) {

        const { days } = request.params;
        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);

        const foundItems = await this.db.items.date_query({ fromDate });

        /* Add pagination here */
        return reply({ data: foundItems });
    },
    response: {
        status: {
            200: Schema.items_response
        }
    },
    plugins: {
        'hapi-swagger': swagger
    }
};
