# Google Maps Embed Guide - UEAB ODeL

## 📍 How to Change the Map Location

### **Easy Method: Use Google Maps Embed Generator**

1. **Go to Google Maps**
   - Visit https://www.google.com/maps
   - Search for your desired location

2. **Share and Get Embed Code**
   - Click the **Share** button (usually top left)
   - Select **Embed a map** tab
   - Google will generate embed code automatically
   - Copy the entire `src=""` URL

3. **Replace in Code**
   - Find the map iframe in `app/page.tsx` (around line 637)
   - Replace the entire `src` attribute with your new URL

---

## 🔧 Understanding the Current Map URL

The current embed URL has this structure:

```
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.783174506244!2d35.27361!3d0.52056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17829d5d5d5d5d5d%3A0x5d5d5d5d5d5d5d5d!2sUniversity%20of%20Eastern%20Africa%20Baraton%20Main%20Campus!5e0!3m2!1sen!2ske!4v1729510800000
```

### **Key Parameters:**

| Parameter | Example | Purpose |
|-----------|---------|---------|
| `2d` (longitude) | `35.27361` | East-West position |
| `3d` (latitude) | `0.52056` | North-South position |
| `1d3` (zoom) | `3989.783174506244` | How close/far the map zooms |
| Location name | `UEAB Baraton Main Campus` | Display name on map |
| `2ske` | Kenya | Country code |

---

## 📝 Step-by-Step: Change Location Example

### **Scenario: Change to Main Campus Building**

**Step 1: Find Location Coordinates**
- Go to Google Maps
- Search: "UEAB Main Campus Building Eldoret"
- Right-click on the location → Copy coordinates
- Example: `0.5210, 35.2736`

**Step 2: Get Embed Code**
- Click Share → Embed a map
- Google provides the complete embed URL

**Step 3: Update the Code**

```tsx
// Current code (app/page.tsx line 637)
<iframe
  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.783174506244!2d35.27361!3d0.52056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17829d5d5d5d5d5d%3A0x5d5d5d5d5d5d5d5d!2sUniversity%20of%20Eastern%20Africa%20Baraton%20Main%20Campus!5e0!3m2!1sen!2ske!4v1729510800000"
  // ... other attributes
></iframe>

// Replace src with your new location's embed URL from Google Maps
```

---

## 🌍 Quick Location Examples

### **Common UEAB Locations**

#### 1. **Main Campus (Eldoret)**
```
Coordinates: 0.5210° N, 35.2736° E
Google Maps Link: https://maps.google.com/?q=0.5210,35.2736
```

#### 2. **Nairobi Learning Center** (if applicable)
```
Coordinates: -1.2865° S, 36.8172° E
Google Maps Link: https://maps.google.com/?q=-1.2865,36.8172
```

#### 3. **Mombasa Learning Center** (if applicable)
```
Coordinates: -4.0435° S, 39.6682° E
Google Maps Link: https://maps.google.com/?q=-4.0435,39.6682
```

---

## 🎯 Alternative: Simple Embed Method

If you prefer a simpler, more lightweight embed:

```tsx
// Option 1: Simple coordinates-based embed
<iframe
  src="https://maps.google.com/maps?q=0.5210,35.2736&z=15&output=embed"
  width="100%"
  height="100%"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
></iframe>

// Option 2: Search-based embed
<iframe
  src="https://maps.google.com/maps?q=UEAB+Main+Campus+Eldoret&z=15&output=embed"
  width="100%"
  height="100%"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
></iframe>
```

**Parameters:**
- `q=` → Location (coordinates or name)
- `z=` → Zoom level (1-20, higher = more zoomed in)
- `output=embed` → Embed format

---

## 🎨 Customization Options

### **Zoom Levels**
- `z=5` → Country level
- `z=10` → Region level
- `z=15` → City level (RECOMMENDED)
- `z=18` → Street level
- `z=20` → Building level

### **Map Types**
Add to URL: `&t=` parameter:
- `&t=m` → Map view (default)
- `&t=k` → Satellite
- `&t=h` → Hybrid (Satellite + Labels)
- `&t=p` → Terrain

**Example with satellite:**
```
https://maps.google.com/maps?q=0.5210,35.2736&z=15&t=k&output=embed
```

---

## 📋 Current Map Configuration (app/page.tsx)

```tsx
<div className="w-full h-96 rounded-2xl overflow-hidden shadow-lg border border-gray-200">
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.783174506244!2d35.27361!3d0.52056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17829d5d5d5d5d5d%3A0x5d5d5d5d5d5d5d5d!2sUniversity%20of%20Eastern%20Africa%20Baraton%20Main%20Campus!5e0!3m2!1sen!2ske!4v1729510800000"
    width="100%"
    height="100%"
    style={{ border: 0 }}
    allowFullScreen
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
    title="UEAB Campus Location"
  ></iframe>
</div>
```

### **Current Settings:**
- **Location**: UEAB Main Campus, Eldoret
- **Coordinates**: 0.5210° N, 35.2736° E
- **Zoom**: ~15 (City level)
- **Styling**: Rounded corners, shadow, border
- **Size**: Responsive (100% width, 384px height)

---

## 🔍 Finding Exact Coordinates

### **Method 1: Google Maps (Easiest)**
1. Open https://www.google.com/maps
2. Search location
3. Right-click the location
4. Copy coordinates displayed at top

### **Method 2: From Google Maps URL**
When you search a location, the URL contains coordinates:
```
https://maps.google.com/maps?q=0.5210,35.2736
                                  ↑           ↑
                              Latitude  Longitude
```

### **Method 3: GPS Devices/Apps**
- Use GPS apps to record exact coordinates
- Format: `Latitude, Longitude`
- Example: `0.5210, 35.2736`

---

## ✅ Checklist for Map Changes

- [ ] Found the location on Google Maps
- [ ] Got the embed code from Share → Embed
- [ ] Copied the full `src` URL
- [ ] Updated the iframe src in `app/page.tsx` line 637
- [ ] Tested the page in browser
- [ ] Verified map shows correct location
- [ ] Checked zoom level is appropriate
- [ ] Confirmed title/alt text is accurate

---

## 🚀 Implementation Example

### **To Change Map Location:**

**File**: `app/page.tsx` (line 637)

**Original:**
```tsx
src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.783174506244!2d35.27361!3d0.52056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x17829d5d5d5d5d5d%3A0x5d5d5d5d5d5d5d5d!2sUniversity%20of%20Eastern%20Africa%20Baraton%20Main%20Campus!5e0!3m2!1sen!2ske!4v1729510800000"
```

**Updated Example (Nairobi Campus):**
```tsx
src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.783174506244!2d36.8172!3d-1.2865!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xXXXXXXXXXXXXXXX%3A0xXXXXXXXXXXXXXX!2sUEAB+Nairobi+Centre!5e0!3m2!1sen!2ske!4v1729510800000"
```

---

## 📞 Support

**Need Help?**
1. Go to Google Maps
2. Find your location
3. Click Share
4. Select "Embed a map"
5. Copy the provided src URL
6. Contact admin if unclear

---

**Last Updated**: October 28, 2025  
**Compatible With**: Next.js 14+, React 18+  
**Map Provider**: Google Maps Embed API
