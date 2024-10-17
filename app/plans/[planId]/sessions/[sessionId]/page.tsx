import ShowSession from '@/app/ui/sessions/show-session';
import { fetchPlanById, fetchSessionById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
 
export default async function Page({ params }: { params: { planId: string, sessionId: string } }) {
  const planId = params.planId;
  const sessionId = params.sessionId;
  console.log(planId)

  const plan = await fetchPlanById(planId);
  const session = await fetchSessionById(sessionId);

  if (!plan || !session) {
    notFound();
  }
  
  return (
    <main>
      <ShowSession session={session} />
    </main>
  );
}