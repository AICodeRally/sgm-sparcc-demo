# SGM Summit Demo - Production URLs

## 🌐 Live Production Site

### Primary URLs

**Production Site**: https://sgm-summit-demo.vercel.app
**Latest Deployment**: https://sgm-summit-demo-9u9tyy0n3-aicoderally.vercel.app

### API Endpoints

**Diagnostics** (System Status):
```
https://sgm-summit-demo.vercel.app/api/sgm/diagnostics
```

**Policies** (List with Filters):
```
https://sgm-summit-demo.vercel.app/api/sgm/policies?status=published
```

**Policy Detail** (With Audit + Links):
```
https://sgm-summit-demo.vercel.app/api/sgm/policies/pol-001
```

---

## 📱 Quick Test Commands

```bash
# Test homepage
curl https://sgm-summit-demo.vercel.app

# Test diagnostics API
curl https://sgm-summit-demo.vercel.app/api/sgm/diagnostics | jq

# Test policies list
curl "https://sgm-summit-demo.vercel.app/api/sgm/policies?status=published" | jq

# Test policy detail with links
curl https://sgm-summit-demo.vercel.app/api/sgm/policies/pol-001 | jq
```

---

## 🎯 Vercel Dashboard Links

**Project Dashboard**:
https://vercel.com/aicoderally/sgm-summit-demo

**Settings**:
https://vercel.com/aicoderally/sgm-summit-demo/settings

**Deployments**:
https://vercel.com/aicoderally/sgm-summit-demo/deployments

**Analytics**:
https://vercel.com/aicoderally/sgm-summit-demo/analytics

**Domains** (to add sgm-edge.info):
https://vercel.com/aicoderally/sgm-summit-demo/settings/domains

---

## 🔗 Custom Domain Setup

### Option 1: Add sgm-edge.info to This Project

```bash
# Via CLI
cd ~/dev/sgm-summit-demo
vercel domains add sgm-edge.info

# Via Dashboard (Recommended)
# Go to: https://vercel.com/aicoderally/sgm-summit-demo/settings/domains
# Click "Add Domain"
# Enter: sgm-edge.info (or summit.sgm-edge.info)
# Follow DNS configuration steps
```

### Option 2: Subdomain Configuration

**Suggested subdomains**:
- `summit.sgm-edge.info` → SGM Summit Demo
- `api.sgm-edge.info` → API endpoints
- `demo.sgm-edge.info` → Demo instance

### DNS Records (When Adding Domain)

**If using sgm-edge.info directly**:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**If using subdomain (summit.sgm-edge.info)**:
```
Type: CNAME
Name: summit
Value: cname.vercel-dns.com
```

---

## ✅ Production Status

**Deployment Status**: ✅ LIVE
**Build Status**: ✅ SUCCESS
**API Status**: ✅ OPERATIONAL
**Binding Mode**: synthetic (zero dependencies)

**Last Deployed**: 2025-12-14
**Commit**: e803347 (Add deployment documentation)
**Build Time**: ~2 minutes

---

## 📊 Production Data

**Confirmed via Diagnostics**:
- 10 policies loaded
- 10 territories loaded
- 3 approvals loaded
- 12 entity links loaded
- 0 search items (index ready but empty)

All synthetic providers operational ✅

---

## 🚀 Next Steps

### Immediate (Optional)
1. Add custom domain via Vercel dashboard
2. Enable GitHub integration for auto-deploy
3. Review analytics dashboard

### Future Enhancements
1. Add Prisma live mode with database
2. Implement mapped mode for external APIs
3. Build UI pages (Phase 5-6 from plan)
4. Add authentication/authorization

---

*Production deployment complete!*
*Access live site: https://sgm-summit-demo.vercel.app*
