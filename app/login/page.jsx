"use client";

import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {};

    if (!email.trim() || !emailRegex.test(email)) {
      newErrors.email = "Invalid email address";
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      if (user) {
        router.push("/");
        toast.success("Successfully logged in!");
      }
      setErrors({});
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong!')
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center max-w-7xl mx-auto min-h-screen px-3">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 border shadow-lg lg:w-1/2 md:w-3/4 sm:w-4/5 w-full items-center justify-center p-2 sm:p-4 my-5"
      >
        <div className="mb-3 w-full text-center">
          <h1 className="font-semibold text-2xl text-primary">ChitChat</h1>
          <p className="text-sm text-foreground">Log in to ChitChat</p>
        </div>

        <div className="w-full">
          <h3 className="font-medium mb-1">Email</h3>
          <input
            type="email"
            className="w-full p-2 border focus:ring ring-offset-background focus:outline-none rounded-md"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && (
            <span className="text-sm text-red-500">{errors.email}</span>
          )}
        </div>
        <div className="w-full">
          <h3 className="font-medium mb-1">Password</h3>
          <input
            type="password"
            className="w-full p-2 border focus:ring ring-offset-background focus:outline-none rounded-md"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && (
            <span className="text-sm text-red-500">{errors.password}</span>
          )}
        </div>

        <div className="w-full mt-4">
          <button
            type="submit"
            className="w-full p-2 rounded-md text-background bg-primary flex items-center justify-center hover:bg-primary/80"
          >
            {loading ? (
              <span className="animate-spin">
                <Loader2 />
              </span>
            ) : (
              <span>Log in</span>
            )}
          </button>
        </div>

        <div>
          <span>First time using ChitChat? </span>
          <Link href="/register" className="text-primary hover:underline">
            Register!
          </Link>
        </div>
      </form>
    </div>
  );
}
