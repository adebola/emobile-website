# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static HTML/CSS website prototype portfolio showcasing five different design themes for Emobile Specialist Hospital's website. Pure HTML5, CSS3, and vanilla JavaScript with no build tools or framework dependencies.

## Development Commands

**Local development:**
```bash
# Serve locally (Python)
python -m http.server 8000

# Or use any static file server
npx serve .
```

**Deployment:**
```bash
firebase deploy
```

Firebase project: `emobile-7372c` (configured in `.firebaserc`)

## Architecture

### File Organization
- `index.html` - Theme showcase landing page with iframe previews and comparison table
- `theme[1-5]-*.html` - Five self-contained, complete theme implementations
- `public/` - Firebase hosting directory (contains copies of all HTML files for deployment)
- `404.html` - Custom error page

### Theme Structure
Each theme file (34-44KB) is a complete, standalone HTML page containing:
1. Embedded CSS with CSS variables for theming (`:root`)
2. Fixed navigation header with smooth scroll
3. Hero section with statistics and CTAs
4. About/Services/Contact sections
5. Responsive design via CSS Grid, Flexbox, and media queries (breakpoint: 768px)
6. Inline JavaScript for interactivity

### The Five Themes
| Theme | Style | Key Characteristics |
|-------|-------|---------------------|
| Theme 1 | Warm & Nurturing | Soft pastels, Cormorant serif, floating animations |
| Theme 2 | Modern Clinical | Clean whites/navy, grid layout, professional |
| Theme 3 | Premium Luxury | Dark theme, gold accents, elegant reveals |
| Theme 4 | Fresh & Vibrant | Bright gradients, animated blobs, bold |
| Theme 5 | Minimalist Zen | Neutral tones, generous whitespace, calm |

### Brand Colors
All themes incorporate the company colors:
- Primary Red: `#E31B23`
- Primary Blue: `#00A3E0`

## Key Conventions

- CSS is embedded inline in each HTML file (no external stylesheets)
- SVG icons are used for vector graphics
- Google Fonts loaded via preconnect (Inter, Cormorant Garamond, Nunito)
- Mobile-first responsive design approach
- Semantic HTML5 elements (nav, section, header, footer)
