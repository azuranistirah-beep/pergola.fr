"use client";

import * as React from "react";
import { Trash2, Upload, Star } from "lucide-react";
import { toast } from "sonner";
import {
  AdminButton,
  AdminCard,
} from "@/features/admin/admin-ui";
import { deleteProductMedia, uploadProductImage } from "@/actions/admin-actions";

interface MediaRow {
  id: string;
  url: string;
  isCover: boolean;
}

export function ProductMediaEditor({
  productId,
  slug,
  media,
}: {
  productId: string;
  slug: string;
  media: MediaRow[];
}) {
  const [items, setItems] = React.useState<MediaRow[]>(media);
  const [uploading, setUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => setItems(media), [media]);

  const onFile = async (file: File, asCover: boolean) => {
    setUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const res = await uploadProductImage(
        productId,
        slug,
        base64,
        file.type,
        asCover,
      );
      setItems((prev) => [
        ...prev,
        { id: `pending-${Date.now()}`, url: res.url, isCover: asCover },
      ]);
      toast.success("Image ajoutée");
    } catch (e) {
      toast.error("Échec de l'envoi", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Supprimer cette image ?")) return;
    setItems((prev) => prev.filter((m) => m.id !== id));
    await deleteProductMedia(id);
    toast.success("Image supprimée");
  };

  return (
    <AdminCard>
      <div className="grid gap-4 md:grid-cols-4">
        {items.map((m) => (
          <div
            key={m.id}
            className="group bg-muted border-border/60 relative aspect-[4/3] overflow-hidden rounded-2xl border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={m.url}
              alt=""
              className="h-full w-full object-cover"
            />
            {m.isCover && (
              <span className="bg-accent/90 text-accent-foreground absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em]">
                <Star className="size-3" /> Cover
              </span>
            )}
            <button
              onClick={() => onDelete(m.id)}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Supprimer"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}

        {/* Upload button */}
        <label className="border-border/70 hover:border-primary text-secondary hover:text-primary flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-colors">
          <Upload className="size-5" />
          <span className="text-xs">
            {uploading ? "Envoi…" : "Ajouter une image"}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              await onFile(f, items.length === 0);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      <p className="text-secondary mt-6 text-xs">
        La première image ajoutée devient la couverture. Formats JPG, PNG,
        WebP. Uploadées dans le bucket InsForge{" "}
        <code className="bg-muted rounded px-1.5 py-0.5">products</code>.
      </p>
      <div className="mt-4">
        <AdminButton
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" /> Uploader
        </AdminButton>
      </div>
    </AdminCard>
  );
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
