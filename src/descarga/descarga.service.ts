import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateDescargaDto } from './dto/create-descarga.dto';
import { UpdateDescargaDto } from './dto/update-descarga.dto';
import { Descarga, DescargaDocument } from './schemas/descarga.schema';
import { ClienteProfileService } from '../cliente-profile/cliente-profile.service';

@Injectable()
export class DescargaService {
  constructor(
    @InjectModel(Descarga.name) private descargaModel: Model<DescargaDocument>,
    private clienteProfileService: ClienteProfileService,
  ) {}

  async create(createDescargaDto: CreateDescargaDto, userId?: string): Promise<Descarga> {
    const clienteId = await this.resolveClienteId(createDescargaDto.cliente, userId);

    const nuevoDescarga = await this.descargaModel.create({
      libro: new Types.ObjectId(createDescargaDto.libro),
      cliente: new Types.ObjectId(clienteId),
      formato: createDescargaDto.formato,
    });

    return this.buildPopulateQuery(
      this.descargaModel.findById(nuevoDescarga._id),
    );
  }

  async findAll(): Promise<Descarga[]> {
    const descargas = await this.buildPopulateQuery(
      this.descargaModel.find().sort({ createdAt: -1 }),
    );
    return descargas;
  }

  async findMyDescargas(userId: string): Promise<Descarga[]> {
    const clienteProfile = await this.clienteProfileService.findByUserId(userId);

    if (!clienteProfile) {
      throw new NotFoundException('Perfil de cliente no encontrado');
    }

    const clienteId = (clienteProfile as any)._id.toString();
    return this.buildPopulateQuery(
      this.descargaModel
        .find({ cliente: new Types.ObjectId(clienteId) })
        .sort({ createdAt: -1 }),
    );
  }

  async findOne(id: string | number): Promise<Descarga> {
    const descarga = await this.buildPopulateQuery(
      this.descargaModel.findById(id),
    );
    if (!descarga) {
      throw new NotFoundException(`Descarga con ID ${id} no encontrado`);
    }
    return descarga;
  }

  async update(id: string | number, updateDescargaDto: UpdateDescargaDto): Promise<Descarga> {
    const payload: any = { ...updateDescargaDto };

    if (payload.libro) {
      payload.libro = new Types.ObjectId(payload.libro);
    }

    if (payload.cliente) {
      payload.cliente = new Types.ObjectId(payload.cliente);
    }

    const descarga = await this.buildPopulateQuery(
      this.descargaModel.findByIdAndUpdate(id, payload, { new: true }),
    );
    if (!descarga) {
      throw new NotFoundException(`Descarga con ID ${id} no encontrado`);
    }
    return descarga;
  }

  async remove(id: string | number): Promise<void> {
    const result = await this.descargaModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Descarga con ID ${id} no encontrado`);
    }
  }

  private async resolveClienteId(clienteIdFromDto?: string, userId?: string): Promise<string> {
    if (clienteIdFromDto) {
      return clienteIdFromDto;
    }

    if (!userId) {
      throw new NotFoundException('Cliente no especificado');
    }

    const clienteProfile = await this.clienteProfileService.findByUserId(userId);

    if (!clienteProfile) {
      throw new NotFoundException('Perfil de cliente no encontrado');
    }

    return (clienteProfile as any)._id.toString();
  }

  private buildPopulateQuery(query: any) {
    return query
      .populate({
        path: 'libro',
        select: 'titulo autor categoria precio archivoURL imagen imagenThumbnail',
      })
      .populate({
        path: 'cliente',
        select: 'nombre telefono user',
        populate: {
          path: 'user',
          select: 'email role',
        },
      });
  }
}
