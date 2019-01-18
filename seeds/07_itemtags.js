'use strict';

exports.seed = function seed(knex, Promise) {

    const tableName = 'item_tags';
    const rows = [
        {
            tag_name: 'kid-friendly',
            item_id: '36908dc7-f097-4d4a-9491-76d3c9336e1e'
        },
        {
            tag_name: 'restaurants',
            item_id: '1479e99f-7b35-49c1-ad2d-ed1686c36b4d'
        },
        {
            tag_name: 'outdoors',
            item_id: '33e0bebb-6e75-403f-b55d-b4e47b33638c'
        },
        {
            tag_name: 'kid-friendly',
            item_id: '33e0bebb-6e75-403f-b55d-b4e47b33638c'
        },
        {
            tag_name: 'university',
            item_id: 'c22355cb-4eaf-4bda-a066-5b978b9c3cc0'
        },
        {
            tag_name: 'university',
            item_id: '36908dc7-f097-4d4a-9491-76d3c9336e1e'
        },
        {
            tag_name: 'restaurants',
            item_id: '8c1e4518-0d0b-46b0-a9c1-1f3345e57bcd'
        },
        {
            tag_name: 'restaurants',
            item_id: '53c46fd1-70c8-4c06-b862-66c113d9c042'
        },
        {
            tag_name: 'restaurants',
            item_id: 'c1da1798-0a44-4d75-8ccb-bb6c042430a1'
        },
        {
            tag_name: 'kid-friendly',
            item_id: '8c1e4518-0d0b-46b0-a9c1-1f3345e57bcd'
        }

    ];

    return (
        knex(tableName)
            .del()
            .then(() => {

                return (
                    knex.insert( rows )
                        .into( tableName )
                );
            })
    );


};
