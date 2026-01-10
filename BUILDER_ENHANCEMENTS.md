# PESA Shop App Builder - Major Enhancements Required

## Current Issues
1. **No Element Nesting**: Cannot drag elements into containers
2. **Column Block Not Working**: No configuration modal when adding columns
3. **Basic Preview**: Need phone mockup instead of plain iframe
4. **Limited Properties**: Need Oxygen Builder-level property controls
5. **Static DOM Tree**: Cannot drag elements from structure panel

## Implementation Plan

### Phase 1: Critical Fixes (CURRENT)
- ✅ Add CSS for phone mockup
- ✅ Add CSS for column configuration modal
- ✅ Add CSS for nested blocks and drag-and-drop states
- 🔄 Update JavaScript to enable nesting
- 🔄 Add column configuration modal
- 🔄 Implement phone mockup preview

### Phase 2: Advanced Properties (NEXT)
Add Oxygen Builder-style properties:

**Size & Spacing:**
- Width, Height (with units: px, %, vh, vw, auto)
- Min/Max Width and Height
- Margin (top, right, bottom, left with units)
- Padding (top, right, bottom, left with units)

**Typography:**
- Font Family, Size, Weight, Style
- Line Height, Letter Spacing
- Text Transform, Decoration, Alignment
- Text Shadow

**Borders & Radius:**
- Border Width, Style, Color (all sides)
- Border Radius (all corners individually)
- Box Shadow
- Outline

**Background:**
- Background Color
- Background Image (URL, gradient)
- Background Size, Position, Repeat
- Background Blend Mode

**Effects:**
- Opacity
- Transform (Rotate, Scale, Skew, Translate)
- Transition Duration, Timing
- Filter (Blur, Brightness, Contrast, etc.)
- Mix Blend Mode

**Layout (Flexbox):**
- Display type
- Flex Direction, Wrap
- Justify Content, Align Items, Align Content
- Flex Grow, Shrink, Basis
- Gap

**Position:**
- Position type (static, relative, absolute, fixed, sticky)
- Top, Right, Bottom, Left
- Z-Index

**Advanced:**
- Custom CSS Classes
- Custom Attributes
- Visibility Conditions
- Animations/Interactions

### Phase 3: Interactive Features
- Drag elements from structure tree to reorder
- Drag elements from structure tree to nest
- Visual indicators for drop zones
- Undo/Redo functionality

### Phase 4: Column System
- Visual column resizing
- Responsive column configurations
- Column gap controls
- Vertical alignment options

## Files Modified
1. `/wordpress-plugin/assets/css/admin.css` - Added styles
2. `/wordpress-plugin/assets/js/admin-app.js` - Needs JavaScript updates
3. `/wordpress-plugin/assets/js/admin-app-enhanced.js` - New enhanced version (partial)

## Next Steps
1. Complete the JavaScript implementation for critical features
2. Test nesting functionality
3. Test column configuration
4. Test phone mockup preview
5. Begin Phase 2: Advanced properties

## Notes
- The enhanced builder aims to match Oxygen Builder's functionality
- All changes maintain backward compatibility with existing pages
- Mobile-first approach with responsive controls
- Real-time preview updates
