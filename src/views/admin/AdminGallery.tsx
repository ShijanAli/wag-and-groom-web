"use client";

import { useState } from "react";
import { Plus, Trash2, Star, StarOff, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
const gallery1 = "/images/pet-gallery-1.jpg";
const gallery2 = "/images/pet-gallery-2.jpg";
const gallery3 = "/images/pet-gallery-3.jpg";

interface GalleryImage {
  id: string;
  src: string;
  caption: string;
  category: string;
  featured: boolean;
}

const categories = ["Grooming", "Spa", "Walking", "Daycare", "Team", "Before/After"];
const defaultSrcs = [gallery1, gallery2, gallery3];

const initialImages: GalleryImage[] = [
  { id: "g1", src: gallery1, caption: "Fluffy after grooming", category: "Grooming", featured: true },
  { id: "g2", src: gallery2, caption: "Cat spa day", category: "Spa", featured: false },
  { id: "g3", src: gallery3, caption: "Morning dog walk", category: "Walking", featured: false },
  { id: "g4", src: gallery1, caption: "Puppy cut", category: "Grooming", featured: false },
  { id: "g5", src: gallery2, caption: "Happy kitty", category: "Spa", featured: true },
  { id: "g6", src: gallery3, caption: "Park adventures", category: "Walking", featured: false },
];

let nextId = 7;

export default function AdminGallery() {
  const [images, setImages] = useState<GalleryImage[]>(initialImages);
  const [showAdd, setShowAdd] = useState(false);
  const [editImage, setEditImage] = useState<GalleryImage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState("all");
  const { toast } = useToast();

  const [form, setForm] = useState({ caption: "", category: "Grooming" });

  const filtered = filterCat === "all" ? images : images.filter((i) => i.category === filterCat);

  const handleAdd = () => {
    if (!form.caption) {
      toast({ title: "Missing caption", description: "Please add a caption.", variant: "destructive" });
      return;
    }
    setImages((prev) => [...prev, {
      id: `g${nextId++}`,
      src: defaultSrcs[Math.floor(Math.random() * defaultSrcs.length)],
      caption: form.caption,
      category: form.category,
      featured: false,
    }]);
    setShowAdd(false);
    setForm({ caption: "", category: "Grooming" });
    toast({ title: "Photo added", description: "New photo has been added to the gallery." });
  };

  const handleEditSave = () => {
    if (!editImage) return;
    setImages((prev) => prev.map((i) => (i.id === editImage.id ? editImage : i)));
    setEditImage(null);
    toast({ title: "Photo updated", description: "Photo details have been saved." });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setImages((prev) => prev.filter((i) => i.id !== deleteTarget));
    setDeleteTarget(null);
    toast({ title: "Photo deleted", description: "The photo has been removed from the gallery." });
  };

  const toggleFeatured = (id: string) => {
    setImages((prev) => prev.map((i) => (i.id === id ? { ...i, featured: !i.featured } : i)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Gallery</h1>
          <p className="text-muted-foreground text-sm">Manage photos for your public gallery</p>
        </div>
        <div className="flex gap-2">
          <Select value={filterCat} onValueChange={setFilterCat}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button className="gap-2" onClick={() => { setForm({ caption: "", category: "Grooming" }); setShowAdd(true); }}><Plus className="w-4 h-4" /> Upload Photo</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((img) => (
          <div key={img.id} className="relative group rounded-xl overflow-hidden aspect-square border border-border">
            <img src={img.src} alt={img.caption} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center gap-2">
              <Button variant="secondary" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => toggleFeatured(img.id)} title={img.featured ? "Unfeature" : "Feature"}>
                {img.featured ? <StarOff className="w-4 h-4" /> : <Star className="w-4 h-4" />}
              </Button>
              <Button variant="secondary" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setEditImage({ ...img })} title="Edit">
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="destructive" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDeleteTarget(img.id)} title="Delete">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-foreground/60 text-background text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-center">
              <span>{img.caption}</span>
              {img.featured && <span className="bg-primary/80 text-primary-foreground px-1.5 py-0.5 rounded text-[10px]">Featured</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Add Photo */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Photo</DialogTitle>
            <DialogDescription>Add a new photo to the gallery.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div><Label>Caption *</Label><Input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="e.g. Fluffy after grooming" /></div>
            <div><Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Upload</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Photo */}
      <Dialog open={!!editImage} onOpenChange={(o) => !o && setEditImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Photo</DialogTitle>
            <DialogDescription>Update photo details.</DialogDescription>
          </DialogHeader>
          {editImage && (
            <div className="grid gap-4 py-2">
              <div><Label>Caption</Label><Input value={editImage.caption} onChange={(e) => setEditImage({ ...editImage, caption: e.target.value })} /></div>
              <div><Label>Category</Label>
                <Select value={editImage.category} onValueChange={(v) => setEditImage({ ...editImage, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditImage(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Photo</DialogTitle>
            <DialogDescription>Are you sure? This removes the photo permanently.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
