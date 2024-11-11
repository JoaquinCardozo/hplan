import Image from 'next/image';
import Link from 'next/link';
import { roboto } from '@/app/ui/fonts';

export default function Logo() {
  return (
    <div className="p-5 bg-black text-white">
      <Link href="" className="flex flex-row justify-center items-center">
        <Image src="/logo.png" width={60} height={60} alt="logo"/>
        <div className={`${roboto.className} bg-black text-white font-bold text-[29px] pl-5`}>Mr. Fitness Coach</div>
      </Link>
    </div>
  );
}
