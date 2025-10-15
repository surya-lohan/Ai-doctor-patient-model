import { useFormik } from 'formik';
import React, { useContext, useState } from 'react';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/contexts/AuthContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import GoogleButton from '@/components/GoogleButton';
import Logo from '@/components/Logo';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient } from '@/util/supabase/component';

const SignUpPage = () => {
  const router = useRouter();
  const { initializing, signUp } = useContext(AuthContext);
  const [showPw, setShowPw] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignUp = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { email, password, name, specialty } = formik.values;
      
      // Register with Supabase and include user metadata
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            specialty
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        await signUp(email, password);
        toast({
          title: "Success",
          description: "Account created successfully. Please log in.",
        });
        router.push('/login');
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const validationSchema = Yup.object().shape({
    email: Yup.string().required("Email is required").email("Email is invalid"),
    password: Yup.string()
      .required("Password is required")
      .min(4, "Must be at least 4 characters")
      .max(40, "Must not exceed 40 characters"),
    name: Yup.string().required("Name is required"),
    specialty: Yup.string().required("Specialty is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      name: '',
      specialty: '',
    },
    validationSchema,
    onSubmit: handleSignUp,
  });

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSignUp(e);
    }
  };

  return (
    <div className="flex h-screen bg-background justify-center items-center">
      <div className="flex flex-col gap-5 h-auto">
        <div className="w-full flex justify-center cursor-pointer" onClick={() => router.push("/")}>
          <Logo />
        </div>

        <Card className="w-full md:w-[440px]" onKeyDown={handleKeyPress}>
          <CardHeader>
            <CardTitle className="text-center">Sign up</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4">
                  <GoogleButton />
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      router.push('/magic-link-login');
                    }}
                    variant="outline"
                  >
                    Continue with Magic Link
                  </Button>
                </div>

                <div className="flex items-center w-full">
                  <Separator className="flex-1" />
                  <span className="mx-4 text-muted-foreground text-sm font-semibold whitespace-nowrap">or</span>
                  <Separator className="flex-1" />
                </div>

                <div className="flex flex-col gap-6">
                  <p className="text-center text-sm text-muted-foreground">Enter your details</p>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter your email"
                        value={formik.values.email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.email && formik.errors.email && (
                        <p className="text-destructive text-xs">{formik.errors.email}</p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPw ? 'text' : 'password'}
                          placeholder="Enter your password"
                          value={formik.values.password}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPw(!showPw)}
                        >
                          {showPw
                            ? <FaEye className="text-muted-foreground" />
                            : <FaEyeSlash className="text-muted-foreground" />
                          }
                        </Button>
                      </div>
                      {formik.touched.password && formik.errors.password && (
                        <p className="text-destructive text-xs">{formik.errors.password}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      {formik.touched.name && formik.errors.name && (
                        <p className="text-destructive text-xs">{formik.errors.name}</p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Label htmlFor="specialty">Medical Specialty</Label>
                      <Select
                        name="specialty"
                        value={formik.values.specialty}
                        onValueChange={(value) => formik.setFieldValue('specialty', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general_practice">General Practice</SelectItem>
                          <SelectItem value="internal_medicine">Internal Medicine</SelectItem>
                          <SelectItem value="pediatrics">Pediatrics</SelectItem>
                          <SelectItem value="cardiology">Cardiology</SelectItem>
                          <SelectItem value="neurology">Neurology</SelectItem>
                          <SelectItem value="psychiatry">Psychiatry</SelectItem>
                          <SelectItem value="surgery">Surgery</SelectItem>
                          <SelectItem value="emergency_medicine">Emergency Medicine</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {formik.touched.specialty && formik.errors.specialty && (
                        <p className="text-destructive text-xs">{formik.errors.specialty}</p>
                      )}
                    </div>

                    <div className="flex justify-end mt-2 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <span>Already have an account?</span>
                        <Button
                          type="button"
                          variant="link"
                          className="p-0"
                          onClick={() => router.push('/login')}
                        >
                          Log in
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || initializing || !formik.values.email || !formik.values.password || !formik.isValid}
                  onClick={handleSignUp}
                >
                  Sign Up
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUpPage;
