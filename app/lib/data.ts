import { sql } from '@vercel/postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  User,
  Gym,
  Exercise,
  ExerciseName,
  WorkoutWithExercises,
  Revenue,
  Plan
} from './definitions';
import { formatCurrency } from './utils';
import { unstable_noStore as noStore } from 'next/cache';

export async function fetchAllGyms() {
  noStore();
  try {
    const gyms = await sql<Gym>`
      SELECT *
      FROM gyms`;
    return gyms.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all gyms.');
  }
}

export async function fetchLatestGymAthletes(gym_id: string) {
  noStore();
  try {
    const users = await sql<User>`
      SELECT users.name, users.email
      FROM users
      JOIN gyms_athletes ON gyms_athletes.gym_id = ${gym_id}
      WHERE users.role = 'athlete'
      ORDER BY users.name DESC
      LIMIT 5`;
    return users.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest ahtletes for the gym.');
  }
}

export async function fetchLatestGymCoaches(gym_id: string) {
  noStore();
  try {
    const users = await sql<User>`
      SELECT users.name, users.email
      FROM users
      JOIN gyms_athletes ON gyms_athletes.gym_id = ${gym_id}
      WHERE users.role = 'coach'
      ORDER BY users.name DESC
      LIMIT 5`;
    return users.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest coaches for the gym.');
  }
}

// EXERCISES

export async function fetchExercisesNames(){
  noStore();
  try {
    const data = await sql<ExerciseName>`
      SELECT id, name
      FROM exercises
      ORDER BY name ASC
    `;

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch exercises');
  }
}

const EXERCISES_PER_PAGE = 10;
export async function fetchFilteredExercisesByPage(query: string, currentPage: number){
  const page_offset = (currentPage - 1) * EXERCISES_PER_PAGE;
  noStore();
  try {
    const exercises = await sql<Exercise>`
      SELECT
        exercises.id,
        exercises.name,
        exercises.description,
        exercises.image_url,
        exercises.video_url
      FROM exercises
      WHERE
        exercises.name ILIKE ${`%${query}%`} OR
        exercises.description ILIKE ${`%${query}%`}
      ORDER BY exercises.name ASC
      LIMIT ${EXERCISES_PER_PAGE} OFFSET ${page_offset}
    `;
    
    return exercises.rows;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch exercises');
  }
}

export async function fetchExercisesTotalPages(query: string){
  noStore();
  try {
    const count = await sql`
      SELECT COUNT(*)
      FROM exercises
      WHERE
        exercises.name ILIKE ${`%${query}%`} OR
        exercises.description ILIKE ${`%${query}%`}
    `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / EXERCISES_PER_PAGE);
    return totalPages;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of exercises');
  }
}

export async function fetchExerciseById(id: string){
  noStore();
  try {
    const data = await sql<Exercise>`
      SELECT
        exercises.id,
        exercises.name,
        exercises.description,
        exercises.image_url,
        exercises.video_url
      FROM exercises
      WHERE exercises.id = ${id};
    `;
  
    return data.rows[0];

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch exercise');
  }
}


const WORKOUTS_PER_PAGE = 10;
export async function fetchFilteredWorkoutsByPage(query: string, currentPage: number){
  const page_offset = (currentPage - 1) * WORKOUTS_PER_PAGE;
  noStore();
  try {
    const workoutsWithExercises = await sql`
      WITH filtered_workouts AS (
        SELECT
          workouts.id
        FROM workouts
        WHERE
          workouts.name ILIKE ${`%${query}%`} OR
          workouts.description ILIKE ${`%${query}%`}
        LIMIT ${WORKOUTS_PER_PAGE} OFFSET ${page_offset}
      )
      SELECT
        workouts.id AS workout_id,
        workouts.name AS workout_name,
        workouts.description AS workout_description,
        workouts.workout_type,
        workouts.workout_value,
        workout_exercises.exercise_id,
        workout_exercises.reps,
        workout_exercises.weight,
        workout_exercises.rest,
        workout_exercises.notes,
        workout_exercises.position,
        exercises.name AS exercise_name,
        exercises.image_url AS exercise_image_url
      FROM workouts
      LEFT JOIN workout_exercises ON workouts.id = workout_exercises.workout_id
      LEFT JOIN exercises ON workout_exercises.exercise_id = exercises.id
      WHERE workouts.id IN (
        SELECT id
        FROM filtered_workouts
      )
      ORDER BY workouts.name, workout_exercises.position ASC
    `;
    
    const groupedWorkouts: Record<string, any> = {};

    workoutsWithExercises.rows.forEach(row => {
      const workoutId = row.workout_id;

      if (!groupedWorkouts[workoutId]) {
        groupedWorkouts[workoutId] = {
          id: workoutId,
          name: row.workout_name,
          description: row.workout_description,
          workout_type: row.workout_type,
          workout_value: row.workout_value,
          exercises: []
        };
      }

      groupedWorkouts[workoutId].exercises.push({
        exercise_id: row.exercise_id,
        reps: row.reps,
        weight: row.weight,
        rest: row.rest,
        notes: row.notes,
        position: row.position,
        name: row.exercise_name,
        image_url: row.exercise_image_url
      });
    });

    return Object.values(groupedWorkouts);

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch workouts');
  }
}

export async function fetchWorkoutsTotalPages(query: string){
  noStore();
  try {
    const count = await sql`
      SELECT COUNT(*)
      FROM workouts
      WHERE
        workouts.name ILIKE ${`%${query}%`} OR
        workouts.description ILIKE ${`%${query}%`}
    `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / WORKOUTS_PER_PAGE);
    return totalPages;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of workouts');
  }
}

export async function fetchWorkoutById(id: string) {
  noStore();
  try {
    const data = await sql`
      SELECT
        workouts.id,
        workouts.name,
        workouts.description,
        workouts.workout_type,
        workouts.workout_value,
        exercises.name AS exercise_name,
        exercises.image_url AS exercise_image_url,
        workout_exercises.exercise_id,
        workout_exercises.position,
        workout_exercises.reps,
        workout_exercises.notes,
        workout_exercises.weight,
        workout_exercises.rest
      FROM workouts
      LEFT JOIN workout_exercises ON workouts.id = workout_exercises.workout_id
      LEFT JOIN exercises ON workout_exercises.exercise_id = exercises.id
      WHERE workouts.id = ${id};
    `;
  
    if (data.rows.length === 0) {
      return null;
    }

    const workoutWithExercises: WorkoutWithExercises = {
      id: data.rows[0].id,
      name: data.rows[0].name,
      description: data.rows[0].description,
      workout_type: data.rows[0].workout_type,
      workout_value: data.rows[0].workout_value,
      exercises: []
    };

    // Recorremos todas las filas para agregar los ejercicios
    data.rows.forEach(row => {
      if (row.exercise_id) {
        workoutWithExercises.exercises.push({
          workout_id: data.rows[0].id,
          exercise_id: row.exercise_id,
          name: row.exercise_name,
          position: row.position,
          reps: row.reps,
          weight: row.weight,
          rest: row.rest,
          notes: row.notes,
          image_url: row.exercise_image_url
        });
      }
    });

    return workoutWithExercises;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch workout');
  }
}

// PLANS

const PLANS_PER_PAGE = 20;
export async function fetchFilteredPlansByPage(query: string, currentPage: number){
  const page_offset = (currentPage - 1) * PLANS_PER_PAGE;
  noStore();
  try {
    const plans = await sql<Exercise>`
      SELECT
        id, name, description
      FROM plans
      WHERE
        name ILIKE ${`%${query}%`} OR
        description ILIKE ${`%${query}%`}
      ORDER BY name ASC
      LIMIT ${PLANS_PER_PAGE} OFFSET ${page_offset}
    `;
    
    return plans.rows;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch plans');
  }
}

export async function fetchPlansTotalPages(query: string){
  noStore();
  try {
    const count = await sql`
      SELECT COUNT(*)
      FROM plans
      WHERE
        name ILIKE ${`%${query}%`} OR
        description ILIKE ${`%${query}%`}
    `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / PLANS_PER_PAGE);
    return totalPages;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of plans');
  }
}

export async function fetchPlanById(id: string){
  noStore();
  try {
    const data = await sql`
      SELECT
        plans.id,
        plans.name,
        plans.description,
        sessions.id AS session_id,
        sessions.name AS session_name,
        sessions.description AS session_description
      FROM plans
      LEFT JOIN sessions ON sessions.plan_id = plans.id
      WHERE plans.id = ${id};
    `;
  
    if (data.rows.length === 0) {
      return null;
    }

    const planWithSessions: Plan = {
      id: data.rows[0].id,
      name: data.rows[0].name,
      description: data.rows[0].description,
      sessions: []
    };

    data.rows.forEach(row => {
      if (row.session_id) {
        planWithSessions.sessions.push({
          id: row.session_id,
          name: row.session_name,
          description: row.session_description,
          plan_id: data.rows[0].id,
          blocks: []
        });
      }
    });

    return planWithSessions;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch plan');
  }
}



// OLD

export async function fetchRevenue() {
  // Add noStore() here to prevent the response from being cached.
  // This is equivalent to in fetch(..., {cache: 'no-store'}).
  noStore();
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)

    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue>`SELECT * FROM revenue`;

    console.log('Data fetch completed after 3 seconds.');

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  noStore();
  try {
    const data = await sql<LatestInvoiceRaw>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  noStore();
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  noStore();
  try {
    const invoices = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  noStore();
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  noStore();
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  noStore();
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  noStore();
  try {
    const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string) {
  noStore();
  try {
    const user = await sql`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0] as User;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
