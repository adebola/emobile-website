# Emobile Specialist Hospital Website

A modern, responsive website for Emobile Specialist Hospital - Lagos, Nigeria's leading IVF and fertility specialists.

## Overview

This is a multi-page static website built using the warm & nurturing theme, featuring soft pastels, elegant typography, and a patient-centered design approach. The website showcases the hospital's comprehensive fertility and reproductive health services.

## Features

- **8 Responsive Pages**: Home, About, Services, Contact, Foundation, Appointment, Gallery, Blog
- **Modern Design**: Warm color palette with floating shapes animation
- **WhatsApp Integration**: Direct contact via WhatsApp (+234 902 998 1301)
- **Image Gallery**: Success stories showcase with lightbox functionality
- **Form Ready**: Appointment booking and contact forms ready for REST API integration
- **SEO Optimized**: Proper meta tags and semantic HTML structure
- **Custom Favicon**: Hospital branding across all devices

## Technology Stack

- **HTML5**: Semantic markup
- **CSS3**: Custom styles with CSS variables for easy theming
- **JavaScript**: Vanilla JS for interactions (no dependencies)
- **Firebase Hosting**: Deployment platform
- **ImageMagick**: Favicon generation

## Color Scheme

- **Red Primary**: #E31B23
- **Red Dark**: #b31419
- **Blue Primary**: #00A3E0
- **Cream**: #FFF9F5
- **Warm White**: #FFFCFA

## Typography

- **Headings**: Cormorant Garamond (Serif)
- **Body**: Nunito (Sans-serif)

## Project Structure

```
.
├── index.html              # Homepage
├── about.html              # About Us page
├── services.html           # Services page
├── contact.html            # Contact page
├── foundation.html         # ECI Foundation page
├── appointment.html        # Appointment booking page
├── gallery.html            # Success stories gallery
├── blog.html               # Blog page
├── assets/
│   ├── css/
│   │   └── main.css       # Main stylesheet (989 lines)
│   ├── js/
│   │   └── main.js        # Main JavaScript file
│   └── images/
│       ├── logo/          # Hospital logo
│       ├── hero/          # Hero section images
│       ├── about/         # About page images
│       ├── gallery/       # Success stories photos
│       └── favicon/       # Favicon files (8 sizes)
├── public/                 # Firebase deployment directory
├── archive/                # Archived theme files
├── deploy.sh               # Deployment script
├── firebase.json           # Firebase configuration
├── .firebaserc            # Firebase project reference
└── README.md              # This file
```

## Deployment

### Quick Deploy

Run the deployment script to copy files to the public directory and optionally deploy to Firebase:

```bash
./deploy.sh
```

The script will:
1. Clean the public directory (preserving 404.html)
2. Copy all HTML files
3. Copy the entire assets directory
4. Display a summary of files
5. Prompt to deploy to Firebase

### Manual Deployment

```bash
# Copy files to public directory
./deploy.sh
# Answer 'n' when prompted

# Deploy to Firebase manually
firebase deploy
```

## Services Offered

1. **Gynaecological Procedures**: Comprehensive women's health services
2. **IVF/ICSI Treatment**: Advanced assisted reproductive technology
3. **Obstetrics**: Complete maternity care
4. **Paediatrics Services**: Child healthcare
5. **24/7 Emergency Services**: Round-the-clock emergency care
6. **Wellness Programme**: Holistic health and wellness
7. **Antenatal Care**: Expert pregnancy care
8. **Male Infertility**: Specialized male reproductive health

## API Integration (Future)

The website is prepared for REST API integration:

- **Contact Form**: `/api/contact` (placeholder)
- **Appointment Booking**: `/api/appointments` (placeholder)
- **Blog Posts**: `/api/blog/posts` (placeholder)
- **Newsletter**: `/api/newsletter` (placeholder)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contact

**Emobile Specialist Hospital**
- Address: 68 Coker Road, Ilupeju, Lagos, Nigeria
- Phone: +234 1 342 1111
- WhatsApp: +234 902 998 1301
- Email: info@emobilespecialisthospital.com
- Website: https://emobilespecialisthospital.com

## License

© 2024 Emobile Specialist Hospital. All rights reserved.

## Development Notes

- Built with mobile-first approach
- No external CSS/JS frameworks (vanilla)
- Optimized images for web performance
- Follows accessibility best practices
- Ready for CMS integration
