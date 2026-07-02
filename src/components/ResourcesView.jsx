import React, { useState } from 'react';
import { BookOpen, Video, FileText, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const ResourcesView = () => {
  const [expandedItem, setExpandedItem] = useState(null);

  const resources = [
    {
      category: 'Documentation',
      icon: BookOpen,
      items: [
        { 
          title: 'Getting Started Guide', 
          description: 'Learn how to use CodeFlux effectively',
          content: `Welcome to CodeFlux! Here's how to get started:
          
1. Choose a Learning Path or browse Modules
2. Start with beginner-friendly problems
3. Watch video tutorials for each pattern
4. Practice problems to reinforce concepts
5. Track your progress in Analytics

Tips:
- Solve at least one problem daily
- Review solutions after attempting
- Use Fluxy AI assistant for help
- Focus on understanding patterns, not memorizing solutions`
        },
        { 
          title: 'DSA Fundamentals', 
          description: 'Core concepts and terminology',
          content: `Key DSA Concepts:

Arrays & Strings:
- Contiguous memory allocation
- O(1) access time
- Common operations: search, insert, delete

Linked Lists:
- Dynamic memory allocation
- O(n) access time
- Efficient insertions/deletions

Trees & Graphs:
- Hierarchical data structures
- Traversal algorithms (DFS, BFS)
- Applications in real-world problems

Time Complexity:
- O(1): Constant time
- O(log n): Logarithmic time
- O(n): Linear time
- O(n²): Quadratic time`
        },
        { 
          title: 'Problem Solving Strategies', 
          description: 'Approaches to tackle coding problems',
          content: `Problem Solving Framework:

1. Understand the Problem
   - Read carefully
   - Identify inputs/outputs
   - Note constraints

2. Plan Your Approach
   - Think of similar problems
   - Consider edge cases
   - Choose appropriate data structure

3. Implement Solution
   - Write clean, readable code
   - Add comments for clarity
   - Test with examples

4. Optimize
   - Analyze time/space complexity
   - Look for bottlenecks
   - Consider trade-offs

5. Review & Learn
   - Compare with optimal solution
   - Understand why it works
   - Note patterns for future`
        },
      ]
    },
    {
      category: 'Video Tutorials',
      icon: Video,
      items: [
        { 
          title: 'Introduction to Algorithms', 
          description: 'Comprehensive video series',
          content: `Video Series Overview:

Module 1: Sorting Algorithms
- Bubble Sort, Selection Sort
- Merge Sort, Quick Sort
- Time complexity analysis

Module 2: Search Algorithms
- Linear Search
- Binary Search
- Search in rotated arrays

Module 3: Graph Algorithms
- BFS and DFS
- Shortest path algorithms
- Topological sorting

Each video includes:
✓ Visual explanations
✓ Code walkthroughs
✓ Practice problems
✓ Real-world applications`
        },
        { 
          title: 'Data Structures Explained', 
          description: 'Visual explanations of key concepts',
          content: `Data Structures Video Library:

Basic Structures:
- Arrays and Dynamic Arrays
- Linked Lists (Single, Double, Circular)
- Stacks and Queues

Advanced Structures:
- Trees (Binary, BST, AVL)
- Heaps and Priority Queues
- Hash Tables and Maps
- Graphs and Tries

Each video covers:
- Structure visualization
- Common operations
- Time/space complexity
- Use cases and applications`
        },
        { 
          title: 'Interview Preparation', 
          description: 'Tips and tricks for coding interviews',
          content: `Interview Preparation Guide:

Before the Interview:
- Practice 2-3 problems daily
- Review common patterns
- Mock interviews with peers
- Prepare questions to ask

During the Interview:
- Think out loud
- Ask clarifying questions
- Start with brute force
- Optimize step by step
- Test your code

Common Topics:
- Arrays & Strings (30%)
- Trees & Graphs (25%)
- Dynamic Programming (20%)
- System Design (15%)
- Others (10%)`
        },
      ]
    },
    {
      category: 'Cheat Sheets',
      icon: FileText,
      items: [
        { 
          title: 'Time Complexity Guide', 
          description: 'Big O notation reference',
          content: `Big O Complexity Chart:

O(1) - Constant:
- Array access by index
- Hash table lookup
- Push/pop from stack

O(log n) - Logarithmic:
- Binary search
- Balanced tree operations
- Heap insert/delete

O(n) - Linear:
- Array traversal
- Linear search
- Single loop

O(n log n) - Linearithmic:
- Merge sort
- Quick sort (average)
- Heap sort

O(n²) - Quadratic:
- Nested loops
- Bubble sort
- Selection sort

O(2ⁿ) - Exponential:
- Recursive fibonacci
- Subset generation
- Backtracking`
        },
        { 
          title: 'Common Patterns', 
          description: 'Quick reference for problem patterns',
          content: `Problem Solving Patterns:

1. Two Pointers
   - Sorted array problems
   - Palindrome checking
   - Container with most water

2. Sliding Window
   - Subarray problems
   - String matching
   - Maximum/minimum in window

3. Fast & Slow Pointers
   - Cycle detection
   - Middle of linked list
   - Happy number

4. Binary Search
   - Search in sorted array
   - Find peak element
   - Search in rotated array

5. DFS/BFS
   - Tree traversal
   - Graph connectivity
   - Shortest path

6. Dynamic Programming
   - Fibonacci sequence
   - Knapsack problem
   - Longest common subsequence`
        },
        { 
          title: 'Language Syntax', 
          description: 'Code snippets in multiple languages',
          content: `Quick Syntax Reference:

JavaScript:
- Array: const arr = [1, 2, 3]
- Loop: for (let i = 0; i < n; i++)
- Map: arr.map(x => x * 2)
- Filter: arr.filter(x => x > 0)

Python:
- List: arr = [1, 2, 3]
- Loop: for i in range(n)
- Comprehension: [x*2 for x in arr]
- Lambda: lambda x: x * 2

Java:
- Array: int[] arr = {1, 2, 3}
- Loop: for (int i = 0; i < n; i++)
- Stream: Arrays.stream(arr)
- Lambda: x -> x * 2

C++:
- Vector: vector<int> arr = {1,2,3}
- Loop: for (int i = 0; i < n; i++)
- Range: for (auto x : arr)
- Lambda: [](int x) { return x*2; }`
        },
      ]
    },
  ];

  const toggleItem = (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setExpandedItem(expandedItem === key ? null : key);
  };

  return (
    <div className="bg-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">Resources</h1>
        <p className="text-slate-400 mb-8">Additional learning materials and references</p>

        <div className="space-y-8">
          {resources.map((category, categoryIndex) => {
            const Icon = category.icon;
            
            return (
              <div key={category.category}>
                <div className="flex items-center gap-3 mb-4">
                  <Icon size={24} className="text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">{category.category}</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {category.items.map((item, itemIndex) => {
                    const key = `${categoryIndex}-${itemIndex}`;
                    const isExpanded = expandedItem === key;
                    
                    return (
                      <div key={itemIndex}>
                        <button
                          onClick={() => toggleItem(categoryIndex, itemIndex)}
                          className="w-full bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition-all group text-left"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                              {item.title}
                            </h3>
                            {isExpanded ? (
                              <ChevronUp size={18} className="text-blue-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown size={18} className="text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-slate-400 text-sm">{item.description}</p>
                        </button>
                        
                        {isExpanded && (
                          <div className="mt-2 bg-slate-800 rounded-lg p-6 border border-blue-500">
                            <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                              {item.content}
                            </pre>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ResourcesView;
