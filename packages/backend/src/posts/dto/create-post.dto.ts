import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ example: 'This is a post content' })
  content: string;

  @ApiProperty({ example: 'user-id-123' })
  userId: string;
}
