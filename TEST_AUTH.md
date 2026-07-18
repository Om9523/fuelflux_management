# Quick Auth Setup Test Guide

## ✅ Pre-Requisites
- [ ] Backend running at `http://127.0.0.1:8000`
- [ ] FuelFlux frontend running at `http://localhost:3000`
- [ ] Test user created in backend

## 🧪 Step-by-Step Test

### 1. Start Frontend
```bash
npm run dev
```
Go to `http://localhost:3000/login`

### 2. Create Test User on Backend (if not exists)
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@fuelflux.com",
    "phone": "9876543210",
    "name": "Test User",
    "password": "TestPassword123"
  }'
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "id": 1,
      "email": "test@fuelflux.com",
      "name": "Test User",
      "roles": ["pump_owner"]
    }
  }
}
```

### 3. Test Login Flow
1. Go to login page
2. Enter: `test@fuelflux.com` or `9876543210`
3. Password: `TestPassword123`
4. Check "Remember my session"
5. Click "Sign In"

**Expected:** 
- ✅ Login succeeds
- ✅ Redirects to `/select-role`
- ✅ Tokens appear in localStorage
- ✅ Tokens appear in cookies

### 4. Test Token Storage
Open DevTools → Application → Cookies/Storage:

**LocalStorage should have:**
```
fuelflux_accessToken: "..."
fuelflux_refreshToken: "..."
fuelflux_user: '{"id":1,"email":"test@fuelflux.com"...}'
```

**Cookies should have:**
```
fuelflux_accessToken: "..."
fuelflux_refreshToken: "..."
```

### 5. Test Role Selection
1. Select a role from the list
2. Click confirm
3. Should redirect to appropriate dashboard

### 6. Test Protected Routes
1. Try accessing `/dashboard` directly
2. Should load (you're authenticated)
3. Check Network tab - should see your user's data loaded

### 7. Test Token Refresh (Optional - takes 15 mins)
1. Wait for access token to expire (15 minutes)
2. Make any API call
3. Should automatically refresh token
4. Request should succeed with new token

Or manually test:
```bash
# Simulate expired token
curl -X POST http://127.0.0.1:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<your_refresh_token>"}'
```

### 8. Test Logout
1. Click logout button
2. Should redirect to login
3. Tokens should be cleared from storage
4. Try accessing `/dashboard` - should redirect to login

### 9. Test Error Handling
1. Try login with wrong password
2. Should show error message
3. Try login with non-existent email
4. Should show appropriate error

## 🔍 Debugging Checklist

**If login fails:**
- [ ] Backend is running: `curl http://127.0.0.1:8000/api/v1/auth/login`
- [ ] Check backend logs for errors
- [ ] Verify credentials exist in backend
- [ ] Check Network tab → XHR/Fetch
- [ ] Look for CORS errors
- [ ] Verify `NEXT_PUBLIC_API_URL` in .env.local

**If tokens not persisting:**
- [ ] Check DevTools → Application
- [ ] Verify localStorage is enabled
- [ ] Check if cookies are being blocked
- [ ] Look for Content Security Policy errors
- [ ] Clear cache and reload

**If redirect loops:**
- [ ] Clear all cookies and localStorage
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Check middleware.ts config
- [ ] Verify token format (Bearer token)

**If API calls fail:**
- [ ] Check Network tab headers
- [ ] Verify `Authorization: Bearer <token>`
- [ ] Check backend is returning correct data
- [ ] Ensure token hasn't expired
- [ ] Check API endpoint path is correct

## 📊 Network Monitoring

Open DevTools → Network tab:

**Login Request:**
```
POST /api/v1/auth/login
Headers: Content-Type: application/json
Status: 200 OK
Response: Contains accessToken, refreshToken, user
```

**Subsequent Requests:**
```
POST /api/v1/users (or any endpoint)
Headers: Authorization: Bearer eyJ...
Status: 200 OK (or appropriate status)
```

**On 401 Error:**
```
Initial request: 401 Unauthorized
Then: POST /api/v1/auth/refresh (auto)
Then: Retry initial request with new token
```

## ✨ Success Indicators

- [ ] Login page loads without errors
- [ ] Can log in with test credentials
- [ ] Redirects to role selection
- [ ] Can select role and access dashboard
- [ ] Tokens are stored in localStorage
- [ ] Tokens are stored in cookies
- [ ] API calls include Authorization header
- [ ] Can logout and redirect to login
- [ ] Protected routes redirect when logged out
- [ ] Error messages display correctly
- [ ] No console errors related to auth

## 🚀 Next Steps After Testing

1. **Update Mock Data:**
   - Go to `/lib/mock-db/index.ts`
   - Can remove or keep for fallback
   - Backend is now primary data source

2. **Create More Test Users:**
   - Test with different roles
   - Test with different permissions
   - Test switching between roles

3. **Test on Different Devices:**
   - Mobile browsers
   - Different desktop browsers
   - Private/Incognito mode

4. **Set Up Monitoring:**
   - Log failed auth attempts
   - Monitor token refresh rates
   - Track session duration

5. **Prepare for Production:**
   - Update API URL to production backend
   - Review security settings
   - Set up error tracking
   - Configure monitoring/logging

## 📝 Testing Commands

### Test Login Endpoint
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@fuelflux.com",
    "password": "TestPassword123"
  }'
```

### Test Protected Endpoint
```bash
curl -X GET http://127.0.0.1:8000/api/v1/users \
  -H "Authorization: Bearer <accessToken>"
```

### Test Token Refresh
```bash
curl -X POST http://127.0.0.1:8000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<refreshToken>"}'
```

---

**Need Help?** Check AUTH_SETUP.md for detailed documentation.
