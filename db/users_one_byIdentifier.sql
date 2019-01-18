SELECT
    users.id,
    users.username,
    users.password
FROM
    users
WHERE
    LOWER(users.username) = LOWER(${username})
OR
    LOWER(users.email) = LOWER(${username})