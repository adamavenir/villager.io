SELECT
    users.email
FROM
    users
WHERE
    LOWER(users.email) = LOWER(${email})