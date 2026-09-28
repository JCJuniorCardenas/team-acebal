import { PartialType } from '@nestjs/mapped-types';
import { CreateGraduacionDto } from './create-graduacion.dto';

export class UpdateGraduacionDto extends PartialType(CreateGraduacionDto) {}
