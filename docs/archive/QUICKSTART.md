# SGM Quick Start Guide

## Three Ways to Run SGM

### 1. Electron Desktop App (Easiest)

**For:** Non-technical users, standard deployment

**Steps:**
1. Download installer for your platform:
   - macOS: `sgm-1.0.0.dmg`
   - Windows: `sgm-setup-1.0.0.exe`
   - Linux: `sgm-1.0.0.AppImage` or `sgm-1.0.0.deb`

2. Install:
   - **Mac:** Double-click .dmg → Drag to Applications
   - **Windows:** Double-click .exe → Follow installer
   - **Linux:** `chmod +x sgm-1.0.0.AppImage && ./sgm-1.0.0.AppImage`

3. Launch SGM from Applications/Start Menu

4. Your data is stored in:
   - **Mac:** `~/Library/Application Support/SGM/data/`
   - **Windows:** `C:\\Users\\YourName\\AppData\\Roaming\\SGM\\data\\`
   - **Linux:** `~/.config/SGM/data/`

---

### 2. Docker Container (IT Departments)

**For:** Enterprise deployments, multi-user setups

**Prerequisites:**
- Docker installed: https://docs.docker.com/get-docker/

**Steps:**

**Option A: Docker Run**
\`\`\`bash
# Create data directory
mkdir -p ~/SGM-Data

# Run container
docker run -d \\
  --name sgm \\
  -p 3003:3003 \\
  -v ~/SGM-Data:/data \\
  bhg/sgm:latest

# Open browser
open http://localhost:3003
\`\`\`

**Option B: Docker Compose**
\`\`\`bash
# Download docker-compose.yml
curl -O https://sgm.com/docker-compose.yml

# Edit data path if needed
nano docker-compose.yml

# Start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
\`\`\`

**Your data:**
- Stored in: `~/SGM-Data/` (or path you specified)
- Backup: `cp -r ~/SGM-Data ~/SGM-Backup`

---

### 3. Portable ZIP (No Installation)

**For:** Demos, consultants, USB drive deployments

**Steps:**
1. Download: `sgm-portable-v1.0.0.zip`

2. Unzip to any folder (e.g., Desktop, USB drive)

3. Run:
   - **Windows:** Double-click `START_SGM.bat`
   - **Mac/Linux:** Open Terminal → `./start.sh`

4. Browser opens automatically to http://localhost:3003

5. Your data:
   - Stored in: `sgm-portable-v1.0.0/data/`
   - Backup: Copy entire folder

---

## First Time Setup

After launching SGM (any method):

1. **Create Account**
   - Email: your-email@company.com
   - Password: (minimum 8 characters)

2. **Enable Demo Data** (optional)
   - Settings → Demo Data → Enable
   - Loads sample plans, policies, and documents

3. **Create Your First Plan**
   - Dashboard → New Plan
   - Choose template or start from scratch

---

## Common Tasks

### Create a Compensation Plan
1. Go to Plans → New Plan
2. Select "Annual Compensation Plan" template
3. Fill in sections (Eligibility, Commission Rates, etc.)
4. Submit for approval
5. Publish when approved

### Upload Documents
1. Go to Documents → Upload
2. Drag and drop files (PDF, DOCX, MD)
3. Add metadata (category, tags)
4. Documents stored locally (never in cloud)

### Configure Policies
1. Go to Policies → New Policy
2. Set effective dates
3. Link to governance frameworks
4. Submit for legal review

---

## Privacy & Security

✅ **All data stays local:**
- SQLite database on your machine
- Documents stored in local filesystem
- No cloud sync (unless you set it up)

✅ **No telemetry:**
- No usage tracking
- No crash reports sent
- No analytics by default

✅ **Backup your data:**
```bash
# Electron app
cp -r ~/Library/Application\ Support/SGM ~/Desktop/SGM-Backup

# Docker
docker cp sgm:/data ~/Desktop/SGM-Backup

# Portable
cp -r sgm-portable-v1.0.0/data ~/Desktop/SGM-Backup
\`\`\`

---

## Development Mode

**For developers working on SGM:**

\`\`\`bash
# Clone repository
git clone https://github.com/bhg/sgm.git
cd sgm

# Install dependencies
npm install

# Set up database
echo "DATABASE_URL=file:./data/sgm.db" > .env
npx prisma generate
npx prisma db push

# Run development server
npm run dev

# Or run Electron in dev mode
npm run electron:dev
\`\`\`

---

## Building from Source

**Electron:**
\`\`\`bash
npm run electron:build:mac    # macOS
npm run electron:build:win    # Windows
npm run electron:build:linux  # Linux
npm run electron:build:all    # All platforms
\`\`\`

**Docker:**
\`\`\`bash
npm run docker:build
\`\`\`

**Portable:**
\`\`\`bash
npm run portable:build
\`\`\`

---

## Troubleshooting

### Port 3003 already in use
\`\`\`bash
# Find process using port 3003
lsof -i :3003

# Kill process
kill -9 <PID>
\`\`\`

### Database locked
- Make sure only one instance of SGM is running
- Close Prisma Studio if open
- Restart SGM

### Electron app won't start (Mac)
\`\`\`bash
# Remove quarantine attribute
xattr -cr /Applications/SGM.app
\`\`\`

### Docker container won't start
\`\`\`bash
# Check logs
docker logs sgm

# Rebuild
docker-compose up --build -d
\`\`\`

---

## Support

- **Documentation:** https://docs.sgm.com
- **Issues:** https://github.com/bhg/sgm/issues
- **Email:** support@sgm.com
- **Community:** https://community.sgm.com

---

## Next Steps

1. ✅ Install SGM (choose your method above)
2. ✅ Complete first-time setup
3. ✅ Create your first plan
4. 📖 Read full documentation
5. 🎓 Take training course (optional)
6. 💬 Join community forum

---

**Welcome to SGM!**
Privacy-first sales governance management.
