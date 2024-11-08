import ShowCicle from '@/app/ui/cicles/show-cicle';
import { fetchCicleById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
 
export default async function Page({ params }: { params: { cicleId: string } }) {
  const cicleId = params.cicleId;

  const cicle = await fetchCicleById(cicleId);

  if (!cicle) {
    notFound();
  }
  
  return (
    <main>
      <ShowCicle cicle={cicle} />
    </main>
  );
}