import { getSiteInfo } from "@/repositories/settings-repository";

export async function WhatsappFab() {
  const site = await getSiteInfo().catch(() => null);
  const raw = site?.whatsappNumber ?? "";
  const digits = raw.replace(/\D+/g, "");
  if (!digits) return null;

  const text = site?.whatsappMessage?.trim() || "";
  const href = `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3.5 text-white shadow-[0_10px_30px_rgba(37,211,102,0.35)] transition-transform hover:scale-105 active:scale-95"
    >
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className="size-5"
        fill="currentColor"
      >
        <path d="M19.11 17.28c-.28-.14-1.64-.81-1.89-.9-.25-.09-.44-.14-.62.14-.19.28-.72.9-.88 1.08-.16.19-.32.21-.6.07-.28-.14-1.17-.43-2.23-1.37-.82-.73-1.38-1.63-1.54-1.91-.16-.28-.02-.43.12-.57.13-.13.28-.32.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.62-1.49-.85-2.05-.22-.54-.45-.47-.62-.48l-.53-.01c-.19 0-.49.07-.75.35-.26.28-.98.96-.98 2.33 0 1.37 1 2.7 1.14 2.89.14.19 1.97 3 4.76 4.21.67.29 1.19.46 1.6.59.67.21 1.28.18 1.76.11.54-.08 1.64-.67 1.87-1.32.23-.65.23-1.2.16-1.32-.07-.12-.25-.19-.53-.33zM16 4C9.37 4 4 9.37 4 16c0 2.11.55 4.09 1.5 5.8L4 28l6.34-1.66A11.95 11.95 0 0 0 16 28c6.63 0 12-5.37 12-12S22.63 4 16 4zm0 21.94c-1.85 0-3.58-.5-5.07-1.36l-.36-.21-3.76.98 1-3.66-.24-.38A9.94 9.94 0 0 1 6.06 16 9.94 9.94 0 0 1 16 6.06 9.94 9.94 0 0 1 25.94 16 9.94 9.94 0 0 1 16 25.94z" />
      </svg>
      <span className="hidden text-sm font-medium sm:inline">WhatsApp</span>
    </a>
  );
}
