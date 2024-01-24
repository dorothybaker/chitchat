"use client";

import { auth, firestore } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AvatarGenerator } from "random-avatar-generator";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Page() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  const router = useRouter();

  const generateRandomAvatar = () => {
    const generator = new AvatarGenerator();
    return generator.generateRandomAvatar();
  };

  const handleAvatarChange = () => {
    setAvatarUrl(generateRandomAvatar());
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!email.trim() || !emailRegex.test(email)) {
      newErrors.email = "Invalid email address";
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const docRef = doc(firestore, "users", user.uid);
      await setDoc(docRef, { name, email, avatarUrl });

      router.push("/");
      toast.success("Successfully registered!");
      setErrors({});
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };

  useEffect(() => {
    setAvatarUrl(generateRandomAvatar());
  }, []);

  return (
    <div className="flex items-center justify-center max-w-7xl mx-auto min-h-screen px-3">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 border shadow-lg lg:w-1/2 md:w-3/4 sm:w-4/5 w-full flex items-center justify-center p-2 sm:p-4 my-5"
      >
        <div className="mb-3 w-full text-center">
          <h1 className="font-semibold text-2xl text-primary">ChitChat</h1>
          <p className="text-sm text-foreground">
            Create an account to use ChitChat
          </p>
        </div>
        <div className="flex justify-between items-center w-full">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="sm:h-20 sm:w-20 h-16 w-16 rounded-full object-cover"
          />
          <button
            type="button"
            onClick={handleAvatarChange}
            className="px-3 py-1.5 rounded-md text-primary bg-transparent border-2 border-primary cursor-pointer"
          >
            New Avatar
          </button>
        </div>

        <div className="w-full">
          <h3 className="font-medium mb-1">Name</h3>
          <input
            type="text"
            className="w-full p-2 border focus:ring ring-offset-background focus:outline-none rounded-md"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <span className="text-sm text-red-500">{errors.name}</span>
          )}
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
        <div className="w-full">
          <h3 className="font-medium mb-1">Confirm Password</h3>
          <input
            type="password"
            className="w-full p-2 border focus:ring ring-offset-background focus:outline-none rounded-md"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <span className="text-sm text-red-500">
              {errors.confirmPassword}
            </span>
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
              <span>Register</span>
            )}
          </button>
        </div>

        <div>
          <span>Already have an account? </span>
          <Link href="/login" className="text-primary hover:underline">
            Log in!
          </Link>
        </div>
      </form>
    </div>
  );
}
