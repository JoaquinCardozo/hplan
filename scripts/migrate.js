const { db } = require('@vercel/postgres');

async function migrate(client) {
  try {
    // Add the column "role" to the table "users" if does not exists
    await client.sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'athlete';
    `;
    
    console.log('Column "role" added to "users" table');
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  try {
    // Add the column "active" to the table "users" if does not exists
    await client.sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT FALSE;
    `;
    
    console.log('Column "active" added to "users" table');
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  try {
    // Create the "gyms" table if it doesn't exist
    await client.sql`
      CREATE TABLE IF NOT EXISTS gyms (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      );
    `;

    console.log(`Created "gyms" table`);
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  try {
    // Create the "gyms_coaches" table if it doesn't exist
    await client.sql`
      CREATE TABLE IF NOT EXISTS gyms_coaches (
        coach_id UUID NOT NULL,
        gym_id UUID NOT NULL,
        PRIMARY KEY (coach_id, gym_id),
        FOREIGN KEY (coach_id) REFERENCES users(id),
        FOREIGN KEY (gym_id) REFERENCES gyms(id)
      );
    `;

    console.log(`Created "gyms_coaches" table`);
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  try {
    // Create the "gyms_athletes" table if it doesn't exist
    await client.sql`
      CREATE TABLE IF NOT EXISTS gyms_athletes (
        athlete_id UUID NOT NULL,
        gym_id UUID NOT NULL,
        PRIMARY KEY (athlete_id, gym_id),
        FOREIGN KEY (athlete_id) REFERENCES users(id),
        FOREIGN KEY (gym_id) REFERENCES gyms(id)
      );
    `;

    console.log(`Created "gyms_athletes" table`);
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
