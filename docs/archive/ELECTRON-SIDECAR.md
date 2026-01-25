# Electron Sidecar Integration

## Overview

**YES, Electron has excellent sidecar capabilities!**

An Electron "sidecar" allows SGM to run alongside SPARCC (or any other application) as an integrated module rather than a standalone app. Think of it like a plugin or companion app that shares data and UI space.

---

## Four Sidecar Patterns

### 1. **IPC Communication** (Recommended)

**How it works:** Two separate Electron apps communicate via Inter-Process Communication

**Architecture:**
\`\`\`
┌─────────────────┐         IPC Messages        ┌──────────────────┐
│  SPARCC App     │ ◄─────────────────────────► │   SGM App        │
│  (Port 3000)    │    (createPlan, notify)     │   (Port 3003)    │
└─────────────────┘                              └──────────────────┘
\`\`\`

**Implementation:**

**SPARCC Electron (main.js):**
\`\`\`javascript
const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process');

let sgmProcess = null;

// Start SGM as child process
function startSGM() {
  sgmProcess = spawn('sgm', [], {
    env: { ...process.env, PORT: 3003 }
  });
}

// Send message to SGM
ipcMain.handle('create-plan-in-sgm', async (event, planData) => {
  // Open SGM window and pass data
  const sgmWindow = new BrowserWindow({
    parent: mainWindow,
    width: 1200,
    height: 800,
  });

  sgmWindow.loadURL('http://localhost:3003/plans/new');

  // Once loaded, inject plan data
  sgmWindow.webContents.on('did-finish-load', () => {
    sgmWindow.webContents.send('prefill-plan', planData);
  });
});

app.whenReady().then(() => {
  startSGM();
  createMainWindow();
});
\`\`\`

**SGM Electron (preload.js):**
\`\`\`javascript
const { ipcRenderer } = require('electron');

// Listen for plan data from SPARCC
ipcRenderer.on('prefill-plan', (event, planData) => {
  // Pre-fill plan form with data from SPARCC
  window.postMessage({ type: 'PREFILL_PLAN', data: planData }, '*');
});

// Notify SPARCC when plan is created
window.addEventListener('message', (event) => {
  if (event.data.type === 'PLAN_CREATED') {
    ipcRenderer.send('sgm-plan-created', event.data.plan);
  }
});
\`\`\`

**Pros:**
- ✅ Apps remain independent
- ✅ Easy to deploy separately
- ✅ No code changes needed
- ✅ Can update SGM without updating SPARCC

**Cons:**
- ❌ Two separate processes
- ❌ Slightly more complex communication

---

### 2. **Custom Protocol Handler** (Deep Linking)

**How it works:** SPARCC opens SGM with context via custom URL protocol

**Example:**
\`\`\`javascript
// SPARCC opens SGM with specific plan
shell.openExternal('sgm://create-plan?templateId=comp-annual&region=AMER');

// Or create plan from SPARCC data
const planData = encodeURIComponent(JSON.stringify({ title: 'Q1 Plan', ... }));
shell.openExternal(\`sgm://import-plan?data=\${planData}\`);
\`\`\`

**SGM Protocol Registration:**
\`\`\`javascript
// In SGM electron/main.js
app.setAsDefaultProtocolClient('sgm');

// Handle protocol URLs
app.on('open-url', (event, url) => {
  event.preventDefault();

  // Parse: sgm://create-plan?templateId=123
  const parsed = new URL(url);
  const action = parsed.host; // "create-plan"
  const params = Object.fromEntries(parsed.searchParams);

  if (action === 'create-plan') {
    mainWindow.loadURL(\`http://localhost:3003/plans/new?templateId=\${params.templateId}\`);
  } else if (action === 'import-plan') {
    const planData = JSON.parse(decodeURIComponent(params.data));
    mainWindow.webContents.send('import-plan', planData);
  }
});
\`\`\`

**Pros:**
- ✅ Simple integration
- ✅ Works across different apps
- ✅ Standard URL pattern

**Cons:**
- ❌ Limited to URL length
- ❌ One-way communication

---

### 3. **Embedded BrowserView** (Tightly Integrated)

**How it works:** SGM runs inside SPARCC window as embedded view

**Architecture:**
\`\`\`
┌──────────────────────────────────────────────┐
│  SPARCC Electron App                         │
│  ┌────────────┐  ┌─────────────────────────┐ │
│  │ SPARCC     │  │  SGM BrowserView        │ │
│  │ Main View  │  │  (localhost:3003)       │ │
│  │            │  │                         │ │
│  │  - Data    │  │  - Plans                │ │
│  │  - Reports │  │  - Templates            │ │
│  │  - Dash    │  │  - Documents            │ │
│  └────────────┘  └─────────────────────────┘ │
└──────────────────────────────────────────────┘
\`\`\`

**Implementation:**

**SPARCC Electron:**
\`\`\`javascript
const { BrowserView } = require('electron');

// Create main SPARCC window
const mainWindow = new BrowserWindow({
  width: 1600,
  height: 1000,
});

// Create SGM BrowserView (embedded)
const sgmView = new BrowserView({
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
  }
});

// Attach to main window
mainWindow.setBrowserView(sgmView);

// Position SGM view (right side)
sgmView.setBounds({
  x: 800,  // Right half of window
  y: 0,
  width: 800,
  height: 1000
});

// Load SGM app
sgmView.webContents.loadURL('http://localhost:3003');

// Resize handling
mainWindow.on('resize', () => {
  const bounds = mainWindow.getBounds();
  sgmView.setBounds({
    x: bounds.width / 2,
    y: 0,
    width: bounds.width / 2,
    height: bounds.height,
  });
});

// Communication between SPARCC and SGM
mainWindow.webContents.on('ipc-message', (event, channel, data) => {
  if (channel === 'create-sgm-plan') {
    sgmView.webContents.send('create-plan', data);
  }
});

sgmView.webContents.on('ipc-message', (event, channel, data) => {
  if (channel === 'plan-created') {
    mainWindow.webContents.send('sgm-plan-created', data);
  }
});
\`\`\`

**Pros:**
- ✅ Seamless UX (looks like one app)
- ✅ Shared window/controls
- ✅ Easy navigation between views
- ✅ Shared data via messages

**Cons:**
- ❌ Tight coupling
- ❌ Harder to deploy independently
- ❌ Need to manage view lifecycle

---

### 4. **Child Process** (Background Service)

**How it works:** SGM runs as background service, SPARCC embeds UI via iframe

**Architecture:**
\`\`\`
┌─────────────────────────────────────────┐
│  SPARCC Electron App                    │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  <iframe src="http://localhost:   │ │
│  │          3003/embed" />            │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
              ▲
              │ HTTP requests
              ▼
    ┌──────────────────┐
    │  SGM Server      │
    │  (Child Process) │
    │  Port 3003       │
    └──────────────────┘
\`\`\`

**Implementation:**

**SPARCC Electron:**
\`\`\`javascript
const { spawn } = require('child_process');
const path = require('path');

let sgmServer = null;

function startSGMServer() {
  const sgmPath = path.join(
    process.resourcesPath,
    'sgm',
    'sgm-server'
  );

  sgmServer = spawn(sgmPath, [], {
    env: {
      ...process.env,
      PORT: 3003,
      DATABASE_URL: \`file:\${app.getPath('userData')}/sgm.db\`,
      PARENT_APP: 'sparcc',
    },
    stdio: 'inherit',
  });

  sgmServer.on('error', (error) => {
    console.error('SGM server error:', error);
  });
}

function stopSGMServer() {
  if (sgmServer) {
    sgmServer.kill();
    sgmServer = null;
  }
}

app.on('ready', () => {
  startSGMServer();
  createMainWindow();
});

app.on('before-quit', () => {
  stopSGMServer();
});
\`\`\`

**SPARCC Renderer:**
\`\`\`html
<!-- Embedded SGM in SPARCC UI -->
<div class="sgm-panel">
  <iframe
    src="http://localhost:3003/embed"
    width="100%"
    height="800px"
    sandbox="allow-same-origin allow-scripts allow-forms"
  ></iframe>
</div>
\`\`\`

**SGM Embed Route:**
\`\`\`typescript
// app/embed/page.tsx
export default function EmbedPage() {
  return (
    <div className="sgm-embed">
      {/* Simplified UI for embedding */}
      <PlanList compact={true} />
      <TemplateSelector embedded={true} />
    </div>
  );
}
\`\`\`

**Pros:**
- ✅ SGM runs as service
- ✅ Can embed multiple views
- ✅ Standard web communication (postMessage)

**Cons:**
- ❌ Need to bundle SGM server with SPARCC
- ❌ iframe security considerations

---

## Comparison

| Pattern | Integration Level | Complexity | Best For |
|---------|------------------|------------|----------|
| **IPC** | Separate apps | Medium | Independent deployment |
| **Protocol** | Loose | Low | Simple handoffs |
| **BrowserView** | Tight | High | Unified UX |
| **Child Process** | Moderate | Medium | Background service |

---

## Recommended Architecture for SPARCC + SGM

**Phase 1: IPC Communication** (Launch)
- Deploy SPARCC and SGM as separate apps
- SPARCC can launch SGM and pass data via IPC
- Users can use either app independently

**Phase 2: BrowserView Integration** (Premium)
- Offer "SPARCC Pro" with embedded SGM
- SGM view appears as panel in SPARCC
- Seamless workflow for power users

**Phase 3: Shared Service** (Enterprise)
- Deploy as Docker containers with shared volumes
- Both apps access same SQLite database
- Multi-user collaboration

---

## Data Sharing Strategies

### Shared Database
\`\`\`javascript
// Both apps use same SQLite database
const DATABASE_URL = \`file:\${app.getPath('userData')}/shared-data.db\`;
\`\`\`

### Message Bus
\`\`\`javascript
// SPARCC publishes event
eventBus.publish('compensation-plan-approved', { planId: '123' });

// SGM subscribes
eventBus.subscribe('compensation-plan-approved', (data) => {
  // Update SGM UI
  refreshPlans();
});
\`\`\`

### REST API
\`\`\`javascript
// SPARCC calls SGM API
const response = await fetch('http://localhost:3003/api/plans', {
  method: 'POST',
  body: JSON.stringify(planData),
});
\`\`\`

---

## Example: Create Plan from SPARCC

**User flow:**
1. User in SPARCC clicks "Create Compensation Plan"
2. SPARCC gathers context (region, team, budget)
3. SPARCC sends IPC message to SGM
4. SGM opens with pre-filled plan
5. User completes plan in SGM
6. SGM notifies SPARCC when done
7. SPARCC refreshes plan list

**Code:**
\`\`\`javascript
// SPARCC: Button click handler
async function createPlanInSGM() {
  const context = {
    region: 'AMER',
    team: 'Enterprise Sales',
    budget: 500000,
    fiscalYear: 2026,
  };

  // Send to SGM
  const plan = await ipcRenderer.invoke('create-sgm-plan', context);

  // SGM returns created plan
  console.log('Plan created:', plan);
  refreshPlans();
}

// SGM: Listen for plan creation request
ipcRenderer.on('create-plan-request', (event, context) => {
  // Pre-fill plan with SPARCC context
  navigateTo('/plans/new', { prefill: context });
});
\`\`\`

---

## Security Considerations

### IPC Security
\`\`\`javascript
// Validate messages
ipcMain.handle('create-plan', async (event, data) => {
  // Verify sender is trusted
  if (event.senderFrame.url !== 'http://localhost:3000') {
    throw new Error('Unauthorized sender');
  }

  // Validate data
  const validated = PlanSchema.parse(data);
  return createPlan(validated);
});
\`\`\`

### BrowserView Isolation
\`\`\`javascript
const sgmView = new BrowserView({
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    webSecurity: true,
  }
});
\`\`\`

---

## Conclusion

**Answer: YES, Electron has excellent sidecar options!**

**For SPARCC + SGM integration:**
- **Start with:** IPC Communication (separate apps)
- **Upgrade to:** BrowserView (embedded panel)
- **Enterprise:** Docker sidecars (multi-tenant)

All three distribution methods (Electron, Docker, Portable) support sidecar patterns. Choose based on your deployment needs and integration level.
