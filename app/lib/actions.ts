'use server';
 
import { z } from 'zod';
import { sql, db } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { User, Gym, Session, SessionBlock } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import { cookies } from "next/headers";
import { put } from '@vercel/blob';
 

export type FormState = {
  errors?: string[];
  message?: string | null;
};

export default async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export async function getCoachGym(user_id: string): Promise<Gym | undefined> {
  try {
    const gym = await sql<Gym>`
      SELECT * FROM gyms 
      JOIN gyms_coaches ON gyms.id = gyms_coaches.gym_id
      WHERE gyms_coaches.coach_id=${user_id}`;
    return gym.rows[0];
  } catch (error) {
    console.error('Failed to fetch gym:', error);
    throw new Error('Failed to fetch gym.');
  }
}

export type SessionData = {
  id: string;
  name: string;
  email: string;
  role: string;
  gymName: string;
  gymId: string;
};

const LoginFormSchema = z.object({ 
  email: z.string().email({
    message: 'Not a valid email.',
  }),
  password: z.string().min(6, { 
    message: 'Password must have at least 6 characters.' 
  }),
});

export type LoginFormState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string | null;
};

export async function login(prevState: LoginFormState, formData: FormData) {
  const client = await db.connect();
  
  try {
    const validatedFormData = LoginFormSchema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    });
    if (!validatedFormData.success) {
      return {
        errors: validatedFormData.error.flatten().fieldErrors,
        message: 'Credentials are not valid.',
      };
    }
    const { email, password } = validatedFormData.data;

    const user = await getUserByEmail(email);
    if (!user) {
      return {
        errors: { email: ['El usuario no existe'] },
        message: 'Credentials are not valid.',
      };
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return {
        errors: { password: ['Contraseña incorrecta'] },
        message: 'Credentials are not valid.',
      };
    }

    const gym = await getCoachGym(user.id);

    const sessionData : SessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      gymName: gym ? gym.name : "",
      gymId: gym ? gym.id : "",
    };

    const serializedSessionData = JSON.stringify(sessionData);

    cookies().set({
      name: "session_data", 
      value: serializedSessionData,
      httpOnly: true,
      secure: true,
      maxAge: 60 * 60 * 24 * 7 // one week
    });

    return { message: 'Logged in.' };

  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Invalid credentials.');
  
  } finally {
    client.release();
  }
}

export async function logout() {
  cookies().delete("session_data");

  revalidatePath('/login');
  redirect('/login');
}

const RegisterCoachFormSchema = z.object({ 
  gymName: z.string().min(1, {
    message: 'Enter the name of your Gym',
  }),
  name: z.string().min(1, {
    message: 'Enter your name',
  }),
  email: z.string().email({
    message: 'Not a valid email.',
  }),
  password: z.string().min(6, { 
    message: 'Password must have at least 6 characters.' 
  }),
});

export type RegisterCoachFormState = {
  errors?: {
    gymName?: string[];
    name?: string[];
    email?: string[];
    password?: string[];
    passwordRepeat?: string[];
  };
  message?: string | null;
};

export async function registerCoach(prevState: RegisterCoachFormState, formData: FormData) {
  const client = await db.connect();
  
  try {
    const validatedFormData = RegisterCoachFormSchema.safeParse({
      gymName: formData.get('gymName'),
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    });
    if (!validatedFormData.success) {
      return {
        errors: validatedFormData.error.flatten().fieldErrors,
        message: 'Form data for new coach is not valid.',
      };
    }
    const { name, email, password, gymName } = validatedFormData.data;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return {
        errors: { email: ['The user already exists'] },
        message: 'Form data for new coach is not valid.',
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10

    // Begin transaction
    await client.sql`BEGIN`;

    const newUserQuery = await client.sql`
      INSERT INTO users (email, name, password, role, active)
      VALUES (${email}, ${name}, ${hashedPassword}, 'coach', TRUE)
      RETURNING id, email
    `;
    const newUser = newUserQuery.rows[0];

    let gymQuery = await client.sql`
      SELECT id FROM gyms WHERE name = ${gymName}
    `;
    let gymId;
    if (gymQuery.rows.length === 0) {
      const newGymQuery = await client.sql`
        INSERT INTO gyms (name)
        VALUES (${gymName})
        RETURNING id
      `;
      gymId = newGymQuery.rows[0].id;
    } else {
      gymId = gymQuery.rows[0].id;
    }
    
    await client.sql`
      INSERT INTO gyms_coaches (coach_id, gym_id)
      VALUES (${newUser.id}, ${gymId})
    `;

    // Execute transaction
    await client.sql`COMMIT`;

    console.log("COACH CREATED");
    console.log("GYM CREATED");
    console.log("ASOCIATION CREATED");

    return { message: 'Coach created.' };

  } catch (error) {
    // Transaction rollback
    await client.sql`ROLLBACK`;

    console.error('Error creating coach:', error);
    throw new Error('Error creating coach.');
  }
}

const RegisterAthleteFormSchema = z.object({ 
  gymName: z.string().min(1, {
    message: 'Enter the name of your Gym',
  }),
  name: z.string().min(1, {
    message: 'Enter your name',
  }),
  email: z.string().email({
    message: 'Not a valid email.',
  }),
  password: z.string().min(6, { 
    message: 'Password must have at least 6 characters.' 
  }),
});

export type RegisterAthleteFormState = {
  errors?: {
    gymName?: string[];
    name?: string[];
    email?: string[];
    password?: string[];
    passwordRepeat?: string[];
  };
  message?: string | null;
};

export async function registerAthlete(prevState: RegisterAthleteFormState, formData: FormData) {
  const client = await db.connect();
  
  try {
    const validatedFormData = RegisterAthleteFormSchema.safeParse({
      gymName: formData.get('gymName'),
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    });
    if (!validatedFormData.success) {
      return {
        errors: validatedFormData.error.flatten().fieldErrors,
        message: 'Form data for new athlete is not valid.',
      };
    }
    const { name, email, password, gymName } = validatedFormData.data;

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return {
        errors: { email: ['The user already exists'] },
        message: 'Form data for new athlete is not valid.',
      };
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds: 10

    // Begin transaction
    await client.sql`BEGIN`;

    const newUserQuery = await client.sql`
      INSERT INTO users (email, name, password, role, active)
      VALUES (${email}, ${name}, ${hashedPassword}, 'athlete', TRUE)
      RETURNING id, email
    `;
    const newUser = newUserQuery.rows[0];

    let gymQuery = await client.sql`
      SELECT id FROM gyms WHERE name = ${gymName}
    `;
    let gymId;
    if (gymQuery.rows.length === 0) {
      return {
        errors: { gymName: ['Gym does not exists'] },
        message: 'Form data for new athlete is not valid.',
      };
    } else {
      gymId = gymQuery.rows[0].id;
    }
    
    await client.sql`
      INSERT INTO gyms_athletes (athlete_id, gym_id)
      VALUES (${newUser.id}, ${gymId})
    `;

    // Execute transaction
    await client.sql`COMMIT`;

    console.log("ATHLETE CREATED");
    console.log("ASOCIATION CREATED");

    return { message: 'Athlete created.' };

  } catch (error) {
    // Transaction rollback
    await client.sql`ROLLBACK`;

    console.error('Error creating athlete:', error);
    throw new Error('Error creating athlete.');
  }
}


// EXERCISES

const ExerciseFormSchema = z.object({
  id: z.string(),
  name: z.string()
    .min(1, { message: 'El nombre no puede estar vacío' }),
  description: z.string(),
  image: z.instanceof(File).nullable(),
  video_url: z.string().nullable(),
});
const CreateExerciseFormSchema = ExerciseFormSchema.omit({ id: true });

export type CreateExerciseState = {
  errors?: {
    name?: string[];
    description?: string[];
    image_url?: string[];
    video_url?: string[];
  };
  message?: string | null;
};

export async function createExercise(prevState: CreateExerciseState, formData: FormData) {
  const validatedFields = CreateExerciseFormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    image: formData.get('image'),
    video_url: formData.get('video_url'),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to Create Exercise.',
    };
  }
  let { name, description, image, video_url } = validatedFields.data;
  if (video_url) {
    video_url = 'https://www.youtube.com/embed/' + video_url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
  }

  let image_url = "";
  if (image && image.size && image.size > 0) {
    const blob = await put("exercise_images/" + image.name, image, {
      access: 'public',
    });
    image_url = blob.url;
  } 

  try {
    await sql`
      INSERT INTO exercises (name, description, image_url, video_url)
      VALUES (${name}, ${description}, ${image_url}, ${video_url})
    `;
  } catch (error){
      return { message: 'Database Error: Failed to Create Exercise' };
  }

  revalidatePath('/dashboard/exercises');
  redirect('/dashboard/exercises');
}

export async function updateExercise(id: string, prevState: CreateExerciseState, formData: FormData) {
  const validatedFields = CreateExerciseFormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    image: formData.get('image'),
    video_url: formData.get('video_url'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to Update Exercise.',
    };
  } 
  let { name, description, image, video_url } = validatedFields.data;
  if (video_url) {
    video_url = 'https://www.youtube.com/embed/' + video_url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
  }

  let image_url = "";
  if (image && image.size && image.size > 0) {
    const blob = await put("exercise_images/" + image.name, image, {
      access: 'public',
    });
    image_url = blob.url;
  }
 
  try {
    if (image && image.size && image.size > 0) {
      await sql`
        UPDATE exercises
        SET name = ${name}, description = ${description}, image_url = ${image_url}, video_url = ${video_url}
        WHERE id = ${id}
      `;  
    } else {
      await sql`
        UPDATE exercises
        SET name = ${name}, description = ${description}, video_url = ${video_url}
        WHERE id = ${id}
      `;
    }
  } catch (error) {
    return { message: 'Database Error: Failed to Update Exercise.' };
  }
 
  revalidatePath('/dashboard/exercises');
  redirect('/dashboard/exercises');
}

export async function deleteExercise(id: string) {
  try {
    await sql`DELETE FROM exercises WHERE id = ${id}`;
      
  } catch (error){
    return { message: 'Database Error: Failed to Delete Exercise' };
  }

  revalidatePath('/dashboard/exercises');
  redirect('/dashboard/exercises');
}

const WorkoutExerciseSchema = z.object({
  exercise_id: z.string(),
  position: z.coerce.number(),
  reps: z.string().min(1, { message: 'Ingresar la cantidad de repeticiones.' }),
  weight: z.string(),
  rest: z.string(),
  notes: z.string(),
});
const WorkoutFormSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  workout_type: z.string().min(1, { message: 'Elegir un tipo de circuito.' }),
  workout_value: z.string().nullable(),
  workout_exercises: z.array(WorkoutExerciseSchema).min(1, { message: 'Agregar al menos un ejercicio.' }),
});
const CreateWorkoutFormSchema = WorkoutFormSchema.omit({ id: true });

export type CreateWorkoutState = {
  errors?: {
    name?: string[];
    description?: string[];
    workout_type?: string[];
    workout_value?: string[];
    workout_exercises?: string[];
  };
  message?: string | null;
};

export async function createWorkout(prevState: CreateWorkoutState, formData: FormData) {
  const validatedFields = CreateWorkoutFormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    workout_type: formData.get('workout_type'),
    workout_value: formData.get('workout_value'),
    workout_exercises: JSON.parse(formData.get('workout_exercises') as string)
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to Create Workout.',
    };
  }
  const { name, description, workout_type, workout_value, workout_exercises } = validatedFields.data;

  const client = await db.connect();
  try {
    await client.sql`BEGIN`;

    const newWorkoutQuery = await client.sql`
      INSERT INTO workouts (name, description, workout_type, workout_value)
      VALUES (${name}, ${description}, ${workout_type}, ${workout_value})
      RETURNING id
    `;
    const workoutId = newWorkoutQuery.rows[0].id;

    await Promise.all(
      workout_exercises.map(exercise => 
        client.sql`
          INSERT INTO workout_exercises (workout_id, exercise_id, position, reps, weight, rest, notes)
          VALUES (${workoutId}, ${exercise.exercise_id}, ${exercise.position}, ${exercise.reps}, ${exercise.weight}, ${exercise.rest}, ${exercise.notes})
        `.catch(innerError => {
            throw innerError;
        })
      )
    );

    await client.sql`COMMIT`;

  } catch (error){
    await client.sql`ROLLBACK`;
    return { message: 'Database Error: Failed to Create Workout'};
  }

  revalidatePath('/dashboard/workouts');
  redirect('/dashboard/workouts');
}

export async function updateWorkout(id: string, prevState: FormState, formData: FormData) {
  const validatedFields = CreateWorkoutFormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    workout_type: formData.get('workout_type'),
    workout_value: formData.get('workout_value'),
    workout_exercises: JSON.parse(formData.get('workout_exercises') as string)
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to Create Workout.',
    };
  }
  const { name, description, workout_type, workout_value, workout_exercises } = validatedFields.data;

  const client = await db.connect();
  try {
    await client.sql`BEGIN`;

    await client.sql`
      UPDATE workouts
      SET name = ${name}, description = ${description}, workout_type = ${workout_type}, workout_value = ${workout_value}
      WHERE id = ${id}
    `;

    await client.sql`
      DELETE FROM workout_exercises
      WHERE workout_id = ${id}
    `;

    await Promise.all(
      workout_exercises.map(exercise => 
        client.sql`
          INSERT INTO workout_exercises (workout_id, exercise_id, position, reps, weight, rest, notes)
          VALUES (${id}, ${exercise.exercise_id}, ${exercise.position}, ${exercise.reps}, ${exercise.weight}, ${exercise.rest}, ${exercise.notes})
          ON CONFLICT (workout_id, position)
          DO UPDATE
          SET reps = ${exercise.reps}, weight = ${exercise.weight}, rest = ${exercise.rest}, notes = ${exercise.notes}
        `.catch(innerError => {
            throw innerError;
        })
      )
    );

    await client.sql`COMMIT`;
    return { success: true};

  } catch (error){
    await client.sql`ROLLBACK`;
    console.log(error);
    return { success: false, message: 'Database Error: Failed to Create Workout', errors: []};
  }

  // revalidatePath('/dashboard/workouts');
  // redirect('/dashboard/workouts');
}

export async function deleteWorkout(id: string) {
  const client = await db.connect();
  try {
    await client.sql`BEGIN`;
    await client.sql`DELETE FROM workout_exercises WHERE workout_id = ${id}`;
    await client.sql`DELETE FROM workouts WHERE id = ${id}`;
    await client.sql`COMMIT`;

  } catch (error){
    await client.sql`ROLLBACK`;
    return { message: 'Database Error: Failed to Delete Workout' };
  }

  revalidatePath('/dashboard/workouts');
  redirect('/dashboard/workouts');
}


// PLANS

const PlanFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'Debes ingresar un nombre.' }),
  description: z.string()
});
const CreatePlanFormSchema = PlanFormSchema.omit({ id: true });

export type CreatePlanState = {
  errors?: {
    name?: string[];
    description?: string[];
  };
  message?: string | null;
};

export async function createPlan() {
  let id;

  try {
    const plan = await sql`
      INSERT INTO plans (name)
      VALUES ('Nuevo plan')
      RETURNING id
    `;

    id = plan.rows[0].id;
  } catch (error){
    console.log(error);
    return { message: 'Database Error: Failed to Create Plan' };
  }

  revalidatePath('/dashboard/plans');
  redirect('/dashboard/plans/' + id + '/edit');
}

export async function updatePlan(id: string, prevState: CreatePlanState, formData: FormData) {
  const validatedFields = CreatePlanFormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description')
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to Update Exercise.',
    };
  } 
  const { name, description } = validatedFields.data;
  let result;

  try {
    result = await sql`
      UPDATE plans
      SET name = ${name}, description = ${description}
      WHERE id = ${id}
      RETURNING name, description
    `;
  } catch (error) {
    console.log(error);
    return { message: 'Database Error: Failed to Update Plan.' };
  }
 
  revalidatePath(`/dashboard/plans/${id}/edit`);
  return { success: true, message: 'Plan Edited.', plan: result.rows[0] };
}

export async function deletePlan(id: string) {
  const client = await db.connect();
  try {
    await client.sql`BEGIN`;

    await client.sql`
      DELETE FROM session_blocks
      WHERE session_id IN (
        SELECT id FROM sessions WHERE plan_id = ${id}
      )
    `;

    await client.sql`
      DELETE FROM sessions
      WHERE plan_id = ${id}
    `;

    await client.sql`
      DELETE FROM plans 
      WHERE id = ${id}
    `;

    await client.sql`COMMIT`;

  } catch (error){
    await client.sql`ROLLBACK`;
    console.log(error);
    return { message: 'Database Error: Failed to Delete Plan' };
  }

  revalidatePath('/dashboard/plans');
}

const SessionFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'Debes ingresar un nombre.' }),
  description: z.string().nullable(),
  position: z.coerce.number(),
  plan_id: z.string().min(1, { message: 'Plan id es obligatorio.' })
});
const CreateSessionFormSchema = SessionFormSchema.omit({ id: true });

export async function createSession(session: Session) {
  const validatedFields = CreateSessionFormSchema.safeParse({
    name: session.name,
    description: session.description,
    position: session.position,
    plan_id: session.plan_id
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to Create Session.',
    };
  } 
  const { name, plan_id, position } = validatedFields.data;
  let id;

  try {
    const result = await sql`
      INSERT INTO sessions (plan_id, name, position)
      VALUES (${plan_id}, ${name}, ${position})
      RETURNING id
    `;

    id = result.rows[0].id;
    return id;

  } catch (error){
    console.log(error);
    return { message: 'Database Error: Failed to Create Session' };
  }

  revalidatePath('/dashboard/plans/' + plan_id + '/edit');
}

export async function deleteSession(id: string) {
  const client = await db.connect();
  try {
    await client.sql`BEGIN`;

    // TODO delete workouts? should I delete only the ones that have no name?

    await client.sql`
      DELETE FROM session_blocks
      WHERE session_id = ${id}
    `;

    await client.sql`
      DELETE FROM sessions 
      WHERE id = ${id}
    `;

    await client.sql`COMMIT`;
    return true;

  } catch (error){
    await client.sql`ROLLBACK`;
    console.log(error);
    return { message: 'Database Error: Failed to Delete Session' };
  }

  //revalidatePath('/dashboard/plans/' + plan_id + '/edit');
}

export async function updateSession(id: string, prevState: CreatePlanState, formData: FormData) {
  const validatedFields = CreateSessionFormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    position: formData.get('position'),
    plan_id: formData.get('plan_id')
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to Update Session.',
    };
  } 
  const { name, description, position, plan_id } = validatedFields.data;
  let result;

  try {
    result = await sql`
      UPDATE sessions
      SET name = ${name}, description = ${description}, position = ${position}
      WHERE id = ${id}
      RETURNING name, description
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Session.' };
  }

  revalidatePath(`/dashboard/plans/${plan_id}/edit/sessions/${id}/edit`);
  return { success: true, message: 'Session Edited.', session: result.rows[0] };
}


const SessionBlockFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'Debes ingresar un nombre.' }),
  description: z.string().nullable(),
  position: z.coerce.number(),
  session_id: z.string().min(1, { message: 'Session id es obligatorio.' }),
  plan_id: z.string().min(1, { message: 'Plan id es obligatorio.' })
});
const CreateSessionBlockFormSchema = SessionBlockFormSchema.omit({ id: true });

export async function createSessionBlock(block: SessionBlock) {
  const validatedFields = CreateSessionBlockFormSchema.safeParse({
    name: block.name,
    description: block.description,
    position: block.position,
    session_id: block.session_id,
    plan_id: block.plan_id,
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to Create SessionBlock.',
    };
  } 
  const { name, session_id, plan_id, position, description } = validatedFields.data;
  let id;

  try {
    const block = await sql`
      INSERT INTO session_blocks (session_id, name, description, position)
      VALUES (${session_id}, ${name}, ${description}, ${position})
      RETURNING id
    `;

    revalidatePath('/dashboard/plans/' + plan_id + '/edit');
    id = block.rows[0].id;
    return id;

  } catch (error){
    console.log(error);
    return { message: 'Database Error: Failed to Create SessionBlock' };
  }
}

export async function updateSessionBlock(id: string, prevState: CreatePlanState, formData: FormData) {
  const validatedFields = CreateSessionBlockFormSchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    position: formData.get('position'),
    session_id: formData.get('session_id'),
    plan_id: formData.get('plan_id')
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Failed to Update SessionBlock.',
    };
  } 
  const { name, description, position, session_id, plan_id } = validatedFields.data;
  let result;

  try {
    result = await sql`
      UPDATE session_blocks
      SET name = ${name}, description = ${description}, position = ${position}
      WHERE id = ${id}
      RETURNING name, description
    `;
  } catch (error) {
    console.log(error);
    return { message: 'Database Error: Failed to Update SessionBlock.' };
  }

  revalidatePath(`/dashboard/plans/${plan_id}/edit/sessions/${session_id}/edit`);
  return { success: true, message: 'SessionBlock Edited.', block: result.rows[0] };
}

export async function deleteSessionBlock(id: string) {
  const client = await db.connect();
  try {
    await client.sql`BEGIN`;

    // TODO delete workouts? should I delete only the ones that have no name?

    await client.sql`
      DELETE FROM session_blocks_workouts
      WHERE session_block_id = ${id}
    `;

    await client.sql`
      DELETE FROM session_blocks 
      WHERE id = ${id}
    `;

    await client.sql`COMMIT`;
    return true;

  } catch (error){
    await client.sql`ROLLBACK`;
    console.log(error);
    return { message: 'Database Error: Failed to Delete SessionBlock' };
  }
}

const SessionBlockWorkoutFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: 'Debes ingresar un nombre.' }),
  description: z.string().nullable(),
  workout_type: z.string(),
  workout_value: z.string(),
  session_block_id: z.string().min(1, { message: 'SessionBlock id es obligatorio.' }),
  session_id: z.string().min(1, { message: 'Session id es obligatorio.' }),
  plan_id: z.string().min(1, { message: 'Plan id es obligatorio.' }),
});
const CreateSessionBlockFormWorkoutSchema = SessionBlockWorkoutFormSchema.omit({ id: true });

export async function createSessionBlockWorkout(session_block_id: string, position: number) {
  // const validatedFields = CreateSessionBlockFormSchema.safeParse({
  //   name: block.name,
  //   description: block.description,
  //   session_id: block.session_id,
  //   plan_id: block.plan_id,
  // });
 
  // if (!validatedFields.success) {
  //   return {
  //     errors: validatedFields.error.flatten().fieldErrors,
  //     message: 'Failed to Create SessionBlock.',
  //   };
  // } 
  // const { name, session_id, plan_id } = validatedFields.data;
  // let id;
  let new_workout_id;

  try {
    const result = await sql`
      INSERT INTO workouts (workout_type)
      VALUES ('')
      RETURNING id
    `;
    new_workout_id = result.rows[0].id;

  } catch (error){
    console.log(error);
    return { message: 'Database Error: Failed to Create Workout' };
  }

  try {
    await sql`
      INSERT INTO session_blocks_workouts (session_block_id, workout_id, position)
      VALUES (${session_block_id}, ${new_workout_id}, ${position})
    `;

  } catch (error){
    console.log(error);
    return { message: 'Database Error: Failed to Create SessionBlockWorkout' };
  }

  return new_workout_id;
}

export async function deleteSessionBlockWorkout(id: string) {
  try {
    const result = await sql`DELETE FROM session_blocks_workouts WHERE workout_id = ${id}`;
    // TODO delete workout??

    return result.rows[0].rowCount == 1;
  } catch (error){
    console.log(error);
    return { message: 'Database Error: Failed to Delete SessionBlockWorkout' };
  }
}

// OLD


const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});
 
const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];

  try {
  	await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
    `;
  } catch (error){
  	  return { message: 'Database Error: Failed to Create Invoice' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');  
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
) {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
 
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }
 
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = amount * 100;
 
  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
  } catch (error) {
    return { message: 'Database Error: Failed to Update Invoice.' };
  }
 
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
    try {
    	await sql`DELETE FROM invoices WHERE id = ${id}`;
    	revalidatePath('/dashboard/invoices');
    	return { message: 'Deleted Invoice' };
	} catch (error){
		return { message: 'Database Error: Failed to Delete Invoice' };
	}
}