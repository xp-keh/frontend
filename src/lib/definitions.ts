import { z } from 'zod';

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .trim(),
  username: z
    .string()
    .min(3, { message: 'Username must be at least 3 characters long.' })
    .max(20, { message: 'Username cannot exceed 20 characters.' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Username can only contain letters, numbers, and underscores.',
    })
    .trim(),
  email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password: z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .regex(/[^a-zA-Z0-9]/, {
      message: 'Contain at least one special character.',
    })
    .trim(),
});

export type SignUpFormState =
  | {
    errors?: {
      name?: string[];
      username?: string[];
      email?: string[];
      password?: string[];
    };
    message?: string;
  }
  | undefined;

  export const SigninFormSchema = z.object({
    username: z
      .string()
      .min(3, { message: 'Username must be at least 3 characters long.' })
      .max(20, { message: 'Username cannot exceed 20 characters.' })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores.',
      })
      .trim(),
    password: z
      .string()
      .min(8, { message: 'Be at least 8 characters long' })
      .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
      .regex(/[0-9]/, { message: 'Contain at least one number.' })
      .regex(/[^a-zA-Z0-9]/, {
        message: 'Contain at least one special character.',
      })
      .trim(),
  });  

export type SignInFormState =
  | {
    errors?: {
      username?: string[];
      password?: string[];
    };
    message?: string;
  }
  | undefined;
