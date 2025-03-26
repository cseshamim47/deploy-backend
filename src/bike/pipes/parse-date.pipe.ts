import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParseDatePipe implements PipeTransform<string, Date | undefined> {
  constructor(private readonly options: { optional?: boolean } = {}) {}

  transform(
    value: string | undefined,
    metadata: ArgumentMetadata,
  ): Date | undefined {
    if (!value && this.options.optional) {
      return undefined;
    }

    if (!value) {
      throw new BadRequestException('Date string is required');
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return date;
  }
}
