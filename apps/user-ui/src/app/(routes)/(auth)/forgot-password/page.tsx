'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, type AnimationProps } from 'motion/react';
import { isAxiosError } from 'axios';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { BorderBeam } from '../../../../components/ui/BorderBeam';
import authHooks from '../../../../hooks/auth-hooks';

type FormData = {
  email: string;
};

// Define a new type for the reset password form data
type ResetPasswordFormData = {
  password: string;
  confirmPassword: string;
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

export default function ForgotPasswordPage() {
  const router = useRouter();
  // Changed inputRef to an array of refs for OTP inputs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [step, setStep] = useState<'email' | 'otp' | 'reset'>('email');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Initialize React Query mutation for login
  const {
    useUserForgotPassword,
    useVerifyUserForgotPassword,
    useResetUserPassword,
  } = authHooks;
  const forgotPasswordMutation = useUserForgotPassword();
  const verifyForgotPasswordMutation = useVerifyUserForgotPassword(); // Renamed for clarity
  const resetPasswordMutation = useResetUserPassword(); // Assuming you have this hook

  const emailForm = useForm<FormData>(); // Renamed for email step
  const resetPasswordForm = useForm<ResetPasswordFormData>(); // Form for reset password

  // Effect for managing the resend timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!canResend && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(interval!);
            setCanResend(true);
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [canResend, timer]);

  // Handler for form submission (request OTP for email)
  const onRequestOtpSubmit = emailForm.handleSubmit(async (data: FormData) => {
    setServerError(null); // Clear previous errors
    forgotPasswordMutation.mutate(data, {
      onSuccess: (res, data) => {
        setUserEmail(data.email);
        setStep('otp');
        setServerError(null);
        setCanResend(false);
        setTimer(60);

        console.log('OTP sent successful:', res, data);
        toast.success('OTP sent Successful', {
          description: res.message || 'We have sent you an OTP.',
          position: 'top-right',
        });
        // router.push('/'); // You can uncomment this if you want to redirect
      },
      onError: (error) => {
        let errorMessage = 'Forgot password failed. Please try again.';
        if (isAxiosError(error) && error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        setServerError(errorMessage);
        toast.error('Forgot Password Failed', {
          // Changed toast title
          description: errorMessage,
          position: 'top-right',
        });
      },
    });
  });

  // Handler for OTP verification (renamed and modified to accept otp string)
  const handleVerifyOtp = async (otpValue: string) => {
    if (!userEmail) {
      setServerError('Email is missing. Please restart the process.');
      toast.error('Verification Error', {
        description: 'Email is missing. Please restart the process.',
        position: 'top-right',
      });
      return;
    }

    setServerError(null); // Clear previous errors
    verifyForgotPasswordMutation.mutate(
      { email: userEmail, otp: otpValue }, // Pass email and OTP
      {
        onSuccess: (res) => {
          // Removed 'data' from onSuccess signature if not needed
          setStep('reset');
          setServerError(null);
          // No need to reset timer/canResend here unless resending OTP for reset is an option
          console.log('OTP verification successful:', res);
          toast.success('OTP verification successful', {
            description:
              res.message ||
              'Your OTP has been verified. Please set a new password.',
            position: 'top-right',
          });
          // router.push('/'); // You can uncomment this if you want to redirect
        },
        onError: (error) => {
          let errorMessage = 'OTP verification failed. Please try again.';
          if (isAxiosError(error) && error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error instanceof Error) {
            errorMessage = error.message;
          }
          setServerError(errorMessage);
          toast.error('Verification Failed', {
            // Changed toast title
            description: errorMessage,
            position: 'top-right',
          });
        },
      }
    );
  };

  // Handler for resending OTP
  const handleResendOtp = () => {
    if (canResend && userEmail) {
      setServerError(null);
      forgotPasswordMutation.mutate(
        { email: userEmail },
        {
          onSuccess: (res) => {
            setCanResend(false);
            setTimer(60);
            toast.success('OTP Resent', {
              description:
                res.message || 'A new OTP has been sent to your email.',
              position: 'top-right',
            });
          },
          onError: (error) => {
            let errorMessage = 'Failed to resend OTP. Please try again.';
            if (isAxiosError(error) && error.response?.data?.message) {
              errorMessage = error.response.data.message;
            } else if (error instanceof Error) {
              errorMessage = error.message;
            }
            setServerError(errorMessage);
            toast.error('Resend Failed', {
              description: errorMessage,
              position: 'top-right',
            });
          },
        }
      );
    }
  };

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

  // Handler for reset password submission
  const onResetPasswordSubmit = resetPasswordForm.handleSubmit(
    async (data: ResetPasswordFormData) => {
      if (data.password !== data.confirmPassword) {
        resetPasswordForm.setError('confirmPassword', {
          type: 'manual',
          message: 'Passwords do not match.',
        });
        return;
      }

      if (!userEmail) {
        setServerError('Email is missing. Please restart the process.');
        toast.error('Reset Password Error', {
          description: 'Email is missing. Please restart the process.',
          position: 'top-right',
        });
        return;
      }

      setServerError(null);
      resetPasswordMutation.mutate(
        { email: userEmail, newPassword: data.password },
        {
          // Assuming OTP is needed here too
          onSuccess: (res) => {
            toast.success('Password Reset Successful', {
              description:
                res.message ||
                'Your password has been reset successfully. Please log in.',
              position: 'top-right',
            });
            router.push('/login'); // Redirect to login page after successful reset
          },
          onError: (error) => {
            let errorMessage = 'Failed to reset password. Please try again.';
            if (isAxiosError(error) && error.response?.data?.message) {
              errorMessage = error.response.data.message;
            } else if (error instanceof Error) {
              errorMessage = error.message;
            }
            setServerError(errorMessage);
            toast.error('Password Reset Failed', {
              description: errorMessage,
              position: 'top-right',
            });
          },
        }
      );
    }
  );

  return (
    <div className="w-full py-20 min-h-[85vh] bg-primary-foreground">
      <h1 className="text-3xl font-Poppins font-semibold text-center">
        Forgot Password
      </h1>
      <p className="text-center text-lg py-3 text-foreground">Welcome back, </p>
      <div className="w-full flex justify-center">
        <div className="p-8 bg-background shadow-xl rounded-xl md:w-[540px] relative">
          <h4 className="text-3xl text-content-light-dark text-center mb-2 font-medium">
            Forgot Password
          </h4>
          <p className="text-center text-muted-foreground mb-4">
            Back to login{' '}
            <Link href="/login" className="text-link">
              Sign In
            </Link>
          </p>

          {/* Conditional Rendering based on step */}
          {step === 'email' && (
            <form onSubmit={onRequestOtpSubmit}>
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
                {...emailForm.register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, // Added a basic email regex
                    message: 'Please enter a valid email address',
                  },
                })}
              />
              {emailForm.formState.errors.email && (
                <p className="text-destructive text-sm mt-1">
                  {emailForm.formState.errors.email.message}
                </p>
              )}

              <div className="flex items-center justify-between mt-4">
                <Link href="/login">
                  {' '}
                  {/* Changed to login link */}
                  <span className="text-link text-sm hover:underline">
                    Back to Sign In
                  </span>
                </Link>
              </div>

              <motion.button
                type="submit"
                className="relative w-full py-2 mt-6 rounded-md
                          overflow-hidden cursor-pointer
                          font-semibold text-sm uppercase tracking-wide
                          "
                style={{
                  backgroundColor: 'hsl(var(--tertiary))',
                  backgroundImage: `linear-gradient(-75deg, transparent calc(var(--x) + 20%), hsl(var(--tertiary-foreground))/20% calc(var(--x) + 25%), transparent calc(var(--x) + 100%))`,
                  backgroundSize: '200% 100%',
                  backgroundPositionX: 'var(--x)',
                }}
                disabled={forgotPasswordMutation.isPending}
                {...shinyAnimationProps}
              >
                {forgotPasswordMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </div>
                ) : (
                  <>
                    <span
                      className="relative block size-full z-20 text-primary-foreground"
                      style={{
                        maskImage:
                          'linear-gradient(-75deg,hsl(var(--tertiary)) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),hsl(var(--tertiary)) calc(var(--x) + 100%))',
                        WebkitMaskImage:
                          'linear-gradient(-75deg,hsl(var(--tertiary)) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),hsl(var(--tertiary)) calc(var(--x) + 100%))',
                      }}
                    >
                      Request OTP
                    </span>
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
            </form>
          )}

          {step === 'otp' && (
            <div className="otp-verification-section">
              <p className="text-center text-muted-foreground mb-4">
                Enter the 6-digit code sent to {userEmail}.
              </p>
              <div className="flex justify-center gap-2 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    ref={(el: HTMLInputElement | null) => {
                      // Explicitly set return type to void
                      inputRefs.current[index] = el;
                    }}
                    className="w-10 h-10 text-center text-lg border outline-0 rounded
                                 border-tertiary dark:border-border bg-input dark:bg-input/30
                                 focus:outline-none focus:border-tertiary dark:focus:border-focus
                                 transition-all duration-500 text-input-foreground"
                  />
                ))}
              </div>

              {serverError && (
                <p className="text-destructive text-center mt-4">
                  {serverError}
                </p>
              )}

              <div className="flex justify-between items-center mt-4 text-sm">
                <span className="text-muted-foreground">
                  Didn&apos;t receive the code?
                </span>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={!canResend || forgotPasswordMutation.isPending}
                  className={`text-link font-medium ${
                    !canResend ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {canResend ? 'Resend OTP' : `Resend in ${timer}s`}
                </button>
              </div>

              {/* You might want a manual "Verify OTP" button as a fallback if auto-verify doesn't trigger */}
              <motion.button
                type="button" // Change to button since auto-verify is handled by input change
                onClick={() => handleVerifyOtp(otp.join(''))}
                className="relative w-full py-2 mt-6 rounded-md
                          overflow-hidden cursor-pointer
                          font-semibold text-sm uppercase tracking-wide
                          "
                style={{
                  backgroundColor: 'hsl(var(--tertiary))',
                  backgroundImage: `linear-gradient(-75deg, transparent calc(var(--x) + 20%), hsl(var(--tertiary-foreground))/20% calc(var(--x) + 25%), transparent calc(var(--x) + 100%))`,
                  backgroundSize: '200% 100%',
                  backgroundPositionX: 'var(--x)',
                }}
                disabled={
                  verifyForgotPasswordMutation.isPending ||
                  otp.some((digit) => digit === '')
                }
                {...shinyAnimationProps}
              >
                {verifyForgotPasswordMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  <>
                    <span
                      className="relative block size-full z-20 text-primary-foreground"
                      style={{
                        maskImage:
                          'linear-gradient(-75deg,hsl(var(--tertiary)) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),hsl(var(--tertiary)) calc(var(--x) + 100%))',
                        WebkitMaskImage:
                          'linear-gradient(-75deg,hsl(var(--tertiary)) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),hsl(var(--tertiary)) calc(var(--x) + 100%))',
                      }}
                    >
                      Verify OTP
                    </span>
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
            </div>
          )}

          {step === 'reset' && (
            <form onSubmit={onResetPasswordSubmit}>
              <label
                htmlFor="password"
                className="block mb-1 text-content-light-dark"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  className="w-full p-2 border outline-0 rounded placeholder-text-placeholder border-tertiary dark:border-border bg-input dark:bg-input/30 focus:outline-none focus:border-tertiary dark:focus:border-focus transition-all duration-500 text-input-foreground"
                  placeholder="Enter new password"
                  {...resetPasswordForm.register('password', {
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters long.',
                    },
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
              {resetPasswordForm.formState.errors.password && (
                <p className="text-destructive text-sm mt-1">
                  {resetPasswordForm.formState.errors.password.message}
                </p>
              )}

              <label
                htmlFor="confirmPassword"
                className="block mb-1 mt-4 text-content-light-dark"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  className="w-full p-2 border outline-0 rounded placeholder-text-placeholder border-tertiary dark:border-border bg-input dark:bg-input/30 focus:outline-none focus:border-tertiary dark:focus:border-focus transition-all duration-500 text-input-foreground"
                  placeholder="Confirm new password"
                  {...resetPasswordForm.register('confirmPassword', {
                    required: 'Confirm password is required',
                    validate: (value) =>
                      value === resetPasswordForm.getValues('password') ||
                      'Passwords do not match.',
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
              {resetPasswordForm.formState.errors.confirmPassword && (
                <p className="text-destructive text-sm mt-1">
                  {resetPasswordForm.formState.errors.confirmPassword.message}
                </p>
              )}

              {serverError && (
                <p className="text-destructive text-center mt-4">
                  {serverError}
                </p>
              )}

              <motion.button
                type="submit"
                className="relative w-full py-2 mt-6 rounded-md
                          overflow-hidden cursor-pointer
                          font-semibold text-sm uppercase tracking-wide
                          "
                style={{
                  backgroundColor: 'hsl(var(--tertiary))',
                  backgroundImage: `linear-gradient(-75deg, transparent calc(var(--x) + 20%), hsl(var(--tertiary-foreground))/20% calc(var(--x) + 25%), transparent calc(var(--x) + 100%))`,
                  backgroundSize: '200% 100%',
                  backgroundPositionX: 'var(--x)',
                }}
                disabled={resetPasswordMutation.isPending}
                {...shinyAnimationProps}
              >
                {resetPasswordMutation.isPending ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </div>
                ) : (
                  <>
                    <span
                      className="relative block size-full z-20 text-primary-foreground"
                      style={{
                        maskImage:
                          'linear-gradient(-75deg,hsl(var(--tertiary)) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),hsl(var(--tertiary)) calc(var(--x) + 100%))',
                        WebkitMaskImage:
                          'linear-gradient(-75deg,hsl(var(--tertiary)) calc(var(--x) + 20%),transparent calc(var(--x) + 30%),hsl(var(--tertiary)) calc(var(--x) + 100%))',
                      }}
                    >
                      Reset Password
                    </span>
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
            </form>
          )}

          <BorderBeam duration={8} size={100} />
        </div>
      </div>
    </div>
  );
}
