'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { AI_MODEL_OPTIONS } from '@/features/settings/ai-models';
import { useState } from 'react';
import { toast } from 'sonner';

type AiModelSettingsProps = {
  initialModel: string;
};

export function AiModelSettings({ initialModel }: AiModelSettingsProps) {
  const [model, setModel] = useState(initialModel);
  const [isSaving, setIsSaving] = useState(false);

  async function saveModel() {
    setIsSaving(true);
    const response = await fetch('/api/settings/ai-model', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model })
    });
    setIsSaving(false);

    if (!response.ok) {
      toast.error('Could not update AI model.');
      return;
    }

    toast.success('AI model updated.');
  }

  const selected = AI_MODEL_OPTIONS.find((option) => option.value === model);

  return (
    <Card className='max-w-2xl'>
      <CardHeader>
        <CardTitle>AI Model</CardTitle>
        <CardDescription>
          Choose the model used for case triage, first-contact drafts, note
          cleanup, and follow-up suggestions.
        </CardDescription>
      </CardHeader>
      <CardContent className='flex flex-col gap-4'>
        <div className='grid gap-2'>
          <Label htmlFor='ai-model'>Model</Label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id='ai-model'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {AI_MODEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selected ? (
            <p className='text-muted-foreground text-sm'>
              {selected.description}
            </p>
          ) : null}
        </div>
        <Button
          type='button'
          onClick={saveModel}
          disabled={isSaving || model === initialModel}
          className='w-full sm:w-fit'
        >
          {isSaving ? 'Saving...' : 'Save Model'}
        </Button>
      </CardContent>
    </Card>
  );
}
