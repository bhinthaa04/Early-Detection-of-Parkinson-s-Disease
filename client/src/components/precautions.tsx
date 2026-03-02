import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Utensils, Dumbbell, Moon, Brain } from "lucide-react";

interface PrecautionsProps {
  stage: 'Early' | 'Mid' | 'Advanced';
}

// Map Flask API stage values to our component's expected values
function mapStageToKey(stage: string): 'Early' | 'Mid' | 'Advanced' {
  const lowerStage = stage.toLowerCase();
  if (lowerStage.includes('early')) return 'Early';
  if (lowerStage.includes('moderate') || lowerStage.includes('mid')) return 'Mid';
  if (lowerStage.includes('advanced')) return 'Advanced';
  // Default to Early for unknown stages like "None" or "Insufficient Data"
  return 'Early';
}

const precautionsData: Record<'Early' | 'Mid' | 'Advanced', Array<{icon: typeof Heart, title: string, tips: string[]}>> = {
  Early: [
    {
      icon: Heart,
      title: 'Cardiovascular Health',
      tips: ['Monitor blood pressure regularly', 'Maintain consistent exercise routine'],
    },
    {
      icon: Utensils,
      title: 'Nutrition',
      tips: ['Eat balanced meals with protein', 'Stay hydrated throughout the day'],
    },
    {
      icon: Dumbbell,
      title: 'Exercise',
      tips: ['30 minutes of moderate activity daily', 'Include balance and flexibility training'],
    },
    {
      icon: Moon,
      title: 'Sleep',
      tips: ['Maintain regular sleep schedule', 'Aim for 7-9 hours per night'],
    },
  ],
  Mid: [
    {
      icon: Heart,
      title: 'Health Monitoring',
      tips: ['Frequent medical check-ups', 'Track medication effectiveness'],
    },
    {
      icon: Utensils,
      title: 'Specialized Nutrition',
      tips: ['Work with a dietitian', 'Manage swallowing difficulties'],
    },
    {
      icon: Dumbbell,
      title: 'Guided Therapy',
      tips: ['Physical therapy 2-3 times weekly', 'Occupational therapy support'],
    },
    {
      icon: Brain,
      title: 'Cognitive Health',
      tips: ['Mental stimulation exercises', 'Stress management techniques'],
    },
  ],
  Advanced: [
    {
      icon: Heart,
      title: 'Intensive Care',
      tips: ['Specialist supervision required', 'Regular hospitalization checks'],
    },
    {
      icon: Utensils,
      title: 'Nutrition Support',
      tips: ['Modified diet for swallowing', 'Consider feeding assistance'],
    },
    {
      icon: Dumbbell,
      title: 'Mobility Assistance',
      tips: ['Physical therapist on call', 'Assistive devices essential'],
    },
    {
      icon: Brain,
      title: 'Comprehensive Support',
      tips: ['Family counseling', '24/7 caregiver availability'],
    },
  ],
};

export function Precautions({ stage }: PrecautionsProps) {
  // Map the stage to a valid key if needed
  const mappedStage = mapStageToKey(stage);
  const precautions = precautionsData[mappedStage] || precautionsData.Early;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-heading font-bold text-foreground">Personalized Precautions & Lifestyle</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {precautions.map((item: {icon: typeof Heart, title: string, tips: string[]}, idx: number) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 text-primary rounded-lg">
                      <Icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {item.tips.map((tip: string, tipIdx: number) => (
                      <li key={tipIdx} className="flex items-start gap-2 text-sm text-black">
                        <span className="text-primary mt-1">→</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
