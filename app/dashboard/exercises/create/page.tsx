import Form from '@/app/ui/exercises/create-form';
import Breadcrumbs from '@/app/ui/exercises/breadcrumbs';
import { fetchCustomers } from '@/app/lib/data';
 
export default async function Page() {
  //const customers = await fetchCustomers();
 
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { 
            label: 'Exercises', 
            href: '/dashboard/exercises',
            active: false,
          },
          {
            label: 'Create Exercise',
            href: '/dashboard/exercises/create',
            active: true,
          },
        ]}
      />
      <Form />
    </main>
  );
}