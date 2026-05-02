export const applicationSteps = [
    {
        title: 'Student Information',
        description: 'Basic profile and admission details',
        fields: [
            { key: 'student_name', label: 'Full Name', type: 'text', required: true, width: 'col-12', placeholder: 'Enter full name' },
            { key: 'name_with_initials', label: 'Name With Initials', type: 'text', required: true, width: 'col-12', placeholder: 'Enter name with initials' },
            { key: 'gender', label: 'Gender', type: 'select', required: true, width: 'col-md-6', options: ['Male', 'Female'] },
            { key: 'date_of_birth', label: 'Date of Birth', type: 'date', required: true, width: 'col-md-6' },
            { key: 'grade_applying', label: 'Grade Applying For', type: 'text', required: true, width: 'col-md-4', placeholder: 'e.g., Grade 6' },
            { key: 'medium', label: 'Medium', type: 'select', required: true, width: 'col-md-4', options: ['Tamil', 'English', 'Sinhala'] },
            { key: 'birth_certificate_no', label: 'Birth Certificate Number', type: 'text', required: true, width: 'col-md-4', placeholder: 'Enter certificate number' },
            { key: 'distance_from_school', label: 'Distance From School (km)', type: 'number', required: true, width: 'col-md-6', placeholder: 'Enter distance' },
            { key: 'student_address', label: 'Address', type: 'textarea', required: true, width: 'col-12', placeholder: 'Enter full address' }
        ]
    },
    {
        title: 'Parent & Guardian',
        description: 'Primary family contact information',
        fields: [
            { key: 'father_name', label: "Father's Name", type: 'text', required: true, width: 'col-md-6' },
            { key: 'mother_name', label: "Mother's Name", type: 'text', required: true, width: 'col-md-6' },
            { key: 'parent_phone', label: 'Parent Mobile Number', type: 'text', required: true, width: 'col-md-6' },
            { key: 'parent_email', label: 'Parent Email', type: 'email', required: false, width: 'col-md-6' },
            { key: 'father_occupation', label: "Father's Occupation", type: 'text', required: false, width: 'col-md-6' },
            { key: 'mother_occupation', label: "Mother's Occupation", type: 'text', required: false, width: 'col-md-6' },
            { key: 'guardian_name', label: 'Guardian Name', type: 'text', required: false, width: 'col-md-6' },
            { key: 'guardian_phone', label: 'Guardian Phone', type: 'text', required: false, width: 'col-md-6' }
        ]
    },
    {
        title: 'Family & Health',
        description: 'Supportive context for the admissions team',
        fields: [
            { key: 'family_members', label: 'Number of Family Members', type: 'number', required: false, width: 'col-md-4' },
            { key: 'monthly_income_range', label: 'Monthly Income Range', type: 'select', required: false, width: 'col-md-4', options: ['Below 20,000', '20,000 - 50,000', '50,000 - 100,000', 'Above 100,000'] },
            { key: 'emergency_contact', label: 'Emergency Contact', type: 'text', required: true, width: 'col-md-4' },
            { key: 'medical_notes', label: 'Medical Conditions or Special Needs', type: 'textarea', required: false, width: 'col-12' },
            { key: 'special_talents', label: 'Special Talents', type: 'textarea', required: false, width: 'col-12' }
        ]
    },
    {
        title: 'Academic Profile',
        description: 'Previous school and learning background',
        fields: [
            { key: 'previous_school', label: 'Previous School', type: 'text', required: false, width: 'col-md-6' },
            { key: 'last_grade_studied', label: 'Last Grade Studied', type: 'text', required: false, width: 'col-md-6' },
            { key: 'results_summary', label: 'Results / Marks Summary', type: 'textarea', required: false, width: 'col-md-6' },
            { key: 'extra_curricular', label: 'Extra Curricular Activities', type: 'textarea', required: false, width: 'col-md-6' }
        ]
    },
    {
        title: 'Documents',
        description: 'Upload the required admission files',
        fields: [
            { key: 'birth_certificate_copy', label: 'Birth Certificate Copy', type: 'file', required: true, width: 'col-md-6' },
            { key: 'parent_id_copy', label: 'Parent NIC Copies', type: 'file', required: true, width: 'col-md-6' },
            { key: 'proof_of_address', label: 'Proof of Address', type: 'file', required: true, width: 'col-md-6' },
            { key: 'student_photo', label: 'Student Photograph', type: 'file', required: true, width: 'col-md-6' },
            { key: 'leaving_certificate', label: 'Previous School Leaving Certificate', type: 'file', required: false, width: 'col-md-6' }
        ]
    },
    {
        title: 'Declaration',
        description: 'Review the summary and submit',
        fields: []
    }
];

export const navigationItems = [
    { key: 'home', label: 'Home' },
    { key: 'about', label: 'About' },
    { key: 'notices', label: 'Notices' },
    { key: 'history', label: 'History' },
    { key: 'achievements', label: 'Achievements' },
    { key: 'staff', label: 'Staff & Students' },
    { key: 'contact', label: 'Contact' },
    { key: 'apply', label: 'Apply' }
];
