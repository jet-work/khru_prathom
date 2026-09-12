"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterFormValues, type RegisterInput } from "@/lib/validations";
import { YEARS } from "@/lib/constants";
import { Field, Input, Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues, unknown, RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.full_name,
          student_id: values.student_id,
          year: values.year,
        },
      },
    });
    if (error) {
      setFormError(
        error.message.includes("already registered")
          ? "อีเมลนี้ถูกใช้งานแล้ว"
          : "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่"
      );
      return;
    }
    router.push("/equipment");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <h1 className="text-xl font-semibold mb-6 text-center">สมัครสมาชิก</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="ชื่อ-นามสกุล" error={errors.full_name?.message}>
          <Input {...register("full_name")} />
        </Field>
        <Field label="รหัสนักศึกษา" error={errors.student_id?.message}>
          <Input {...register("student_id")} />
        </Field>
        <Field label="ชั้นปี" error={errors.year?.message}>
          <Select {...register("year")} defaultValue="">
            <option value="" disabled>
              เลือกชั้นปี
            </option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                ปี {y}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="อีเมล" error={errors.email?.message}>
          <Input type="email" {...register("email")} />
        </Field>
        <Field label="รหัสผ่าน" error={errors.password?.message}>
          <Input type="password" {...register("password")} />
        </Field>
        {formError && <p className="text-sm text-red-600">{formError}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "กำลังสมัคร..." : "สมัครสมาชิก"}
        </Button>
      </form>
      <p className="text-sm text-gray-600 mt-4 text-center">
        มีบัญชีอยู่แล้ว?{" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </div>
  );
}
