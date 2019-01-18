SELECT
users.id,
users.name,
users.email,
users.username,
users.bio,
users.role,
users.logout,
users.created_at,
users.updated_at
FROM
users
WHERE
LOWER(users.username) = LOWER(${username})