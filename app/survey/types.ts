import { z } from 'zod'

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const FamilyMemberSchema = z.object({
  name:                         z.string().min(1, 'Name is required'),
  relationToHead:               z.string().min(1, 'Relation is required'),
  birthdate:                    z.string().optional(),
  sex:                          z.enum(['Male', 'Female', '']).optional(),
  highestEducationalAttainment: z.enum([
    'No Formal Education', 'Elementary', 'High School',
    'Senior High School', 'Vocational', 'College', 'Post Graduate', '',
  ]).optional(),
  occupation:          z.string().optional(),
  typeOfVulnerability: z.enum([
    'PWD', 'Senior Citizen', 'Pregnant', 'Lactating Mother',
    'Solo Parent', 'Unaccompanied Minor', 'None', '',
  ]).optional(),
})

export const FormSchema = z.object({
  // Step 1 — Location
  region:           z.string().min(1, 'Region is required'),
  province:         z.string().min(1, 'Province is required'),
  cityMunicipality: z.string().min(1, 'City/Municipality is required'),
  district:         z.string().optional(),
  barangay:         z.string().min(1, 'Barangay is required'),
  evacuationCenter: z.string().optional(),

  // Step 2 — Head of Family
  lastName:               z.string().min(1, 'Last name is required').max(100),
  firstName:              z.string().min(1, 'First name is required').max(100),
  middleName:             z.string().max(100).optional(),
  nameExt:                z.string().max(10).optional(),
  birthdate:              z.string().min(1, 'Birthdate is required'),
  birthplace:             z.string().min(1, 'Birthplace is required').max(100),
  sex:                    z.enum(['Male', 'Female'], { errorMap: () => ({ message: 'Sex is required' }) }),
  civilStatus:            z.enum(['Single', 'Married', 'Widowed', 'Separated', 'Annulled']).optional(),
  motherMaidenName:       z.string().max(100).optional(),
  religion:               z.string().max(100).optional(),
  occupation:             z.string().max(100).optional(),
  monthlyFamilyNetIncome: z.string().optional(),
  idCardPresented:        z.string().max(100).optional(),
  idCardNumber:           z.string().max(100).optional(),
  primaryContactNumber:   z.string()
    .min(1, 'Primary contact is required')
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Invalid contact number format'),
  altContactNumber: z.string()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Invalid contact number format')
    .optional()
    .or(z.literal('')),
  houseBlockLotNo:         z.string().max(100).optional(),
  street:                  z.string().max(100).optional(),
  subdivisionVillage:      z.string().max(100).optional(),
  addressBarangay:         z.string().max(100).optional(),
  addressCityMunicipality: z.string().max(100).optional(),
  addressProvince:         z.string().max(100).optional(),
  zipCode:                 z.string().max(10).optional(),
  fourPsBeneficiary:       z.boolean(),
  isIP:                    z.boolean(),
  ipEthnicity:             z.string().max(100).optional(),

  // Step 3 — Family Members
  familyMembers: z.array(FamilyMemberSchema),

  // Step 4 — Account & Property
  bankEwallet:   z.string().optional(),
  accountName:   z.string().max(100).optional(),
  accountType:   z.enum(['Savings', 'Checking', 'E-Wallet', '']).optional(),
  accountNumber: z.string().max(100).optional(),
  houseOwnership:     z.enum(['Owner', 'Renter', 'Sharer']).optional(),
  shelterDamage:      z.enum(['Partially Damaged', 'Totally Damaged']).optional(),
  dataPrivacyConsent: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the Data Privacy Declaration' }),
  }),
})

export type FormValues      = z.infer<typeof FormSchema>
export type FamilyMemberLocal = z.infer<typeof FamilyMemberSchema>

// ─── Location codes (passed alongside form values) ────────────────────────────

export type LocationCodes = {
  regionCode:       string
  provinceCode:     string
  municipalityCode: string
  barangayCode:     string
}