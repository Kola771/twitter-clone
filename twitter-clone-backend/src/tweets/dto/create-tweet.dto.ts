import { IsString, MaxLength, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTweetDto {
  @ApiProperty({ example: 'Hello Twitter Clone !', maxLength: 280, required: false })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  content?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mediaUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  replyToId?: string;
}
