"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/login/actions";

function ListaZadanIcon() {
  return (
    <svg
      width="20"
      height="17"
      viewBox="0 0 39 33"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M7.375 14.75C3.3125 14.75 0 11.4219 0 7.375C0 3.32812 3.3125 0 7.375 0C11.4219 0 14.75 3.32812 14.75 7.375C14.75 11.4219 11.4219 14.75 7.375 14.75ZM6.48438 11.3594C6.89062 11.3594 7.26562 11.1406 7.5 10.7969L11.0625 5.48438C11.2344 5.20312 11.2969 4.98438 11.2969 4.75C11.2969 4.1875 10.7969 3.75 10.2031 3.75C9.8125 3.75 9.5 3.9375 9.25 4.34375L6.48438 8.75L5.3125 7.40625C5.07812 7.125 4.85938 6.98438 4.48438 6.98438C3.90625 6.98438 3.4375 7.4375 3.4375 8.04688C3.4375 8.32812 3.53125 8.51562 3.73438 8.78125L5.48438 10.8438C5.73438 11.1562 6.07812 11.3594 6.48438 11.3594ZM20.7188 9.57812C19.5312 9.57812 18.5781 8.51562 18.5781 7.375C18.5781 6.1875 19.5156 5.17188 20.7188 5.17188H36.2969C37.5156 5.17188 38.4375 6.15625 38.4375 7.375C38.4375 8.54688 37.5 9.57812 36.2969 9.57812H20.7188ZM7.375 32.8594C3.3125 32.8594 0 29.5312 0 25.4844C0 21.4531 3.3125 18.125 7.375 18.125C11.4219 18.125 14.75 21.4375 14.75 25.4844C14.75 29.5312 11.4219 32.8594 7.375 32.8594ZM7.375 29.0156C9.29688 29.0156 10.8906 27.4219 10.8906 25.4844C10.8906 23.5781 9.29688 21.9688 7.375 21.9688C5.45312 21.9688 3.84375 23.5781 3.84375 25.4844C3.84375 27.4219 5.45312 29.0156 7.375 29.0156ZM20.7188 27.6875C19.5312 27.6875 18.5781 26.625 18.5781 25.4844C18.5781 24.2969 19.5156 23.2812 20.7188 23.2812H36.2969C37.5156 23.2812 38.4375 24.2812 38.4375 25.4844C38.4375 26.6562 37.5 27.6875 36.2969 27.6875H20.7188Z"
        fill="currentColor"
      />
    </svg>
  );
}

function PracownikiIcon() {
  return (
    <svg
      width="21"
      height="14"
      viewBox="0 0 44 29"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M29.9219 14C26.3125 14 23.4531 10.875 23.4531 6.95312C23.4531 3.17188 26.3438 0 29.9219 0C33.4844 0 36.3906 3.15625 36.3906 6.9375C36.3906 10.875 33.5156 14 29.9219 14ZM11.6406 14.3438C8.5 14.3438 6 11.6094 6 8.20312C6 4.90625 8.53125 2.15625 11.6406 2.15625C14.7344 2.15625 17.2812 4.89062 17.2812 8.1875C17.2812 11.6094 14.7656 14.3438 11.6406 14.3438ZM3.3125 28.75C0.8125 28.75 0 27.5781 0 25.625C0 21.6562 4.85938 16.6719 11.6406 16.6719C14.1719 16.6719 16.4219 17.3906 18.0625 18.3438C14.0781 21.6094 12.7344 26.2656 14.5312 28.75H3.3125ZM20.4062 28.75C17.4844 28.75 16.5469 27.7344 16.5469 26.0938C16.5469 22.125 21.8125 16.6875 29.9219 16.6875C38.0156 16.6875 43.2812 22.125 43.2812 26.0938C43.2812 27.7344 42.3438 28.75 39.4219 28.75H20.4062Z"
        fill="currentColor"
      />
    </svg>
  );
}

function UstawieniaIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 35 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M16.0781 34.9375C14.7812 34.9375 13.7812 34.1406 13.5 32.8906L12.7812 29.9531C12.4844 29.8438 12.1875 29.7188 11.9219 29.5938L9.34375 31.1875C8.28125 31.8438 6.96875 31.7188 6.07812 30.8281L4.09375 28.8438C3.20312 27.9531 3.10938 26.6094 3.78125 25.5469L5.34375 23C5.21875 22.7344 5.10938 22.4688 5.01562 22.1875L2.03125 21.4688C0.796875 21.1875 0 20.1875 0 18.8906V16.1406C0 14.8594 0.796875 13.8594 2.03125 13.5625L4.96875 12.8594C5.07812 12.5625 5.1875 12.2656 5.3125 12.0312L3.73438 9.40625C3.07812 8.29688 3.17188 7.03125 4.09375 6.125L6.09375 4.14062C6.96875 3.28125 8.17188 3.17188 9.25 3.75L11.8906 5.375C12.1719 5.23438 12.4844 5.10938 12.7812 5.01562L13.5 2.0625C13.7969 0.796875 14.7812 0 16.0781 0H18.8906C20.1719 0 21.1562 0.796875 21.4688 2.04688L22.1875 5.03125C22.5 5.15625 22.7812 5.26562 23.0469 5.39062L25.7188 3.75C26.7812 3.17188 27.9531 3.32812 28.8594 4.14062L30.875 6.125C31.7812 7.03125 31.8906 8.29688 31.2188 9.40625L29.6562 12.0312C29.7656 12.2656 29.8906 12.5625 30 12.8594L32.9219 13.5625C34.1719 13.8594 34.9688 14.8594 34.9688 16.1406V18.8906C34.9688 20.1875 34.1719 21.1875 32.9219 21.4688L29.9531 22.1875C29.8594 22.4688 29.75 22.7344 29.625 23L31.1875 25.5469C31.8438 26.6094 31.75 27.9531 30.8594 28.8438L28.875 30.8281C27.9844 31.7188 26.6875 31.8438 25.6094 31.1875L23.0469 29.5938C22.7812 29.7188 22.4844 29.8438 22.1719 29.9531L21.4688 32.8906C21.1719 34.1406 20.1719 34.9375 18.8906 34.9375H16.0781ZM17.4844 22.7812C20.4219 22.7812 22.7969 20.4062 22.7969 17.4688C22.7969 14.5312 20.4219 12.1562 17.4844 12.1562C14.5469 12.1562 12.1719 14.5312 12.1719 17.4688C12.1719 20.4062 14.5469 22.7812 17.4844 22.7812Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SubskrypcjaIcon() {
  return (
    <svg
      width="20"
      height="18"
      viewBox="0 0 40 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
      aria-hidden="true"
    >
      <path
        d="M11.4062 5.59375L23.0312 1.73438C28.0781 0 31.1562 1.90625 31.6875 5.53125V5.60938L11.4062 5.59375ZM5.76562 35.8438C2.09375 35.8438 0 33.7656 0 30.1094V13.8125C0 10.1562 2.09375 8.07812 5.76562 8.07812H31.375C35.0469 8.07812 37.1406 10.1562 37.1406 13.8125V15.1406H30.75C26.7031 15.1406 23.8594 17.875 23.8594 21.7969C23.8594 25.7344 26.7188 28.4531 30.75 28.4531H37.1406V30.1094C37.1406 33.7656 35.0469 35.8438 31.375 35.8438H5.76562ZM30.75 25.7344C28.4688 25.7344 26.5781 24.4375 26.5781 21.7969C26.5781 19.1406 28.4688 17.8594 30.75 17.8594H37.5938C38.9219 17.8594 39.6094 18.5156 39.6094 19.875V23.7188C39.6094 25.0781 38.9219 25.7344 37.5938 25.7344H30.75ZM31.0156 23.7031C32.0312 23.7031 32.875 22.8594 32.875 21.8125C32.875 20.7812 32.0312 19.9375 31.0156 19.9375C29.9688 19.9375 29.125 20.7812 29.125 21.8125C29.125 22.8594 29.9688 23.7031 31.0156 23.7031Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={direction === "left" ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
    </svg>
  );
}

const navItems: { label: string; href: string; icon: React.ReactNode }[] = [
  { label: "Lista zadań", href: "/", icon: <ListaZadanIcon /> },
  { label: "Pracownicy", href: "/employees", icon: <PracownikiIcon /> },
  { label: "Ustawienia", href: "/settings", icon: <UstawieniaIcon /> },
  { label: "Subskrypcja", href: "/subscription", icon: <SubskrypcjaIcon /> },
];

type SidebarUser = {
  firstName: string | null;
  lastName: string | null;
  shopName: string | null;
  shopAddress: string | null;
};

export default function Sidebar({ user }: { user?: SidebarUser | null }) {
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.push("/login");
    router.refresh();
  }

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    "Imię Nazwisko";
  const secondary = user?.shopAddress || user?.shopName || "—";
  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "?";
  const isZabka = user?.shopName === "Żabka";

  return (
    <>
      {/* Мобільна верхня панель */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-[#26262b] bg-[#1a1a1e] px-4 md:hidden">
        <Image
          src="/logo.png"
          alt="MyShop by zdrovy"
          width={1555}
          height={400}
          priority
          className="h-auto w-24 invert"
        />
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Otwórz menu"
          className="rounded-[4px] p-2 text-gray-200 hover:bg-[#232327]"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
      </div>

      {/* Бекдроп для мобільної шухляди */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col overflow-hidden border-r border-[#26262b] bg-[#1a1a1e] transition-[transform,width] duration-300 ease-in-out md:sticky md:top-0 md:z-auto md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${open ? "" : "md:w-[72px]"}`}
      >
      <div className="flex h-[76px] items-center justify-between px-4">
        {open && (
          <Image
            src="/logo.png"
            alt="MyShop by zdrovy"
            width={1555}
            height={400}
            priority
            className="h-auto w-36 max-w-none shrink-0 invert"
          />
        )}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Zamknij panel" : "Otwórz panel"}
          className="hidden rounded-[4px] p-2 text-gray-400 hover:bg-[#232327] hover:text-gray-100 md:inline-flex"
        >
          <ChevronIcon direction={open ? "left" : "right"} />
        </button>
      </div>
      <nav className="px-3">
        <ul className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.href === pathname;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-label={item.label}
                  title={!open ? item.label : undefined}
                  className={`relative flex w-full items-center gap-3 whitespace-nowrap rounded-[6px] px-3 py-2.5 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-[#1e2a3a] font-semibold text-[#3b82f6] before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-[#3b82f6]"
                      : "font-medium text-gray-400 hover:bg-[#232327] hover:text-gray-100"
                  }`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center">
                    {item.icon}
                  </span>
                  {open && item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto flex items-center gap-3 border-t border-[#26262b] p-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-gray-300 ${
            isZabka ? "bg-[#1a1a1e] ring-1 ring-[#34343c]" : "bg-[#2a2a30]"
          }`}
        >
          {isZabka ? (
            <Image
              src="/zabkalogo.png"
              alt="Żabka"
              width={1280}
              height={516}
              className="h-auto w-8 object-contain"
            />
          ) : (
            initials
          )}
        </div>
        {open && (
          <>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-100">
                {fullName}
              </p>
              <p className="truncate text-xs text-gray-400">{secondary}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Wyloguj się"
              title="Wyloguj się"
              className="ml-auto shrink-0 rounded-[4px] p-2 text-gray-400 hover:bg-[#232327] hover:text-gray-100"
            >
              <LogoutIcon />
            </button>
          </>
        )}
      </div>
      </aside>
    </>
  );
}
