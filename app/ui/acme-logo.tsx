import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';

export default function AcmeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none text-white`}
    >
      <Image
        src="/logo.png"
        width={60}
        height={60}
        alt="logo"
      />
      <p className="font-bold text-[29px] md:text-[17px] pl-2">Mr. Fitness Coach</p>
    </div>
  );
}
