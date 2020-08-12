const { Client } = require("pg");

(async () => {
  try {
    let client = new Client();

    await client.connect();

    const query =
      "CREATE TABLE IF NOT EXISTS messages (id SERIAL PRIMARY KEY, username varchar, message varchar,  image varchar, date varchar)";

    const res = await client.query(query);

    await client.end();
  } catch (err) {
    console.error(err);
  }
})();

module.exports = {
  getAllMessages: async () => {
    try {
      let client = new Client();

      await client.connect();

      const subquery = "SELECT * FROM messages ORDER BY date DESC LIMIT 50";
      const query = `SELECT * FROM (${subquery}) as msgs ORDER BY date`;

      const res = await client.query(query);

      await client.end();

      return res.rows;
    } catch (err) {
      console.log(err);
    }
  },
  saveMessage: async (newMessage) => {
    try {
      let client = new Client();

      await client.connect();

      const { username, message, image, date } = newMessage;
      const query = `
        INSERT INTO messages (username, message, image, date) 
        VALUES ('${username}', '${message || ""}', '${image || ""}', '${date}')
      `;

      const res = await client.query(query);

      await client.end();
    } catch (err) {
      console.log(err);
    }
  },
};
