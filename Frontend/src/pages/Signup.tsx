import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Mail, Lock, User, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { fetchWithAuth } from '@/utils/api';

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(formData.password) },
    { label: 'Contains a letter', met: /[a-zA-Z]/.test(formData.password) },
  ];

  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure your passwords match.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const signupResponse = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const signupData = await signupResponse.json();

      if (!signupResponse.ok) {
        const errorMessage =
          signupData?.email?.[0] ||
          signupData?.username?.[0] ||
          signupData?.password?.[0] ||
          signupData?.detail ||
          'Signup failed';
        throw new Error(errorMessage);
      }

      const loginResponse = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        toast({
          title: 'Account created',
          description: 'Please login manually',
        });
        navigate('/login');
        return;
      }

      localStorage.setItem('access', loginData.access);
      localStorage.setItem('refresh', loginData.refresh);
      localStorage.setItem('user', JSON.stringify(loginData.user));

      toast({
        title: 'Account created!',
        description: "Welcome to JobTracker. Let's get started!",
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Signup failed',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-lg">
              <Briefcase className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">JobTracker</h1>
              <p className="text-sm text-muted-foreground">Smart Applications</p>
            </div>
          </div>
        </div>

        <Card className="shadow-card animate-scale-in">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>
              Start tracking your job applications today
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="John Doe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                
                {formData.password && (
                  <div className="space-y-1 pt-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <Check 
                          className={cn(
                            'h-3 w-3',
                            req.met ? 'text-success' : 'text-muted-foreground'
                          )} 
                        />
                        <span className={req.met ? 'text-success' : 'text-muted-foreground'}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className={cn(
                      'pl-10',
                      formData.confirmPassword && (passwordsMatch ? 'border-success' : 'border-destructive')
                    )}
                    required
                  />
                  {formData.confirmPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {passwordsMatch ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <span className="text-xs text-destructive">No match</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full gap-2 mt-6"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link to="/login">
                Sign in instead
              </Link>
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-primary hover:underline">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}