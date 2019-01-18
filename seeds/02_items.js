'use strict';

exports.seed = function seed(knex, Promise) {

    const tableName = 'items';
    const rows = [
        {//1
            id: '36908dc7-f097-4d4a-9491-76d3c9336e1e',
            name: 'WSUTC',
            location: '2710 Crimson Way, Richland, WA 99354',
            type: 'place'
        },
        {//2
            id: '1479e99f-7b35-49c1-ad2d-ed1686c36b4d',
            name: 'Dive in Diner',
            location: '2000 Fire ln, Flavor Town, USA',
            type: 'place'
        },
        {//3
            id: '33e0bebb-6e75-403f-b55d-b4e47b33638c',
            name: 'Howard Amon Park',
            location: '900 Amon Park Rd N, Richland, WA',
            type: 'activity'
        },
        {//4
            id: 'c22355cb-4eaf-4bda-a066-5b978b9c3cc0',
            name: 'Coding Cougs',
            location: '2710 Crimson Way, Richland, WA 99354',
            type: 'group'
        },
        {//5
            id: '8c1e4518-0d0b-46b0-a9c1-1f3345e57bcd',
            name: 'Casa Mia',
            location: '607 George Washington Way, Richland, WA 99354',
            type: 'place'
        },
        {//6
            id: '53c46fd1-70c8-4c06-b862-66c113d9c042',
            name: 'Bangkok Thai Cuisine',
            location: '8318 W Gage Blvd, Kennewick, WA 99336',
            type: 'place'
        },
        {//7
            id: 'c1da1798-0a44-4d75-8ccb-bb6c042430a1',
            name: 'Fiesta Mexican Restaurant & Catering',
            location: '8524 W Gage Blvd #130, Kennewick, WA 99336',
            type: 'place'
        },
        {//8
            id: '0d6793ce-1d99-4948-bcdf-a1e16c5beb31',
            name: 'Fiesta Mexican Restaurant',
            location: '8524 W Gage Blvd #130, Kennewick, WA 99336',
            type: 'place'
        },
        {//9
            id: 'a4270fcf-db4e-4eac-b96f-669e96c3f000',
            name: 'Go To Dive in Diner',
            location: '2000 Fire ln, Flavor Town, USA',
            type: 'event',
            start_date: '01/22/2018 10:00',
            end_date: '01/22/2018 10:30'
        }
    ];

    return (
        knex(tableName)
            .del()
            .then(() => {

                return (
                    knex.insert(rows)
                        .into(tableName)
                );
            })
    );
};
