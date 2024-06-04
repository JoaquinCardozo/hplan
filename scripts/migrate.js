const { db } = require('@vercel/postgres');

async function migrate(client) {
  try {
    // Add the column "role" to the table "users" if does not exists
    const createColumn = await client.sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'athlete';
    `;
    
    console.log('Column "role" added to "users" table');

    return createColumn;
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }
}

async function main() {
  const client = await db.connect();

  await migrate(client);
  await client.end();
}

main().catch((err) => {
  console.error(
    'An error occurred while migrating the database:',
    err,
  );
});
