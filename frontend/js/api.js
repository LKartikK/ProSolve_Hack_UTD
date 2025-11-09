/**
 * API Client for backend communication (SQLite-ready)
 */

var API_BASE_URL = 'http://localhost:8000';

// Health check on load (non-blocking)
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    fetch(`${API_BASE_URL}/health`)
      .then(() => console.log('✅ Backend is connected and running'))
      .catch(() => console.warn('⚠️ Backend not reachable on port 8000'));
  });
}

/* ---------------- Helpers ---------------- */
function pct(n, fallback = 70) {
  const x = Number.isFinite(n) ? n : fallback;
  return Math.max(0, Math.min(100, Math.round(x)));
}

function buildScenarioText(d) {
  const parts = [
    `Feature: ${d.featureName || d.name}`,
    `Problem: ${d.problemStatement || d.description}`,
    `Target users: ${d.targetUsers || d.targetMarket}`,
    `Success metrics: ${d.successMetrics || ''}`,
  ];
  if (d.timeline) parts.push(`Timeline: ${d.timeline}`);
  if (d.resources) parts.push(`Resources: ${d.resources}`);
  if (Array.isArray(d.constraints) && d.constraints.length)
    parts.push(`Constraints: ${d.constraints.join('; ')}`);
  else if (Array.isArray(d.assumptions) && d.assumptions.length)
    parts.push(`Constraints: ${d.assumptions.join('; ')}`);
  return parts.join('. ') + '.';
}

const API = {
  /* ================= LLM simulate ================= */
  async analyzeScenario(scenarioData) {
    try {
      const requestBody = { scenario: buildScenarioText(scenarioData), context: null };
      const response = await fetch(`${API_BASE_URL}/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const body = await response.text();
        throw new Error(`Backend error (${response.status}): ${body}`);
      }
      const result = await response.json();

      // Extract all lifecycle sections
      const productStrategy = result?.product_strategy_ideation || {};
      const requirements = result?.requirements_development || {};
      const marketResearch = result?.customer_market_research || {};
      const prototypeTesting = result?.prototype_testing_plan || {};
      const gotoExecution = result?.goto_execution || {};
      const featureScores = Array.isArray(result?.feature_impact_scores) ? result.feature_impact_scores : [];

      // Get user stories
      const userStories = Array.isArray(requirements.user_stories) ? requirements.user_stories : [];
      const featureList = Array.isArray(requirements.feature_list) ? requirements.feature_list : [];
      const taskBreakdown = Array.isArray(requirements.task_breakdown) ? requirements.task_breakdown : [];

      // Get highest impact score for main display (first feature, sorted highest to lowest)
      const topFeature = featureScores.length > 0 ? featureScores[0] : null;
      const impactScore = topFeature ? pct(topFeature.impact_score ?? 70, 70) : 70;
      const impactRationale = topFeature?.reasoning || '';

      // Get competitor analysis
      const competitors = Array.isArray(marketResearch.competitor_analysis) ? marketResearch.competitor_analysis : [];
      const gapsInsights = Array.isArray(marketResearch.gaps_insights) ? marketResearch.gaps_insights : [];
      const feasibilityConstraints = Array.isArray(marketResearch.feasibility_constraints) ? marketResearch.feasibility_constraints : [];

      // Get prototype and testing info
      const validationTests = Array.isArray(prototypeTesting.quick_validation_tests) ? prototypeTesting.quick_validation_tests : [];
      const userTesting = prototypeTesting.first_round_user_testing || {};

      // Get GTM info
      const persona = gotoExecution.persona || {};
      const messaging = gotoExecution.messaging_positioning || {};
      const launchPlan = gotoExecution.mini_launch_plan || {};
      const successMeasurements = Array.isArray(gotoExecution.success_measurements) ? gotoExecution.success_measurements : [];

      // Collect all risk factors from lifecycle data
      const riskList = [
        // From market research - feasibility constraints are risks
        ...feasibilityConstraints.map(c => `Risk: ${c}`),
        // From gaps/insights - potential risks
        ...gapsInsights.filter(g => g.toLowerCase().includes('risk') || g.toLowerCase().includes('challenge')).map(g => `Risk: ${g}`),
        // From prototype testing - testing risks
        ...validationTests.filter(t => t.purpose && (t.purpose.toLowerCase().includes('risk') || t.purpose.toLowerCase().includes('validate risk'))).map(t => `Testing Risk: ${t.test || ''} - ${t.purpose || ''}`),
      ].filter(Boolean);

      // Create user stories list with full details for display
      const userStoriesList = userStories.map(us => {
        if (typeof us === 'string') return us;
        const story = us.story || '';
        const criteria = Array.isArray(us.acceptance_criteria) && us.acceptance_criteria.length > 0 
          ? us.acceptance_criteria 
          : [];
        return { story, criteria };
      }).filter(us => us.story || typeof us === 'string');

      // Create opportunities list (for backwards compatibility, show user stories)
      const oppList = userStoriesList.map(us => {
        if (typeof us === 'string') return us;
        return us.story;
      }).filter(Boolean);

      // Collect strategic recommendations from multiple sources
      const strategicRecommendations = [
        productStrategy.strategic_framing,
        productStrategy.opportunity_analysis,
        messaging.value_proposition,
      ].filter(Boolean);
      
      const recommendation = strategicRecommendations.length > 0 
        ? strategicRecommendations.join(' ') 
        : '';

      return {
        id: Date.now().toString(),
        name: scenarioData.featureName || scenarioData.name,
        description: scenarioData.problemStatement || scenarioData.description,
        targetMarket: scenarioData.targetUsers || scenarioData.targetMarket,
        timeline: scenarioData.timeline,
        resources: scenarioData.resources || null,
        assumptions: scenarioData.constraints || scenarioData.assumptions || [],
        createdAt: new Date().toISOString(),
        aiAnalysis: {
          impact: impactScore,  // Highest impact score (from first feature)
          impactRationale: impactRationale,
          risks: riskList,  // All risk factors from lifecycle
          opportunities: oppList,  // User stories for display
          userStories: userStoriesList,  // Full user stories with acceptance criteria
          recommendation: recommendation,  // Strategic recommendations
          strategicFraming: productStrategy.strategic_framing || '',
          keyMetrics: [
            { label: 'Impact Score', value: `${impactScore}`, trend: impactScore >= 80 ? 'up' : impactScore >= 50 ? 'neutral' : 'down' },
          ],
          aiReasons: { impact: impactRationale },
          // Full lifecycle data (unchanged)
          lifecycle: {
            productStrategy,
            requirements: {
              userStories,
              featureList,
              taskBreakdown,
            },
            marketResearch: {
              competitors,
              gapsInsights,
              feasibilityConstraints,
            },
            prototypeTesting: {
              whatToPrototype: prototypeTesting.what_to_prototype_first || '',
              validationTests,
              userTesting,
            },
            gotoExecution: {
              persona,
              messaging,
              launchPlan,
              successMeasurements,
            },
            featureScores, // All features with their impact scores
          },
          aiRaw: result,
        },
      };
    } catch (err) {
      console.error('❌ analyzeScenario failed, using mock:', err);
      return this.getMockAnalysis(scenarioData);
    }
  },

  /* ================= Tasks (SQLite) ================= */
  // Matches FastAPI TaskCreate (aliases enabled in Pydantic)
  async createTask({
    name, description, targetMarket, timeline,
    resources = null, assumptions = [], aiAnalysis = null, createdAt = null
  }) {
    const body = {
      name,
      description,
      targetMarket,   // alias -> target_market
      timeline,
      resources,
      assumptions,
      aiAnalysis,     // alias -> ai_analysis
      createdAt       // alias -> created_at
    };

    const r = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await r.text();
    if (!r.ok) {
      console.error('❌ Save failed body:', text);
      throw new Error('Failed to create task');
    }
    return JSON.parse(text);
  },

  async getTodayTasks() {
    const r = await fetch(`${API_BASE_URL}/tasks/today`);
    if (!r.ok) throw new Error("Failed to load today's tasks");
    return r.json();
  },

  async getHistoryGroups() {
    // returns { groups: { 'YYYY-MM-DD': [tasks...] } }
    const r = await fetch(`${API_BASE_URL}/tasks/history`);
    if (!r.ok) throw new Error('Failed to load history');
    return r.json();
  },

  async deleteTask(id) {
    console.log('🗑️ Deleting task', id);
    const r = await fetch(`${API_BASE_URL}/tasks/${id}`, { method: 'DELETE' });
    if (!r.ok) {
      const body = await r.text().catch(() => '');
      console.error('❌ Delete failed:', body || r.statusText);
      throw new Error('Failed to delete task');
    }
    return r.json();
  },

  /* ========== Legacy helpers (optional) ========== */
  async getScenarios() {
    try {
      const response = await fetch(`${API_BASE_URL}/scenarios`);
      if (!response.ok) throw new Error(`API request failed: ${response.statusText}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      return [];
    }
  },

  async deleteScenario(scenarioId) {
    // Kept for back-compat; routes to /tasks/{id}
    // Use deleteTask for consistency
    return this.deleteTask(scenarioId);
  },

  /* ================= Mock ================= */
  getMockAnalysis(scenarioData) {
    const feasibility = Math.floor(Math.random() * 30) + 70;
    const impact = Math.floor(Math.random() * 30) + 70;
    return {
      id: Date.now().toString(),
      ...scenarioData,
      createdAt: new Date().toISOString(),
      aiAnalysis: {
        feasibility,
        impact,
        risks: [
          'Market adoption may be slower than anticipated',
          'Resource allocation conflicts with existing priorities',
          'Technical dependencies on third-party vendors',
          'Competitive response could accelerate timeline pressures',
        ],
        opportunities: [
          'First-mover advantage in emerging market segment',
          'Potential for strategic partnerships with key players',
          'Strong alignment with long-term company vision',
          'Opportunity to establish industry standards',
        ],
        recommendation:
          feasibility > 80 && impact > 80
            ? 'High priority - Recommend immediate execution with full resource allocation'
            : feasibility > 70
            ? 'Medium priority - Validate assumptions with user research before proceeding'
            : 'Low priority - Consider alternative approaches or defer until resources available',
        keyMetrics: [
          { label: 'Est. User Impact', value: `${Math.floor(Math.random() * 500 + 100)}K users`, trend: 'up' },
          { label: 'Time to Market', value: scenarioData.timeline, trend: 'neutral' },
          { label: 'Resource Efficiency', value: `${Math.floor(Math.random() * 30) + 70}%`, trend: 'up' },
          { label: 'Market Fit Score', value: `${Math.floor(Math.random() * 20) + 75}/100`, trend: 'up' },
        ],
      },
    };
  },
};

/* ---- Back-compat shims so older code paths keep working ---- */
if (!API.getCurrentTasks) {
  API.getCurrentTasks = API.getTodayTasks;
}

/* Node export (optional) */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
