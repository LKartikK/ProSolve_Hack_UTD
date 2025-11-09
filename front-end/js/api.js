/**
 * API Client for backend communication
 */

const API_BASE_URL = 'http://localhost:5000/api'; // Update with your backend URL

const API = {
    /**
     * Analyze a new scenario
     * @param {Object} scenarioData - The scenario data to analyze
     * @returns {Promise<Object>} - The analyzed scenario with AI insights
     */
    async analyzeScenario(scenarioData) {
        try {
            const response = await fetch(`${API_BASE_URL}/scenarios/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scenarioData),
            });

            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error analyzing scenario:', error);
            
            // Return mock data for demo purposes if API is not available
            return this.getMockAnalysis(scenarioData);
        }
    },

    /**
     * Get all scenarios
     * @returns {Promise<Array>} - List of all scenarios
     */
    async getScenarios() {
        try {
            const response = await fetch(`${API_BASE_URL}/scenarios`);
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching scenarios:', error);
            return [];
        }
    },

    /**
     * Delete a scenario
     * @param {string} scenarioId - The ID of the scenario to delete
     * @returns {Promise<boolean>} - Success status
     */
    async deleteScenario(scenarioId) {
        try {
            const response = await fetch(`${API_BASE_URL}/scenarios/${scenarioId}`, {
                method: 'DELETE',
            });

            return response.ok;
        } catch (error) {
            console.error('Error deleting scenario:', error);
            return false;
        }
    },

    /**
     * Mock analysis function for demo purposes
     * This simulates what the backend AI would return
     */
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
                    'Competitive response could accelerate timeline pressures'
                ],
                opportunities: [
                    'First-mover advantage in emerging market segment',
                    'Potential for strategic partnerships with key players',
                    'Strong alignment with long-term company vision',
                    'Opportunity to establish industry standards'
                ],
                recommendation: feasibility > 80 && impact > 80 
                    ? 'High priority - Recommend immediate execution with full resource allocation'
                    : feasibility > 70 
                    ? 'Medium priority - Validate assumptions with user research before proceeding'
                    : 'Low priority - Consider alternative approaches or defer until resources available',
                keyMetrics: [
                    { 
                        label: 'Est. User Impact', 
                        value: `${Math.floor(Math.random() * 500 + 100)}K users`, 
                        trend: 'up' 
                    },
                    { 
                        label: 'Time to Market', 
                        value: scenarioData.timeline, 
                        trend: 'neutral' 
                    },
                    { 
                        label: 'Resource Efficiency', 
                        value: `${Math.floor(Math.random() * 30) + 70}%`, 
                        trend: 'up' 
                    },
                    { 
                        label: 'Market Fit Score', 
                        value: `${Math.floor(Math.random() * 20) + 75}/100`, 
                        trend: 'up' 
                    },
                ],
            }
        };
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
