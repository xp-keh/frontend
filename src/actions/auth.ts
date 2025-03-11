import { SignupFormSchema, SignUpFormState } from '@/lib/definitions'
import { SigninFormSchema, SignInFormState } from '@/lib/definitions'

export async function signup(state: SignUpFormState, formData: FormData) {
    const validatedFields = SignupFormSchema.safeParse({
        name: formData.get('name'),
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password')
    })

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        }
    }

    const { name, username, email, password } = validatedFields.data

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, username, email, password }),
            credentials: 'include',
        })

        if (!response.ok) {
            const errorData = await response.json()
            return {
                message: errorData.message || 'Failed to create account.',
            }
        }

        const data = await response.json()

        return {
            message: 'Account created successfully!',
        }

    } catch (error) {
        console.error('Signup error:', error)
        return {
            message: 'An unexpected error occurred. Please try again later.',
        }
    }
}

export async function signin(state: SignInFormState, formData: FormData) {
    const validatedFields = SigninFormSchema.safeParse({
        username: formData.get('username'),
        password: formData.get('password'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { username, password } = validatedFields.data;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json();
            return {
                message: errorData.error || 'Failed to sign in. Please check your credentials.',
            };
        }

        const data = await response.json();

        localStorage.setItem('refreshToken', data.refreshToken);
        
        return {
            message: 'Signed in successfully!',
        };        

    } catch (error) {
        console.error('Signin error:', error);
        return {
            message: 'An unexpected error occurred. Please try again later.',
        };
    }
}

