import { City } from '../../city/entities/city.entity';

export class Area {
  id: number;
  name: string;
  city_id: number;
  city: City;
  createdAt: Date;
  updatedAt: Date;
}
