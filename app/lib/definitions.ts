// This file contains type definitions for your data.
// It describes the shape of the data, and what data type each property should accept.
// For simplicity of teaching, we're manually defining these types.
// However, these types are generated automatically if you're using an ORM such as Prisma.

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  active: boolean;
  profile_picture_url: string;
};

export type Gym = {
  id: string;
  name: string;
};

    export type GymCoach = {
      coachId: string;
      gymId: string;
    };


// PLANS

export type Exercise = {
  id: string;
  name: string;
  description: string;
  image_url: string;
  video_url: string;
};

export type Workout = {
  id: string;
  name: string;
  description: string;
  workout_type: 'amrap' | 'emom' | 'rounds' | 'other';
  workout_value: string;
  // exercises[]
};

    export type WorkoutExercise = {
      workout_id: string;
      exercise_id: string;
      name: string;
      position: number;
      reps: string;
      weight: string;
      rest: string;
      notes: string;
      image_url: string;
    };

    export type ExerciseName = {
      id: string;
      name: string;
    }

    export type WorkoutWithExercises = {
      id: string;
      name: string;
      description: string;
      workout_type: 'amrap' | 'emom' | 'rounds' | 'other';
      workout_value: string;
      exercises: WorkoutExercise[];
    }

export type Plan = {
  id: string;
  name: string;
  description: string;
  sessions: Session[];
}

export type Session = {
  id: string;
  name: string;
  description: string;
  plan_id: string;
  blocks: SessionBlock[];
}

export type SessionBlock = {
  id: string;
  name: string;
  description: string;
  session_id: string;
  // workouts[]
}

    export type SessionBlockWorkouts = {
      session_block_id: string;
      workout_id: string;
    }



// export type PlanBlock = {
//   id: string;
//   name: string;
//   session_id: string;
// }

// export type PlanBlockRest = {
//   block_id: string;
//   rest_type: 'seconds' | 'minutes';
//   rest_value: number;
// }

// export type PlanBlockWorkout = {
//   block_id: string;
//   workout_id: string;
// }






// OLD

export type Customer = {
  id: string;
  name: string;
  email: string;
  image_url: string;
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number;
  date: string;
  // In TypeScript, this is called a string union type.
  // It means that the "status" property can only be one of the two strings: 'pending' or 'paid'.
  status: 'pending' | 'paid';
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  image_url: string;
  email: string;
  amount: string;
};

// The database returns a number for amount, but we later format it to a string with the formatCurrency function
export type LatestInvoiceRaw = Omit<LatestInvoice, 'amount'> & {
  amount: number;
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  image_url: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid';
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: number;
  total_paid: number;
};

export type FormattedCustomersTable = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number;
  status: 'pending' | 'paid';
};
