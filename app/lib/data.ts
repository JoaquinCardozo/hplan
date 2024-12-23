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
  Workout,
  Revenue,
  Plan,
  Session,
  Cicle
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
        exercises.description AS exercise_description,
        exercises.image_url AS exercise_image_url,
        exercises.video_url AS exercise_video_url,
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

    const workoutWithExercises: Workout = {
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
          description: row.exercise_description,
          position: row.position,
          reps: row.reps,
          weight: row.weight,
          rest: row.rest,
          notes: row.notes,
          image_url: row.exercise_image_url,
          video_url: row.exercise_video_url
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

export async function fetchPlanById(id: string) {
  noStore();
  try {
    const data = await sql`
      SELECT
        plans.id,
        plans.name,
        plans.description,
        plans.image_url,
        plans.video_url,
        cicles.id AS cicle_id,
        cicles.name AS cicle_name,
        cicles.description AS cicle_description,
        cicles.position AS cicle_position,
        cicles.image_url AS cicle_image_url,
        cicles.video_url AS cicle_video_url
      FROM plans
      LEFT JOIN cicles ON cicles.plan_id = plans.id
      WHERE plans.id = ${id};
    `;
  
    if (data.rows.length === 0) {
      return null;
    }

    // Crear objeto del plan
    const planWithCicles: Plan = {
      id: data.rows[0].id,
      name: data.rows[0].name,
      description: data.rows[0].description,
      image_url: data.rows[0].image_url,
      video_url: data.rows[0].video_url,
      cicles: []
    };

    // Usamos un mapa auxiliar para organizar los ciclos y evitar duplicados
    const cicleMap = new Map();

    data.rows.forEach(row => {
      // Si existe el ciclo
      if (row.cicle_id) {
        // Si el ciclo ya está en el mapa, simplemente obtenlo
        let cicle = cicleMap.get(row.cicle_id);

        if (!cicle) {
          // Si no existe, creamos el ciclo y lo añadimos al mapa
          cicle = {
            id: row.cicle_id,
            name: row.cicle_name,
            description: row.cicle_description,
            position: row.cicle_position,
            image_url: row.cicle_image_url,
            video_url: row.cicle_video_url,
            plan_id: row.id,
            sessions: []
          };
          cicleMap.set(row.cicle_id, cicle);
          planWithCicles.cicles.push(cicle);
        }
      }
    });

    return planWithCicles;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch plan');
  }
}

export async function fetchCicleById(id: string){
  noStore();
  try {
    const data = await sql`
      SELECT
        cicles.id,
        cicles.name,
        cicles.description,
        cicles.position,
        cicles.image_url,
        cicles.video_url,
        cicles.plan_id,
        sessions.id AS session_id,
        sessions.name AS session_name,
        sessions.description AS session_description,
        sessions.position AS session_position,
        sessions.image_url AS session_image_url,
        sessions.video_url AS session_video_url
      FROM cicles
      LEFT JOIN sessions ON sessions.cicle_id = cicles.id
      WHERE cicles.id = ${id};
    `;
  
    if (data.rows.length === 0) {
      return null;
    }

    const cicleWithSessions: Cicle = {
      id: data.rows[0].id,
      name: data.rows[0].name,
      description: data.rows[0].description,
      position: data.rows[0].position,
      image_url: data.rows[0].image_url,
      video_url: data.rows[0].video_url,
      plan_id: data.rows[0].plan_id,
      sessions: []
    };

    data.rows.forEach(row => {
      if (row.session_id) {
        cicleWithSessions.sessions.push({
          id: row.session_id,
          name: row.session_name,
          description: row.session_description,
          position: row.session_position,
          image_url: row.session_image_url,
          video_url: row.session_video_url,
          cicle_id: data.rows[0].id,
          plan_id: data.rows[0].plan_id,
          blocks: []
        });
      }
    });

    return cicleWithSessions;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch plan');
  }
}

export async function fetchSessionById(id: string) {
  noStore();
  try {
    const data = await sql`
      SELECT
        sessions.id,
        sessions.name,
        sessions.description,
        sessions.plan_id,
        sessions.cicle_id,
        sessions.position,
        sessions.image_url,
        sessions.video_url,
        session_blocks.id AS block_id,
        session_blocks.name AS block_name,
        session_blocks.description AS block_description,
        session_blocks.video_url AS block_video_url,
        session_blocks.position AS block_position,
        session_blocks_workouts.position AS workout_position,
        workouts.id AS workout_id,
        workouts.workout_type AS workout_type,
        workouts.description AS workout_description,
        workout_exercises.exercise_id AS exercise_id,
        workout_exercises.position AS exercise_position,
        workout_exercises.reps AS exercise_reps,
        workout_exercises.weight AS exercise_weight,
        workout_exercises.notes AS exercise_notes,
        workout_exercises.rest AS exercise_rest,
        exercises.name AS exercise_name,
        exercises.description AS exercise_description,
        exercises.image_url AS exercise_image_url,
        exercises.video_url AS exercise_video_url
      FROM sessions
      LEFT JOIN session_blocks ON session_blocks.session_id = sessions.id
      LEFT JOIN session_blocks_workouts ON session_blocks_workouts.session_block_id = session_blocks.id
      LEFT JOIN workouts ON session_blocks_workouts.workout_id = workouts.id
      LEFT JOIN workout_exercises ON workout_exercises.workout_id = workouts.id
      LEFT JOIN exercises ON exercises.id = workout_exercises.exercise_id
      WHERE sessions.id = ${id};
    `;
  
    if (data.rows.length === 0) {
      return null;
    }

    // Crear objeto de la sesión
    const sessionWithBlocks: Session = {
      id: data.rows[0].id,
      name: data.rows[0].name,
      description: data.rows[0].description,
      position: data.rows[0].position,
      image_url: data.rows[0].image_url,
      video_url: data.rows[0].video_url,
      plan_id: data.rows[0].plan_id,
      cicle_id: data.rows[0].cicle_id,
      blocks: []
    };

    // Usamos un mapa auxiliar para organizar los bloques y evitar duplicados
    const blockMap = new Map();
    const workoutMap = new Map();

    data.rows.forEach(row => {
      // Si existe el bloque
      if (row.block_id) {
        // Si el bloque ya está en el mapa, simplemente obtenlo
        let block = blockMap.get(row.block_id);

        if (!block) {
          // Si no existe, creamos el bloque y lo añadimos al mapa
          block = {
            id: row.block_id,
            name: row.block_name,
            description: row.block_description,
            video_url: row.block_video_url,
            position: row.block_position,
            session_id: row.id,
            workouts: []
          };
          blockMap.set(row.block_id, block);
          sessionWithBlocks.blocks.push(block);
        }

        // Si hay un workout asociado, lo añadimos al bloque
        if (row.workout_id) {
          let workout = workoutMap.get(row.workout_id);

          if (!workout) {
            workout = {
              id: row.workout_id,
              workout_type: row.workout_type,
              description: row.workout_description,
              position: row.workout_position,
              exercises: []
            };
            workoutMap.set(row.workout_id, workout);
            block.workouts.push(workout);
          }

          // Si hay ejercicios asociados al workout, los añadimos
          if (row.exercise_id) {
            workout.exercises.push({
              exercise_id: row.exercise_id,
              name: row.exercise_name,
              description: row.exercise_description,
              position: row.exercise_position,
              reps: row.exercise_reps,
              weight: row.exercise_weight,
              notes: row.exercise_notes,
              rest: row.exercise_rest,
              image_url: row.exercise_image_url,
              video_url: row.exercise_video_url
            });
          }
        }
      }
    });

    return sessionWithBlocks;

  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch session');
  }
}

// export async function fetchBlockWorkoutsById(id: string){
//   noStore();
//   try {
//     const data = await sql`
//       SELECT
//         workouts.id AS workout_id,
//         workouts.workout_type AS workout_type
//       FROM session_blocks_workouts
//       LEFT JOIN workouts ON session_blocks_workouts.workout_id = workouts.id
//       WHERE session_blocks_workouts.session_block_id = ${id};
//     `;
  
//     if (data.rows.length === 0) {
//       return null;
//     }

//     const blockWithWorkouts: SessionBlock = {
//       name: data.rows[0].name,
//       description: data.rows[0].description,
//       workouts: []
//     };

//     data.rows.forEach(row => {
//       if (row.workout_id) {
//         blockWithWorkouts.workouts.push({
//           id: row.workout_id,
//           type: row.workout_type,
//         });
//       }
//     });

//     console.log(blockWithWorkouts);

//     return blockWithWorkouts;

//   } catch (error) {
//     console.error('Database Error:', error);
//     throw new Error('Failed to fetch block');
//   }
// }


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
