for file in *.png; do
  convert "$file" -rotate 180 "${file}"
done
