'use server';
 
import { z } from 'zod';
import { sql, db } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { User } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';
import { cookies } from "next/headers";

 
export default async function getUserByEmail(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export type SessionData = {
  id: string;
  name: string;
  email: string;
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
        errors: { email: ['The user does not exists'] },
        message: 'Credentials are not valid.',
      };
    }

    const passwordsMatch = await bcrypt.compare(password, user.password);
    if (!passwordsMatch) {
      return {
        errors: { password: ['Incorrect password'] },
        message: 'Credentials are not valid.',
      };
    }

    const sessionData : SessionData = {
      id: user.id,
      name: user.name,
      email: user.email
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