'use strict';

exports.seed = function seed( knex, Promise ) {

    const tableName = 'users';
    const rows = [
        {
            id: 'e129cc9e-460e-4e52-9573-92e3ff0007ef',
            name: 'Roberto Pierini',
            username: 'Robfrikaans',
            password: '$2b$10$k4yg2ZvJxbgsJyrYnX10jOq4aqBOxH6SlgfGhK3eom2klJA5kIygy',
            email: 'Rob@email.com',
            bio: 'yup',
            role: 'admin',
            created_at: new Date(),
            updated_at: new Date(),
            logout: new Date()
        },
        {
            id: '8865b22c-a732-4381-9ba6-e9bc32fc9b99',
            name: 'Randolph',
            username: 'Randolphin',
            password: '$2b$10$k4yg2ZvJxbgsJyrYnX10jOq4aqBOxH6SlgfGhK3eom2klJA5kIygy',
            email: 'Randolph@email.com',
            bio: 'A connoisseur of the finer things in life',
            role: 'user',
            created_at: new Date(),
            updated_at: new Date(),
            logout: new Date()
        },
        {
            id: 'c06f747f-81cd-4033-8752-d284cd1c1706',
            name: 'Leif',
            username: 'modérateur',
            password: '$2b$10$k4yg2ZvJxbgsJyrYnX10jOq4aqBOxH6SlgfGhK3eom2klJA5kIygy',
            email: 'Leif@email.com',
            bio: 'I\'m sworn to carry your burdens',
            role: 'mod',
            created_at: new Date(),
            updated_at: new Date(),
            logout: new Date()
        }
    ];

    return (
        knex(tableName)
            // Empty the table (DELETE)
            .del()
            .then(() => {

                return (
                    knex.insert( rows )
                        .into(tableName)
                );
            })
    );

};
