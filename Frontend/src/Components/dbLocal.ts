import Dexie, { type Table } from "dexie";

export interface OfflineVenta {
  id?: number;
  producto_id: number;
  nombre_producto: string;
  cantidad: number;
  total_usd: number;
  total_bs: number;
  fecha: string;
  sincronizado: number; // 0 = pendiente, 1 = enviado
}

export class MyDatabase extends Dexie {
  ventasOffline!: Table<OfflineVenta>;

  constructor() {
    super("InventarioLocal");
    this.version(1).stores({
      ventasOffline: "++id, sincronizado, fecha", // Indexamos para búsquedas rápidas
    });
  }
}

export const dbLocal = new MyDatabase();
