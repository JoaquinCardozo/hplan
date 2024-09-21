import AdminDashboard from '@/app/dashboard/(overview)/admin-dashboard';
import AthleteDashboard from '@/app/dashboard/(overview)/athlete-dashboard';
import CoachDashboard from '@/app/dashboard/(overview)/coach-dashboard';
import { SessionData } from '@/app/lib/actions';
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = cookies();
  const cookieData = cookieStore.get("session_data")?.value;
  if (!cookieData) {
    throw new Error("Session data cookie is not set");
  }
  const userData = JSON.parse(cookieData as string) as SessionData;
  const userRole = userData.role;

  return (
    <main>
      <div className="text-lg smx:text-center">
        ¡Bienvenido <span className="font-bold">{ userData.name }</span>!
      </div>

      {/*<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        { userRole === 'admin' ? (
          <AdminDashboard />
        ) : null}

        { userRole === 'coach' ? (
          <CoachDashboard /> 
        ) : null}

        { userRole === 'athlete' ? (
          <AthleteDashboard />
        ) : null}
      </div>*/}
    </main>
  );
}