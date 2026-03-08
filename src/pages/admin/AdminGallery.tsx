import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import gallery1 from "@/assets/pet-gallery-1.jpg";
import gallery2 from "@/assets/pet-gallery-2.jpg";
import gallery3 from "@/assets/pet-gallery-3.jpg";

const images = [
  { src: gallery1, caption: "Fluffy after grooming" },
  { src: gallery2, caption: "Cat spa day" },
  { src: gallery3, caption: "Morning dog walk" },
  { src: gallery1, caption: "Puppy cut" },
  { src: gallery2, caption: "Happy kitty" },
  { src: gallery3, caption: "Park adventures" },
];

export default function AdminGallery() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gallery</h1>
          <p className="text-muted-foreground text-sm">Manage photos for your public gallery</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> Upload Photo</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, i) => (
          <div key={i} className="relative group rounded-xl overflow-hidden aspect-square border border-border">
            <img src={img.src} alt={img.caption} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center">
              <Button variant="destructive" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="absolute bottom-0 left-0 right-0 bg-foreground/60 text-background text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">{img.caption}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
