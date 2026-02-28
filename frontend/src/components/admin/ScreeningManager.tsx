import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Clock, Film, Loader2, X, Check, Image, Video, Link } from 'lucide-react';
import { useGetAllScreenings, useAddScreening, useEditScreening, useDeleteScreening, useCreateSeatPlan } from '../../hooks/useQueries';
import type { Screening } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function dateToTimestamp(dateStr: string): bigint {
  return BigInt(new Date(dateStr).getTime()) * BigInt(1_000_000);
}

function timestampToDateInput(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  const d = new Date(ms);
  return d.toISOString().split('T')[0];
}

interface ScreeningFormData {
  title: string;
  date: string;
  time: string;
  description: string;
  posterImages: string[];
  trailerLinks: string[];
}

const emptyForm: ScreeningFormData = {
  title: '',
  date: '',
  time: '',
  description: '',
  posterImages: [],
  trailerLinks: [],
};

interface ScreeningManagerProps {
  onSelectScreening: (screening: Screening | null) => void;
  selectedScreeningId: string | null;
}

function UrlListEditor({
  label,
  icon: Icon,
  placeholder,
  values,
  onChange,
}: {
  label: string;
  icon: React.ElementType;
  placeholder: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  const [inputVal, setInputVal] = useState('');

  const addEntry = () => {
    const trimmed = inputVal.trim();
    if (!trimmed) return;
    onChange([...values, trimmed]);
    setInputVal('');
  };

  const removeEntry = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addEntry();
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-gold" />
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="bg-theatre-dark border-gold-dim focus:border-gold text-sm"
        />
        <Button
          type="button"
          size="sm"
          onClick={addEntry}
          disabled={!inputVal.trim()}
          className="gold-gradient text-theatre-dark font-semibold flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      {values.length > 0 && (
        <ul className="space-y-1.5 mt-1">
          {values.map((url, i) => (
            <li
              key={i}
              className="flex items-center gap-2 bg-theatre-dark border border-gold-dim rounded-md px-3 py-1.5 text-xs"
            >
              <Link className="w-3 h-3 text-gold flex-shrink-0" />
              <span className="flex-1 truncate text-muted-foreground">{url}</span>
              <button
                type="button"
                onClick={() => removeEntry(i)}
                className="text-muted-foreground hover:text-theatre-red transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function ScreeningManager({ onSelectScreening, selectedScreeningId }: ScreeningManagerProps) {
  const { data: screenings = [], isLoading } = useGetAllScreenings();
  const addScreening = useAddScreening();
  const editScreening = useEditScreening();
  const deleteScreening = useDeleteScreening();
  const createSeatPlan = useCreateSeatPlan();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Screening | null>(null);
  const [form, setForm] = useState<ScreeningFormData>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Screening | null>(null);

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (s: Screening) => {
    setEditTarget(s);
    setForm({
      title: s.title,
      date: timestampToDateInput(s.date),
      time: s.time,
      description: s.description,
      posterImages: s.posterImages ? [...s.posterImages] : [],
      trailerLinks: s.trailerLinks ? [...s.trailerLinks] : [],
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.time) {
      toast.error('Title, date, and time are required');
      return;
    }

    const id = editTarget?.id ?? `screening-${Date.now()}`;
    const screening: Screening = {
      id,
      title: form.title.trim(),
      date: dateToTimestamp(form.date),
      time: form.time,
      description: form.description.trim(),
      posterImages: form.posterImages.filter((u) => u.trim() !== ''),
      trailerLinks: form.trailerLinks.filter((u) => u.trim() !== ''),
    };

    try {
      if (editTarget) {
        await editScreening.mutateAsync({ id, screening });
        toast.success('Screening updated');
      } else {
        await addScreening.mutateAsync(screening);
        try {
          await createSeatPlan.mutateAsync(id);
        } catch {
          // Seat plan might already exist
        }
        toast.success('Screening added');
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save screening');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteScreening.mutateAsync(deleteTarget.id);
      if (selectedScreeningId === deleteTarget.id) onSelectScreening(null);
      toast.success('Screening deleted');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
    setDeleteTarget(null);
  };

  const isSaving = addScreening.isPending || editScreening.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-semibold text-gold">Screenings</h3>
        <Button
          onClick={openAdd}
          size="sm"
          className="gold-gradient text-theatre-dark font-semibold hover:opacity-90"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gold" />
        </div>
      ) : screenings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No screenings yet. Add one to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {screenings.map((s) => (
            <div
              key={s.id}
              onClick={() => onSelectScreening(s)}
              className={`theatre-card rounded-lg p-3 cursor-pointer transition-all hover:border-gold ${
                selectedScreeningId === s.id ? 'border-gold shadow-gold' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {selectedScreeningId === s.id && (
                      <Check className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                    )}
                    <p className="font-medium text-sm text-foreground truncate">{s.title}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(s.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {s.time}
                    </span>
                  </div>
                  {/* Media indicators */}
                  {((s.posterImages && s.posterImages.length > 0) || (s.trailerLinks && s.trailerLinks.length > 0)) && (
                    <div className="flex items-center gap-2 mt-1.5">
                      {s.posterImages && s.posterImages.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gold-dim">
                          <Image className="w-3 h-3" />
                          {s.posterImages.length} poster{s.posterImages.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {s.trailerLinks && s.trailerLinks.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-gold-dim">
                          <Video className="w-3 h-3" />
                          {s.trailerLinks.length} trailer{s.trailerLinks.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(s); }}
                    className="p-1.5 rounded hover:bg-theatre-gold/10 text-muted-foreground hover:text-gold transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(s); }}
                    className="p-1.5 rounded hover:bg-theatre-red/10 text-muted-foreground hover:text-theatre-red transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-theatre-surface border-gold-dim text-foreground max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-gold flex items-center gap-2">
              <Film className="w-5 h-5" />
              {editTarget ? 'Edit Screening' : 'Add Screening'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm">Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Film or event title"
                className="bg-theatre-dark border-gold-dim focus:border-gold"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Date *</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="bg-theatre-dark border-gold-dim focus:border-gold"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Time *</Label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="bg-theatre-dark border-gold-dim focus:border-gold"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
                className="bg-theatre-dark border-gold-dim focus:border-gold resize-none"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gold-dim pt-3">
              <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-gold" />
                Media Attachments (optional)
              </p>
              <div className="space-y-4">
                <UrlListEditor
                  label="Poster Image URLs"
                  icon={Image}
                  placeholder="https://example.com/poster.jpg"
                  values={form.posterImages}
                  onChange={(posterImages) => setForm({ ...form, posterImages })}
                />
                <UrlListEditor
                  label="Trailer Video Links"
                  icon={Video}
                  placeholder="https://youtube.com/watch?v=... or any video URL"
                  values={form.trailerLinks}
                  onChange={(trailerLinks) => setForm({ ...form, trailerLinks })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-gold-dim text-muted-foreground"
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="gold-gradient text-theatre-dark font-semibold"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : editTarget ? 'Save Changes' : 'Add Screening'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-theatre-surface border-gold-dim text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-foreground">Delete Screening?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently delete "{deleteTarget?.title}" and all associated seat plans and reservations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gold-dim text-muted-foreground bg-transparent">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-theatre-red text-foreground hover:opacity-90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
