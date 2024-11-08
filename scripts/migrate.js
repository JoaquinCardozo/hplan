const { db } = require('@vercel/postgres');

async function migrate(client) {
  
  // TODO create table users if does not exists (mover de seed.js)

  // Add the column "role" to the table "users" if does not exists
  try {
    await client.sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'athlete';
    `;
    
    console.log('Column "role" added to "users" table');
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  // Add the column "active" to the table "users" if does not exists
  try {
    await client.sql`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT FALSE;
    `;
    
    console.log('Column "active" added to "users" table');
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  // Create the "gyms" table if it doesn't exist
  try {
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

  // Create the "gyms_coaches" table if it doesn't exist
  try {
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

  // Create the "gyms_athletes" table if it doesn't exist
  try {
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

  // Create the "exercises" table if it doesn't exist
  try {
    await client.sql`
      CREATE TABLE IF NOT EXISTS exercises (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        image_url VARCHAR(255),
        video_url VARCHAR(255)
      );
    `;

    console.log(`Created "exercises" table`);
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  // Create the "workouts" table if it doesn't exist
  try {
    await client.sql`
      CREATE TABLE IF NOT EXISTS workouts (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255),
        description VARCHAR(255),
        workout_type VARCHAR(255) NOT NULL,
        workout_value VARCHAR(255)
      );
    `;

    console.log(`Created "workouts" table`);
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  // Create the "workout_exercises" table if it doesn't exist
  try {
    await client.sql`
      CREATE TABLE IF NOT EXISTS workout_exercises (
        workout_id UUID NOT NULL,
        FOREIGN KEY (workout_id) REFERENCES workouts(id),
        position INT NOT NULL,
        PRIMARY KEY (workout_id, position),
        exercise_id UUID NOT NULL,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id),
        reps VARCHAR(255) NOT NULL,
        weight VARCHAR(255),
        notes VARCHAR(255),
        rest VARCHAR(255)
      );
    `;

    console.log(`Created "workout_exercises" table`);
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }


  // Create the "plans" table if it doesn't exist
  try {
    await client.sql`
      CREATE TABLE IF NOT EXISTS plans (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255),
        description VARCHAR(255)
      );
    `;

    console.log(`Created "plans" table`);
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  // Add column "image_url" and "video_url" to "plans" table
  try {
    await client.sql`
      ALTER TABLE plans
      ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);
    `;
    await client.sql`
      ALTER TABLE plans
      ADD COLUMN IF NOT EXISTS video_url VARCHAR(255);
    `;
    
    console.log('Column "image_url" added to "plans" table');
    console.log('Column "video_url" added to "plans" table');
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  // Create the "cicles" table if it doesn't exist
  try {
    await client.sql`
      CREATE TABLE IF NOT EXISTS cicles (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255),
        description VARCHAR(255),
        image_url VARCHAR(255),
        video_url VARCHAR(255),
        plan_id UUID NOT NULL,
        FOREIGN KEY (plan_id) REFERENCES plans(id),
        position INT NOT NULL
      );
    `;

    console.log(`Created "clicles" table`);
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  // Create the "sessions" table if it doesn't exist
  try {
    await client.sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255),
        description VARCHAR(255),
        plan_id UUID NOT NULL,
        FOREIGN KEY (plan_id) REFERENCES plans(id)
      );
    `;

    console.log(`Created "sessions" table`);
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  // Add column "position" to "sessions" table
  try {
    await client.sql`
      ALTER TABLE sessions
      ADD COLUMN IF NOT EXISTS position INT NOT NULL DEFAULT 0;
    `;
    
    console.log('Column "position" added to "sessions" table');
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  // Add column "image_url" and "video_url" to "sessions" table
  try {
    await client.sql`
      ALTER TABLE sessions
      ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);
    `;
    await client.sql`
      ALTER TABLE sessions
      ADD COLUMN IF NOT EXISTS video_url VARCHAR(255);
    `;
    
    console.log('Column "image_url" added to "sessions" table');
    console.log('Column "video_url" added to "sessions" table');
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  // Add column "cicle_id" to "sessions" table
  try {
    await client.sql`
      ALTER TABLE sessions
      ADD COLUMN IF NOT EXISTS cicle_id UUID;
    `;

    await client.sql`
      ALTER TABLE sessions
      ADD CONSTRAINT fk_cicle
      FOREIGN KEY (cicle_id) REFERENCES cicles(id) ON DELETE CASCADE;
    `;
    
    console.log('Column "cicle_id" added to "sessions" table');
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  // Create the "session_blocks" table if it doesn't exist
  try {
    await client.sql`
      CREATE TABLE IF NOT EXISTS session_blocks (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255),
        description VARCHAR(255),
        session_id UUID NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id)
      );
    `;

    console.log(`Created "session_block" table`);
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  // Add column "position" to "session_blocks" table
  try {
    await client.sql`
      ALTER TABLE session_blocks
      ADD COLUMN IF NOT EXISTS position INT NOT NULL DEFAULT 0;
    `;
    
    console.log('Column "position" added to "session_blocks" table');
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  // Add column "video_url" to "session_blocks" table
  try {
    await client.sql`
      ALTER TABLE session_blocks
      ADD COLUMN IF NOT EXISTS video_url VARCHAR(255);
    `;
    
    console.log('Column "video_url" added to "session_blocks" table');
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  // Create the "session_blocks_workouts" table if it doesn't exist
  try {
    await client.sql`
      CREATE TABLE IF NOT EXISTS session_blocks_workouts (
        session_block_id UUID NOT NULL,
        workout_id UUID NOT NULL,
        PRIMARY KEY (session_block_id, workout_id),
        FOREIGN KEY (session_block_id) REFERENCES session_blocks(id),
        FOREIGN KEY (workout_id) REFERENCES workouts(id)
      );
    `;

    console.log(`Created "session_blocks_workouts" table`);
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  // Add column "position" to "session_blocks_workouts" table
  try {
    await client.sql`
      ALTER TABLE session_blocks_workouts
      ADD COLUMN IF NOT EXISTS position INT NOT NULL DEFAULT 0;
    `;
    
    console.log('Column "position" added to "session_blocks_workouts" table');
  } catch (error) {
    console.error('Error migrating database:', error);
    throw error;
  }

  // Delete old primary key from "session_blocks_workouts" and creates a new one using position
  try {
    await client.sql`
      ALTER TABLE session_blocks_workouts
      DROP CONSTRAINT IF EXISTS session_blocks_workouts_pkey;

      ALTER TABLE session_blocks_workouts
      ADD PRIMARY KEY (session_block_id, position);
    `;
    
    console.log('Primary key updated on "session_blocks_workouts" table');
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
