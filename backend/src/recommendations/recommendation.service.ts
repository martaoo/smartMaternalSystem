import { Injectable } from '@nestjs/common';
import { RecommendationRequestDto } from './dto/recommendation.dto';
import { RecommendationResultDto, FoodAvoidanceDto } from './dto/recommendation-result.dto';

@Injectable()
export class RecommendationService {
  private readonly maternalNutritionRules: Record<string, string> = {
    Pregnancy: 'Eat iron-rich foods',
    Weakness: 'Increase protein and vegetables',
    Anemia: 'Eat spinach, meat, lentils',
    Constipation: 'Drink water + fruits',
    'High BP': 'Reduce salty foods',
    'Underweight mother': 'More calories and protein',
  };

  private readonly sleepPositionRules: Record<string, string> = {
    'Pregnancy after 5 months': 'Sleep on left side',
    'Back pain': 'Use pillow support',
    'Difficulty breathing': 'Elevate head slightly',
  };

  private readonly deficiencyRules: Record<string, string> = {
    'Swollen body': 'Increase protein (Eggs, beans, milk)',
    'Thin muscles': 'Increase protein (Eggs, beans, milk)',
    'Low energy': 'Add rice/injera/potato to increase healthy calories',
    'Weight loss': 'Add rice/injera/potato to increase healthy calories',
    'Pale skin': 'Iron foods',
    Dizziness: 'Medical checkup',
  };

  private readonly foodsToAvoid: FoodAvoidanceDto[] = [
    { food: 'Raw meat (ጥሬ ስጋ)', reason: 'Infection risk' },
    { food: 'Unboiled milk', reason: 'Bacteria' },
    { food: 'Alcohol', reason: 'Baby harm' },
    { food: 'Smoking', reason: 'Pregnancy complications' },
    { food: 'Too much coffee', reason: 'Sleep & BP problems' },
    { food: 'Unsafe herbs', reason: 'Unknown effects' },
  ];

  private readonly sunlightConditions = new Set(['newborn', 'jaundice', 'weak bones']);

  evaluate(payload: RecommendationRequestDto): RecommendationResultDto {
    const conditions = this.normalizeList(payload.conditions);
    const babyConditions = this.normalizeList(payload.babyConditions);
    const deficiencies = this.normalizeList(payload.deficiencies);

    const recommendations: string[] = [];
    const foodsToAvoid: FoodAvoidanceDto[] = [];
    const feedingAdvice: string[] = [];

    // Rule 1: Pregnancy Nutrition and symptom-based advice
    for (const [key, advice] of Object.entries(this.maternalNutritionRules)) {
      if (this.containsCondition(conditions, key)) {
        recommendations.push(advice);
      }
    }

    // Rule 2: Always include foods to avoid when any maternal condition is present
    if (conditions.length > 0) {
      foodsToAvoid.push(...this.foodsToAvoid);
    }

    // Rule 3: Sleep Positions
    for (const [key, advice] of Object.entries(this.sleepPositionRules)) {
      if (this.containsCondition(conditions, key)) {
        recommendations.push(advice);
      }
    }

    // Rule 4: Sunlight for baby
    if (babyConditions.some((condition) => this.sunlightConditions.has(condition))) {
      recommendations.push(
        'Morning sunlight 15–20 mins (Best time: Before 10 AM) with Vitamin D support',
      );
    }

    // Rule 5: Feeding
    if (payload.babyAgeMonths !== undefined && payload.babyAgeMonths !== null) {
      if (payload.babyAgeMonths >= 0 && payload.babyAgeMonths < 6) {
        feedingAdvice.push('Exclusive breastfeeding only');
      } else if (payload.babyAgeMonths >= 6 && payload.babyAgeMonths < 12) {
        feedingAdvice.push('Add: Soft porridge, Mashed potato, Banana, Egg, Vegetables');
      } else if (payload.babyAgeMonths >= 12) {
        feedingAdvice.push('Add: Family foods, Fruits, Protein foods');
      }
    }

    // Rule 6: Nutrient deficiencies
    for (const [key, advice] of Object.entries(this.deficiencyRules)) {
      if (this.containsCondition(deficiencies, key)) {
        recommendations.push(advice);
      }
    }

    return {
      recommendations: this.unique(recommendations),
      foodsToAvoid: this.uniqueFoods(foodsToAvoid),
      feedingAdvice: this.unique(feedingAdvice),
    };
  }

  private normalizeList(values?: string[]): string[] {
    return (values || []).map((value) => value.toString().trim().toLowerCase()).filter(Boolean);
  }

  private containsCondition(list: string[], condition: string): boolean {
    return list.includes(condition.toLowerCase());
  }

  private unique(items: string[]): string[] {
    return Array.from(new Set(items));
  }

  private uniqueFoods(items: FoodAvoidanceDto[]): FoodAvoidanceDto[] {
    const uniqueMap = new Map<string, FoodAvoidanceDto>();
    for (const item of items) {
      if (!uniqueMap.has(item.food)) {
        uniqueMap.set(item.food, item);
      }
    }
    return Array.from(uniqueMap.values());
  }
}
