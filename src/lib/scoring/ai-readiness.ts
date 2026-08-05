export interface StructuralReadinessInput {
  h1Count: number;
  hasFaqSchema: boolean;
  hasQnaFormat: boolean;
  hasListsOrTables: boolean;
  wordCount: number;
  hasDirectAnswerHeader: boolean;
}

export interface AiReadinessScoreResult {
  structuralScore: number; // 0-100
  semanticScore: number; // 0-100
  overallScore: number; // 0-100
  issues: string[];
}

export function computeStructuralScore(input: StructuralReadinessInput): { score: number; issues: string[] } {
  let score = 0;
  const issues: string[] = [];

  // H1 and logical hierarchy (25 pts)
  if (input.h1Count === 1) {
    score += 25;
  } else {
    issues.push('Logical H1 heading structure missing');
  }

  // Schema presence (25 pts)
  if (input.hasFaqSchema) {
    score += 25;
  } else {
    issues.push('Missing FAQ / Q&A Schema.org markup for answer engine parsing');
  }

  // Q&A Formatting (20 pts)
  if (input.hasQnaFormat || input.hasDirectAnswerHeader) {
    score += 20;
  } else {
    issues.push('Content lacks clear Q&A / direct-answer section near top');
  }

  // Lists or Tables (15 pts)
  if (input.hasListsOrTables) {
    score += 15;
  } else {
    issues.push('No structured HTML lists or tables found for easy quote extraction');
  }

  // Word count sufficiency (15 pts)
  if (input.wordCount >= 600) {
    score += 15;
  } else if (input.wordCount >= 250) {
    score += 8;
  } else {
    issues.push('Insufficient content depth for LLM context extraction');
  }

  return { score, issues };
}

export function combineAiReadinessScore(
  structuralScore: number,
  semanticScore: number,
  structuralIssues: string[],
  semanticIssues: string[] = []
): AiReadinessScoreResult {
  // 60% structural + 40% semantic
  const overallScore = Math.round(structuralScore * 0.6 + semanticScore * 0.4);
  const issues = Array.from(new Set([...structuralIssues, ...semanticIssues]));

  return {
    structuralScore,
    semanticScore,
    overallScore,
    issues,
  };
}
