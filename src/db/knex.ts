declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var pg: any | undefined;
}

export const pg =
  global.pg ||
  require("knex")({
    client: "pg",
    connection: process.env.DB_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global.pg = pg;
}
