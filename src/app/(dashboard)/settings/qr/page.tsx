import { randomBytes } from "crypto";
import { headers } from "next/headers";
import QRCode from "qrcode";
import BackHeader from "@/components/BackHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/session";

export default async function QrCodePage() {
  const userId = await getSessionUserId();
  const supabase = createAdminClient();

  // Беремо токен користувача; якщо його нема — генеруємо і зберігаємо.
  const { data: user } = await supabase
    .from("users")
    .select("qr_token")
    .eq("id", userId)
    .maybeSingle();

  let token = user?.qr_token as string | null | undefined;
  if (!token) {
    token = randomBytes(8).toString("hex");
    await supabase.from("users").update({ qr_token: token }).eq("id", userId);
  }

  // Публічна сторінка списку задач (сам сайт ще не реалізовано).
  const host = (await headers()).get("host") ?? "myshop.zdrovy.com";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const url = `${protocol}://${host}/t/${token}`;

  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 240,
    margin: 1,
  });

  return (
    <div className="py-8">
      <BackHeader href="/settings" title="QR kod listy zadań" />

      <div className="flex max-w-sm flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Klucz (ID)</span>
          <code className="break-all rounded-[4px] border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">
            {token}
          </code>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Link</span>
          <code className="break-all rounded-[4px] border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
            {url}
          </code>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-700">Kod QR</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="Kod QR listy zadań"
            width={240}
            height={240}
            className="rounded-lg border border-gray-200"
          />
        </div>
      </div>
    </div>
  );
}
