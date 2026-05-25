import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecommendationService } from './recommendation.service';
import { RecommendationRequestDto } from './dto/recommendation.dto';
import { RecommendationResultDto } from './dto/recommendation-result.dto';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly recommendationService: RecommendationService) {}

  @Post('evaluate')
  @ApiOperation({ summary: 'Evaluate maternal and baby clinical state to generate recommendations' })
  @ApiBody({ type: RecommendationRequestDto })
  @ApiResponse({ status: 201, description: 'Recommendations generated successfully', type: RecommendationResultDto })
  evaluate(
    @Body() payload: RecommendationRequestDto,
  ): RecommendationResultDto {
    return this.recommendationService.evaluate(payload);
  }
}
