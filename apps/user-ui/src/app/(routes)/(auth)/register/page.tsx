'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, type AnimationProps } from 'motion/react';
import { isAxiosError } from 'axios';

import GoogleBtn from '../../../../components/ui/GoogleBtn';
import { BorderBeam } from '../../../../components/ui/BorderBeam';
import authHooks from '../../../../hooks/auth-hooks/index';
import { toast } from 'sonner';

type FormData = {
  name: string;
  email: string;
  password: string;
};

const shinyAnimationProps = {
  initial: { '--x': '100%', scale: 1 },
  animate: { '--x': '-100%', scale: 1 },
  whileTap: { scale: 0.95 },
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

export default function RegisterPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [userData, setUserData] = useState<FormData | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const { useRegisterUser, useVerifyOtp, useResendOtp } = authHooks;
  const registerMutation = useRegisterUser();
  const verifyOtpMutation = useVerifyOtp();
  const resendOtpMutation = useResendOtp();

  const form = useForm<FormData>();

  // Effect for managing the resend timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!canResend && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval!);
            setCanResend(true);
            setShowOtp(false);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      setShowOtp(false);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [canResend, timer]);

  // Main registration form submission handler
  const handleRegisterSubmit = form.handleSubmit(async (data: FormData) => {
    setServerError(null);
    registerMutation.mutate(data, {
      onSuccess: (res, formData) => {
        console.log('From register Mutation here: ', res);
        toast.success('Successful', {
          description: res.message,
          position: 'top-right',
        });
        setUserData(formData);
        setShowOtp(true);
        setCanResend(false);
        setTimer(60);
      },
      onError: (error) => {
        let errorMessage = 'Registration failed. Please try again.';
        if (isAxiosError(error) && error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        setServerError(errorMessage);
      },
    });
  });

  // Handler for OTP input changes
  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify if all OTP fields are filled
    if (newOtp.every((digit) => digit !== '') && newOtp.length === 6) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handler for OTP paste event
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pastedData = e.clipboardData.getData('text');
    const cleanPastedData = pastedData.replace(/\D/g, '').substring(0, 6);

    if (cleanPastedData.length === 6) {
      const newOtp = cleanPastedData.split('');
      setOtp(newOtp);

      newOtp.forEach((digit, idx) => {
        if (inputRefs.current[idx]) {
          inputRefs.current[idx]!.value = digit;
        }
      });
      inputRefs.current[5]?.focus(); // Focus the last input

      handleVerifyOtp(newOtp.join('')); // Auto-verify
    }
  };

  // Handler for verifying OTP
  const handleVerifyOtp = (enteredOtp: string) => {
    setServerError(null);
    if (!userData?.email) {
      setServerError('User email not found. Please register again.');
      return;
    }

    verifyOtpMutation.mutate(
      {
        email: userData.email,
        otp: enteredOtp,
        name: userData.name,
        password: userData.password,
      },
      {
        onSuccess: (_, data) => {
          console.log('From verify Otp Mutation: ', _, data);
          toast.success('OTP Verified successfully!');
          console.log('OTP Verified successfully!');
          // router.push('/dashboard'); // Example: Redirect to dashboard on success
        },
        onError: (error) => {
          let errorMessage = 'Invalid OTP. Please try again.';
          if (isAxiosError(error) && error.response?.data?.message) {
            errorMessage = error.response.data.message;
          }
          setServerError(errorMessage);
        },
      }
    );
  };

  // Handler for resending OTP
  const handleResendOtp = () => {
    setServerError(null);
    if (!canResend || !userData?.email) return;

    resendOtpMutation.mutate(
      { email: userData.email },
      {
        onSuccess: () => {
          setCanResend(false); // Restart timer
          setTimer(60);
          setOtp(['', '', '', '', '', '']); // Clear OTP inputs
          console.log('OTP Resent successfully!');
        },
        onError: (error) => {
          let errorMessage = 'Failed to resend OTP. Please try again.';
          if (isAxiosError(error) && error.response?.data?.message) {
            errorMessage = error.response.data.message;
          }
          setServerError(errorMessage);
        },
      }
    );
  };

  // Determine global loading state from all relevant mutations
  const isGlobalLoading =
    registerMutation.isPending ||
    verifyOtpMutation.isPending ||
    resendOtpMutation.isPending;

  return (
    // Replaced bg-slate-100 dark:bg-slate-800 with bg-surface dark:bg-muted
    <div className="w-full py-20 min-h-[85vh] bg-primary-foreground">
      <h1 className="text-3xl font-Poppins font-semibold text-center">
        Register
      </h1>
      {/* Replaced text-slate-800 with text-foreground */}
      <p className="text-center text-lg py-3 text-foreground">Hello, </p>
      <div className="w-full flex justify-center">
        <div className="p-8 bg-background shadow-xl rounded-xl md:w-[540px] relative">
          <h4 className="text-3xl text-content-light-dark text-center mb-2 font-medium">
            Register
          </h4>
          <p className="text-center text-muted-foreground mb-4">
            Already have an account?{' '}
            <Link href="/login" className="text-link">
              Sign In
            </Link>
          </p>

          <GoogleBtn />
          {/* Replaced text-gray-300 with text-muted-foreground */}
          <div className="flex items-center my-5 text-muted-foreground text-sm">
            <div className="flex-1 border-t" />
            <span className="px-3">or Sign Up with Email</span>
            <div className="flex-1 border-t" />
          </div>

          {/* REGISTER FORM AND OTP FORM */}
          {!showOtp ? (
            <form onSubmit={handleRegisterSubmit}>
              <label
                htmlFor="name"
                className="block mb-1 text-content-light-dark"
              >
                Name
              </label>
              <input
                type="text"
                className="w-full p-2 border outline-0 rounded placeholder-text-placeholder border-tertiary dark:border-border bg-input dark:bg-input/30 focus:outline-none focus:border-tertiary dark:focus:border-focus transition-all duration-500 text-input-foreground"
                placeholder="abc@shop.com"
                {...form.register('name', {
                  required: 'Name is required',
                })}
                autoComplete="name"
              />
              {form.formState.errors.name && (
                <p className="text-destructive text-sm mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}

              {/* ADD EMAIL FIELD */}
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
                autoComplete="email"
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
                  autoComplete="current-password"
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

              {/* Register Button with shiny effect and loading state */}
              <motion.button
                type="submit"
                className="relative w-full py-2 mt-6 rounded-md
                 overflow-hidden cursor-pointer
                 font-semibold text-sm disabled:bg-orange-300 disabled:cursor-not-allowed uppercase tracking-wide
                 "
                // Apply the animated background directly to the button's style
                style={{
                  backgroundColor: 'hsl(var(--tertiary))', // Base button background color
                  backgroundImage: `linear-gradient(-75deg, transparent calc(var(--x) + 20%), hsl(var(--tertiary-foreground))/20% calc(var(--x) + 25%), transparent calc(var(--x) + 100%))`,
                  backgroundSize: '200% 100%', // Makes the gradient twice as wide as the button to animate across
                  backgroundPositionX: 'var(--x)', // Controls the horizontal position of the background
                }}
                disabled={isGlobalLoading}
                {...shinyAnimationProps}
              >
                {isGlobalLoading ? (
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
                      Register
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
                <p className="text-destructive text-center mt-4">
                  {serverError}
                </p>
              )}
            </form>
          ) : (
            <div className="">
              <h3 className="text-xl font-semibold text-center mb-4">
                Enter OTP
              </h3>
              <div className="flex justify-center gap-6">
                {otp?.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    ref={(e) => {
                      if (e) inputRefs.current[index] = e;
                    }}
                    maxLength={1}
                    className="w-12 h-12 text-center border outline-none rounded"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                  />
                ))}
              </div>
              {serverError && (
                <p className="text-destructive text-center mt-4">
                  {serverError}
                </p>
              )}
              <motion.button
                type="button"
                onClick={() => handleVerifyOtp(otp.join(''))}
                className="relative w-full py-2 mt-6 rounded-md
                           overflow-hidden cursor-pointer
                           font-semibold text-sm uppercase tracking-wide disabled:bg-orange-300 disabled:cursor-not-allowed
                           "
                style={{
                  backgroundColor: 'hsl(var(--tertiary))',
                  backgroundImage: `linear-gradient(-75deg, transparent calc(var(--x) + 20%), hsl(var(--tertiary-foreground))/20% calc(var(--x) + 25%), transparent calc(var(--x) + 100%))`,
                  backgroundSize: '200% 100%',
                  backgroundPositionX: 'var(--x)',
                }}
                disabled={isGlobalLoading || otp.some((d) => d === '')} // Disable if loading or OTP not complete
                {...shinyAnimationProps}
              >
                {isGlobalLoading ? (
                  <div className="flex items-center justify-center text-tertiary-foreground">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-current"
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
                    Verifying...
                  </div>
                ) : (
                  <span className="relative block z-20 text-tertiary-foreground">
                    Verify OTP
                  </span>
                )}
              </motion.button>

              <div className="flex justify-between items-center text-sm mt-4">
                <span className="text-muted-foreground">
                  Time remaining: {timer}s
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || isGlobalLoading} // Disable if timer is active or loading
                  className={`font-semibold ${
                    canResend
                      ? 'text-link hover:underline'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Resend OTP
                </button>
              </div>
            </div>
          )}

          <BorderBeam duration={8} size={100} />
        </div>
      </div>
    </div>
  );
}
