'use client';

import {
  HomeIcon,
  DocumentIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';


// Map of links to display in the side navigation.
// Depending on the size of the application, this would be stored in a database.
const links = [
  { 
    name: 'Inicio', 
    href: '/dashboard', 
    icon: HomeIcon 
  },
  { 
    name: 'Planes', 
    href: '/dashboard/plans', 
    icon: ClipboardDocumentIcon 
  },
  // { 
  //   name: 'Circuitos', 
  //   href: '/dashboard/workouts', 
  //   icon: DocumentDuplicateIcon 
  // },
  {
    name: 'Ejercicios',
    href: '/dashboard/exercises',
    icon: DocumentIcon,
  },
];

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-lg bg-gray-50 p-3 text-sm font-medium hover:bg-gray-300 hover:text-black sm:flex-none sm:justify-start sm:p-2 sm:px-3',
              {
                'bg-gray-300 text-black': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden sm:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
