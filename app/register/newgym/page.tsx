import NewGymForm from '@/app/ui/registration/new-gym-form';
 
export default function NewGymPage() {
  return (
    <main className="flex items-center justify-center">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4">
        <NewGymForm />
      </div>
    </main>
  );
}