"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/logo.png";
import { useLogin } from "@/react-query/queries/auth/auth";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// --- Login Page ---
const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
export default function LoginPage() {
  const navigate = useNavigate();
  const { mutate: login, isPending: isLoadingLogin } = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const handleLogin = (data: LoginFormValues) => {
    localStorage.clear();
    login(
      {
        username: data.username,
        password: data.password,
      },
      {
        onSuccess: (value) => {
          localStorage.setItem("token", value.token);
          navigate("/main");
        },
      }
    );
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-background font-sans text-foreground">
      {/* --- Background Elements (Mappacific Theme) --- */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--secondary)_0%,_transparent_50%)]" />

      {/* Primary Green Blob */}
      <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-primary/5 rounded-full blur-3xl animate-blob" />
      {/* Destructive Orange Blob */}
      <div className="absolute top-[20%] -right-[10%] w-[40vw] h-[40vw] bg-destructive/5 rounded-full blur-3xl animate-blob animation-delay-2000" />

      {/* Texture */}
      <div className="absolute inset-0 opacity-[0.02] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* --- Login Card --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-md p-4"
      >
        <div className="relative bg-card/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden">
          {/* Decorative Top Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-destructive" />

          <div className="p-8 space-y-8">
            {/* Header / Logo Area */}
            <div className="text-center space-y-2">
              <img src={Logo} className="w-32" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Chào mừng trở lại!
              </h1>
              <p className="text-sm text-muted-foreground">
                Đăng nhập hệ thống điều khiển quay số
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <div className="relative group items-center flex">
                  <User className="absolute left-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="username"
                    placeholder="admin@mappacific.com"
                    className="pl-10"
                    required
                    {...register("username")}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Mật khẩu</Label>
                </div>
                <div className="relative group items-center flex">
                  <Lock className="absolute left-3 h-5 w-5 text-muted-foreground group-focus-within:text-destructive transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    required
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full text-base group"
                disabled={isLoadingLogin}
                onClick={handleSubmit(handleLogin)}
              >
                {isLoadingLogin ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
              Mappacific Singapore &copy; 2024. All rights reserved.
            </div>
          </div>
        </div>

        {/* Glow Effects behind card */}
        <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
      </motion.div>
    </div>
  );
}
