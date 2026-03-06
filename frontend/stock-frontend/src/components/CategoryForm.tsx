import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import type { Category } from '../types/api';

interface CategoryFormProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSave: (category: Partial<Category>) => Promise<void>;
}

export function CategoryForm({ open, category, onClose, onSave }: CategoryFormProps) {
  const [categoryName, setCategoryName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const isEdit = !!category?.id;

  useEffect(() => {
    if (category) {
      setCategoryName(category.categoryName);
      setDescription(category.description ?? '');
    } else {
      setCategoryName('');
      setDescription('');
    }
  }, [category]);

  const handleSave = async () => {
    if (!categoryName.trim()) {
      return;
    }

    setSaving(true);
    try {
      await onSave({
        categoryName: categoryName.trim(),
        description: description.trim() || null
      });
      onClose();
    } catch (error) {
      console.error('Failed to save category:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Category' : 'Add Category'}</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: 2 }}>
        <TextField
          label="Category Name"
          value={categoryName}
          onChange={(e) => setCategoryName(e.target.value)}
          required
          fullWidth
          autoFocus
          disabled={saving}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          minRows={3}
          fullWidth
          disabled={saving}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={saving || !categoryName.trim()}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
