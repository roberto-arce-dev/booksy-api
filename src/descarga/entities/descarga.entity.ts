export class Descarga {
  id: string;
  libro: string;
  cliente: string;
  formato?: 'pdf' | 'epub' | 'mobi';
  fechaDescarga?: Date;
  imagen?: string;
  imagenThumbnail?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Descarga>) {
    Object.assign(this, partial);
  }
}
