import * as z from 'zod';

const assistanceTypeValues = [
  'employment',
  'resume',
  'interview_prep',
  'career_direction',
  'budgeting',
  'debt',
  'housing',
  'mental_health',
  'social_connection',
  'other'
] as const;

const urgencyFlagValues = [
  'basic_needs',
  'medical_crisis',
  'housing_crisis',
  'financial_crisis',
  'family_crisis',
  'vulnerable_people',
  'leader_contact_needed'
] as const;

const supportSourceValues = [
  'family_friends',
  'neighbors',
  'ministering',
  'church_assistance',
  'community_programs',
  'government_services',
  'professional_services',
  'none'
] as const;

const optionalText = z.string().trim();
const optionalEmail = z
  .string()
  .trim()
  .refine(
    (value) => value === '' || z.email().safeParse(value).success,
    'Enter a valid email address.'
  );

export const assistanceTypeOptions = [
  { value: 'employment', label: 'Employment' },
  { value: 'resume', label: 'Resume' },
  { value: 'interview_prep', label: 'Interview prep' },
  { value: 'career_direction', label: 'Career direction' },
  { value: 'budgeting', label: 'Budgeting' },
  { value: 'debt', label: 'Debt' },
  { value: 'housing', label: 'Housing' },
  { value: 'mental_health', label: 'Mental health support' },
  { value: 'social_connection', label: 'Social connection / community' },
  { value: 'other', label: 'Other' }
];

export const urgencyFlagOptions = [
  { value: 'basic_needs', label: 'Food, shelter, or basic needs are at risk' },
  { value: 'medical_crisis', label: 'Immediate medical or health concern' },
  { value: 'housing_crisis', label: 'Housing, eviction, or shelter crisis' },
  { value: 'financial_crisis', label: 'Urgent financial deadline' },
  { value: 'family_crisis', label: 'Family or childcare crisis' },
  {
    value: 'vulnerable_people',
    label: 'Children, elderly, or vulnerable people affected'
  },
  {
    value: 'leader_contact_needed',
    label: 'A leader may need to be contacted right away'
  }
];

export const supportSourceOptions = [
  { value: 'family_friends', label: 'Family or friends' },
  { value: 'neighbors', label: 'Neighbors or ward members' },
  { value: 'ministering', label: 'Ministering brothers or sisters' },
  { value: 'church_assistance', label: 'Church assistance' },
  { value: 'community_programs', label: 'Community or charitable programs' },
  { value: 'government_services', label: 'Government services' },
  { value: 'professional_services', label: 'Professional services' },
  { value: 'none', label: 'No current support' }
];

export const contactMethodOptions = [
  { value: 'text', label: 'Text me' },
  { value: 'phone', label: 'Call me' },
  { value: 'email', label: 'Email me' },
  { value: 'any', label: 'I am not sure yet' }
];

export const urgencyLevelOptions = [
  { value: 'immediate', label: 'Immediate crisis' },
  { value: 'this_week', label: 'Need help this month' },
  { value: 'soon', label: 'General support or advice' },
  {
    value: 'not_urgent',
    label: 'I am not ready to talk yet, but want resources'
  }
];

export const needDurationOptions = [
  { value: 'temporary', label: 'Temporary' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'unsure', label: 'Unsure' }
];

export const intakeSchema = z
  .object({
    fullName: optionalText,
    phone: optionalText,
    email: optionalEmail,
    address: optionalText.default(''),
    preferredContactMethod: z.enum(['phone', 'text', 'email', 'any']),
    bestContactTimes: optionalText,
    householdInfo: optionalText.default(''),
    assistanceTypes: z
      .array(z.enum(assistanceTypeValues))
      .min(1, 'Select at least one type of assistance.'),
    assistanceOther: optionalText,
    situationDescription: optionalText,
    needStarted: optionalText.default(''),
    needDuration: z.enum(['temporary', 'ongoing', 'unsure']).default('unsure'),
    helpTried: optionalText.default(''),
    currentSupportAvailable: optionalText.default(''),
    urgentDeadlines: optionalText.default(''),
    urgencyLevel: z.enum(['immediate', 'this_week', 'soon', 'not_urgent']),
    urgencyFlags: z.array(z.enum(urgencyFlagValues)).default([]),
    safetyConcerns: optionalText.default(''),
    incomeEmploymentStatus: optionalText.default(''),
    majorExpenses: optionalText.default(''),
    requestedAmount: optionalText.default(''),
    billDueDates: optionalText.default(''),
    otherResourcesContacted: optionalText.default(''),
    supportSources: z.array(z.enum(supportSourceValues)).default([]),
    churchAssistanceDetails: optionalText.default(''),
    professionalServices: optionalText.default(''),
    followUpPlans: optionalText,
    followUpContactName: optionalText.default(''),
    followUpAvailability: optionalText.default(''),
    sharePermission: z.boolean().default(true),
    privacyAcknowledgement: z
      .boolean()
      .refine(
        (value) => value,
        'Please acknowledge how this information will be used.'
      )
  })
  .superRefine((values, ctx) => {
    if (values.assistanceTypes.includes('other') && !values.assistanceOther) {
      ctx.addIssue({
        code: 'custom',
        path: ['assistanceOther'],
        message: 'Please share what kind of help you need.'
      });
    }

    if (
      (values.preferredContactMethod === 'text' ||
        values.preferredContactMethod === 'phone') &&
      !values.phone
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['phone'],
        message: 'Please add a phone number so we can follow up.'
      });
    }

    if (values.preferredContactMethod === 'email' && !values.email) {
      ctx.addIssue({
        code: 'custom',
        path: ['email'],
        message: 'Please add an email address so we can follow up.'
      });
    }

    if (
      values.preferredContactMethod === 'any' &&
      !values.phone &&
      !values.email
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['phone'],
        message: 'Please add a phone number or email so we can follow up.'
      });
    }
  });

export type IntakeFormValues = z.input<typeof intakeSchema>;
export type IntakeSubmission = z.output<typeof intakeSchema>;

export const intakeDefaultValues: IntakeFormValues = {
  fullName: '',
  phone: '',
  email: '',
  address: '',
  preferredContactMethod: 'text',
  bestContactTimes: '',
  householdInfo: '',
  assistanceTypes: [],
  assistanceOther: '',
  situationDescription: '',
  needStarted: '',
  needDuration: 'unsure',
  helpTried: '',
  currentSupportAvailable: '',
  urgentDeadlines: '',
  urgencyLevel: 'soon',
  urgencyFlags: [],
  safetyConcerns: '',
  incomeEmploymentStatus: '',
  majorExpenses: '',
  requestedAmount: '',
  billDueDates: '',
  otherResourcesContacted: '',
  supportSources: [],
  churchAssistanceDetails: '',
  professionalServices: '',
  followUpPlans: '',
  followUpContactName: '',
  followUpAvailability: '',
  sharePermission: true,
  privacyAcknowledgement: false
};
