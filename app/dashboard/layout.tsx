import SideNav from '@/app/ui/dashboard/sidenav';
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex
                    smx:flex-col 
                    sm:flex-row sm:grow sm:overflow-hidden">
      <div className="flex-none sm:w-64">
        <SideNav />
      </div>
      <div className="flex-grow smx:p-6 sm:p-12 sm:overflow-y-auto">
        {children}
      </div>
    </div>
  );
}