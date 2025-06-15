'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, type AnimationProps } from 'motion/react';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';

import GoogleBtn from '../../../../components/ui/GoogleBtn';
import { BorderBeam } from '../../../../components/ui/BorderBeam';
import authHooks from '../../../../hooks/auth-hooks/index';

type FormData = {
  email: string;
  password: string;
};

const shinyAnimationProps = {
  initial: { '--x': '100%', scale: 1 }, // Start with shine off-screen, scale 1 for initial state
  animate: { '--x': '-100%', scale: 1 }, // Animate shine across, scale 1
  whileTap: { scale: 0.95 }, // Scale down slightly when tapped
  transition: {
    repeat: Infinity,
    repeatType: 'loop',
    repeatDelay: 1, // Delay before repeating animation
    type: 'spring',
    stiffness: 20,
    damping: 15,
    mass: 2,
    scale: {
      type: 'spring',
      stiffness: 200,
      damping: 5,
      mass: 0.5,
    },
  },
} as AnimationProps;

export default function LoginPage() {
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Initialize React Query mutation for login
  const { useLoginUser } = authHooks;
  const loginMutation = useLoginUser();

  const form = useForm<FormData>();

  // Handler for form submission using React Query mutation
  const handleLoginSubmit = form.handleSubmit(async (data: FormData) => {
    setServerError(null); // Clear previous errors
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        console.log('Login successful:', res);
        toast.success('Login Successful', {
          description: res.message || 'You have successfully logged in.',
          position: 'top-right',
        });
        router.push('/');
      },
      onError: (error) => {
        let errorMessage = 'Login failed. Please try again.';
        if (isAxiosError(error) && error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        setServerError(errorMessage);
        toast.error('Login Failed', {
          description: errorMessage,
          position: 'top-right',
        });
      },
    });
  });

  return (
    <div className="w-full py-20 min-h-[85vh] bg-primary-foreground">
      <h1 className="text-3xl font-Poppins font-semibold text-center">Login</h1>
      <p className="text-center text-lg py-3 text-foreground">Welcome back, </p>
      <div className="w-full flex justify-center">
        <div className="p-8 bg-background shadow-xl rounded-xl md:w-[540px] relative">
          <h4 className="text-3xl text-content-light-dark text-center mb-2 font-medium">
            Login
          </h4>
          <p className="text-center text-muted-foreground mb-4">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-link">
              Sign up
            </Link>
          </p>

          <GoogleBtn />
          {/* Replaced text-gray-300 with text-muted-foreground */}
          <div className="flex items-center my-5 text-muted-foreground text-sm">
            <div className="flex-1 border-t" />
            <span className="px-3">or Sign in with Email</span>
            <div className="flex-1 border-t" />
          </div>

          {/* FORM */}
          <form onSubmit={handleLoginSubmit}>
            <label
              htmlFor="email"
              className="block mb-1 text-content-light-dark"
            >
              Email
            </label>
            <input
              type="email"
              className="w-full p-2 border outline-0 rounded placeholder-text-placeholder border-tertiary dark:border-border bg-input dark:bg-input/30 focus:outline-none focus:border-tertiary dark:focus:border-focus transition-all duration-500 text-input-foreground"
              placeholder="abc@shop.com"
              {...form.register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, // Added a basic email regex
                  message: 'Please enter a valid email address',
                },
              })}
            />
            {form.formState.errors.email && (
              <p className="text-destructive text-sm mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
            {/* Add password field and toggle for visibility */}
            <label
              htmlFor="password"
              className="block mb-1 mt-4 text-content-light-dark"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? 'text' : 'password'}
                className="w-full p-2 border outline-0 rounded placeholder-text-placeholder border-tertiary dark:border-border bg-input dark:bg-input/30 focus:outline-none focus:border-tertiary dark:focus:border-focus transition-all duration-500 text-input-foreground"
                placeholder="********"
                {...form.register('password', {
                  required: 'Password is required',
                })}
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 text-muted-foreground"
              >
                {passwordVisible ? 'Hide' : 'Show'}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-destructive text-sm mt-1">
                {form.formState.errors.password.message}
              </p>
            )}

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-tertiary border-muted-foreground rounded focus:ring-tertiary dark:focus:ring-tertiary"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-content-light-dark"
                >
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password">
                <span className="text-link text-sm hover:underline">
                  Forgot password?
                </span>
              </Link>
            </div>

            {/* Login Button with shiny effect and loading state */}
            <motion.button
              type="submit"
              className="relative w-full py-2 mt-6 rounded-md
                           overflow-hidden cursor-pointer
                           font-semibold text-sm uppercase tracking-wide
                           "
              // Apply the animated background directly to the button's style
              style={{
                backgroundColor: 'hsl(var(--tertiary))', // Base button background color
                backgroundImage: `linear-gradient(-75deg, transparent calc(var(--x) + 20%), hsl(var(--tertiary-foreground))/20% calc(var(--x) + 25%), transparent calc(var(--x) + 100%))`,
                backgroundSize: '200% 100%', // Makes the gradient twice as wide as the button to animate across
                backgroundPositionX: 'var(--x)', // Controls the horizontal position of the background
              }}
              disabled={loginMutation.isPending}
              {...shinyAnimationProps}
            >
              {loginMutation.isPending ? (
                <div className="flex items-center justify-center">
                  {/* Simple loading spinner */}
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-tertiary-foreground"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </div>
              ) : (
                <>
                  {/* Text content with mask for shine */}
                  <span
                    className="relative block size-full z-20 text-primary-foreground" // Higher z-index for the text
                    style={{
                      maskImage:
                        'linear-gradient(-75deg,hsl(var(--tertiary)) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),hsl(var(--tertiary)) calc(var(--x) + 100%))',
                      WebkitMaskImage:
                        'linear-gradient(-75deg,hsl(var(--tertiary)) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),hsl(var(--tertiary)) calc(var(--x) + 100%))',
                    }}
                  >
                    Login
                  </span>
                  {/* Shiny overlay */}
                  <span
                    style={{
                      mask: 'linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))',
                      WebkitMask:
                        'linear-gradient(rgb(0,0,0), rgb(0,0,0)) content-box exclude,linear-gradient(rgb(0,0,0), rgb(0,0,0))',
                      backgroundImage:
                        'linear-gradient(-75deg,hsl(var(--tertiary))/10% calc(var(--x)+20%),hsl(var(--tertiary))/50% calc(var(--x)+25%),hsl(var(--tertiary))/10% calc(var(--x)+100%))',
                    }}
                    className="absolute inset-0 z-10 block rounded-[inherit] p-px"
                  />
                </>
              )}
            </motion.button>

            {/* Server Error Message */}
            {serverError && (
              <p className="text-destructive text-center mt-4">{serverError}</p>
            )}
          </form>

          <BorderBeam duration={8} size={100} />
        </div>
      </div>
    </div>
  );
}
