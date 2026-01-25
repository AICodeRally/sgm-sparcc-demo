# SGM Distribution Guide

## Three-Tier Distribution Strategy

SGM is distributed in three formats to serve different user types:

### 1. **Electron Desktop App** (Primary - 80% of users)
- **For:** Business users, non-technical staff
- **File Size:** ~150-200MB
- **Platforms:** macOS (.dmg), Windows (.exe), Linux (.AppImage, .deb)
- **User Experience:** Double-click → Install → Launch from Applications

### 2. **Docker Container** (Enterprise - 15% of users)
- **For:** IT departments, tech-savvy companies
- **File Size:** ~200-300MB (image)
- **Platforms:** Any OS with Docker
- **User Experience:** IT manages deployment via Docker/Kubernetes

### 3. **Portable ZIP** (Developers - 5% of users)
- **For:** Developers, consultants, quick demos
- **File Size:** ~50-100MB
- **Platforms:** All (includes binaries for Mac/Windows/Linux)
- **User Experience:** Unzip → Run start script

---

## Building Distributions

### Electron Desktop App

**Build for all platforms:**
\`\`\`bash
npm run electron:build:all
\`\`\`

**Build for specific platform:**
\`\`\`bash
# macOS only (Intel + Apple Silicon)
npm run electron:build:mac

# Windows only (x64 + x86)
npm run electron:build:win

# Linux only (AppImage + deb)
npm run electron:build:linux
\`\`\`

**Output:**
- \`dist-electron/sgm-1.0.0.dmg\` (macOS)
- \`dist-electron/sgm-setup-1.0.0.exe\` (Windows)
- \`dist-electron/sgm-1.0.0.AppImage\` (Linux)
- \`dist-electron/sgm-1.0.0.deb\` (Linux)

**Development:**
\`\`\`bash
npm run electron:dev
\`\`\`

---

### Docker Container

**Build image:**
\`\`\`bash
npm run docker:build
\`\`\`

**Run container:**
\`\`\`bash
npm run docker:run
\`\`\`

**Or use Docker Compose:**
\`\`\`bash
docker-compose up -d
\`\`\`

**Push to registry:**
\`\`\`bash
# Tag for registry
docker tag sgm:latest your-registry.com/sgm:1.0.0

# Push
docker push your-registry.com/sgm:1.0.0
\`\`\`

**Client deployment:**
\`\`\`bash
# Pull and run
docker run -d \\
  -p 3003:3003 \\
  -v ~/SGM-Data:/data \\
  --name sgm \\
  your-registry.com/sgm:1.0.0
\`\`\`

---

### Portable ZIP

**Build portable package:**
\`\`\`bash
npm run portable:build
\`\`\`

**Output:**
- \`dist-portable/sgm-portable-v1.0.0.zip\`

**Contents:**
\`\`\`
sgm-portable-v1.0.0/
├── sgm-macos-arm64      # macOS Apple Silicon executable
├── sgm-macos-x64        # macOS Intel executable
├── sgm-win.exe          # Windows executable
├── sgm-linux-x64        # Linux executable
├── START_SGM.bat        # Windows start script
├── start.sh             # Mac/Linux start script
├── data/                # Data directory
│   ├── documents/
│   └── plans/
└── README.txt           # Instructions
\`\`\`

---

## Distribution Comparison

| Feature | Electron | Docker | Portable ZIP |
|---------|----------|--------|--------------|
| **Download Size** | 150-200MB | 200-300MB | 50-100MB |
| **Install Time** | 1-2 min | 30 sec | 0 sec (unzip) |
| **Tech Level** | Beginner | Advanced | Intermediate |
| **Auto-Update** | ✅ Yes | ✅ Yes | ❌ No |
| **Code Signing** | ✅ Yes | N/A | ❌ No |
| **Native Feel** | ✅ Yes | ❌ Browser | ❌ Browser |
| **Isolation** | App Sandbox | Container | Process |
| **Multi-Tenant** | ❌ No | ✅ Yes | ❌ No |

---

## Privacy Guarantees

All three distributions:

✅ **100% Local** - No cloud dependencies
✅ **SQLite Storage** - All data in local database
✅ **File System** - Documents stored locally
✅ **No Telemetry** - No analytics by default
✅ **Offline** - Works without internet
✅ **Portable Data** - Easy to backup/migrate

---

## Electron Sidecar Capability

### What is a Sidecar?

A sidecar allows SGM to run alongside another application (like SPARCC) as an integrated module.

### Electron Sidecar Options:

#### **Option 1: IPC Communication**
Electron apps can communicate via Inter-Process Communication (IPC):

\`\`\`javascript
// SPARCC Electron app sends message to SGM
sgmWindow.webContents.send('create-plan', planData);

// SGM Electron app responds
ipcMain.handle('plan-created', (event, plan) => {
  // Notify SPARCC
  sparcWindow.webContents.send('sgm-plan-created', plan);
});
\`\`\`

#### **Option 2: Shared State via Protocol**
Custom protocol for deep linking:

\`\`\`javascript
// SPARCC opens SGM with context
shell.openExternal('sgm://create-plan?templateId=123');

// SGM registers protocol handler
app.setAsDefaultProtocolClient('sgm');
\`\`\`

#### **Option 3: Embedded Window (BrowserView)**
SGM runs inside SPARCC window:

\`\`\`javascript
// In SPARCC Electron app
const { BrowserView } = require('electron');

const sgmView = new BrowserView();
mainWindow.setBrowserView(sgmView);
sgmView.setBounds({ x: 0, y: 0, width: 800, height: 600 });
sgmView.webContents.loadURL('http://localhost:3003');
\`\`\`

#### **Option 4: Child Process**
SPARCC spawns SGM as subprocess:

\`\`\`javascript
const { spawn } = require('child_process');

// Start SGM in background
const sgm = spawn('sgm', [], {
  env: { ...process.env, PORT: 3004 }
});

// Embed in iframe or BrowserView
\`\`\`

---

## Docker Sidecar (Enterprise)

For SPARCC enterprise deployments:

### **Kubernetes Pod with Sidecar:**

\`\`\`yaml
apiVersion: v1
kind: Pod
metadata:
  name: sparcc-with-sgm
spec:
  containers:
  # Main SPARCC container
  - name: sparcc
    image: bhg/sparcc:latest
    ports:
    - containerPort: 3000

  # SGM sidecar container
  - name: sgm
    image: bhg/sgm:latest
    ports:
    - containerPort: 3003
    volumeMounts:
    - name: shared-data
      mountPath: /data

  volumes:
  - name: shared-data
    persistentVolumeClaim:
      claimName: sparcc-data
\`\`\`

### **Docker Compose with Multiple Services:**

\`\`\`yaml
version: '3.8'

services:
  sparcc:
    image: bhg/sparcc:latest
    ports:
      - "3000:3000"
    environment:
      - SGM_API_URL=http://sgm:3003
    depends_on:
      - sgm

  sgm:
    image: bhg/sgm:latest
    ports:
      - "3003:3003"
    volumes:
      - sgm-data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - sparcc
      - sgm

volumes:
  sgm-data:
\`\`\`

---

## Recommended Distribution Strategy

### **For Individual Clients:**
1. **Primary:** Electron app (.dmg for Mac, .exe for Windows)
2. **Fallback:** Portable ZIP (if client prefers no installation)

### **For Enterprise Clients:**
1. **Primary:** Docker container (IT-managed deployment)
2. **Alternative:** Docker Compose (if running multiple services)
3. **Fallback:** Electron app (for individual users in enterprise)

### **For Partners/Consultants:**
1. **Primary:** Portable ZIP (demo/proof-of-concept)
2. **Production:** Docker (when integrating with SPARCC)

---

## Testing Before Release

\`\`\`bash
# 1. Test Electron app
npm run electron:dev

# 2. Test Docker build
docker-compose up --build

# 3. Test portable build
npm run portable:build
cd dist-portable/sgm-portable-v1.0.0
./start.sh

# 4. Verify data isolation
# Each distribution should use separate data directories
\`\`\`

---

## Release Checklist

- [ ] Update version in package.json
- [ ] Build all three distributions
- [ ] Test on Mac, Windows, Linux
- [ ] Sign Electron apps (Mac/Windows)
- [ ] Push Docker image to registry
- [ ] Upload portable ZIP to download server
- [ ] Update documentation
- [ ] Create release notes
- [ ] Notify users

---

## Support

- **Electron Issues:** https://github.com/bhg/sgm/issues (label: electron)
- **Docker Issues:** https://github.com/bhg/sgm/issues (label: docker)
- **Portable Issues:** https://github.com/bhg/sgm/issues (label: portable)

---

**Built with:**
- Electron 39.x (Desktop)
- Docker 25.x (Container)
- pkg (Portable)
- Next.js 16.x (App Framework)
