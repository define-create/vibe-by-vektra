import type { MentalTag } from '@/types';

export const MENTAL_TAGS_CONFIG: Array<{
  value: MentalTag;
  label: string;
  description?: string;
}> = [
  {
    value: 'focused',
    label: 'Focused',
    description: 'Clear mental clarity and concentration'
  },
  {
    value: 'distracted',
    label: 'Distracted',
    description: 'Difficulty maintaining attention'
  },
  {
    value: 'confident',
    label: 'Confident',
    description: 'Self-assured and positive mindset'
  },
  {
    value: 'anxious',
    label: 'Anxious',
    description: 'Nervous or worried state'
  },
  {
    value: 'frustrated',
    label: 'Frustrated',
    description: 'Irritated or bothered'
  },
 // {
 //   value: 'flow-state',
 //   label: 'Flow State',
 //   description: 'Fully immersed and engaged'
 // },
  {
    value: 'fatigued',
    label: 'Fatigued',
    description: 'Mentally tired or drained'
  }
];

export const getMentalTagLabel = (value: MentalTag): string => {
  return MENTAL_TAGS_CONFIG.find(tag => tag.value === value)?.label || value;
};
