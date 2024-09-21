import NewAthleteForm from '@/app/ui/registration/new-athlete-form';
 
export default function NewAthletePage({ searchParams }: {
    searchParams?: {
      gymName?: string;
    };
  }) {
  return (
    <main className="flex items-center justify-center">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4">
        <NewAthleteForm gymName={searchParams?.gymName || ''}/>
      </div>
    </main>
  );
}