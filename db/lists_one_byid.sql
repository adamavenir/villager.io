SELECT
lists.id,
lists.name,
lists.description,
lists.owner
FROM
lists
WHERE
lists.id = ${id}