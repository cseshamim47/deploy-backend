export class City {
  id: number;
  name: string;
  image: string;
  createdAt: Date;
  updatedAt: Date;
  areas?: Area[];
}

class Area {
  id: number;
  name: string;
  city_id: number;
}
