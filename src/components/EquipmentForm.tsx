"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  equipmentSchema,
  type EquipmentFormValues,
  type EquipmentInput,
} from "@/lib/validations";
import { Field, Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import PhotoUpload from "@/components/PhotoUpload";
import type { Equipment } from "@/lib/types";

export default function EquipmentForm({ equipment }: { equipment?: Equipment }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(equipment?.photo_url ?? null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EquipmentFormValues, unknown, EquipmentInput>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: equipment
      ? {
          name: equipment.name,
          total_quantity: equipment.total_quantity,
          category: equipment.category ?? "",
          room: equipment.room ?? "",
        }
      : { total_quantity: 1 },
  });

  async function onSubmit(values: EquipmentInput) {
    setFormError(null);
    const payload = { ...values, photo_url: photoUrl ?? undefined };
    const res = await fetch(equipment ? `/api/equipment/${equipment.id}` : "/api/equipment", {
      method: equipment ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setFormError(body.error ?? "บันทึกไม่สำเร็จ");
      return;
    }
    router.push("/admin/equipment");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
      <Field label="ชื่ออุปกรณ์" error={errors.name?.message}>
        <Input {...register("name")} />
      </Field>
      <Field label="จำนวนทั้งหมด" error={errors.total_quantity?.message}>
        <Input type="number" min={0} {...register("total_quantity")} />
      </Field>
      <Field label="หมวดหมู่ (ไม่บังคับ)" error={errors.category?.message}>
        <Input {...register("category")} />
      </Field>
      <Field label="ห้อง/สาขา (ไม่บังคับ)" error={errors.room?.message}>
        <Input {...register("room")} />
      </Field>
      <Field label="รูปอุปกรณ์">
        <PhotoUpload pathPrefix={`equipment/${equipment?.id ?? "new"}`} onUploaded={setPhotoUrl} />
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoUrl} alt="รูปอุปกรณ์" className="h-20 w-20 object-cover rounded border mt-2" />
        )}
      </Field>
      {formError && <p className="text-sm text-red-600">{formError}</p>}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
      </Button>
    </form>
  );
}
