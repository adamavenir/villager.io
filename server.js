'use strict';

const Config = require('getconfig');
const Hapi = require('hapi');
const Muckraker = require('muckraker');


//const UserActivity = require('./lib/user_activity');
const Pkg = require('./package.json');

// Config.hapi.cache.engine = require(Config.hapi.cache.engine);

const server = new Hapi.Server(Config.hapi);
const db = new Muckraker(Config.db);

// const userActivity = new UserActivity(db);


server.connection(Config.connection.public);
//$lab:coverage:off$
server.on('request-error', (err, m) => {

    if (err) {
        console.log(err.stack);
        console.log(m.stack);
    }
});
//$lab:coverage:on$

exports.db = db; //For tests to pick up

exports.server = server.register([{
    register: require('inert')
}, {
    register: require('vision')
}, {
    register: require('hapi-swagger'),
    options: {
        grouping: 'tags',
        //This may just all need to go in config instead
        info: {
            title: Pkg.description,
            version: Pkg.version,
            contact: {
                name: 'Villagers'
            },
            license: {
                name: Pkg.license
            }
        },
        tags: [
            { name: 'public', description: 'Routes that do not require authentication' }
        ]
    }
}, {
    register: require('hapi-auth-jwt2')
}
// ,{
//   register: require('./lib/log_user')
// },
]).then(async () => {

    await server.bind({ db });
    await server.route(require('./routes'));

    server.auth.strategy('jwt','jwt', {

        key: Config.auth.secret,
        verifyOptions: {
            algorithms: [Config.auth.options.algorithm]
        },
        validateFunc: async (decoded, request, callback) => {

            const user = await db.users.validate(decoded);
            //$lab:coverage:off$
            if (!user) {
                return callback(null, false); //user is not valid
            }

            //$lab:coverage:on$
            const logout = user.logout.getTime();
            const timestamp = Date.parse(decoded.timestamp);
            if (timestamp < logout) {

                return callback(null, false); //user is not valid
            }

            return callback(null, true, user); //user is valid
        }
    });

    server.auth.default('jwt');
}).then(async () => {

    // coverage disabled because module.parent is always defined in tests
    // $lab:coverage:off$
    if (module.parent) {
        await server.initialize();

        return server;
    }

    await server.start();
    //Disable CSP for this content that is not user controlled
    //const doc_route = server.match('get', '/documentation');
    server.connections.forEach((connection) => {

        console.log(`${connection.info.uri}`);
        server.log(['info', 'startup'], `${connection.info.uri} ${connection.settings.labels}`);
    });
    // $lab:coverage:on$
}).catch((err) => {

    // coverage disabled due to difficulty in faking a throw
    // $lab:coverage:off$
    console.error(err.stack || err);
    process.exit(1);
    // $lab:coverage:on$

});
