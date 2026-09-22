"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-xl font-semibold text-center">เข้าสู่ระบบแอดมิน</h1>
      <p className="text-sm text-gray-500 text-center mt-1 mb-6">
        สำหรับแอดมินเท่านั้น — นักศึกษาไม่ต้องเข้าสู่ระบบเพื่อยืมอุปกรณ์
      </p>
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
    </div>
  );
}
