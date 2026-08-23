"use client";

import { useState } from "react";
import Link from "next/link";
import { Link2 } from "lucide-react";

import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@LinkTrim/ui/components/card";

export default function LoginPage() {
  const [showSignIn, setShowSignIn] = useState(true);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 px-4 py-10">
      <Link href="/" className="group flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
          <Link2 className="size-5" />
        </span>
        <span className="text-lg font-semibold tracking-tight">LinkTrim</span>
      </Link>

      <Card className="w-full max-w-md shadow-sm">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-xl font-semibold tracking-tight">
            {showSignIn ? "Welcome back" : "Create your account"}
          </CardTitle>
          <CardDescription>
            {showSignIn
              ? "Sign in to manage your links."
              : "Start shortening and tracking links in minutes."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showSignIn ? (
            <SignInForm />
          ) : (
            <SignUpForm />
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        {showSignIn ? "New to LinkTrim?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => setShowSignIn((v) => !v)}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {showSignIn ? "Create an account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
