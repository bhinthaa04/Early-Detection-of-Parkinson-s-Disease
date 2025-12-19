import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, AlertOctagon } from "lucide-react";

interface DiseaseStageCardProps {
  stage: 'Early' | 'Mid' | 'Advanced';
}

const stageConfig = {
  Early: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50 border-yellow-200',
    title: 'Early Stage',
    description: 'Early-stage Parkinson\'s disease detected.',
    tips: [
      'Regular physical exercise and physiotherapy',
      'Speech therapy for voice clarity',
      'Occupational therapy for fine motor skills',
      'Regular neurologist follow-ups every 3-6 months',
    ],
  },
  Mid: {
    icon: AlertTriangle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    title: 'Mid Stage',
    description: 'Mid-stage Parkinson\'s disease detected.',
    tips: [
      'Intensive physical therapy and exercise',
      'Speech and occupational therapy optimization',
      'Medication management review',
      'Assistive devices for mobility assistance',
      'Monthly neurologist consultation',
    ],
  },
  Advanced: {
    icon: AlertOctagon,
    color: 'text-red-600',
    bgColor: 'bg-red-50 border-red-200',
    title: 'Advanced Stage',
    description: 'Advanced-stage Parkinson\'s disease detected.',
    tips: [
      'Urgent neurologist consultation required',
      'Comprehensive multidisciplinary care',
      'Advanced medication and possibly surgical options',
      '24/7 care support and nursing assistance',
      'Mental health support for patient and family',
      'Consider clinical trials for new therapies',
    ],
  },
};

export function DiseaseStageCard({ stage }: DiseaseStageCardProps) {
  const config = stageConfig[stage];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className={`border-2 ${config.bgColor}`}>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${config.color} bg-white shadow-sm`}>
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <CardTitle className={config.color}>{config.title}</CardTitle>
              <p className="text-sm text-black mt-1">{config.description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Recommended Care & Precautions:</h4>
              <ul className="space-y-2">
                {config.tips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className={`${config.color} mt-1`}>✓</div>
                    <span className="text-sm text-black">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
