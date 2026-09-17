"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  borrowRequestSchema,
  type BorrowRequestFormValues,
  type BorrowRequestInput,
} from "@/lib/validations";
import { Field, Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function BorrowRequestForm({
  equipmentId,
  availableQuantity,
}: {
  equipmentId: string;
  availableQuantity: number;
}) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BorrowRequestFormValues, unknown, BorrowRequestInput>({
    resolver: zodResolver(borrowRequestSchema),
    defaultValues: { equipment_id: equipmentId, requested_quantity: 1 },
  });

  async function onSubmit(values: BorrowRequestInput) {
    setFormError(null);
    const res = await fetch("/api/borrow-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setFormError(body.error ?? "ส่งคำขอไม่สำเร็จ กรุณาลองใหม่");
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  if (availableQuantity <= 0) {
    return <p className="text-red-600 text-sm">อุปกรณ์นี้ไม่ว่างในขณะนี้</p>;
  }

  if (success) {
    return <p className="text-green-600 text-sm">ส่งคำขอยืมสำเร็จ รอการอนุมัติจากแอดมิน</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
      <input type="hidden" {...register("equipment_id")} />
      <Field label={`จำนวน (ว่าง ${availableQuantity})`} error={errors.requested_quantity?.message}>
        <Input type="number" min={1} max={availableQuantity} {...register("requested_quantity")} />
      </Field>
      <Field label="วันที่ยืม" error={errors.borrow_date?.message}>
        <Input type="date" {...register("borrow_date")} />
      </Field>
      <Field label="วันที่คืน" error={errors.return_date?.message}>
        <Input type="date" {...register("return_date")} />
      </Field>
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "กำลังส่งคำขอ..." : "ส่งคำขอยืม"}
      </Button>
    </form>
  );
}
