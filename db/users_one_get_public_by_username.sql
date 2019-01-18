SELECT 
users.name,
users.username,
users.email,
users.role
FROM 
users
WHERE   
LOWER(users.username) = LOWER(${username})
