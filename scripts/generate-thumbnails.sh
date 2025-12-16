#!/bin/bash
# Generate 600px-wide thumbnails for all gallery images
# This reduces page load from ~110MB to ~3.5MB

echo "Starting thumbnail generation for gallery images..."
echo "==========================================="

total_generated=0

for category in babies building equipment team; do
  echo ""
  echo "Processing category: $category"
  mkdir -p "assets/images/gallery/${category}/thumbs"

  count=0
  for img in assets/images/gallery/${category}/*.{jpg,jpeg,JPG,JPEG}; do
    # Skip if file doesn't exist (from glob pattern)
    [ -f "$img" ] || continue

    filename=$(basename "$img")
    name="${filename%.*}"
    output_path="assets/images/gallery/${category}/thumbs/${name}-thumb.jpg"

    # Generate thumbnail
    magick "$img" \
      -resize 600x \
      -quality 75 \
      -strip \
      -interlace Plane \
      "$output_path" 2>/dev/null

    if [ $? -eq 0 ]; then
      count=$((count + 1))
      total_generated=$((total_generated + 1))
      echo "  ✓ Generated: ${category}/thumbs/${name}-thumb.jpg"
    else
      echo "  ✗ Failed: ${filename}"
    fi
  done

  echo "  → Generated $count thumbnails for $category"
done

echo ""
echo "==========================================="
echo "Thumbnail generation complete!"
echo "Total thumbnails generated: $total_generated"
echo ""
echo "Next steps:"
echo "1. Verify thumbnails in assets/images/gallery/*/thumbs/"
echo "2. Run the gallery page implementation"
