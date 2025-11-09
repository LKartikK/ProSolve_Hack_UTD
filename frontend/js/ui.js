/**
 * UI Rendering Functions
 */

const UI = {
    /**
     * Render a scenario card
     */
    renderScenarioCard(scenario, isSelected = false) {
        const ai = scenario?.aiAnalysis || {};
        const impact = Number.isFinite(ai.impact) ? ai.impact : 0;
        const risks = Array.isArray(ai.risks) ? ai.risks : [];
        const opportunities = Array.isArray(ai.opportunities) ? ai.opportunities : [];
      
        const scoreClass = (score) => {
          if (score >= 80) return 'score-high';
          if (score >= 50) return 'score-medium';
          return 'score-low';
        };
      
        const trendIcon = (trend) => {
          if (trend === 'up') return `
            <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
            </svg>`;
          if (trend === 'down') return `
            <svg class="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
            </svg>`;
          return `
            <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
            </svg>`;
        };
      
        return `
          <div class="scenario-card ${isSelected ? 'selected' : ''} bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden fade-in" data-scenario-id="${scenario.id}">
            <div class="p-6 space-y-4">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-start gap-3 flex-1">
                  <div class="custom-checkbox ${isSelected ? 'checked' : ''}" data-scenario-id="${scenario.id}">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <div class="flex-1 cursor-pointer" data-action="view-lifecycle" data-id="${scenario.id}">
                    <h3 class="text-lg font-bold text-slate-900 mb-2">${scenario.name || 'Untitled'}</h3>
                    <p class="text-sm text-slate-600">${scenario.description || ''}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  ${ai.lifecycle ? `
                    <button class="text-xs text-violet-600 hover:text-violet-800 hover:underline" data-action="view-lifecycle" data-id="${scenario.id}" title="View Full PM Lifecycle">
                      View Lifecycle
                    </button>
                  ` : ''}
                <button class="text-xs text-red-600 hover:underline" data-action="delete-task" data-id="${scenario.id}">Delete</button>
                </div>
              </div>
      
              <div class="grid grid-cols-2 gap-3 text-sm pt-2">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  <span class="text-slate-600">${scenario.targetMarket || ''}</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <span class="text-slate-600">${scenario.timeline || ''}</span>
                </div>
              </div>
      
              ${Number.isFinite(impact) ? `
              <div class="space-y-3 pt-3 border-t border-slate-200">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-600 font-medium">Impact Score</span>
                  <span class="score-badge ${scoreClass(impact)}">${impact}</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width: ${impact}%"></div></div>
                ${ai.impactRationale ? `
                  <p class="text-xs text-slate-500 italic">${ai.impactRationale}</p>
                ` : ''}
      
                <div class="flex gap-2 flex-wrap text-xs pt-2">
                  ${ai.lifecycle?.featureScores?.length > 0 ? `
                    <span class="badge badge-outline">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                      ${ai.lifecycle.featureScores.length} Features
                    </span>
                  ` : ''}
                  <span class="badge badge-outline">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                    </svg>
                    ${risks.length} Risks
                  </span>
                  <span class="badge badge-outline">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                    </svg>
                    ${opportunities.length} User Stories
                  </span>
                  ${ai.lifecycle ? `
                    <span class="badge badge-outline">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      Full PM Lifecycle
                    </span>
                  ` : ''}
                </div>
              </div>
              ` : ''}
            </div>
          </div>
        `;
      },
      
      
    
      

    /**
     * Render comparison view
     */
    renderComparisonView(scenarios) {
        if (scenarios.length < 2) {
            return `
                <div class="bg-white rounded-lg shadow-md p-12 text-center">
                    <p class="text-slate-600">Select at least 2 scenarios to compare</p>
                </div>
            `;
        }

        // Sort by Impact Score (highest first)
        const sortedScenarios = [...scenarios].sort((a, b) => {
            const scoreA = a.aiAnalysis?.impact || 0;
            const scoreB = b.aiAnalysis?.impact || 0;
            return scoreB - scoreA;
        });
        const topScenario = sortedScenarios[0];

        return `
            <!-- Winner Card -->
            <div class="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-lg shadow-md border-2 border-violet-600 p-6 mb-6">
                <div class="flex items-center gap-2 mb-3">
                    <svg class="w-5 h-5 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                    <h2 class="text-xl font-bold text-slate-900">Recommended Scenario</h2>
                </div>
                <p class="text-sm text-slate-600 mb-4">Based on Impact Score analysis</p>
                <h3 class="text-lg font-bold text-slate-900 mb-2">${topScenario.name}</h3>
                <p class="text-slate-700 mb-4">${topScenario.description}</p>
                <div class="flex gap-4 text-sm">
                    <div class="flex items-center gap-2">
                        <span class="text-slate-600">Impact Score:</span>
                        <span class="badge badge-primary">${topScenario.aiAnalysis?.impact || 0}</span>
                    </div>
                </div>
            </div>

            <!-- Comparison Table -->
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <div class="p-6 border-b border-slate-200">
                    <h2 class="text-xl font-bold text-slate-900">Side-by-Side Comparison</h2>
                    <p class="text-sm text-slate-600 mt-1">Detailed breakdown of each feature</p>
                </div>
                <div class="overflow-x-auto">
                    <table class="comparison-table">
                        <thead>
                            <tr>
                                <th class="min-w-[150px]">Criteria</th>
                                ${sortedScenarios.map(s => `
                                    <th class="min-w-[200px]">
                                        <div class="flex items-center gap-2">
                                            ${s.id === topScenario.id ? `
                                                <svg class="w-4 h-4 crown-icon" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                                </svg>
                                            ` : ''}
                                            <span>${s.name}</span>
                                        </div>
                                    </th>
                                `).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td class="font-medium text-slate-700">Impact Score</td>
                                ${sortedScenarios.map(s => `
                                    <td>
                                        <div class="space-y-2">
                                            <span class="font-semibold text-slate-900">${s.aiAnalysis?.impact || 0}</span>
                                            <div class="progress-bar">
                                                <div class="progress-fill" style="width: ${s.aiAnalysis?.impact || 0}%"></div>
                                            </div>
                                            ${s.aiAnalysis?.impactRationale ? `
                                                <p class="text-xs text-slate-500 italic mt-2">${s.aiAnalysis.impactRationale}</p>
                                            ` : ''}
                                        </div>
                                    </td>
                                `).join('')}
                            </tr>
                            <tr>
                                <td class="font-medium text-slate-700">Target Users</td>
                                ${sortedScenarios.map(s => `<td class="text-slate-700">${s.targetMarket || ''}</td>`).join('')}
                            </tr>
                            <tr>
                                <td class="font-medium text-slate-700">Timeline</td>
                                ${sortedScenarios.map(s => `<td class="text-slate-700">${s.timeline || ''}</td>`).join('')}
                            </tr>
                            <tr>
                                <td class="font-medium text-slate-700">Key Risks</td>
                                ${sortedScenarios.map(s => `
                                    <td>
                                        <ul class="space-y-1 text-sm text-slate-700">
                                            ${(s.aiAnalysis?.risks || []).slice(0, 2).map(risk => `<li>• ${risk}</li>`).join('')}
                                        </ul>
                                    </td>
                                `).join('')}
                            </tr>
                            <tr>
                                <td class="font-medium text-slate-700">User Stories</td>
                                ${sortedScenarios.map(s => `
                                    <td>
                                        <ul class="space-y-1 text-sm text-slate-700">
                                            ${(s.aiAnalysis?.opportunities || []).slice(0, 2).map(opp => `<li>• ${opp}</li>`).join('')}
                                        </ul>
                                    </td>
                                `).join('')}
                            </tr>
                            <tr>
                                <td class="font-medium text-slate-700">AI Recommendation</td>
                                ${sortedScenarios.map(s => `<td class="text-sm text-slate-700">${s.aiAnalysis?.recommendation || ''}</td>`).join('')}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    /**
     * Render insights panel
     */
    renderInsightsPanel(scenarios, isFiltered = false) {
        if (scenarios.length === 0) {
            if (isFiltered) {
                return `
                    <div class="bg-white rounded-lg shadow-md p-12 text-center">
                        <p class="text-slate-600 mb-4">No selected features to analyze</p>
                        <p class="text-sm text-slate-500">Select features from the overview or history to see their insights</p>
                    </div>
                `;
            }
            return `
                <div class="bg-white rounded-lg shadow-md p-12 text-center">
                    <p class="text-slate-600">Analyze features to see PM-powered insights</p>
                </div>
            `;
        }

        // Calculate average Impact Score
        const avgImpact = Math.round(scenarios.reduce((sum, s) => sum + (s.aiAnalysis?.impact || 0), 0) / scenarios.length);

        // Sort scenarios by Impact Score (highest first)
        const sortedScenarios = [...scenarios].sort((a, b) => {
            const scoreA = a.aiAnalysis?.impact || 0;
            const scoreB = b.aiAnalysis?.impact || 0;
            return scoreB - scoreA;
        });

        // Collect all risk factors from all scenarios
        const allRisks = scenarios.flatMap(s => {
            const risks = s.aiAnalysis?.risks || [];
            // Also check lifecycle for additional risks
            const lifecycleRisks = s.aiAnalysis?.lifecycle?.marketResearch?.feasibilityConstraints || [];
            return [...risks, ...lifecycleRisks.map(c => `Risk: ${c}`)];
        });
        const topRisks = [...new Set(allRisks)].slice(0, 10); // Show more risks

        // Collect user stories from all scenarios
        const allUserStories = scenarios.flatMap(s => {
            // Prefer full user stories structure if available
            const userStories = s.aiAnalysis?.userStories || [];
            if (userStories.length > 0) return userStories;
            // Fallback to opportunities list
            const opportunities = s.aiAnalysis?.opportunities || [];
            return opportunities.map(opp => {
                if (typeof opp === 'string') return { story: opp, criteria: [] };
                return opp;
            });
        });
        
        // Get strategic recommendations from all scenarios
        const allRecommendations = scenarios
            .map(s => {
                const rec = s.aiAnalysis?.recommendation || '';
                const framing = s.aiAnalysis?.strategicFraming || '';
                const lifecycle = s.aiAnalysis?.lifecycle;
                const strategy = lifecycle?.productStrategy || {};
                return {
                    scenarioName: s.name,
                    recommendation: rec || framing || strategy.strategic_framing || '',
                    opportunity: strategy.opportunity_analysis || '',
                    problem: strategy.problem_summary || '',
                };
            })
            .filter(r => r.recommendation || r.opportunity || r.problem);

        const headerText = isFiltered 
            ? `Insights for ${scenarios.length} Selected Feature${scenarios.length !== 1 ? 's' : ''}`
            : 'AI Insights Overview';

        return `
            <div class="space-y-6">
                ${isFiltered ? `
                    <div class="bg-violet-50 border border-violet-200 rounded-lg p-4">
                        <p class="text-sm text-violet-800">
                            <strong>Viewing insights for selected features.</strong> Clear selection to see all features.
                        </p>
                    </div>
                ` : ''}
                <!-- Stats -->
                <div class="grid gap-6 md:grid-cols-2">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="text-sm font-medium text-slate-600 mb-2">${isFiltered ? 'Selected Features' : 'Total Features'}</div>
                        <div class="flex items-baseline gap-2">
                            <span class="text-3xl font-bold text-slate-900">${scenarios.length}</span>
                            <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <div class="text-sm font-medium text-slate-600 mb-2">Avg Impact Score</div>
                        <div class="flex items-baseline gap-2">
                            <span class="text-3xl font-bold text-slate-900">${avgImpact}</span>
                            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Features Ranked by Impact Score -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                        </svg>
                        Features Ranked by Impact Score
                    </h2>
                    <p class="text-sm text-slate-600 mb-4">Higher scores indicate features to build first. Features are sorted by impact score (1-100).</p>
                    <div class="space-y-3">
                        ${sortedScenarios.map((s, index) => {
                            const impact = s.aiAnalysis?.impact || 0;
                            return `
                                <div class="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div class="flex items-center gap-3 flex-1">
                                        <span class="text-sm font-semibold text-slate-500 w-6">#${index + 1}</span>
                                        <div class="flex-1">
                                            <div class="font-medium text-slate-900">${s.name}</div>
                                            <div class="text-xs text-slate-500">${s.description || ''}</div>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-3">
                                        <div class="text-right">
                                            <div class="text-lg font-bold text-slate-900">${impact}</div>
                                            <div class="text-xs text-slate-500">Impact Score</div>
                                </div>
                                        <div class="progress-bar w-20">
                                            <div class="progress-fill" style="width: ${impact}%"></div>
                            </div>
                        </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Risk Factors -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                        Risk Factors
                    </h2>
                    <p class="text-sm text-slate-600 mb-4">Key risks and constraints identified across all features</p>
                    ${topRisks.length > 0 ? `
                        <ul class="space-y-3">
                            ${topRisks.map(risk => `
                                <li class="flex items-start gap-3 text-sm text-slate-700 bg-amber-50 p-3 rounded-lg border-l-4 border-amber-500">
                                    <span class="text-amber-600 mt-0.5 flex-shrink-0">⚠</span>
                                    <span class="flex-1">${risk}</span>
                                </li>
                            `).join('')}
                        </ul>
                    ` : `
                        <p class="text-sm text-slate-500 italic">No risks identified</p>
                    `}
                </div>

                <!-- User Stories -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        User Stories
                    </h2>
                    <p class="text-sm text-slate-600 mb-4">User stories with acceptance criteria identified by PM AI</p>
                    ${allUserStories.length > 0 ? `
                        <div class="space-y-4">
                            ${allUserStories.slice(0, 10).map(us => {
                                const story = typeof us === 'string' ? us : us.story || '';
                                const criteria = typeof us === 'string' ? [] : (us.criteria || []);
                                return `
                                    <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                                        <div class="flex items-start gap-2 mb-2">
                                            <span class="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                                            <p class="text-sm font-medium text-slate-900 flex-1">${story}</p>
                                        </div>
                                        ${criteria.length > 0 ? `
                                            <div class="ml-6 mt-2">
                                                <p class="text-xs font-semibold text-slate-600 mb-1">Acceptance Criteria:</p>
                                                <ul class="space-y-1">
                                                    ${criteria.map(ac => `
                                                        <li class="text-xs text-slate-600 flex items-start gap-2">
                                                            <span class="text-green-600 mt-0.5">•</span>
                                                            <span>${ac}</span>
                                                        </li>
                                                    `).join('')}
                                                </ul>
                                            </div>
                                        ` : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : `
                        <p class="text-sm text-slate-500 italic">No user stories available</p>
                    `}
                </div>

                <!-- Strategic Recommendations -->
                <div class="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-lg shadow-md border-2 border-violet-200 p-6">
                    <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <svg class="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                        </svg>
                        Strategic Recommendations
                    </h2>
                    <div class="space-y-4 text-slate-700">
                        ${allRecommendations.length > 0 ? `
                            ${allRecommendations.map(rec => `
                                <div class="bg-white p-4 rounded-lg border border-violet-200">
                                    ${rec.scenarioName ? `
                                        <h3 class="font-semibold text-slate-900 mb-2">${rec.scenarioName}</h3>
                                    ` : ''}
                                    ${rec.recommendation ? `
                                        <p class="text-sm mb-2"><strong>Strategic Recommendation:</strong> ${rec.recommendation}</p>
                                    ` : ''}
                                    ${rec.opportunity ? `
                                        <p class="text-sm mb-2"><strong>Opportunity:</strong> ${rec.opportunity}</p>
                                    ` : ''}
                                    ${rec.problem ? `
                                        <p class="text-sm"><strong>Problem:</strong> ${rec.problem}</p>
                                    ` : ''}
                                </div>
                            `).join('')}
                        ` : ''}
                        ${sortedScenarios.length > 0 ? `
                            <div class="bg-white p-4 rounded-lg border border-violet-200">
                                <p class="text-sm mb-2"><strong>Build First:</strong> Focus on features with the highest Impact Scores. 
                                "${sortedScenarios[0].name}" (Score: ${sortedScenarios[0].aiAnalysis?.impact || 0}) should be prioritized for development as it has the highest overall impact considering user value, business impact, feasibility, and risk.</p>
                                ${sortedScenarios.length > 1 ? `
                                    <p class="text-sm mt-2"><strong>Strategic Planning:</strong> Features are ranked by Impact Score. Higher scores (80-100) indicate strong candidates to build first. Lower scores (1-49) may need refinement or can be deprioritized. Use the Impact Score as a data-driven guide for prioritization.</p>
                                ` : ''}
                            </div>
                        ` : `
                            <div class="bg-white p-4 rounded-lg border border-violet-200">
                                <p class="text-sm"><strong>Recommendation:</strong> Consider refining feature problem statements or exploring alternative approaches to improve impact scores.</p>
                            </div>
                        `}
                        ${topRisks.length > 0 ? `
                            <div class="bg-white p-4 rounded-lg border border-violet-200">
                                <p class="text-sm"><strong>Risk Mitigation:</strong> Address the ${topRisks.length} risk${topRisks.length !== 1 ? 's' : ''} identified above to improve overall success probability. Use validation approaches recommended by the PM AI agent.</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Render full PM lifecycle view
     */
    renderLifecycleView(scenario) {
        const lifecycle = scenario?.aiAnalysis?.lifecycle;
        if (!lifecycle) {
            return `
                <div class="bg-white rounded-lg shadow-md p-12 text-center">
                    <p class="text-slate-600">Lifecycle data not available</p>
                </div>
            `;
        }

        const ps = lifecycle.productStrategy || {};
        const req = lifecycle.requirements || {};
        const mr = lifecycle.marketResearch || {};
        const pt = lifecycle.prototypeTesting || {};
        const gtm = lifecycle.gotoExecution || {};
        const featureScores = lifecycle.featureScores || [];

        return `
            <div class="space-y-6">
                <!-- 1. Product & Strategy Ideation -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span class="text-2xl">1️⃣</span>
                        Product & Strategy Ideation
                    </h2>
                    <div class="space-y-4">
                        <div>
                            <h3 class="font-semibold text-slate-700 mb-2">Problem Summary</h3>
                            <p class="text-sm text-slate-600">${ps.problem_summary || 'Not available'}</p>
                        </div>
                        <div>
                            <h3 class="font-semibold text-slate-700 mb-2">Opportunity Analysis</h3>
                            <p class="text-sm text-slate-600">${ps.opportunity_analysis || 'Not available'}</p>
                        </div>
                        <div>
                            <h3 class="font-semibold text-slate-700 mb-2">Strategic Framing</h3>
                            <p class="text-sm text-slate-600">${ps.strategic_framing || 'Not available'}</p>
                        </div>
                    </div>
                </div>

                <!-- 2. Requirements & Development -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span class="text-2xl">2️⃣</span>
                        Requirements & Development
                    </h2>
                    <div class="space-y-4">
                        <div>
                            <h3 class="font-semibold text-slate-700 mb-2">User Stories</h3>
                            <ul class="space-y-2">
                                ${(req.userStories || []).map(us => `
                                    <li class="text-sm text-slate-600">
                                        <strong>${us.story || ''}</strong>
                                        ${us.acceptance_criteria && us.acceptance_criteria.length > 0 ? `
                                            <ul class="ml-4 mt-1 space-y-1">
                                                ${us.acceptance_criteria.map(ac => `<li class="text-xs text-slate-500">• ${ac}</li>`).join('')}
                                            </ul>
                                        ` : ''}
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        <div>
                            <h3 class="font-semibold text-slate-700 mb-2">Feature List</h3>
                            <ul class="space-y-2">
                                ${(req.featureList || []).map(f => `
                                    <li class="text-sm text-slate-600">
                                        <strong>${f.name || ''}</strong> 
                                        <span class="badge badge-${f.priority === 'high' ? 'success' : f.priority === 'medium' ? 'warning' : 'danger'} ml-2">${f.priority || ''}</span>
                                        <p class="text-xs text-slate-500 mt-1">${f.description || ''}</p>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                        <div>
                            <h3 class="font-semibold text-slate-700 mb-2">Task Breakdown</h3>
                            <ul class="space-y-2">
                                ${(req.taskBreakdown || []).map(t => `
                                    <li class="text-sm text-slate-600">
                                        <strong>${t.task || ''}</strong>
                                        <span class="badge badge-outline ml-2">${t.estimated_effort || ''}</span>
                                        <p class="text-xs text-slate-500 mt-1">${t.description || ''}</p>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- 3. Customer & Market Research -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span class="text-2xl">3️⃣</span>
                        Customer & Market Research
                    </h2>
                    <div class="space-y-4">
                        <div>
                            <h3 class="font-semibold text-slate-700 mb-2">Competitor Analysis</h3>
                            <div class="space-y-3">
                                ${(mr.competitors || []).map(c => `
                                    <div class="border-l-4 border-violet-500 pl-3">
                                        <strong class="text-slate-700">${c.competitor || ''}</strong>
                                        <p class="text-xs text-slate-600 mt-1"><strong>Strengths:</strong> ${c.strengths || ''}</p>
                                        <p class="text-xs text-slate-600"><strong>Weaknesses:</strong> ${c.weaknesses || ''}</p>
                                        <p class="text-xs text-violet-600 mt-1"><strong>Opportunity:</strong> ${c.opportunity || ''}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div>
                            <h3 class="font-semibold text-slate-700 mb-2">Gaps & Insights</h3>
                            <ul class="space-y-1">
                                ${(mr.gapsInsights || []).map(g => `<li class="text-sm text-slate-600">• ${g}</li>`).join('')}
                            </ul>
                        </div>
                        <div>
                            <h3 class="font-semibold text-slate-700 mb-2">Feasibility Constraints</h3>
                            <ul class="space-y-1">
                                ${(mr.feasibilityConstraints || []).map(c => `<li class="text-sm text-slate-600">• ${c}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- 4. Prototype & Testing Plan -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span class="text-2xl">4️⃣</span>
                        Prototype & Testing Plan
                    </h2>
                    <div class="space-y-4">
                        <div>
                            <h3 class="font-semibold text-slate-700 mb-2">What to Prototype First</h3>
                            <p class="text-sm text-slate-600">${pt.whatToPrototype || 'Not available'}</p>
                        </div>
                        <div>
                            <h3 class="font-semibold text-slate-700 mb-2">Quick Validation Tests</h3>
                            <div class="space-y-2">
                                ${(pt.validationTests || []).map(t => `
                                    <div class="border-l-4 border-green-500 pl-3">
                                        <strong class="text-slate-700">${t.test || ''}</strong>
                                        <p class="text-xs text-slate-600 mt-1"><strong>Purpose:</strong> ${t.purpose || ''}</p>
                                        <p class="text-xs text-green-600 mt-1"><strong>Success Criteria:</strong> ${t.success_criteria || ''}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div>
                            <h3 class="font-semibold text-slate-700 mb-2">First-Round User Testing</h3>
                            ${pt.userTesting ? `
                                <div class="bg-slate-50 p-3 rounded">
                                    <p class="text-sm text-slate-600"><strong>Approach:</strong> ${pt.userTesting.approach || ''}</p>
                                    <p class="text-sm text-slate-600 mt-1"><strong>Participants:</strong> ${pt.userTesting.participants || ''}</p>
                                    <p class="text-sm text-slate-600 mt-1"><strong>Success Criteria:</strong> ${pt.userTesting.success_criteria || ''}</p>
                                    ${pt.userTesting.key_questions && pt.userTesting.key_questions.length > 0 ? `
                                        <div class="mt-2">
                                            <strong class="text-sm text-slate-700">Key Questions:</strong>
                                            <ul class="mt-1 space-y-1">
                                                ${pt.userTesting.key_questions.map(q => `<li class="text-xs text-slate-600">• ${q}</li>`).join('')}
                                            </ul>
                                        </div>
                                    ` : ''}
                                </div>
                            ` : '<p class="text-sm text-slate-600">Not available</p>'}
                        </div>
                    </div>
                </div>

                <!-- 5. Go-To Execution -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span class="text-2xl">5️⃣</span>
                        Go-To Execution
                    </h2>
                    <div class="space-y-4">
                        <div>
                            <h3 class="font-semibold text-slate-700 mb-2">Persona</h3>
                            ${gtm.persona ? `
                                <div class="bg-slate-50 p-3 rounded">
                                    <p class="text-sm font-semibold text-slate-700">${gtm.persona.name || ''}</p>
                                    <p class="text-sm text-slate-600 mt-1">${gtm.persona.description || ''}</p>
                                    ${gtm.persona.pain_points && gtm.persona.pain_points.length > 0 ? `
                                        <p class="text-sm text-slate-600 mt-2"><strong>Pain Points:</strong></p>
                                        <ul class="ml-4 space-y-1">
                                            ${gtm.persona.pain_points.map(p => `<li class="text-xs text-slate-600">• ${p}</li>`).join('')}
                                        </ul>
                                    ` : ''}
                                    ${gtm.persona.goals && gtm.persona.goals.length > 0 ? `
                                        <p class="text-sm text-slate-600 mt-2"><strong>Goals:</strong></p>
                                        <ul class="ml-4 space-y-1">
                                            ${gtm.persona.goals.map(g => `<li class="text-xs text-slate-600">• ${g}</li>`).join('')}
                                        </ul>
                                    ` : ''}
                                </div>
                            ` : '<p class="text-sm text-slate-600">Not available</p>'}
                        </div>
                        <div>
                            <h3 class="font-semibold text-slate-700 mb-2">Messaging & Positioning</h3>
                            ${gtm.messaging ? `
                                <div class="space-y-2">
                                    <p class="text-sm text-slate-600"><strong>Value Proposition:</strong> ${gtm.messaging.value_proposition || ''}</p>
                                    <p class="text-sm text-slate-600"><strong>Positioning:</strong> ${gtm.messaging.positioning || ''}</p>
                                    ${gtm.messaging.key_messages && gtm.messaging.key_messages.length > 0 ? `
                                        <div>
                                            <strong class="text-sm text-slate-700">Key Messages:</strong>
                                            <ul class="mt-1 space-y-1">
                                                ${gtm.messaging.key_messages.map(m => `<li class="text-xs text-slate-600">• ${m}</li>`).join('')}
                                            </ul>
                                        </div>
                                    ` : ''}
                                </div>
                            ` : '<p class="text-sm text-slate-600">Not available</p>'}
                        </div>
                        <div>
                            <h3 class="font-semibold text-slate-700 mb-2">Mini Launch Plan</h3>
                            ${gtm.launchPlan ? `
                                <div class="space-y-3">
                                    ${gtm.launchPlan.phases && gtm.launchPlan.phases.length > 0 ? `
                                        <div>
                                            <strong class="text-sm text-slate-700">Phases:</strong>
                                            <div class="mt-2 space-y-2">
                                                ${gtm.launchPlan.phases.map(p => `
                                                    <div class="border-l-4 border-blue-500 pl-3">
                                                        <strong class="text-slate-700">${p.phase || ''}</strong>
                                                        <p class="text-xs text-slate-600 mt-1">${p.description || ''}</p>
                                                        <p class="text-xs text-blue-600 mt-1">Timeline: ${p.timeline || ''}</p>
                                                    </div>
                                                `).join('')}
                                            </div>
                                        </div>
                                    ` : ''}
                                    ${gtm.launchPlan.channels && gtm.launchPlan.channels.length > 0 ? `
                                        <div>
                                            <strong class="text-sm text-slate-700">Channels:</strong>
                                            <p class="text-sm text-slate-600">${gtm.launchPlan.channels.join(', ')}</p>
                                        </div>
                                    ` : ''}
                                </div>
                            ` : '<p class="text-sm text-slate-600">Not available</p>'}
                        </div>
                        <div>
                            <h3 class="font-semibold text-slate-700 mb-2">Success Measurements</h3>
                            <div class="space-y-2">
                                ${(gtm.successMeasurements || []).map(m => `
                                    <div class="border-l-4 border-purple-500 pl-3">
                                        <strong class="text-slate-700">${m.metric || ''}</strong>
                                        <p class="text-xs text-slate-600 mt-1"><strong>Target:</strong> ${m.target || ''}</p>
                                        <p class="text-xs text-purple-600 mt-1"><strong>Measurement:</strong> ${m.measurement_method || ''}</p>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 6. Feature Impact Scores -->
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <span class="text-2xl">6️⃣</span>
                        Feature Impact Scores
                    </h2>
                    <div class="space-y-3">
                        ${featureScores.map((f, index) => {
                            const score = f.impact_score || 0;
                            const scoreClass = score >= 80 ? 'score-high' : score >= 50 ? 'score-medium' : 'score-low';
                            return `
                                <div class="border-l-4 border-violet-500 pl-4 py-3 bg-slate-50 rounded">
                                    <div class="flex items-center justify-between mb-2">
                                        <h3 class="font-semibold text-slate-700">${index + 1}. ${f.feature_name || ''}</h3>
                                        <span class="score-badge ${scoreClass}">${score}</span>
                                    </div>
                                    <p class="text-sm text-slate-600">${f.reasoning || ''}</p>
                                    <div class="progress-bar mt-2">
                                        <div class="progress-fill" style="width: ${score}%"></div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Show a toast notification
     */
    // --- replace your UI.showToast with this ---
    showToast(message, type = 'success') {
        // kill any existing toast so we never show both "Failed" and "Deleted"
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();
    
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'status');
        toast.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            ${type === 'success'
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>'
            }
        </svg>
        <span>${message}</span>
        `;
        document.body.appendChild(toast);
    
        // auto-hide
        setTimeout(() => toast.remove(), 2200);
    }
  

    /* ========= NEW UI for Tasks + Sessions ========= */

    // Simple date/time helpers
    ,_fmtDateTime(iso) {
        const d = new Date(iso);
        return d.toLocaleString();
    },
    _dayKey(iso) {
        const d = new Date(iso);
        return [d.getFullYear(), String(d.getMonth()+1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
    },

    // Render Today's Work list
    renderTodayList(container, tasks = []) {
        container.innerHTML = '';
        if (!tasks.length) {
          container.innerHTML = '<li class="text-slate-500 text-sm">No tasks yet. Add one!</li>';
          return;
        }
        tasks.forEach(t => {
          const li = document.createElement('li');
          li.className = 'task-item py-2 border-b border-slate-100 last:border-0';
          li.innerHTML = `
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-slate-900 font-medium">${t.title || t.name || 'Untitled'}</div>
                ${t.details ? `<div class="text-sm text-slate-600">${t.details}</div>` : (t.description ? `<div class="text-sm text-slate-600">${t.description}</div>` : '')}
              </div>
              <div class="flex items-center gap-3">
                <button class="text-xs text-red-600 hover:underline" data-action="delete-task" data-id="${t.id}">Delete</button>
                <div class="text-xs text-slate-500 whitespace-nowrap">${this._fmtDateTime(t.created_at || t.createdAt)}</div>
              </div>
            </div>
          `;
          container.appendChild(li);
        });
      },
      
      

    // Group tasks by day within a session
    _groupTasksByDay(tasks = []) {
        const map = {};
        for (const t of tasks) {
            const key = this._dayKey(t.created_at);
            if (!map[key]) map[key] = [];
            map[key].push(t);
        }
        return map;
    },

    // Render Task History with sessions, each grouped by task day (newest day first)
    renderHistoryGrouped(container, groupsObj) {
        if (!container) return;
        container.innerHTML = '';
    
        // groupsObj is expected like: { "YYYY-MM-DD": [taskRow, ...], ... }
        const dates = Object.keys(groupsObj || {});
        if (!dates.length) {
            container.innerHTML = `
              <div class="text-sm text-slate-500 bg-white border border-slate-200 rounded-lg p-6">
                No past sessions yet.
              </div>`;
            return;
        }
    
        // Newest date first
        dates.sort((a, b) => (a < b ? 1 : -1));
    
        const sections = dates.map(dateKey => {
            const rows = Array.isArray(groupsObj[dateKey]) ? groupsObj[dateKey] : [];
            const normalized = rows.map(normalizeTask);
            const inner = normalized.map(t => this.renderScenarioCard(t, false)).join('');
            return `
              <div class="bg-white rounded-lg border border-slate-200">
                <div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 class="text-sm font-semibold text-slate-700">${dateKey}</h3>
                  <span class="text-xs text-slate-500">${normalized.length} item(s)</span>
                </div>
                <div class="p-4 grid gap-4 md:grid-cols-2">
                  ${inner}
                </div>
              </div>
            `;
        });
    
        container.innerHTML = sections.join('');
    },
    
};

// Export for tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UI;
}
