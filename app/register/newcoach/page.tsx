import NewCoachForm from '@/app/ui/registration/new-coach-form';
 
export default function NewCoachPage({ searchParams }: {
    searchParams?: {
      gymName?: string;
    };
  }) {
  return (
    <main className="flex items-center justify-center">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4">
        <NewCoachForm gymName={searchParams?.gymName || ''}/>
      </div>
    </main>
  );
}