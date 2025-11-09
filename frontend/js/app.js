/**
 * Main Application Logic
 */

// Application State
const AppState = {
    scenarios: [],              // today
    selectedScenarios: [],
    currentTab: 'overview',
    todayTasks: [],
    sessions: [],               // (not used now, but kept)
    historyTasksFlat: [],       // <— NEW: flattened list of *all* history tasks
  };
  

  function normalizeTask(t) {
    const isDB = Object.prototype.hasOwnProperty.call(t, "target_market") || Object.prototype.hasOwnProperty.call(t, "created_at");
    const dbId = (isDB ? t.id : null);
  
    const aiRaw = (isDB ? t.ai_analysis : t.aiAnalysis) || {};
    return {
      // if it’s from DB use the real id; otherwise let client items fall back
      id: dbId != null ? String(dbId) : String(t.id ?? Date.now()),
      name: t.name,
      description: t.description,
      targetMarket: isDB ? t.target_market : t.targetMarket,
      timeline: t.timeline,
      resources: t.resources ?? null,
      assumptions: t.assumptions ?? [],
      createdAt: t.created_at || t.createdAt || new Date().toISOString(),
      aiAnalysis: {
        impact: aiRaw.impact ?? 0,  // Single Impact Score (1-100)
        impactRationale: aiRaw.impactRationale || null,
        risks: Array.isArray(aiRaw.risks) ? aiRaw.risks : [],
        opportunities: Array.isArray(aiRaw.opportunities) ? aiRaw.opportunities : [],
        userStories: Array.isArray(aiRaw.userStories) ? aiRaw.userStories : (Array.isArray(aiRaw.opportunities) ? aiRaw.opportunities.map(opp => typeof opp === 'string' ? { story: opp, criteria: [] } : opp) : []),
        recommendation: aiRaw.recommendation ?? "",
        strategicFraming: aiRaw.strategicFraming || null,
        keyMetrics: Array.isArray(aiRaw.keyMetrics) ? aiRaw.keyMetrics : [],
        aiReasons: aiRaw.aiReasons || aiRaw.reasons || null,
        aiRecommendationFull: aiRaw.aiRecommendationFull || aiRaw.recommendation || null,
        lifecycle: aiRaw.lifecycle || null,  // Full PM lifecycle data (unchanged)
        aiRaw
      }
    };
  }
  
  // ---------- Deletion + Delegated Click Helpers ----------
async function handleDelete(taskId) {
    try {
      // Convert to number for backend
      const idNum = Number(taskId);
      if (!Number.isInteger(idNum) || idNum <= 0) {
        UI?.showToast && UI.showToast('Invalid task ID', 'error');
        return;
      }

      // Remove from selected scenarios first
      AppState.selectedScenarios = AppState.selectedScenarios.filter(id => String(id) !== String(taskId));
      
      // Remove from local state immediately (optimistic update)
      AppState.scenarios = AppState.scenarios.filter(s => String(s.id) !== String(taskId));
      AppState.historyTasksFlat = AppState.historyTasksFlat.filter(s => String(s.id) !== String(taskId));
      
      // Update UI immediately for instant feedback
      updateUI();

      // Delete from backend
      await API.deleteTask(idNum);
      
      // Refresh from server to ensure consistency
      await refreshTasksAndHistory();
      
      UI?.showToast && UI.showToast('Task deleted successfully', 'success');
    } catch (e) {
      console.error('Delete error:', e);
      UI?.showToast && UI.showToast('Failed to delete task', 'error');
      // Refresh to restore correct state in case of error
      await refreshTasksAndHistory();
    }
  }
  
  /**
   * Delegate clicks for:
   *  - selecting a card via .custom-checkbox
   * Works for both Today and History grids.
   * Note: Delete is handled by global click delegation below
   */
  function delegateCardClicks(containerEl) {
    if (!containerEl) return;
  
    containerEl.addEventListener('click', async (e) => {
      // Toggle select
      const checkbox = e.target.closest('.custom-checkbox');
      if (checkbox && checkbox.dataset.scenarioId) {
        toggleScenarioSelection(String(checkbox.dataset.scenarioId));
        return;
      }
      // Delete is handled by global listener to avoid conflicts
    });
  }
  

  
// DOM Elements - will be initialized in init()
let elements = {};

// Initialize DOM elements
function initializeElements() {
    console.log('🔍 Initializing DOM elements...');
    
    elements = {
        homeLogoBtn: document.getElementById('home-logo-btn'),
        newScenarioBtn: document.getElementById('new-scenario-btn'),
        emptyCreateBtn: document.getElementById('empty-create-btn'),
        scenarioCreator: document.getElementById('scenario-creator'),
        closeCreatorBtn: document.getElementById('close-creator-btn'),
        cancelFormBtn: document.getElementById('cancel-form-btn'),
        scenarioForm: document.getElementById('scenario-form'),
        addAssumptionBtn: document.getElementById('add-assumption-btn'),
        assumptionsContainer: document.getElementById('assumptions-container'),
        emptyState: document.getElementById('empty-state'),
        tabsNavigation: document.getElementById('tabs-navigation'),
        tabContent: document.getElementById('tab-content'),
        scenariosGrid: document.getElementById('scenarios-grid'),
        selectionBanner: document.getElementById('selection-banner'),
        selectionCount: document.getElementById('selection-count'),
        compareSelectedBtn: document.getElementById('compare-selected-btn'),
        clearSelectionBtn: document.getElementById('clear-selection-btn'),
        compareCount: document.getElementById('compare-count'),
        compareTab: document.getElementById('compare-tab'),
        loadingOverlay: document.getElementById('loading-overlay'),

        // NEW
        todayTaskList: document.getElementById('today-task-list'),
        historyContainer: document.getElementById('history-container'),
        archiveTodayBtn: document.getElementById('archive-today-btn'),
    };
    
    const foundCount = Object.keys(elements).filter(k => elements[k] !== null).length;
    console.log(`✅ DOM elements initialized: ${foundCount}/${Object.keys(elements).length} found`);
    
    if (!elements.newScenarioBtn) {
        const btn = document.querySelector('#new-scenario-btn');
        if (btn) elements.newScenarioBtn = btn;
    }
    if (!elements.emptyCreateBtn) {
        const btn = document.querySelector('#empty-create-btn');
        if (btn) elements.emptyCreateBtn = btn;
    }
}

// Initialize the application
async function init() {
    initializeElements();
    setupEventListeners();
    updateUI();
    await refreshTasksAndHistory();   // <— ensure this is here
    checkBackendStatus().catch(() => {});
  }
  

// Check backend status and show indicator
async function checkBackendStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        if (response.ok) {
            const health = await response.json();
            if (health.llm_provider && health.llm_provider !== 'mock') {
                showBackendStatus('connected', `Connected to ${health.llm_provider} (${health.llm_model})`);
            } else {
                showBackendStatus('mock', 'Using mock data - Backend not configured');
            }
        }
    } catch (error) {
        console.warn('Backend not reachable:', error);
        showBackendStatus('disconnected', 'Backend not reachable - Using mock data');
    }
}

function showBackendStatus(status, message) {
    const existing = document.getElementById('backend-status');
    if (existing) existing.remove();
    
    const statusEl = document.createElement('div');
    statusEl.id = 'backend-status';
    statusEl.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-sm z-50 ${
        status === 'connected' ? 'bg-green-100 text-green-800 border border-green-300' :
        status === 'mock' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
        'bg-red-100 text-red-800 border border-red-300'
    }`;
    statusEl.innerHTML = `
        <div class="flex items-center gap-2">
            <span>${status === 'connected' ? '✅' : status === 'mock' ? '⚠️' : '❌'}</span>
            <span>${message}</span>
        </div>
    `;
    document.body.appendChild(statusEl);
    
    if (status === 'connected') {
        setTimeout(() => {
            if (statusEl.parentNode) {
                statusEl.style.opacity = '0';
                statusEl.style.transition = 'opacity 0.5s';
                setTimeout(() => statusEl.remove(), 500);
            }
        }, 5000);
    }
}

// Setup all event listeners
// Setup all event listeners
function setupEventListeners() {
    // Home logo button - return to overview
    if (elements.homeLogoBtn) {
        elements.homeLogoBtn.addEventListener('click', () => {
            // Switch to overview tab
            switchTab('overview');
            // Clear any selections
            clearSelection();
            // Hide creator form if open
            hideCreator();
            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    if (elements.newScenarioBtn) elements.newScenarioBtn.addEventListener('click', showCreator);
    if (elements.emptyCreateBtn) elements.emptyCreateBtn.addEventListener('click', showCreator);
    // Close and cancel buttons handled via global event delegation below
  
    if (elements.scenarioForm) elements.scenarioForm.addEventListener('submit', handleFormSubmit);
    if (elements.addAssumptionBtn) elements.addAssumptionBtn.addEventListener('click', addAssumptionInput);
  
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => btn.addEventListener('click', (e) => {
      e.preventDefault();
      switchTab(btn.dataset.tab);
    }));
  
    // Compare selected button (handled separately since it needs direct access)
    // Clear selection is handled by global click delegation below
  
    // 🔁 Use delegated click handling for both Today and History areas:
    //    - selection via .custom-checkbox
    //    - deletion via .delete-task
    //    - lifecycle view via .view-lifecycle
    delegateCardClicks(document.getElementById('scenarios-grid'));   // Today list container
    delegateCardClicks(document.getElementById('history-groups'));   // History container
    
    // Global click handler for lifecycle view
    document.addEventListener('click', (e) => {
        const lifecycleBtn = e.target.closest('[data-action="view-lifecycle"]');
        if (lifecycleBtn) {
            e.preventDefault();
            e.stopPropagation();
            const scenarioId = lifecycleBtn.getAttribute('data-id');
            const allScenarios = [...AppState.scenarios, ...AppState.historyTasksFlat];
            const scenario = allScenarios.find(s => String(s.id) === String(scenarioId));
            if (scenario) {
                showLifecycleView(scenario);
            }
        }
    });
  
    // Archive today's tasks
    if (elements.archiveTodayBtn) {
      elements.archiveTodayBtn.addEventListener('click', async () => {
        const name = prompt('Session name?', 'Saved Session');
        try {
          await API.archiveCurrentTasks({ name: name || 'Saved Session' });
          UI.showToast('Saved current tasks into a session', 'success');
          await refreshTasksAndHistory();
        } catch (err) {
          console.error(err);
          UI.showToast('Failed to archive tasks', 'error');
        }
      });
    }
  // Selection inside history cards (separate handler for history)
  const historyContainer = document.getElementById('history-groups');
  if (historyContainer) {
    historyContainer.addEventListener('click', (e) => {
      const checkbox = e.target.closest('.custom-checkbox');
      if (!checkbox) return;
      const sid = checkbox.dataset.scenarioId;
      if (!sid) return;
  
      // toggle selected IDs
      const i = AppState.selectedScenarios.indexOf(sid);
      if (i > -1) AppState.selectedScenarios.splice(i, 1);
      else AppState.selectedScenarios.push(sid);
  
      updateUI();
    });
  }
  
  }
  

// Expose function globally IMMEDIATELY (before it's defined)
window.showCreatorForm = null; // Will be set below

// Show scenario creator
function showCreator(e) {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    let form = document.getElementById('scenario-creator') || document.querySelector('#scenario-creator');
    if (!form) return alert('Error: Could not find the scenario form. Please refresh the page.');
    form.classList.remove('hidden');
    form.style.display = 'block';
    form.style.visibility = 'visible';
    form.style.opacity = '1';
    elements.scenarioCreator = form;
    setTimeout(() => { try { form.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch {} }, 100);
}

// Expose function globally for inline onclick handlers
window.showCreatorForm = showCreator;
window.hideCreatorForm = hideCreator;
(function(){ 
    window.showCreatorForm = showCreator;
    window.hideCreatorForm = hideCreator;
})();

// Hide scenario creator
function hideCreator() {
    const creator = document.getElementById('scenario-creator');
    if (creator) {
        // Remove all display styles and add hidden class
        creator.classList.add('hidden');
        creator.style.display = 'none';
        creator.style.visibility = 'hidden';
        creator.style.opacity = '0';
    }
    // Also update elements object if it exists
    if (elements.scenarioCreator) {
        elements.scenarioCreator.classList.add('hidden');
        elements.scenarioCreator.style.display = 'none';
    }
    // Reset form
    const form = document.getElementById('scenario-form');
    if (form) {
        form.reset();
    }
    if (elements.scenarioForm) {
        elements.scenarioForm.reset();
    }
    // Reset assumptions container
    const assumptionsContainer = document.getElementById('assumptions-container');
    if (assumptionsContainer) {
        assumptionsContainer.innerHTML = `
            <div class="assumption-input flex gap-2">
                <input type="text" class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent text-slate-900 bg-white"
                       placeholder="e.g., Must work offline, Depends on API v2 launch">
            </div>
        `;
    }
}

// Add assumption input field
function addAssumptionInput() {
    const newInput = document.createElement('div');
    newInput.className = 'assumption-input flex gap-2';
    newInput.innerHTML = `
        <input type="text" class="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-violet-600 focus:border-transparent text-slate-900 bg-white"
               placeholder="e.g., Must work offline, Depends on API v2 launch">
        <button type="button" class="remove-assumption px-3 text-slate-400 hover:text-slate-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
        </button>
    `;
    newInput.querySelector('.remove-assumption').addEventListener('click', function() { newInput.remove(); });
    elements.assumptionsContainer.appendChild(newInput);
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
  
    const formData = {
      featureName: document.getElementById('feature-name').value,
      problemStatement: document.getElementById('problem-statement').value,
      targetUsers: document.getElementById('target-users').value,
      successMetrics: document.getElementById('success-metrics').value,
      timeline: document.getElementById('timeline').value || null,
      resources: document.getElementById('resources').value || null,
      constraints: []
    };
  
    // Gather constraints (backwards compatible with assumptions)
    if (elements.assumptionsContainer) {
      const inputs = elements.assumptionsContainer.querySelectorAll('input');
      inputs.forEach(input => {
        const v = input.value.trim();
        if (v) formData.constraints.push(v);
      });
    }
    
    // Backwards compatibility
    formData.name = formData.featureName;
    formData.description = formData.problemStatement;
    formData.targetMarket = formData.targetUsers;
    formData.assumptions = formData.constraints;
  
    // Show loading
    elements.loadingOverlay?.classList.remove('hidden');
  
    try {
      // 1) Get AI analysis
      const analyzed = await API.analyzeScenario(formData);
  
      // 2) Persist to DB with required field names/aliases
      await API.createTask({
        name: analyzed.name || formData.featureName,
        description: analyzed.description || formData.problemStatement,
        targetMarket: analyzed.targetMarket || formData.targetUsers,
        timeline: analyzed.timeline || formData.timeline,
        resources: analyzed.resources || formData.resources,
        assumptions: analyzed.assumptions || formData.constraints,
        aiAnalysis: analyzed.aiAnalysis,
        createdAt: analyzed.createdAt,
      });
  
      // 3) Refresh Today's and History
      await refreshTasksAndHistory();
  
      // UI updates
      hideCreator();
      UI?.showToast && UI.showToast('Feature analyzed & saved!', 'success');
    } catch (error) {
      console.error(error);
      UI?.showToast && UI.showToast('Error creating task', 'error');
    } finally {
      elements.loadingOverlay?.classList.add('hidden');
    }
  }
  

// Toggle scenario selection
function toggleScenarioSelection(scenarioId) {
    const idStr = String(scenarioId);
    const index = AppState.selectedScenarios.indexOf(idStr);
    if (index > -1) AppState.selectedScenarios.splice(index, 1);
    else AppState.selectedScenarios.push(idStr);
    updateUI();
}

// Clear selection
function clearSelection() {
    console.log('Clearing selection...', AppState.selectedScenarios);
    
    // Clear the selection array
    AppState.selectedScenarios = [];
    
    // Update selection UI (hides banner, updates counts)
    updateSelectionUI();
    
    // Re-render today's scenarios to remove selected state
    renderScenarios();
    
    // Update history cards' selection state
    updateHistorySelectionState();
    
    // Refresh insights/compare views if currently viewing them
    if (AppState.currentTab === 'insights') {
        renderInsightsView();
    } else if (AppState.currentTab === 'compare') {
        renderComparisonView();
    }
    
    console.log('Selection cleared. Selected count:', AppState.selectedScenarios.length);
}

// Switch tabs
function switchTab(tabName) {
    AppState.currentTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) btn.classList.add('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active'); content.classList.add('hidden');
    });
    const activeContent = document.getElementById(`${tabName}-content`);
    if (activeContent) { activeContent.classList.remove('hidden'); activeContent.classList.add('active'); }
    if (tabName === 'compare') renderComparisonView();
    else if (tabName === 'insights') renderInsightsView();
}

// Update the entire UI
function updateUI() {
    const hasScenarios = AppState.scenarios.length > 0;
  
    if (elements.emptyState) elements.emptyState.classList.toggle('hidden', hasScenarios);
    if (elements.tabsNavigation) elements.tabsNavigation.classList.toggle('hidden', !hasScenarios);
  
    // ❗️Always clear the grid first
    if (elements.scenariosGrid) elements.scenariosGrid.innerHTML = '';
  
    if (hasScenarios) {
      renderScenarios();
      updateSelectionUI();
      if (AppState.currentTab === 'compare') renderComparisonView();
      else if (AppState.currentTab === 'insights') renderInsightsView();
    } else {
      // Even if no scenarios, still update selection UI (to hide banner)
      updateSelectionUI();
    }
  
    if (elements.todayTaskList) UI.renderTodayList(elements.todayTaskList, AppState.todayTasks);
    // Note: History is rendered separately in refreshTasksAndHistory()
    // But we can update existing history cards' selection state
    updateHistorySelectionState();
  }
  
  // Helper to update selection state on already-rendered history cards
  function updateHistorySelectionState() {
    const historyContainer = document.getElementById('history-groups');
    if (!historyContainer) return;
    
    // Update all history cards' selection state based on AppState
    const historyCards = historyContainer.querySelectorAll('.scenario-card');
    historyCards.forEach(card => {
      const scenarioId = card.dataset.scenarioId;
      if (!scenarioId) return;
      
      const isSelected = AppState.selectedScenarios.includes(String(scenarioId));
      const checkbox = card.querySelector('.custom-checkbox');
      
      if (isSelected) {
        card.classList.add('selected');
        if (checkbox) checkbox.classList.add('checked');
      } else {
        card.classList.remove('selected');
        if (checkbox) checkbox.classList.remove('checked');
      }
    });
  }
  

// Render scenarios grid (existing cards)
function renderScenarios() {
    if (!elements.scenariosGrid) return;
    // Sort scenarios by Impact Score (highest first)
    const sortedScenarios = [...AppState.scenarios].sort((a, b) => {
        const scoreA = a.aiAnalysis?.impact || 0;
        const scoreB = b.aiAnalysis?.impact || 0;
        return scoreB - scoreA;
    });
    elements.scenariosGrid.innerHTML = sortedScenarios
        .map(scenario => UI.renderScenarioCard(scenario, AppState.selectedScenarios.includes(String(scenario.id))))
        .join('');
}

// Update selection UI
function updateSelectionUI() {
    const count = AppState.selectedScenarios.length;
    if (elements.selectionBanner) elements.selectionBanner.classList.toggle('hidden', count === 0);
    if (elements.selectionCount) elements.selectionCount.textContent = count;
    if (elements.compareSelectedBtn) elements.compareSelectedBtn.classList.toggle('hidden', count < 2);
    if (elements.compareCount) elements.compareCount.textContent = count;
    if (elements.compareTab) {
        elements.compareTab.disabled = count < 2;
        if (count < 2) elements.compareTab.classList.add('opacity-50', 'cursor-not-allowed');
        else elements.compareTab.classList.remove('opacity-50', 'cursor-not-allowed');
    }
}

// Render comparison view
function renderComparisonView() {
    const pool = [...AppState.scenarios, ...AppState.historyTasksFlat];
    const selected = pool.filter(s => AppState.selectedScenarios.includes(String(s.id)));
    const compareContent = document.getElementById('compare-content');
    if (compareContent) compareContent.innerHTML = UI.renderComparisonView(selected);
  }
  

// Render insights view
function renderInsightsView() {
    const insightsContent = document.getElementById('insights-content');
    if (!insightsContent) return;
    
    // Get all scenarios (today + history)
    const allScenarios = [...AppState.scenarios, ...AppState.historyTasksFlat];
    
    // If there are selected scenarios, show insights only for selected ones
    // Otherwise, show insights for all scenarios
    let scenariosToShow = allScenarios;
    if (AppState.selectedScenarios.length > 0) {
        scenariosToShow = allScenarios.filter(s => 
            AppState.selectedScenarios.includes(String(s.id))
        );
    }
    
    insightsContent.innerHTML = UI.renderInsightsPanel(scenariosToShow, AppState.selectedScenarios.length > 0);
}

// Expose globally for onclick handler
window.renderInsightsView = renderInsightsView;

// Show lifecycle view for a specific scenario
function showLifecycleView(scenario) {
    // Switch to insights tab
    switchTab('insights');
    
    // Render lifecycle view
    const insightsContent = document.getElementById('insights-content');
    if (insightsContent) {
        insightsContent.innerHTML = `
            <div class="mb-4">
                <button onclick="renderInsightsView()" class="text-sm text-violet-600 hover:text-violet-800 hover:underline flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Back to Insights
                </button>
            </div>
            <div class="mb-4 bg-violet-50 border border-violet-200 rounded-lg p-4">
                <h2 class="text-xl font-bold text-slate-900 mb-2">${scenario.name || 'Untitled'}</h2>
                <p class="text-sm text-slate-600">${scenario.description || ''}</p>
            </div>
            ${UI.renderLifecycleView(scenario)}
        `;
    }
}

// Fetch Today + History from backend and render
async function refreshTasksAndHistory() {
    try {
      // Today (DB rows -> normalized)
      const todayRows = await API.getTodayTasks();
      const today = (todayRows || []).map(normalizeTask);
  
      AppState.scenarios = today;
      if (elements.todayTaskList) UI.renderTodayList(elements.todayTaskList, today);
      const todayEmpty = document.getElementById('today-empty');
      if (todayEmpty) todayEmpty.classList.toggle('hidden', today.length > 0);
  
      // History groups: { groups: { 'YYYY-MM-DD': [rows...] } }
      const { groups } = await API.getHistoryGroups();
  
      // Build history DOM + flat cache
      const historyContainer = document.getElementById('history-groups');
      AppState.historyTasksFlat = []; // reset
  
      if (!groups || Object.keys(groups).length === 0) {
        if (historyContainer) {
          historyContainer.innerHTML = `<div class="text-sm text-slate-500 bg-white border border-slate-200 rounded-lg p-6">No past sessions yet.</div>`;
        }
      } else {
        if (historyContainer) {
          historyContainer.innerHTML = Object.entries(groups).map(([date, tasks]) => {
            const normalized = tasks.map(normalizeTask);
            // store into flat cache for compare/selection
            AppState.historyTasksFlat.push(...normalized);
  
            return `
              <div class="bg-white rounded-lg border border-slate-200">
                <div class="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                  <h3 class="text-sm font-semibold text-slate-700">${date}</h3>
                  <span class="text-xs text-slate-500">${normalized.length} item(s)</span>
                </div>
                <div class="p-4 grid gap-4 md:grid-cols-2">
                  ${normalized.map(t => UI.renderScenarioCard(t, AppState.selectedScenarios.includes(String(t.id)))).join('')}
                </div>
              </div>
            `;
          }).join('');
        }
      }
  
      // Re-render the main UI (keeps counts, compare/insights awareness)
      updateUI();
    } catch (err) {
      console.error('Failed to load tasks/sessions:', err);
    }
  }
  
  
  
  

// Start the application when DOM is ready
function startApp() {
    setTimeout(() => {
        try { init(); } catch (error) { console.error('❌ Error during initialization:', error); }
    }, 100);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

// Global click delegation for delete buttons, clear selection, compare selected, and close creator
// This handles all action buttons that might be in dynamic content
document.addEventListener('click', async (e) => {
    // Handle close creator button - check button itself or if click is inside the button
    if (e.target.id === 'close-creator-btn' || 
        e.target.closest('#close-creator-btn') ||
        (e.target.tagName === 'svg' && e.target.closest('button')?.id === 'close-creator-btn') ||
        (e.target.tagName === 'path' && e.target.closest('button')?.id === 'close-creator-btn')) {
        e.preventDefault();
        e.stopPropagation();
        hideCreator();
        return;
    }
    
    // Handle cancel form button
    if (e.target.id === 'cancel-form-btn' || 
        e.target.closest('#cancel-form-btn')) {
        e.preventDefault();
        e.stopPropagation();
        hideCreator();
        return;
    }
    
    // Handle clear selection button
    const clearBtn = e.target.closest('[data-action="clear-selection"]') || 
                     (e.target.id === 'clear-selection-btn' ? e.target : null);
    if (clearBtn) {
        e.preventDefault();
        e.stopPropagation();
        clearSelection();
        return;
    }
    
    // Handle compare selected button
    const compareBtn = e.target.closest('[data-action="compare-selected"]') || 
                       (e.target.id === 'compare-selected-btn' ? e.target : null);
    if (compareBtn) {
        e.preventDefault();
        e.stopPropagation();
        switchTab('compare');
        return;
    }
    
    // Handle delete buttons
    const btn = e.target.closest('[data-action="delete-task"]');
    if (!btn) return;
  
    // Prevent event bubbling
    e.stopPropagation();
    e.preventDefault();
  
    const idStr = btn.getAttribute('data-id');
    if (!idStr) {
      console.error('Delete button missing data-id attribute');
      return;
    }
  
    if (!confirm('Delete this task? This cannot be undone.')) return;
  
    // Use the centralized handleDelete function
    await handleDelete(idStr);
  });
  
  