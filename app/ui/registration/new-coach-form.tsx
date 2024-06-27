'use client';
 
import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  HomeIcon,
  ExclamationCircleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from '@/app/ui/button';
import { useFormState, useFormStatus } from 'react-dom';
import { registerCoach, RegisterCoachFormState } from '@/app/lib/actions';
 
export default function NewCoachForm({ gymName }: { gymName: string }) {
  const [formState, formAction] = useFormState(registerCoachIfPasswordRepeatIsValid, { /* initialState is empty */ });

  async function registerCoachIfPasswordRepeatIsValid(prevState: RegisterCoachFormState, formData: FormData) {
    if (formData.get('password') == formData.get('passwordRepeat')) {
      return registerCoach(prevState, formData);  
    }
    else {
      return {
        errors: { passwordRepeat: ['Password is not the same'] },
        message: 'Form data for new coach is not valid.',
      };
    }
  };

  return (
    <form action={formAction} className="space-y-3">
      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Create a new Coach for <b>{gymName}</b>
        </h1>
        <div className="mt-4 hidden">
          <label
            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
            htmlFor="gymName"
          >
            Gym Name
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              id="gymName"
              name="gymName"
              placeholder="Enter the name of your gym"
              aria-describedby="gymName-error"
              defaultValue={gymName}
            />
            <HomeIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="gymName-error" aria-live="polite" aria-atomic="true">
            {formState.errors?.gymName &&
              formState.errors.gymName.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
        <div className="mt-4">
          <label
            className="mb-3 mt-5 block text-xs font-medium text-gray-900"
            htmlFor="name"
          >
            Coach Name
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
              id="name"
              name="name"
              placeholder="Enter your name"
              required
              aria-describedby="name-error"
            />
            <HomeIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
          </div>
          <div id="name-error" aria-live="polite" aria-atomic="true">
            {formState.errors?.name &&
              formState.errors.name.map((error: string) => (
                <p className="mt-2 text-sm text-red-500" key={error}>
                  {error}
                </p>
              ))}
          </div>
        </div>
        <div className="mt-4">
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Coach Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
                aria-describedby="email-error"
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            <div id="email-error" aria-live="polite" aria-atomic="true">
              {formState.errors?.email &&
                formState.errors.email.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
                aria-describedby="password-error"
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            <div id="password-error" aria-live="polite" aria-atomic="true">
              {formState.errors?.password &&
                formState.errors.password.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="passwordRepeat"
            >
              Repeat password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="passwordRepeat"
                type="password"
                name="passwordRepeat"
                placeholder="Repeat password"
                required
                aria-describedby="password-repeat-error"
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            <div id="passwordRepeat-error" aria-live="polite" aria-atomic="true">
              {formState.errors?.passwordRepeat &&
                formState.errors.passwordRepeat.map((error: string) => (
                  <p className="mt-2 text-sm text-red-500" key={error}>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>
        <RegisterButton />        
        <div
          className="flex h-8 items-end space-x-1"
          aria-live="polite"
          aria-atomic="true"
        >
          {formState.message && !formState.errors && (
            <>
              <UserCircleIcon className="h-5 w-5 text-green-500" />
              <p className="text-sm text-green-500">{formState.message}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
 
function RegisterButton() {
  const { pending } = useFormStatus(); // used to disable the button while the previous call is pending
 
  return (
    <Button className="mt-4 w-full" aria-disabled={pending}>
      Create new account <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
    </Button>
  );
}