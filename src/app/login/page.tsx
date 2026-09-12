"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Field, Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      setFormError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    router.push("/equipment");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-xl font-semibold mb-6 text-center">เข้าสู่ระบบ</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="อีเมล" error={errors.email?.message}>
          <Input type="email" {...register("email")} />
        </Field>
        <Field label="รหัสผ่าน" error={errors.password?.message}>
          <Input type="password" {...register("password")} />
        </Field>
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </Button>
      </form>
      <p className="text-sm text-gray-600 mt-4 text-center">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="text-blue-600 hover:underline">
          สมัครสมาชิก
        </Link>
      </p>
    </div>
  );
}
