import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import AcmeLogo from '@/app/ui/acme-logo';
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


  return (
    <div className="flex flex-col h-full px-3 py-4 md:px-2">
      <div className="flex flex-row md:flex-col items-end md:items-center justify-end md:justify-center mb-2 p-4 rounded-md bg-blue-600 text-white">
        <Link className="flex-1" href="/">
          <AcmeLogo />
        </Link>
        <div className="flex-1 text-right md:text-center font-bold mt-1">
          hola { userData.name }
        </div>
      </div>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <form
          action={async () => {
            'use server';
            await logout();
          }}
        >
          <button className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
