import Logo from '@/app/ui/logo';
import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function Page() {
  return (
    <div className="flex flex-col p-6 pt-10">
      <div className="items-center flex flex-col justify-center gap-6">
        {/*<Link
          href="/login"
          className="flex items-center gap-5 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black md:text-base"
        >
          <span>Iniciar sesión</span> <ArrowRightIcon className="w-5 md:w-6" />
        </Link>*/}
        {/*<Link
          href="/register/newgym"
          className="flex items-center gap-5 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black md:text-base"
        >
          <span>New Gym Account</span> <ArrowRightIcon className="w-5 md:w-6" />
        </Link>
        <Link
          href="/register/newcoach"
          className="flex items-center gap-5 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black md:text-base"
        >
          <span>New Coach Account</span> <ArrowRightIcon className="w-5 md:w-6" />
        </Link>
        <Link
          href="/register/newathlete"
          className="flex items-center gap-5 rounded-lg bg-black px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-black md:text-base"
        >
          <span>New Athlete Account</span> <ArrowRightIcon className="w-5 md:w-6" />
        </Link>*/}
      </div>
    </div>
  );
}
