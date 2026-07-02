/**
 * ProblemFormatter - Formats and renders problem data
 * 
 * Provides methods for rendering problem descriptions with markdown,
 * difficulty color coding, and collapsible sections for hints and solutions.
 */

import type { Problem, DifficultyLevel, TimeRange } from '../types/problem-based-learning';
import { DIFFICULTY_TIME_ESTIMATES } from '../types/problem-based-learning';

export class ProblemFormatter {
  /**
   * Get difficulty color class
   */
  static getDifficultyColor(difficulty: DifficultyLevel): string {
    const colors = {
      Easy: 'text-green-600 bg-green-100',
      Medium: 'text-yellow-600 bg-yellow-100',
      Hard: 'text-red-600 bg-red-100'
    };
    
    return colors[difficulty] || 'text-gray-600 bg-gray-100';
  }
  
  /**
   * Get difficulty badge HTML
   */
  static getDifficultyBadge(difficulty: DifficultyLevel): string {
    const colorClass = this.getDifficultyColor(difficulty);
    return `<span class="px-2 py-1 rounded text-sm font-medium ${colorClass}">${difficulty}</span>`;
  }
  
  /**
   * Get estimated time range for difficulty
   */
  static getEstimatedTimeRange(difficulty: DifficultyLevel): TimeRange {
    return DIFFICULTY_TIME_ESTIMATES[difficulty];
  }
  
  /**
   * Format time range as string
   */
  static formatTimeRange(range: TimeRange): string {
    return `${range.min}-${range.max} minutes`;
  }
  
  /**
   * Get estimated time display
   */
  static getEstimatedTimeDisplay(difficulty: DifficultyLevel): string {
    const range = this.getEstimatedTimeRange(difficulty);
    return `⏱️ Estimated: ${this.formatTimeRange(range)}`;
  }
  
  /**
   * Format problem header (title, difficulty, time estimate)
   */
  static formatProblemHeader(problem: Problem): {
    title: string;
    difficulty: string;
    timeEstimate: string;
  } {
    return {
      title: problem.title,
      difficulty: problem.difficulty,
      timeEstimate: this.getEstimatedTimeDisplay(problem.difficulty)
    };
  }
  
  /**
   * Format hints as collapsible sections
   */
  static formatHints(hints: string[]): Array<{ level: number; text: string }> {
    return hints.map((hint, index) => ({
      level: index + 1,
      text: hint
    }));
  }
  
  /**
   * Format test cases for display
   */
  static formatTestCases(testCases: any[]): Array<{
    input: string;
    output: string;
    explanation?: string;
  }> {
    return testCases.map(tc => ({
      input: tc.input,
      output: tc.expectedOutput,
      explanation: tc.explanation
    }));
  }
  
  /**
   * Check if solution should be visible
   */
  static shouldShowSolution(solved: boolean, explicitlyRequested: boolean): boolean {
    return solved || explicitlyRequested;
  }
  
  /**
   * Get language display name
   */
  static getLanguageDisplayName(language: string): string {
    const names: Record<string, string> = {
      javascript: 'JavaScript',
      python: 'Python',
      java: 'Java',
      c: 'C'
    };
    
    return names[language] || language;
  }
  
  /**
   * Format problem description (basic markdown support)
   */
  static formatDescription(description: string): string {
    // Basic markdown formatting
    let formatted = description;
    
    // Bold: **text** -> <strong>text</strong>
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic: *text* -> <em>text</em>
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code: `code` -> <code>code</code>
    formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>');
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  }
  
  /**
   * Get problem metadata for display
   */
  static getProblemMetadata(problem: Problem): {
    id: string;
    title: string;
    difficulty: DifficultyLevel;
    difficultyColor: string;
    timeEstimate: string;
    hintCount: number;
    testCaseCount: number;
  } {
    return {
      id: problem.id,
      title: problem.title,
      difficulty: problem.difficulty,
      difficultyColor: this.getDifficultyColor(problem.difficulty),
      timeEstimate: this.getEstimatedTimeDisplay(problem.difficulty),
      hintCount: problem.hints.length,
      testCaseCount: problem.testCases.length
    };
  }
  
  /**
   * Format progress percentage
   */
  static formatProgressPercentage(solved: number, total: number): string {
    if (total === 0) return '0%';
    const percentage = Math.round((solved / total) * 100);
    return `${percentage}%`;
  }
  
  /**
   * Get completion status icon
   */
  static getCompletionIcon(completed: boolean): string {
    return completed ? '✓' : '○';
  }
  
  /**
   * Format time spent
   */
  static formatTimeSpent(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
      return `${hours}h`;
    }
    
    return `${hours}h ${mins}m`;
  }
}
