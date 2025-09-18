# Google Maps Setup

## Required Environment Variable

To use the Google Map Picker component, you need to add your Google Maps API key to your environment variables.

### Steps:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Add the API key to your `.env.local` file:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### Security Note:

- Restrict your API key to specific domains in production
- Add your domain to the HTTP referrers list
- Consider using environment-specific keys

### Features:

- Interactive map with click-to-select location
- Search functionality using Google Places API
- Current location detection
- Drag and drop marker positioning
- Simplified interface with search and map only
