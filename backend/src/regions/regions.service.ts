import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Region, RegionDocument } from './schemas/region.schema';
import { CreateRegionDto } from './dto/create-region.dto';

@Injectable()
export class RegionsService {
  constructor(@InjectModel(Region.name) private regionModel: Model<RegionDocument>) {}

  async create(createRegionDto: CreateRegionDto): Promise<Region> {
    const existingRegion = await this.regionModel.findOne({ 
      $or: [
        { name: createRegionDto.name },
        { code: createRegionDto.code }
      ]
    });
    if (existingRegion) {
      throw new ConflictException('Region with this name or code already exists');
    }

    const createdRegion = new this.regionModel(createRegionDto);
    return createdRegion.save();
  }

  async findAll(): Promise<Region[]> {
    return this.regionModel.find({ isActive: true }).sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<Region | null> {
    return this.regionModel.findById(id).exec();
  }

  async findByUserRegion(regionId: string): Promise<Region[]> {
    return this.regionModel.find({ _id: regionId, isActive: true }).exec();
  }

  async update(id: string, updateRegionDto: any): Promise<Region> {
    const region = await this.regionModel.findById(id);
    if (!region) {
      throw new NotFoundException('Region not found');
    }
    Object.assign(region, updateRegionDto);
    return region.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.regionModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Region not found');
    }
  }
}
