'use server';
 
import { z } from 'zod';
import { sql, db } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { User, Gym } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import { cookies } from "next/headers";
import { put } from '@vercel/blob';
 
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
  position: z.number(),
  reps: z.string().min(1, { message: 'Ingresar la cantidad de repeticiones.' }),
  weight: z.string(),
  rest: z.string(),
  notes: z.string(),
});
const WorkoutFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  workout_type: z.string().min(1, { message: 'Elegir un tipo de circuito.' }),
  workout_value: z.string(),
  workout_exercises: z.array(WorkoutExerciseSchema).min(1, { message: 'Agregar al memnos un ejercicio.' }),
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

export async function updateWorkout(id: string, prevState: CreateWorkoutState, formData: FormData) {
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
      UPDATE workouts
      SET name = ${name}, description = ${description}, workout_type = ${workout_type}, workout_value = ${workout_value}
      WHERE id = ${id}
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

  } catch (error){
    await client.sql`ROLLBACK`;
    return { message: 'Database Error: Failed to Create Workout'};
  }

  revalidatePath('/dashboard/workouts');
  redirect('/dashboard/workouts');
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