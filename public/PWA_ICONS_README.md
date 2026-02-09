# PWA Icons

## Required Icons

Place the following icon files in the `/public` directory:

- `icon-192.png` - 192x192 pixels
- `icon-512.png` - 512x512 pixels

## Design Guidelines

- **Style**: Minimal, calm aesthetic matching the app's dark theme
- **Colors**: Dark grays (#171717 background) with subtle accent
- **Shape**: Simple geometric shape or "V" monogram for "Vibe"
- **Safe Area**: Keep important elements within the center 80% (for maskable icons)

## Temporary Solution

For development, you can use a simple placeholder:
1. Create a 512x512 PNG with dark background (#171717)
2. Add a light colored "V" or simple wave icon in the center
3. Resize to 192x192 for the smaller icon

## Tools

- **Figma/Sketch**: Design the icon
- **ImageMagick**: `convert icon-512.png -resize 192x192 icon-192.png`
- **Online PWA Icon Generator**: https://www.pwabuilder.com/imageGenerator

## Testing

Test the icons using Chrome DevTools:
1. Open DevTools → Application → Manifest
2. Verify icons load correctly
3. Test "Add to Home Screen" on mobile device
