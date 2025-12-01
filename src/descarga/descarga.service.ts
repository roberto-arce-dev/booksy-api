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
    let clienteId: string;

    if (createDescargaDto.cliente) {
      clienteId = createDescargaDto.cliente;
    } else if (userId) {
      const clienteProfile = await this.clienteProfileService.findByUserId(userId);
      clienteId = (clienteProfile as any)._id.toString();
    } else {
      throw new NotFoundException('Cliente no especificado');
    }

    const nuevoDescarga = await this.descargaModel.create({
      ...createDescargaDto,
      cliente: new Types.ObjectId(clienteId),
    });
    return nuevoDescarga;
  }

  async findAll(): Promise<Descarga[]> {
    const descargas = await this.descargaModel.find();
    return descargas;
  }

  async findMyDescargas(userId: string): Promise<Descarga[]> {
    const clienteProfile = await this.clienteProfileService.findByUserId(userId);
    const clienteId = (clienteProfile as any)._id.toString();
    return this.descargaModel.find({ cliente: new Types.ObjectId(clienteId) })
      .populate('libro', 'titulo autor precio')
      .populate('cliente', 'nombre email')
      .sort({ createdAt: -1 });
  }

  async findOne(id: string | number): Promise<Descarga> {
    const descarga = await this.descargaModel.findById(id)
    .populate('libro', 'titulo autor precio')
    .populate('cliente', 'nombre email');
    if (!descarga) {
      throw new NotFoundException(`Descarga con ID ${id} no encontrado`);
    }
    return descarga;
  }

  async update(id: string | number, updateDescargaDto: UpdateDescargaDto): Promise<Descarga> {
    const descarga = await this.descargaModel.findByIdAndUpdate(id, updateDescargaDto, { new: true })
    .populate('libro', 'titulo autor precio')
    .populate('cliente', 'nombre email');
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
}
