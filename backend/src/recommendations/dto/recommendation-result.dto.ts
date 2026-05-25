import { ApiProperty } from '@nestjs/swagger';

export class FoodAvoidanceDto {
  @ApiProperty({ example: 'Raw meat (ጥሬ ስጋ)' })
  food: string;

  @ApiProperty({ example: 'Infection risk' })
  reason: string;
}

export class RecommendationResultDto {
  @ApiProperty({ type: [String] })
  recommendations: string[];

  @ApiProperty({ type: [FoodAvoidanceDto] })
  foodsToAvoid: FoodAvoidanceDto[];

  @ApiProperty({ type: [String] })
  feedingAdvice: string[];
}
