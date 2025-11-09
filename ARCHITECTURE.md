# ProSolve Architecture & Flow Documentation

## 📋 Project Overview

**ProSolve** is an AI-driven product scenario planning tool that helps product managers evaluate ideas, predict outcomes, and make data-driven decisions. It combines LLM-powered analysis with a modern web interface and persistent SQLite storage.

---

## 🏗️ System Architecture

### High-Level Flow

```
User Input (Frontend)
    ↓
Form Submission → API.analyzeScenario()
    ↓
Backend /simulate endpoint
    ↓
LLM Client (Groq API or Mock)
    ↓
Structured JSON Response
    ↓
Frontend Processing (Score Calculation)
    ↓
Save to SQLite Database
    ↓
Render UI (Scenario Cards, Insights, Comparisons)
```

---

## 📂 Project Structure

```
ProSolve/
├── app.py                    # FastAPI main application (at root)
├── prosolve.db              # SQLite database (auto-created)
├── requirements.txt         # Python dependencies
│
├── backend/
│   ├── agents/              # Agent modules (partially used)
│   │   ├── impact_analyzer.py
│   │   ├── recommendation_engine.py
│   │   └── risk_modeler.py
│   ├── models/
│   │   └── scenario.py      # Pydantic models for validation
│   ├── prompts/
│   │   └── templates.py     # LLM system prompts
│   └── utils/
│       └── llm_client.py    # LLM client (Groq/Mock)
│
└── frontend/
    ├── index.html           # Main HTML structure
    ├── css/
    │   └── styles.css       # Custom styling
    └── js/
        ├── api.js           # API client & score calculation
        ├── app.js           # Application state & logic
        └── ui.js            # UI rendering functions
```

---

## 🔧 Backend Architecture (FastAPI)

### 1. Main Application (`app.py`)

**Key Components:**

- **FastAPI App**: CORS-enabled, error handling middleware
- **SQLModel ORM**: Database abstraction layer
- **Task Model**: SQLite table schema
- **API Endpoints**: RESTful routes for tasks and simulation

**Database Schema:**
```python
Task (
    id: int (primary key)
    name: str
    description: str
    target_market: str
    timeline: str
    resources: Optional[str]
    assumptions: Optional[List[str]] (JSON)
    ai_analysis: Optional[Dict] (JSON)
    created_at: datetime (UTC)
)
```

**API Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check & LLM config status |
| `/config` | GET | Environment configuration |
| `/simulate` | POST | AI scenario analysis (LLM call) |
| `/tasks` | GET | List all tasks |
| `/tasks` | POST | Create new task |
| `/tasks/today` | GET | Get today's tasks (Chicago timezone) |
| `/tasks/history` | GET | Get historical tasks grouped by date |
| `/tasks/{id}` | DELETE | Delete a task |
| `/scenarios` | GET | Alias for `/tasks` (legacy support) |

**Timezone Handling:**
- All timestamps stored in UTC
- "Today" calculated in America/Chicago timezone
- History grouped by local date (Chicago time)

### 2. LLM Client (`backend/utils/llm_client.py`)

**Features:**
- **Mock Mode**: Returns hardcoded JSON when no API key configured
- **Groq Integration**: Real LLM API calls via Groq
- **JSON Parsing**: Robust JSON extraction with fallback repair
- **Error Handling**: Clear error messages for API failures

**Configuration:**
- Environment variables: `PROVIDER`, `API_KEY`, `API_BASE`, `MODEL`
- Default model: `llama-3.3-70b-versatile`
- Mock mode: Activated when `PROVIDER` or `API_KEY` is missing

**Response Format:**
```json
{
  "classification": "pricing_change" | "feature_change" | ...,
  "scores": {
    "risk": 0-100,
    "customer": -100 to +100,
    "competitive": -100 to +100,
    "cost": -100 to +100,
    "overall": 0-100
  },
  "reasons": { ... },
  "impacts": { ... },
  "top_risks": [ ... ],
  "opportunities": [ ... ],
  "recommendation": { ... }
}
```

### 3. Prompt Templates (`backend/prompts/templates.py`)

**System Prompt:**
- Defines JSON schema for LLM response
- Provides scoring guidelines
- Emphasizes specificity over generic text
- Requests concrete, testable recommendations

**Key Requirements:**
- Valid JSON (no markdown fences)
- Specific scores with rationale
- Testable risks with mitigations
- Actionable next steps

### 4. Data Models (`backend/models/scenario.py`)

**Pydantic Models:**
- `ScenarioRequest`: Input validation
- `ImpactTexts`: Impact descriptions
- `Scores`: Numerical scores with validation
- `Recommendation`: Decision structure
- `ScenarioResult`: Complete analysis result

---

## 🎨 Frontend Architecture (Vanilla JavaScript)

### 1. Application State (`app.js`)

**State Management:**
```javascript
AppState = {
    scenarios: [],           // Today's tasks
    selectedScenarios: [],   // Selected for comparison
    currentTab: 'overview',  // Active tab
    todayTasks: [],          // Today's tasks (duplicate)
    historyTasksFlat: []     // All history tasks (flat list)
}
```

**Key Functions:**
- `init()`: Initialize app, load DOM elements, set up event listeners
- `refreshTasksAndHistory()`: Fetch today's tasks and history from backend
- `handleFormSubmit()`: Process form, call AI, save to DB
- `switchTab()`: Switch between Overview, Compare, Insights
- `toggleScenarioSelection()`: Select/deselect scenarios for comparison
- `normalizeTask()`: Convert DB format to frontend format

**Event Handling:**
- Delegated click handlers for selection and deletion
- Form submission with loading overlay
- Tab navigation
- Scenario card interactions

### 2. API Client (`api.js`)

**Key Functions:**
- `analyzeScenario()`: Calls `/simulate`, processes response, calculates scores
- `createTask()`: Saves task to database
- `getTodayTasks()`: Fetches today's tasks
- `getHistoryGroups()`: Fetches historical tasks grouped by date
- `deleteTask()`: Deletes a task

**Score Calculation (Fixed):**
```javascript
// Feasibility: Uses overall score from LLM (0-100)
const feasibility = pct(scores.overall, 70);

// Impact: Normalized weighted average
// Customer & Competitive scores are -100..+100
// Normalize to 0..100: (score + 100) / 2
const customerScore = ((scores.customer ?? 0) + 100) / 2;
const competitiveScore = ((scores.competitive ?? 0) + 100) / 2;
// Weighted: 60% customer, 40% competitive
const impact = Math.round(customerScore * 0.6 + competitiveScore * 0.4);
```

**Helper Functions:**
- `pct()`: Clamp value to 0-100 range
- `buildScenarioText()`: Convert form data to scenario text

### 3. UI Rendering (`ui.js`)

**Key Components:**
- `renderScenarioCard()`: Individual scenario card with scores, metrics, badges
- `renderComparisonView()`: Side-by-side comparison table
- `renderInsightsPanel()`: Dashboard with averages, risks, opportunities
- `renderTodayList()`: Simple list of today's tasks
- `renderHistoryGrouped()`: History grouped by date
- `showToast()`: Toast notifications

**Card Features:**
- Feasibility & Impact scores with progress bars
- Key metrics with trend indicators
- Risk and opportunity badges
- Selection checkbox
- Delete button

### 4. HTML Structure (`index.html`)

**Sections:**
1. **Header**: Logo, title, "New Task" button
2. **Creator Form**: Scenario creation form (hidden by default)
3. **Tabs**: Overview, Compare, Insights
4. **Overview Tab**:
   - Selection banner
   - Today's Work section
   - Task History section
5. **Compare Tab**: Comparison view (rendered dynamically)
6. **Insights Tab**: AI insights dashboard (rendered dynamically)
7. **Loading Overlay**: Shown during AI analysis

**Styling:**
- Tailwind CSS (CDN) for utility classes
- Custom CSS for dark theme elements
- Responsive grid layouts
- Smooth animations and transitions

---

## 🔄 Data Flow

### Scenario Creation Flow

1. **User fills form** → Name, Description, Target Market, Timeline, Resources, Assumptions
2. **Form submitted** → `handleFormSubmit()` called
3. **Loading overlay shown** → User feedback
4. **API call** → `API.analyzeScenario(formData)`
   - Builds scenario text from form data
   - Calls `/simulate` endpoint
   - Backend calls LLM (Groq or Mock)
   - LLM returns structured JSON
5. **Frontend processing** → Calculates feasibility and impact scores
6. **Save to database** → `API.createTask()` saves to SQLite
7. **Refresh UI** → `refreshTasksAndHistory()` reloads data
8. **Render cards** → New scenario appears in "Today's Work"

### Comparison Flow

1. **User selects scenarios** → Click checkboxes on cards
2. **Selection tracked** → `AppState.selectedScenarios` updated
3. **Compare tab enabled** → When 2+ scenarios selected
4. **Switch to Compare tab** → `renderComparisonView()` called
5. **Winner calculation** → Highest (feasibility + impact) score
6. **Side-by-side table** → Shows all metrics, risks, opportunities

### Insights Flow

1. **Switch to Insights tab** → `renderInsightsView()` called
2. **Calculate averages** → Avg feasibility, avg impact across all scenarios
3. **Aggregate data** → Collect all risks, opportunities
4. **Priority breakdown** → High/Medium priority scenarios
5. **Render dashboard** → Stats, risks, opportunities, recommendations

---

## 🎯 Key Features

### 1. AI-Powered Analysis
- LLM evaluates scenarios and provides structured analysis
- Scores for risk, customer impact, competitive position, cost
- Specific risks with mitigations
- Opportunities with concrete examples
- Actionable recommendations

### 2. Task Management
- Persistent SQLite database
- Today's Work view (Chicago timezone)
- History grouped by date
- Delete functionality
- Auto-grouping by creation date

### 3. Comparison Mode
- Select multiple scenarios
- Side-by-side comparison table
- Winner highlighting
- All metrics visible at once

### 4. Insights Dashboard
- Average feasibility and impact
- Common risks across scenarios
- Strategic opportunities
- Priority recommendations
- High/Medium priority breakdown

### 5. Modern UI
- Clean, responsive design
- Tailwind CSS styling
- Smooth animations
- Toast notifications
- Loading states
- Empty states

---

## 🔐 Configuration

### Environment Variables

```bash
PROVIDER=groq                    # LLM provider
API_KEY=your_api_key            # Groq API key
API_BASE=https://api.groq.com/openai/v1  # API base URL
MODEL=llama-3.3-70b-versatile   # LLM model
DATABASE_URL=sqlite:///./prosolve.db  # Database URL
USE_MOCK_ON_FAIL=1              # Fallback to mock on error
```

### Mock Mode
- Activated when `PROVIDER` or `API_KEY` is missing
- Returns hardcoded analysis
- Allows frontend development without API costs
- Same response structure as real LLM

---

## 🐛 Error Handling

### Backend
- Debug middleware logs full tracebacks
- JSON error responses
- Mock fallback on LLM failure (if enabled)
- Database transaction rollback on errors

### Frontend
- Try-catch blocks around API calls
- Toast notifications for errors
- Console logging for debugging
- Graceful degradation (empty states)

---

## 🚀 Deployment

### Local Development
1. Install dependencies: `pip install -r requirements.txt`
2. Set environment variables (optional)
3. Run backend: `uvicorn app:app --reload --port 8000`
4. Open frontend: `frontend/index.html` (Live Server)

### Production
- Use production WSGI server (Gunicorn + Uvicorn)
- Configure CORS for specific origins
- Set up proper database backups
- Use environment variables for secrets
- Enable HTTPS

---

## 📊 Database Queries

### Today's Tasks
```sql
SELECT * FROM task
WHERE created_at >= start_of_today_utc
  AND created_at < start_of_tomorrow_utc
ORDER BY created_at DESC
```

### History (Grouped)
```sql
SELECT * FROM task
WHERE created_at < start_of_today_utc
   OR created_at >= start_of_tomorrow_utc
ORDER BY created_at DESC
```

### Delete Task
```sql
DELETE FROM task WHERE id = ?
```

---

## 🔍 Score Calculation Details

### Feasibility Score
- **Source**: `scores.overall` from LLM (0-100)
- **Fallback**: 70 if missing
- **Display**: Percentage with progress bar

### Impact Score (Fixed)
- **Components**: Customer score + Competitive score
- **Normalization**: Convert -100..+100 to 0..100
  - Formula: `(score + 100) / 2`
- **Weighting**: 60% customer, 40% competitive
- **Final**: `customerScore * 0.6 + competitiveScore * 0.4`
- **Range**: 0-100

### Score Classification
- **High**: ≥ 80 (green)
- **Medium**: 60-79 (yellow)
- **Low**: < 60 (red)

---

## 🎨 UI Components

### Scenario Card
- Checkbox for selection
- Name and description
- Target market and timeline
- Feasibility and impact scores
- Progress bars
- Key metrics
- Risk and opportunity badges
- Delete button

### Comparison Table
- Side-by-side columns for each scenario
- Winner crown icon
- Feasibility and impact rows
- Target market and timeline
- Key risks and opportunities
- AI recommendation

### Insights Dashboard
- Total scenarios count
- Average feasibility
- Average impact
- Priority breakdown (High/Medium)
- Common risks list
- Strategic opportunities
- AI recommendations

---

## 🔄 State Management

### AppState Object
- Centralized state management
- React-like pattern (without framework)
- Updates trigger UI re-renders
- Selection state persists across tabs

### Data Flow
1. User action → Event handler
2. Update AppState
3. Call `updateUI()`
4. Re-render affected components
5. Update DOM

---

## 🧪 Testing Considerations

### Backend
- Mock LLM responses for testing
- Database fixtures for test data
- API endpoint unit tests
- Integration tests for full flow

### Frontend
- Manual testing for UI interactions
- Mock API responses
- Test data for different scenarios
- Browser compatibility testing

---

## 🚧 Known Issues & Future Improvements

### Current Limitations
- No user authentication
- Single SQLite database (no multi-user)
- No real-time updates
- Limited error recovery
- No export functionality

### Potential Enhancements
- User authentication and sessions
- PostgreSQL for production
- Real-time collaboration
- Export to PDF/CSV
- Advanced filtering and search
- Scenario templates
- Bulk operations
- Analytics and reporting

---

## 📝 Code Quality

### Backend
- Type hints throughout
- Pydantic validation
- Error handling
- Logging and debugging
- Clean separation of concerns

### Frontend
- Modular JavaScript
- Separation of concerns (API, UI, State)
- Event delegation
- Error handling
- Console logging for debugging

---

## 🎓 Learning Resources

### Technologies Used
- **FastAPI**: Modern Python web framework
- **SQLModel**: SQL ORM with Pydantic
- **SQLite**: Lightweight database
- **Groq**: LLM API provider
- **Tailwind CSS**: Utility-first CSS
- **Vanilla JavaScript**: No frameworks

### Key Concepts
- RESTful API design
- Database schema design
- LLM integration
- Frontend state management
- UI component rendering
- Error handling patterns

---

## 📞 Support & Maintenance

### Debugging
- Check browser console for frontend errors
- Check backend logs for API errors
- Verify environment variables
- Test LLM connectivity
- Check database connections

### Common Issues
- **Backend not reachable**: Check if uvicorn is running
- **LLM errors**: Verify API key and provider
- **Database errors**: Check file permissions
- **CORS errors**: Verify CORS middleware configuration
- **Score calculation**: Check `api.js` for formula

---

## 🎯 Summary

ProSolve is a well-architected AI-powered product planning tool that combines:
- **Backend**: FastAPI + SQLite + LLM integration
- **Frontend**: Vanilla JavaScript + Tailwind CSS
- **AI**: Groq LLM with structured JSON responses
- **Features**: Scenario analysis, comparison, insights, task management

The system is modular, extensible, and designed for both development and production use. The recent fix to the impact score calculation ensures accurate scoring that reflects the actual analysis results rather than always showing 100%.

