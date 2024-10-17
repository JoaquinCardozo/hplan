export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="m-10 smx:m-2">
      {children}
    </div>
  );
}