import clsx from 'clsx';

export default function ExampleCLSX({ color }: { color: string }) {
  return (
    <div
      className={clsx(
        'h-0 w-0 border-b-[30px] border-l-[20px] border-r-[20px] border-l-transparent border-r-transparent',
        {
          'border-b-white': color === 'white',
          'border-b-black': color === 'black',
        },
      )}
    />
  );
}
