# 🚀 Vercel Deployment Checklist

## ✅ Pre-Deployment Checks

### Code & Build
- [x] Production build succeeds (`npm run build`)
- [x] TypeScript errors resolved
- [x] All dependencies installed
- [x] date-fns dependency added
- [x] Webpack build configured (Turbopack disabled)

### PWA Setup
- [x] manifest.json created with app metadata
- [x] Service worker (sw.js) created
- [x] App icons generated (72px to 512px SVG)
- [x] Favicon created
- [x] PWA install prompt component added
- [x] Service worker registration in layout

### Mobile Optimization
- [x] Viewport meta tags configured (no user zoom)
- [x] Audio Welcome Screen for browser unlock
- [x] Touch-friendly UI components
- [x] Mobile-first responsive design
- [x] AwehChat FAB positioned correctly

### Party OS Features
- [x] Sticker Factory with html2canvas (384px for 58mm printers)
- [x] Native Share API for printing
- [x] Pusher configured for South Africa (sa1 cluster)
- [x] Real-time leaderboards
- [x] AwehChat trash talk buttons
- [x] QR code scanning

## 🔧 Environment Variables

Make sure these are set in Vercel:

### Firebase
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

### Database (Neon Postgres)
```
DATABASE_URL
```

### Pusher
```
NEXT_PUBLIC_PUSHER_KEY
NEXT_PUBLIC_PUSHER_CLUSTER=sa1
PUSHER_APP_ID
PUSHER_SECRET
```

### Genkit AI (Optional)
```
GOOGLE_GENAI_API_KEY
```

## 📦 Vercel Configuration

### Build Settings
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x or higher

### Deploy Command
```bash
vercel --prod
```

### Environment Settings
- **Regions**: Choose closest to South Africa (EU or Asia)
- **Edge Middleware**: Disabled (not using Edge runtime)
- **Output File Tracing**: Enabled

## 🎯 Post-Deployment Tests

### Critical Features
- [ ] Homepage loads
- [ ] Party join flow works
- [ ] Authentication (login/signup)
- [ ] Sticker Factory generates and shares
- [ ] Pusher real-time updates
- [ ] Audio Welcome Screen appears
- [ ] PWA install prompt shows after 5 seconds
- [ ] Mobile navigation works
- [ ] AwehChat FAB appears

### PWA Features
- [ ] manifest.json accessible at `/manifest.json`
- [ ] Service worker registers successfully
- [ ] "Add to Home Screen" prompt appears
- [ ] App installs on Android/Desktop Chrome
- [ ] App installs on iOS Safari
- [ ] App icons display correctly
- [ ] Offline caching works (visit cached pages)

### Mobile Tests
- [ ] Test on Android Chrome
- [ ] Test on iOS Safari
- [ ] Portrait orientation
- [ ] Landscape orientation (games)
- [ ] Touch gestures work
- [ ] No horizontal scrolling
- [ ] Input fields don't cause zoom

### Performance
- [ ] Lighthouse PWA score > 90
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] No console errors
- [ ] All images load

## 🐛 Common Deployment Issues

### Build Fails
- Check all dependencies are in package.json
- Verify environment variables are set
- Review build logs for specific errors

### PWA Not Installing
- Ensure HTTPS is enabled (Vercel provides this)
- Check manifest.json is accessible
- Verify service worker registers
- Test in incognito mode

### Real-time Updates Not Working
- Verify Pusher credentials are correct
- Check Pusher cluster is set to `sa1`
- Test Pusher connection in browser console

### Mobile UI Issues
- Test viewport meta tags
- Check touch targets are 44px minimum
- Verify no elements overflow viewport

## 🎊 Success Criteria

Your deployment is successful when:
1. ✅ Build completes without errors
2. ✅ App loads on production URL
3. ✅ Users can join parties
4. ✅ PWA install prompt appears
5. ✅ App installs on mobile devices
6. ✅ Real-time features work (Pusher)
7. ✅ Audio plays after welcome screen
8. ✅ Sticker Factory prints to thermal printer

## 📱 APK Generation (Optional)

To create an Android APK from your PWA:

### Option 1: PWA Builder (Recommended)
1. Visit https://www.pwabuilder.com
2. Enter your deployed Vercel URL
3. Click "Generate Package"
4. Download Android package
5. Sign with your keystore
6. Upload to Play Store

### Option 2: Bubblewrap
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://your-app.vercel.app/manifest.json
bubblewrap build
```

### Option 3: Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap sync
npx cap open android
```

## 🔒 Security Checklist

- [ ] Environment variables not committed to git
- [ ] Firebase security rules configured
- [ ] Database prepared statements used
- [ ] CORS configured for allowed origins
- [ ] Rate limiting enabled if needed
- [ ] Authentication required for sensitive routes

## 📈 Monitoring

After deployment, monitor:
- Vercel Analytics
- Firebase Usage
- Pusher Connections
- Database queries
- Error logs
- User feedback

## 🎉 Launch Day

1. Deploy to production: `vercel --prod`
2. Test all critical features
3. Share Party OS URL with guests
4. Monitor real-time connections
5. Have thermal printer ready
6. Enjoy the party! 🎊

---

**Ready to deploy?**

```bash
# Final build test
npm run build

# Deploy to Vercel
vercel --prod

# Or push to main branch (if auto-deploy configured)
git push origin main
```

## 🆘 Emergency Rollback

If critical issues occur:
```bash
vercel rollback
```

Or redeploy previous version from Vercel dashboard.

---

**Questions?** Check the Vercel docs or Party OS admin guide.
