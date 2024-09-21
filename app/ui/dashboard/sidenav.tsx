import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import Logo from '@/app/ui/logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import { logout, SessionData } from '@/app/lib/actions';
import { cookies } from "next/headers";

export default function SideNav() {
  const cookieStore = cookies();
  const cookieData = cookieStore.get("session_data")?.value;
  if (!cookieData) {
    throw new Error("Session data cookie is not set");
  }
  const userData = JSON.parse(cookieData as string) as SessionData;

  const logoutAction = async () => {
    'use server';
    await logout();
  }

  return (
    <div className="p-3 flex bg-black 
    smx:flex-row smx:fixed smx:z-50 smx:bottom-0 smx:gap-x-3 smx:w-full
    sm:flex-col sm:pt-0 sm:space-y-2 sm:h-full">
      {/*hola { userData.name }*/}
      
      <NavLinks />
      
      <div className="grow smx:hidden sm:block"></div>

      <form action={logoutAction}>
        <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-lg bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-black sm:flex-none sm:justify-start sm:p-2 sm:px-3">
          <PowerIcon className="w-6" />
          <div className="smx:hidden sm:block">Cerrar sesión</div>
        </button>
      </form>
    </div>
  );
}
