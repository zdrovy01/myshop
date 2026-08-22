"use server";

import { todayWarsaw } from "@/lib/date";
import { createAdminClient } from "@/lib/supabase/admin";

export type AddDoneResult =
  | { error: string }
  | { ok: true; taskId: string; employeeName: string; completedAt: string };

// Працівник додає те, що зробив (поза списком): нове завдання + виконання.
export async function addDoneTask(input: {
  token: string;
  employeeId: string;
  pin: string;
  description: string;
}): Promise<AddDoneResult> {
  const supabase = createAdminClient();
  const description = input.description.trim();
  if (!description) return { error: "Wpisz, co zostało zrobione." };

  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("qr_token", input.token)
    .maybeSingle();
  if (!user) return { error: "Nieprawidłowy link." };

  const { data: emp } = await supabase
    .from("employees")
    .select("id, name, pin, user_id")
    .eq("id", input.employeeId)
    .maybeSingle();
  if (!emp || emp.user_id !== user.id) {
    return { error: "Nieprawidłowy pracownik." };
  }
  if (emp.pin !== input.pin.trim()) return { error: "Nieprawidłowy PIN." };

  const today = todayWarsaw();
  const { data: last } = await supabase
    .from("tasks")
    .select("position")
    .eq("user_id", user.id)
    .eq("task_date", today)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const position = (last?.position ?? 0) + 1;

  const { data: task, error: taskErr } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      name: description,
      priority: 2,
      requires_photo: false,
      position,
      task_date: today,
    })
    .select("id")
    .single();
  if (taskErr || !task) return { error: "Nie udało się zapisać." };

  const completedAt = new Date().toISOString();
  const { error: compErr } = await supabase.from("task_completions").insert({
    task_id: task.id,
    employee_id: emp.id,
    note: null,
    photo_url: null,
  });
  if (compErr) return { error: "Nie udało się zapisać." };

  return {
    ok: true,
    taskId: task.id,
    employeeName: emp.name,
    completedAt,
  };
}

export type CompleteInput = {
  taskId: string;
  employeeId: string; // головний виконавець (вводить PIN)
  helperIds?: string[]; // додаткові виконавці
  pin: string;
  note: string;
  photoBase64: string | null; // data URL
};

export type CompleteResult = { error: string } | { ok: true };

export async function completeTask(
  input: CompleteInput,
): Promise<CompleteResult> {
  const supabase = createAdminClient();

  const { data: task } = await supabase
    .from("tasks")
    .select("id, user_id, requires_photo")
    .eq("id", input.taskId)
    .maybeSingle();
  if (!task) return { error: "Nie znaleziono zadania." };

  const { data: emp } = await supabase
    .from("employees")
    .select("id, pin, user_id")
    .eq("id", input.employeeId)
    .maybeSingle();
  if (!emp || emp.user_id !== task.user_id) {
    return { error: "Nieprawidłowy pracownik." };
  }
  if (emp.pin !== input.pin.trim()) {
    return { error: "Nieprawidłowy PIN." };
  }
  if (task.requires_photo && !input.photoBase64) {
    return { error: "To zadanie wymaga zdjęcia." };
  }

  let photoUrl: string | null = null;
  if (input.photoBase64) {
    const match = input.photoBase64.match(/^data:(image\/\w+);base64,(.+)$/);
    if (match) {
      const contentType = match[1];
      const bytes = Buffer.from(match[2], "base64");
      const ext = contentType.split("/")[1];
      const path = `${task.user_id}/${input.taskId}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("task-photos")
        .upload(path, bytes, { contentType });
      if (!upErr) {
        photoUrl = supabase.storage.from("task-photos").getPublicUrl(path)
          .data.publicUrl;
      }
    }
  }

  // Додаткові виконавці — лише ті, що належать тому ж власнику.
  const helperIds = [...new Set(input.helperIds ?? [])].filter(
    (id) => id && id !== input.employeeId,
  );
  let validHelpers: string[] = [];
  if (helperIds.length) {
    const { data: emps } = await supabase
      .from("employees")
      .select("id")
      .eq("user_id", task.user_id)
      .in("id", helperIds);
    validHelpers = (emps ?? []).map((e) => e.id as string);
  }

  const { error } = await supabase.from("task_completions").insert({
    task_id: input.taskId,
    employee_id: input.employeeId,
    helper_ids: validHelpers,
    note: input.note.trim() || null,
    photo_url: photoUrl,
  });
  if (error) return { error: "Nie udało się zapisać wykonania." };

  return { ok: true };
}
