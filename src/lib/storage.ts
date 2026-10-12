import { supabase } from "@/integrations/supabase/client";
import * as React from "react";

const BUCKET = "catalog";
const cache = new Map<string, string>();

/** Imagens locais do cardápio inicial (assets do projeto). */
const localAssets = import.meta.glob("/src/assets/*.jpg", { eager: true, import: "default" }) as Record<
  string,
  string
>;

function localAsset(name: string) {
  return localAssets[`/src/assets/${name}`];
}

/** Versão síncrona: URL pública de uma imagem do cardápio (bucket "catalog" é público). */
export function catalogImageUrl(value: string | null | undefined): string {
  if (!value) return "";
  if (value.startsWith("http") || value.startsWith("/")) return value;
  const asset = localAsset(value);
  if (asset) return asset;
  return supabase.storage.from(BUCKET).getPublicUrl(value).data.publicUrl;
}

/** Resolve o caminho salvo no banco para uma URL exibível. */
export async function resolveImageUrl(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  if (value.startsWith("http")) return value;
  const asset = localAsset(value);
  if (asset) return asset;
  if (cache.has(value)) return cache.get(value)!;
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(value, 60 * 60 * 6);
  if (!data?.signedUrl) return null;
  cache.set(value, data.signedUrl);
  return data.signedUrl;
}

export function useImageUrl(value: string | null | undefined) {
  const [url, setUrl] = React.useState<string | null>(() => {
    if (!value) return null;
    if (value.startsWith("http")) return value;
    return localAsset(value) ?? cache.get(value) ?? null;
  });

  React.useEffect(() => {
    let active = true;
    void resolveImageUrl(value).then((resolved) => {
      if (active) setUrl(resolved);
    });
    return () => {
      active = false;
    };
  }, [value]);

  return url;
}

/** Envia uma imagem para o Storage e devolve o caminho salvo. */
export async function uploadImage(file: File, folder = "produtos") {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

export async function removeImage(path: string) {
  if (!path || path.startsWith("http") || localAsset(path)) return;
  await supabase.storage.from(BUCKET).remove([path]);
}
