import { randomBytes } from "crypto";
import { headers } from "next/headers";
import QRCode from "qrcode";
import BackHeader from "@/components/BackHeader";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSessionUserId } from "@/lib/session";
import DownloadPdfButton from "./DownloadPdfButton";

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
  const qrPrintDataUrl = await QRCode.toDataURL(url, {
    width: 1000,
    margin: 2,
  });

  return (
    <div className="py-8">
      <BackHeader href="/settings" title="QR kod listy zadań" />

      <div className="flex max-w-sm flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-200">Klucz (ID)</span>
          <code className="break-all rounded-[4px] border border-[#26262b] bg-[#232327] px-3 py-2 text-sm text-gray-100">
            {token}
          </code>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-200">Link</span>
          <code className="break-all rounded-[4px] border border-[#26262b] bg-[#232327] px-3 py-2 text-xs text-gray-300">
            {url}
          </code>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-gray-200">Kod QR</span>
          <div className="flex items-start gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrDataUrl}
              alt="Kod QR listy zadań"
              width={240}
              height={240}
              className="rounded-lg border border-[#26262b]"
            />
            <DownloadPdfButton qrDataUrl={qrPrintDataUrl} />
          </div>
        </div>
      </div>
    </div>
  );
}
