"use client";

import React, { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock, Mail, Loader2, CheckCircle2, AlertCircle, Building2, Moon, Sun } from "lucide-react";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);
  const [darkMode, setDarkMode] = React.useState(false);

  // Toggle Theme class on the html element
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 sm:p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Theme toggle */}
      <div className="absolute top-6 right-6">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleDarkMode}
          className="rounded-lg h-9 w-9 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          type="button"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>

      <div className="w-full max-w-[400px]">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center justify-center text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Building2 className="h-5 w-5" />
          </div>
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            SmartERP
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Enterprise accounting & operations foundation
          </p>
        </div>

        {/* Card */}
        <Card className="rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-none">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
              Sign In
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Enter credentials below to access your company database.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 grid gap-4">
            {/* Status alerts */}
            {state?.success && (
              <div className="flex items-start gap-2.5 rounded-md bg-emerald-50/60 border border-emerald-100 p-3 text-xs text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block">{state.message}</span>
                  {state.user && (
                    <span className="block text-[11px] text-emerald-700/90 dark:text-emerald-400/80 mt-0.5">
                      Logged in as: {state.user.name} ({state.user.email})
                    </span>
                  )}
                </div>
              </div>
            )}

            {state && !state.success && (
              <div className="flex items-start gap-2.5 rounded-md bg-red-50/60 border border-red-100 p-3 text-xs text-red-800 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1 font-semibold">{state.error}</div>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@company.com"
                    required
                    className="pl-9 h-10 rounded-md border-slate-200 dark:border-slate-800 bg-slate-50/40 hover:bg-slate-50/80 focus:bg-white dark:bg-slate-950 dark:hover:bg-slate-950 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Password
                  </Label>
                  <a
                    href="#"
                    className="text-xs text-blue-600 hover:text-blue-500 transition-colors font-medium"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    className="pl-9 h-10 rounded-md border-slate-200 dark:border-slate-800 bg-slate-50/40 hover:bg-slate-50/80 focus:bg-white dark:bg-slate-950 dark:hover:bg-slate-950 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" className="h-4 w-4 rounded border-slate-300 dark:border-slate-700" />
                  <label
                    htmlFor="remember"
                    className="text-xs text-slate-500 dark:text-slate-400 cursor-pointer select-none font-medium"
                  >
                    Keep me signed in
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-10 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all active:scale-[0.99] disabled:opacity-75"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 border-t border-slate-100 dark:border-slate-800 p-6 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Database connection status is checked automatically on submit.
            </p>
            <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Seed Credential:</span>
              <div className="mt-0.5 font-mono text-[11px]">admin@smarterp.com / password123</div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
