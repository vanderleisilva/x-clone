import { ApiProperty } from '@nestjs/swagger';

export class UpdatePostDto {
  @ApiProperty({ example: 'This is an updated post content', required: false })
  content?: string;
}
