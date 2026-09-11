import { useCallback, useEffect, useState } from "react";

export interface MyProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  coverImage: string; // base64 data URL or empty
  views: number;
  sales: number;
  createdAt: string; // ISO
}

const STORAGE_KEY = "digistore.myProducts.v1";

const read = (): MyProduct[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const write = (items: MyProduct[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("digistore:myProducts:changed"));
  } catch (err) {
    console.error("Failed to save products", err);
  }
};

export const useMyProducts = () => {
  const [products, setProducts] = useState<MyProduct[]>(() => read());

  useEffect(() => {
    const sync = () => setProducts(read());
    window.addEventListener("storage", sync);
    window.addEventListener("digistore:myProducts:changed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("digistore:myProducts:changed", sync);
    };
  }, []);

  const addProduct = useCallback(
    (data: Omit<MyProduct, "id" | "views" | "sales" | "createdAt">) => {
      const item: MyProduct = {
        ...data,
        id: crypto.randomUUID(),
        views: 0,
        sales: 0,
        createdAt: new Date().toISOString(),
      };
      const next = [item, ...read()];
      write(next);
      return item;
    },
    []
  );

  const removeProduct = useCallback((id: string) => {
    write(read().filter((p) => p.id !== id));
  }, []);

  return { products, addProduct, removeProduct };
};
