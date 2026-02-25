"use client";

import { useState } from 'react';
import { 
  // Building2, 
  User, 
  Briefcase, 
  CreditCard, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  // LogOut,
  ChevronRight,
  Wand2
} from 'lucide-react';

const HDFC_BLUE = '#004c8f';
const HDFC_RED = '#ed232a';

// Form section grouping for better UX
const formSections = [
  {
    id: 'personal',
    title: 'Personal Information',
    icon: <User className="w-5 h-5" style={{ color: HDFC_BLUE }} />,
    fields: [
      { name: 'Applicant_ID', label: 'Applicant ID', type: 'text', placeholder: 'e.g., APP-10023' },
      { name: 'Gender', label: 'Gender', type: 'select', options: ['Male', 'Female'] },
      { name: 'Age', label: 'Age', type: 'number', placeholder: 'e.g., 34' },
      { name: 'Marital_Status', label: 'Marital Status', type: 'select', options: ['Single', 'Married'] },
      { name: 'Dependents', label: 'Dependents', type: 'number', placeholder: 'e.g., 2' },
      { name: 'Education', label: 'Education', type: 'select', options: ['High School', 'Graduate', 'Postgraduate'] },
      { name: 'City_Town', label: 'City/Town', type: 'select', options: ['Urban', 'Suburban', 'Rural'] },
      { name: 'Residential_Status', label: 'Residential Status', type: 'select', options: ['Own', 'Rented', 'Mortgage'] },
    ]
  },
  {
    id: 'employment',
    title: 'Employment & Income',
    icon: <Briefcase className="w-5 h-5" style={{ color: HDFC_BLUE }} />,
    fields: [
      { name: 'Employment_Status', label: 'Employment Status', type: 'select', options: ['Employed', 'Self-Employed', 'Unemployed'] },
      { name: 'Occupation_Type', label: 'Occupation Type', type: 'select', options: ['Salaried', 'Business', 'Freelancer'] },
      { name: 'Annual_Income', label: 'Annual Income (₹)', type: 'number', placeholder: 'e.g., 1200000' },
      { name: 'Monthly_Expenses', label: 'Monthly Expenses (₹)', type: 'number', placeholder: 'e.g., 40000' },
    ]
  },
  {
    id: 'credit',
    title: 'Credit & Existing Debt',
    icon: <CreditCard className="w-5 h-5" style={{ color: HDFC_BLUE }} />,
    fields: [
      { name: 'Credit_Score', label: 'Credit Score', type: 'number', placeholder: 'e.g., 750' },
      { name: 'Existing_Loans', label: 'Existing Loans (Count)', type: 'number', placeholder: 'e.g., 1' },
      { name: 'Total_Existing_Loan_Amount', label: 'Total Existing Loan Amt (₹)', type: 'number', placeholder: 'e.g., 500000' },
      { name: 'Outstanding_Debt', label: 'Outstanding Debt (₹)', type: 'number', placeholder: 'e.g., 250000' },
      { name: 'Loan_History', label: 'Previous Loan History', type: 'select', options: ['1', '0'] },
    ]
  },
  {
    id: 'loan_request',
    title: 'New Loan Request Details',
    icon: <FileText className="w-5 h-5" style={{ color: HDFC_BLUE }} />,
    fields: [
      { name: 'Loan_Amount_Requested', label: 'Loan Amount Requested (₹)', type: 'number', placeholder: 'e.g., 2000000' },
      { name: 'Loan_Term', label: 'Loan Term (Months)', type: 'number', placeholder: 'e.g., 60' },
      { name: 'Loan_Purpose', label: 'Loan Purpose', type: 'select', options: ['Home', 'Vehicle', 'Personal', 'Education'] },
      { name: 'Interest_Rate', label: 'Proposed Interest Rate (%)', type: 'number', step: '0.01', placeholder: 'e.g., 8.5' },
      { name: 'Loan_Type', label: 'Loan Type', type: 'select', options: ['Secured', 'Unsecured'] },
      { name: 'Co_Applicant', label: 'Co-Applicant Included', type: 'select', options: ['No', 'Yes'] },
    ]
  },
  {
    id: 'risk',
    title: 'Banking & Risk Profile',
    icon: <ShieldAlert className="w-5 h-5" style={{ color: HDFC_BLUE }} />,
    fields: [
      { name: 'Bank_Account_History', label: 'Bank Account History', type: 'number', placeholder: 'e.g., 8' },
      { name: 'Transaction_Frequency', label: 'Transaction Frequency', type: 'number', placeholder: 'e.g., 20' },
      { name: 'Default_Risk', label: 'Calculated Default Risk', type: 'number', step: '0.01', placeholder: 'e.g., 0.17' },
    ]
  }
];

export default function App() {
  const [formData, setFormData] = useState({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsEvaluating(true);
    setResult(null);

    try {
      // Make real API call to your FastAPI backend
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send the exact form data JSON over to the Python server
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error: ${response.status}`);
      }

      // Read the response from Python
      const aiPrediction = await response.json();
      
      // Update UI with the result (status, confidence, reasons)
      setResult(aiPrediction);

    } catch (error) {
      console.error("Prediction Error:", error);
      alert(`Failed to connect to the AI model: ${error.message}\nMake sure your FastAPI server is running on port 5000!`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const resetForm = () => {
    setFormData({});
    setResult(null);
  };

  const generateRandomData = () => {
  const isStrongProfile = Math.random() > 0.5; // 50% good applicants

  const randomOptions = {
    Gender: ['Male', 'Female'],
    Marital_Status: ['Single', 'Married'],
    Education: ['High School', 'Graduate', 'Postgraduate'],
    Residential_Status: ['Own', 'Rented', 'Mortgage'],
    Employment_Status: ['Employed', 'Self-Employed'],
    Occupation_Type: ['Salaried', 'Business', 'Freelancer'],
    City_Town: ['Urban', 'Suburban', 'Rural'],
    Loan_Purpose: ['Home', 'Vehicle', 'Personal', 'Education'],
    Loan_Type: ['Secured', 'Unsecured'],
    Co_Applicant: ['No', 'Yes'],
  };

  const data = {
    Applicant_ID: `APP-${Math.floor(Math.random() * 90000) + 10000}`,
    Gender: randomOptions.Gender[Math.floor(Math.random() * 2)],
    Age: Math.floor(Math.random() * 30) + 25,
    Marital_Status: randomOptions.Marital_Status[Math.floor(Math.random() * 2)],
    Dependents: Math.floor(Math.random() * 3),
    Education: isStrongProfile ? 'Graduate' : 'High School',
    City_Town: 'Urban',
    Residential_Status: isStrongProfile ? 'Own' : 'Rented',
    Employment_Status: isStrongProfile ? 'Employed' : 'Self-Employed',
    Occupation_Type: randomOptions.Occupation_Type[Math.floor(Math.random() * 3)],

    // 💰 Income Logic
    Annual_Income: isStrongProfile
      ? (Math.floor(Math.random() * 10) + 15) * 100000  // 15–25 lakh
      : (Math.floor(Math.random() * 5) + 4) * 100000,  // 4–9 lakh

    Monthly_Expenses: isStrongProfile
      ? (Math.floor(Math.random() * 20) + 10) * 1000
      : (Math.floor(Math.random() * 50) + 30) * 1000,

    Credit_Score: isStrongProfile
      ? Math.floor(Math.random() * 100) + 700   // 700–800
      : Math.floor(Math.random() * 150) + 550,  // 550–700

    Existing_Loans: isStrongProfile ? 0 : Math.floor(Math.random() * 3),
    Total_Existing_Loan_Amount: isStrongProfile ? 0 : Math.floor(Math.random() * 5) * 100000,
    Outstanding_Debt: isStrongProfile ? 0 : Math.floor(Math.random() * 5) * 100000,

    Loan_History: isStrongProfile ? '1' : '0',

    Loan_Amount_Requested: isStrongProfile
      ? (Math.floor(Math.random() * 10) + 5) * 100000
      : (Math.floor(Math.random() * 40) + 20) * 100000,

    Loan_Term: [24, 36, 48][Math.floor(Math.random() * 3)],
    Loan_Purpose: randomOptions.Loan_Purpose[Math.floor(Math.random() * 4)],
    Interest_Rate: isStrongProfile ? 8.5 : 11.5,
    Loan_Type: isStrongProfile ? 'Secured' : 'Unsecured',
    Co_Applicant: isStrongProfile ? 'Yes' : 'No',

    Bank_Account_History: isStrongProfile
      ? Math.floor(Math.random() * 10) + 5
      : Math.floor(Math.random() * 5),

    Transaction_Frequency: isStrongProfile
      ? Math.floor(Math.random() * 20) + 10
      : Math.floor(Math.random() * 10),

    Default_Risk: isStrongProfile
      ? parseFloat((Math.random() * 0.3).toFixed(2))
      : parseFloat((Math.random() * 0.7 + 0.3).toFixed(2)),
  };

  setFormData(data);
  setResult(null);
};

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-10 shadow-md" style={{ backgroundColor: HDFC_BLUE }}>
        <div className="w-full h-1" style={{ backgroundColor: HDFC_RED }}></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {/* Custom HDFC-style Logo */}
            <div className="w-9 h-9 flex items-center justify-center bg-white p-1 rounded-sm shadow-sm">
              <div className="w-full h-full bg-[#ed232a] relative flex items-center justify-center">
                <div className="w-3 h-3 bg-[#004c8f]"></div>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                HDFC BANK <span className="text-blue-200 font-medium text-lg ml-2 border-l border-blue-400 pl-2">AI Decision Engine</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-blue-100 hidden sm:block">Branch: Mumbai Central (0021)</div>
            {/* <button className="flex items-center space-x-1 text-blue-100 hover:text-white transition-colors">
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button> */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">New Application Evaluation</h2>
            <p className="text-slate-500 mt-1 text-sm">Fill in the applicant details below to generate an AI-powered approval decision.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={generateRandomData}
              type="button"
              className="text-sm flex items-center space-x-1 text-white font-medium transition-colors px-3 py-1.5 rounded-md shadow-sm hover:opacity-90"
              style={{ backgroundColor: HDFC_BLUE }}
            >
              <Wand2 className="w-4 h-4" />
              <span>Auto-Fill Demo</span>
            </button>
            {Object.keys(formData).length > 0 && !isEvaluating && (
              <button 
                onClick={resetForm}
                type="button"
                className="text-sm text-slate-500 hover:text-[#ed232a] transition-colors font-medium px-2"
              >
                Clear Form
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Form Area */}
          <div className={`transition-all duration-500 ease-in-out ${result ? 'lg:w-2/3' : 'w-full'}`}>
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              
              <div className="p-6 md:p-8 space-y-10">
                {formSections.map((section) => (
                  <div key={section.id} className="relative">
                    <div className="flex items-center space-x-2 mb-5 border-b border-gray-100 pb-2">
                      {section.icon}
                      <h3 className="text-lg font-semibold text-slate-800">{section.title}</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {section.fields.map((field) => (
                        <div key={field.name} className="flex flex-col space-y-1.5">
                          <label htmlFor={field.name} className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                            {field.label}
                          </label>
                          
                          {field.type === 'select' ? (
                            <select
                              id={field.name}
                              name={field.name}
                              value={formData[field.name] ?? ''}
                              onChange={handleInputChange}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004c8f]/20 focus:border-[#004c8f] transition-shadow appearance-none"
                              required
                            >
                              <option value="" disabled>Select option...</option>
                              {field.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              id={field.name}
                              name={field.name}
                              placeholder={field.placeholder}
                              value={formData[field.name] ?? ''}
                              onChange={handleInputChange}
                              step={field.step}
                              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#004c8f]/20 focus:border-[#004c8f] transition-shadow placeholder:text-slate-300"
                              required
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Form Footer / Submit */}
              <div className="bg-slate-50 px-6 py-4 border-t border-gray-200 flex justify-end items-center">
                <button
                  type="submit"
                  disabled={isEvaluating}
                  className="inline-flex items-center justify-center space-x-2 rounded-md px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ backgroundColor: HDFC_BLUE }}
                >
                  {isEvaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Running AI Model...</span>
                    </>
                  ) : (
                    <>
                      <span>Evaluate Application</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Result Area (Slides in when result is ready) */}
          {result && (
            <div className="lg:w-1/3 animate-in slide-in-from-right-8 fade-in duration-500">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden sticky top-24">
                
                {/* Result Header */}
                <div className={`p-6 text-center text-white ${result.status === 'Approved' ? 'bg-emerald-600' : 'bg-[#ed232a]'}`}>
                  <div className="flex justify-center mb-3">
                    {result.status === 'Approved' ? (
                      <CheckCircle2 className="w-16 h-16 opacity-90" />
                    ) : (
                      <XCircle className="w-16 h-16 opacity-90" />
                    )}
                  </div>
                  <h3 className="text-sm uppercase tracking-widest font-semibold opacity-90 mb-1">AI Decision</h3>
                  <div className="text-4xl font-bold">{result.status}</div>
                </div>

                {/* Result Body */}
                <div className="p-6 space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                    <span className="text-slate-500 text-sm">AI Confidence Score</span>
                    <span className="text-xl font-bold text-slate-800">{result.confidence}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-3 uppercase tracking-wider">Key Determining Factors</h4>
                    <ul className="space-y-3">
                      {result.reasons && result.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start text-sm text-slate-600">
                          <span className={`mr-2 mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${result.status === 'Approved' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                      <p className="text-xs text-slate-500 mb-2">Internal Reference ID</p>
                      <p className="font-mono text-sm fonta-medium text-slate-700">
                        {formData.Applicant_ID || `EVAL-${Math.floor(Math.random() * 90000) + 10000}`}
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={resetForm}
                    className="w-full py-2.5 border border-gray-300 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Start New Evaluation
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}