/**
 * ProblemManager - Manages problem loading, state, and module completion
 * 
 * Loads and validates modules, tracks problem-solving progress, and
 * calculates module completion based on 12/16 criteria with minimum
 * difficulty requirements (4 Easy, 6 Medium, 2 Hard).
 */

import type {
  Module,
  Problem,
  DifficultyLevel,
  ModuleProgress
} from '../types/problem-based-learning';

import {
  PROBLEMS_PER_MODULE,
  EASY_PROBLEMS_PER_MODULE,
  MEDIUM_PROBLEMS_PER_MODULE,
  HARD_PROBLEMS_PER_MODULE,
  MODULE_COMPLETION_THRESHOLD,
  MIN_EASY_FOR_COMPLETION,
  MIN_MEDIUM_FOR_COMPLETION,
  MIN_HARD_FOR_COMPLETION
} from '../types/problem-based-learning';

import { ProblemParser } from './ProblemParser';
import { ProgressStorage } from './ProgressStorage';

export class ProblemManager {
  private moduleCache: Map<string, Module> = new Map();
  
  /**
   * Load a module from JSON file
   */
  async loadModule(moduleId: string): Promise<Module> {
    // Check cache first
    if (this.moduleCache.has(moduleId)) {
      return this.moduleCache.get(moduleId)!;
    }
    
    try {
      // Load module JSON file
      const response = await fetch(`/src/data/modules/${moduleId}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load module: ${response.statusText}`);
      }
      
      const jsonData = await response.text();
      const parseResult = ProblemParser.parseModule(jsonData);
      
      if (!parseResult.success) {
        ProblemParser.logErrors(moduleId, parseResult.errors);
        throw new Error(`Module validation failed: ${parseResult.errors.join(', ')}`);
      }
      
      const module = parseResult.data!;
      this.moduleCache.set(moduleId, module);
      return module;
      
    } catch (error) {
      console.error(`[ProblemManager] Failed to load module "${moduleId}":`, error);
      throw error;
    }
  }
  
  /**
   * Get a specific problem from a module
   */
  getProblem(moduleId: string, problemId: string): Problem | null {
    const module = this.moduleCache.get(moduleId);
    if (!module) return null;
    
    return module.problems.find(p => p.id === problemId) || null;
  }
  
  /**
   * Get all problems for a module
   */
  getModuleProblems(moduleId: string): Problem[] {
    const module = this.moduleCache.get(moduleId);
    return module ? module.problems : [];
  }
  
  /**
   * Get problems filtered by difficulty
   */
  getProblemsByDifficulty(moduleId: string, difficulty: DifficultyLevel): Problem[] {
    const module = this.moduleCache.get(moduleId);
    if (!module) return [];
    
    return module.problems.filter(p => p.difficulty === difficulty);
  }
  
  /**
   * Get module progress for a user
   */
  getModuleProgress(userId: string, moduleId: string): ModuleProgress {
    const state = ProgressStorage.load(userId);
    if (!state) {
      return this.createEmptyProgress();
    }
    
    const module = this.moduleCache.get(moduleId);
    if (!module) {
      return this.createEmptyProgress();
    }
    
    let solved = 0;
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;
    
    module.problems.forEach(problem => {
      const key = `${moduleId}:${problem.id}`;
      const attempt = state.problemAttempts.get(key);
      
      if (attempt && attempt.solved) {
        solved++;
        if (problem.difficulty === 'Easy') easyCount++;
        else if (problem.difficulty === 'Medium') mediumCount++;
        else if (problem.difficulty === 'Hard') hardCount++;
      }
    });
    
    const completionMet = this.checkCompletionCriteria(solved, easyCount, mediumCount, hardCount);
    
    return {
      total: PROBLEMS_PER_MODULE,
      solved,
      easy: { solved: easyCount, total: EASY_PROBLEMS_PER_MODULE },
      medium: { solved: mediumCount, total: MEDIUM_PROBLEMS_PER_MODULE },
      hard: { solved: hardCount, total: HARD_PROBLEMS_PER_MODULE },
      completionMet
    };
  }
  
  /**
   * Check if module completion criteria are met
   */
  isModuleComplete(userId: string, moduleId: string): boolean {
    const progress = this.getModuleProgress(userId, moduleId);
    return progress.completionMet;
  }
  
  /**
   * Check completion criteria (12/16 with 4 Easy, 6 Medium, 2 Hard minimum)
   */
  private checkCompletionCriteria(
    solved: number,
    easyCount: number,
    mediumCount: number,
    hardCount: number
  ): boolean {
    return (
      solved >= MODULE_COMPLETION_THRESHOLD &&
      easyCount >= MIN_EASY_FOR_COMPLETION &&
      mediumCount >= MIN_MEDIUM_FOR_COMPLETION &&
      hardCount >= MIN_HARD_FOR_COMPLETION
    );
  }
  
  /**
   * Create empty progress object
   */
  private createEmptyProgress(): ModuleProgress {
    return {
      total: PROBLEMS_PER_MODULE,
      solved: 0,
      easy: { solved: 0, total: EASY_PROBLEMS_PER_MODULE },
      medium: { solved: 0, total: MEDIUM_PROBLEMS_PER_MODULE },
      hard: { solved: 0, total: HARD_PROBLEMS_PER_MODULE },
      completionMet: false
    };
  }
  
  /**
   * Mark a problem as solved and update progress
   */
  markProblemSolved(userId: string, moduleId: string, problemId: string, timeSpent: number): void {
    let state = ProgressStorage.load(userId);
    if (!state) {
      state = ProgressStorage.initializeDefaultState(userId);
    }
    
    const problem = this.getProblem(moduleId, problemId);
    if (!problem) {
      console.error(`[ProblemManager] Problem not found: ${moduleId}:${problemId}`);
      return;
    }
    
    const key = `${moduleId}:${problemId}`;
    const now = new Date();
    
    // Update or create problem attempt
    const existingAttempt = state.problemAttempts.get(key);
    if (existingAttempt) {
      existingAttempt.solved = true;
      existingAttempt.attempts++;
      existingAttempt.timeSpent += timeSpent;
      existingAttempt.timestamps.push(now);
      existingAttempt.lastAttempt = now;
    } else {
      state.problemAttempts.set(key, {
        problemId,
        moduleId,
        difficulty: problem.difficulty,
        solved: true,
        attempts: 1,
        timeSpent,
        timestamps: [now],
        lastAttempt: now
      });
    }
    
    // Update module completion
    this.updateModuleCompletion(state, moduleId);
    
    // Update last updated timestamp
    state.lastUpdated = now;
    
    // Save to storage
    ProgressStorage.save(userId, state);
  }
  
  /**
   * Update module completion status
   */
  private updateModuleCompletion(state: any, moduleId: string): void {
    const module = this.moduleCache.get(moduleId);
    if (!module) return;
    
    let problemsSolved = 0;
    let easyCount = 0;
    let mediumCount = 0;
    let hardCount = 0;
    let totalTimeSpent = 0;
    
    module.problems.forEach(problem => {
      const key = `${moduleId}:${problem.id}`;
      const attempt = state.problemAttempts.get(key);
      
      if (attempt && attempt.solved) {
        problemsSolved++;
        totalTimeSpent += attempt.timeSpent;
        
        if (problem.difficulty === 'Easy') easyCount++;
        else if (problem.difficulty === 'Medium') mediumCount++;
        else if (problem.difficulty === 'Hard') hardCount++;
      }
    });
    
    const completed = this.checkCompletionCriteria(
      problemsSolved,
      easyCount,
      mediumCount,
      hardCount
    );
    
    const existingCompletion = state.moduleCompletions.get(moduleId);
    const wasCompleted = existingCompletion?.completed || false;
    
    state.moduleCompletions.set(moduleId, {
      moduleId,
      completed,
      problemsSolved,
      easyCount,
      mediumCount,
      hardCount,
      totalTimeSpent,
      completedAt: completed && !wasCompleted ? new Date() : existingCompletion?.completedAt || null
    });
  }
  
  /**
   * Format progress as display string
   */
  formatProgress(progress: ModuleProgress): string {
    const { solved, total, easy, medium, hard, completionMet } = progress;
    
    let result = `${solved}/${total} problems solved (${easy.solved}/${easy.total} Easy, ${medium.solved}/${medium.total} Medium, ${hard.solved}/${hard.total} Hard)`;
    
    if (completionMet) {
      result += ' ✓ Completed';
    } else {
      const remaining: string[] = [];
      
      if (solved < MODULE_COMPLETION_THRESHOLD) {
        remaining.push(`${MODULE_COMPLETION_THRESHOLD - solved} more problems`);
      }
      if (easy.solved < MIN_EASY_FOR_COMPLETION) {
        remaining.push(`${MIN_EASY_FOR_COMPLETION - easy.solved} more Easy`);
      }
      if (medium.solved < MIN_MEDIUM_FOR_COMPLETION) {
        remaining.push(`${MIN_MEDIUM_FOR_COMPLETION - medium.solved} more Medium`);
      }
      if (hard.solved < MIN_HARD_FOR_COMPLETION) {
        remaining.push(`${MIN_HARD_FOR_COMPLETION - hard.solved} more Hard`);
      }
      
      if (remaining.length > 0) {
        result += ` - Need: ${remaining.join(', ')}`;
      }
    }
    
    return result;
  }
}
