import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/lib/api-service";
import {
  createPatientId,
  savePatientData,
  type PatientData,
} from "@/lib/patient-data";
import patientFormLogo from "@assets/generated_images/patient_form_logo.png";

const medicalBlue = "#2c5ba9";

const initialFormData: PatientData = {
  name: "",
  age: "",
  gender: "",
  patient_id: "",
  contact: "",
  email: "",
  address: "",
  medical_history: "",
  symptoms: "",
  family_history: "No",
  medications: "",
};

export default function PatientForm() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [formData, setFormData] = useState<PatientData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Missing patient name",
        description: "Please enter patient full name.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.age.trim()) {
      toast({
        title: "Missing age",
        description: "Please enter patient age.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.gender.trim()) {
      toast({
        title: "Missing gender",
        description: "Please select patient gender.",
        variant: "destructive",
      });
      return;
    }

    const patientPayload: PatientData = {
      ...formData,
      patient_id: formData.patient_id.trim() || createPatientId(),
      medical_history: formData.medical_history.trim() || "None reported",
      symptoms: formData.symptoms.trim() || "None reported",
      medications: formData.medications.trim() || "None",
    };

    setIsSubmitting(true);
    try {
      const dbPatientId = await apiService.createPatient({
        name: patientPayload.name,
        age: patientPayload.age,
        gender: patientPayload.gender,
        phone: patientPayload.contact,
        email: patientPayload.email,
        address: patientPayload.address,
      });

      savePatientData({
        ...patientPayload,
        db_patient_id: dbPatientId,
      });
      sessionStorage.removeItem("predictionResult");
      setLocation("/take-test");
    } catch (error) {
      toast({
        title: "Failed to save patient",
        description: error instanceof Error ? error.message : "Could not save patient to MySQL.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 min-h-screen bg-white px-4 py-8 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-t-2xl p-8 text-center text-white" style={{ backgroundColor: medicalBlue }}>
          <div className="mb-4 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white">
              <img
                src={patientFormLogo}
                alt="NeuroScan AI logo"
                className="h-full w-full scale-110 rounded-full object-cover"
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold">NeuroScan AI</h1>
          <p className="text-xl opacity-90">Patient Screening Form</p>
          <p className="mt-2 text-sm opacity-80">AI-Based Multimodal Parkinson&apos;s Screening</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 rounded-b-2xl bg-white p-8 shadow-xl">
          <div className="border-l-4 pl-4" style={{ borderColor: medicalBlue }}>
            <h2 className="text-xl font-bold" style={{ color: medicalBlue }}>Patient Information</h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Patient Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter patient full name"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Age *</label>
              <input
                type="number"
                min="1"
                max="120"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Enter age"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Gender *</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Patient ID *</label>
              <input
                type="text"
                name="patient_id"
                value={formData.patient_id}
                onChange={handleChange}
                onFocus={() => {
                  if (!formData.patient_id.trim()) {
                    setFormData((prev) => ({ ...prev, patient_id: createPatientId() }));
                  }
                }}
                placeholder="Auto-generated or manual"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Contact Number</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="+1 234 567 890"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                placeholder="Enter patient address"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="patient@email.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="border-l-4 pl-4" style={{ borderColor: medicalBlue }}>
            <h2 className="text-xl font-bold" style={{ color: medicalBlue }}>Medical Information</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Previous Medical History</label>
              <textarea
                name="medical_history"
                value={formData.medical_history}
                onChange={handleChange}
                rows={3}
                placeholder="e.g., Diabetes, Hypertension, Previous neurological conditions..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Current Symptoms</label>
              <textarea
                name="symptoms"
                value={formData.symptoms}
                onChange={handleChange}
                rows={3}
                placeholder="e.g., Tremors in hands, slow movement, stiffness, balance issues..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Family History of Parkinson's</label>
              <select
                name="family_history"
                value={formData.family_history}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Current Medications</label>
              <textarea
                name="medications"
                value={formData.medications}
                onChange={handleChange}
                rows={2}
                placeholder="e.g., Levodopa, Pramipexole, No current medications..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
            After submit, the app will redirect to Take Test and automatically continue with: Upload data, Analyze, Display result, Generate report.
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setLocation("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back Home
            </Button>

            <Button type="submit" className="bg-[#2c5ba9] hover:bg-[#244a8f]" disabled={isSubmitting}>
              {isSubmitting ? "Saving Patient..." : "Continue to Take Test"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
