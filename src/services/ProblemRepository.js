/**
 * ProblemRepository - Manages problem data and filtering
 * 
 * Features: Load problems, filter by difficulty/company/topic, similarity calculation
 */

class ProblemRepository {
  constructor() {
    this.problems = [];
    this.problemsById = new Map();
    this.problemsByModule = new Map();
    this.initialized = false;
  }

  /**
   * Initialize repository by loading all problems from modules
   * @param {Array<import('../types').ContentModule>} modules
   */
  async initialize(modules) {
    if (this.initialized) return;
    
    this.problems = [];
    this.problemsById.clear();
    this.problemsByModule.clear();
    
    for (const module of modules) {
      if (module.problems && module.problems.length > 0) {
        for (const problem of module.problems) {
          // Add module reference to problem
          const enhancedProblem = {
            ...problem,
            moduleId: module.id,
            moduleName: module.title,
          };
          
          this.problems.push(enhancedProblem);
          this.problemsById.set(problem.id, enhancedProblem);
          
          // Group by module
          if (!this.problemsByModule.has(module.id)) {
            this.problemsByModule.set(module.id, []);
          }
          this.problemsByModule.get(module.id).push(enhancedProblem);
        }
      }
    }
    
    this.initialized = true;
  }

  /**
   * Get all problems
   * @returns {Array<import('../types').EnhancedProblem>}
   */
  getAllProblems() {
    return [...this.problems];
  }

  /**
   * Get problems by module ID
   * @param {string} moduleId
   * @returns {Array<import('../types').EnhancedProblem>}
   */
  getProblemsByModule(moduleId) {
    return this.problemsByModule.get(moduleId) || [];
  }

  /**
   * Get problem by ID
   * @param {string} problemId
   * @returns {import('../types').EnhancedProblem | undefined}
   */
  getProblemById(problemId) {
    return this.problemsById.get(problemId);
  }

  /**
   * Filter problems by difficulty
   * @param {'easy' | 'medium' | 'hard'} difficulty
   * @returns {Array<import('../types').EnhancedProblem>}
   */
  filterByDifficulty(difficulty) {
    return this.problems.filter(p => p.difficulty === difficulty);
  }

  /**
   * Filter problems by company tag
   * @param {string} company
   * @returns {Array<import('../types').EnhancedProblem>}
   */
  filterByCompany(company) {
    return this.problems.filter(p => 
      p.companyTags && p.companyTags.includes(company)
    );
  }

  /**
   * Filter problems by topic tag
   * @param {string} topic
   * @returns {Array<import('../types').EnhancedProblem>}
   */
  filterByTopic(topic) {
    return this.problems.filter(p => 
      p.topicTags && p.topicTags.includes(topic)
    );
  }

  /**
   * Get similar problems based on shared attributes
   * @param {string} problemId
   * @param {number} limit - Maximum number of suggestions (default: 5)
   * @returns {Array<import('../types').EnhancedProblem>}
   */
  getSimilarProblems(problemId, limit = 5) {
    const problem = this.getProblemById(problemId);
    if (!problem) return [];
    
    // Calculate similarity scores for all other problems
    const similarities = this.problems
      .filter(p => p.id !== problemId)
      .map(p => ({
        problem: p,
        score: this.calculateSimilarity(problem, p),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    return similarities.map(s => s.problem);
  }

  /**
   * Calculate similarity score between two problems
   * @param {import('../types').EnhancedProblem} problem1
   * @param {import('../types').EnhancedProblem} problem2
   * @returns {number} Similarity score (0-100)
   * @private
   */
  calculateSimilarity(problem1, problem2) {
    let score = 0;
    
    // Same module: +40 points (highest priority)
    if (problem1.moduleId === problem2.moduleId) {
      score += 40;
    }
    
    // Same difficulty: +20 points
    if (problem1.difficulty === problem2.difficulty) {
      score += 20;
    }
    
    // Shared topic tags: +5 points per shared tag (max 20)
    if (problem1.topicTags && problem2.topicTags) {
      const sharedTopics = problem1.topicTags.filter(tag => 
        problem2.topicTags.includes(tag)
      );
      score += Math.min(sharedTopics.length * 5, 20);
    }
    
    // Shared company tags: +2 points per shared company (max 10)
    if (problem1.companyTags && problem2.companyTags) {
      const sharedCompanies = problem1.companyTags.filter(tag => 
        problem2.companyTags.includes(tag)
      );
      score += Math.min(sharedCompanies.length * 2, 10);
    }
    
    // Similar complexity: +10 points if both have same time complexity
    if (problem1.timeComplexity && problem2.timeComplexity && 
        problem1.timeComplexity === problem2.timeComplexity) {
      score += 10;
    }
    
    return score;
  }

  /**
   * Get all unique company tags
   * @returns {Array<string>}
   */
  getAllCompanyTags() {
    const companies = new Set();
    this.problems.forEach(p => {
      if (p.companyTags) {
        p.companyTags.forEach(tag => companies.add(tag));
      }
    });
    return Array.from(companies).sort();
  }

  /**
   * Get all unique topic tags
   * @returns {Array<string>}
   */
  getAllTopicTags() {
    const topics = new Set();
    this.problems.forEach(p => {
      if (p.topicTags) {
        p.topicTags.forEach(tag => topics.add(tag));
      }
    });
    return Array.from(topics).sort();
  }

  /**
   * Search problems by title or description
   * @param {string} query
   * @returns {Array<import('../types').EnhancedProblem>}
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.problems.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get problem statistics
   * @returns {Object}
   */
  getStatistics() {
    const stats = {
      total: this.problems.length,
      byDifficulty: {
        easy: 0,
        medium: 0,
        hard: 0,
      },
      byModule: {},
      averageAcceptanceRate: 0,
    };
    
    let totalAcceptance = 0;
    let countWithAcceptance = 0;
    
    this.problems.forEach(p => {
      // Count by difficulty
      if (p.difficulty) {
        stats.byDifficulty[p.difficulty]++;
      }
      
      // Count by module
      if (p.moduleId) {
        stats.byModule[p.moduleId] = (stats.byModule[p.moduleId] || 0) + 1;
      }
      
      // Calculate average acceptance rate
      if (p.acceptanceRate) {
        totalAcceptance += p.acceptanceRate;
        countWithAcceptance++;
      }
    });
    
    if (countWithAcceptance > 0) {
      stats.averageAcceptanceRate = Math.round(totalAcceptance / countWithAcceptance * 10) / 10;
    }
    
    return stats;
  }
}

// Export singleton instance
export default new ProblemRepository();
