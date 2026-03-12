import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle, Send, Bot, User, ArrowLeft,
  Brain, Heart, Activity, Moon, Zap
} from "lucide-react";
import { useLocation } from "wouter";
import heroBg from "@assets/generated_images/hopeful_medical_background_with_brain_waves_and_pulses.png";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const quickQuestions = [
  "What are the early signs of Parkinson's?",
  "How can I manage tremors?",
  "What exercises help with Parkinson's?",
  "How does Parkinson's affect sleep?",
  "What medications are commonly prescribed?",
  "How to deal with depression and Parkinson's?",
  "What is deep brain stimulation?",
  "How does diet affect Parkinson's?"
];

export default function AIChatbot() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your Parkinson's disease assistant. I can help answer questions about symptoms, treatments, lifestyle tips, and more. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isTyping]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // In a real implementation, this would call your OpenAI API
      const response = await simulateAIResponse(content);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please try again later or consult with your healthcare provider for medical advice.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lowerMessage = userMessage.toLowerCase();

    // Simple rule-based responses (in real implementation, use OpenAI API)
    if (lowerMessage.includes('early signs') || lowerMessage.includes('symptoms')) {
      return "Early signs of Parkinson's disease can include:\n\n• Tremor (shaking) in hands, arms, legs, or face\n• Stiffness in the arms, legs, or trunk\n• Slowness of movement (bradykinesia)\n• Impaired balance and coordination\n• Changes in handwriting (micrographia)\n• Reduced sense of smell\n• Sleep disturbances\n\nThese symptoms usually begin gradually and may be mild at first. If you're experiencing these symptoms, please consult a healthcare professional for proper diagnosis.";
    }

    if (lowerMessage.includes('tremor') || lowerMessage.includes('shaking')) {
      return "Managing tremors in Parkinson's disease:\n\n• **Medication**: Your doctor may prescribe medications like levodopa, dopamine agonists, or anticholinergics\n• **Physical therapy**: Exercises to improve muscle control and coordination\n• **Lifestyle adjustments**: Weighted utensils, wrist weights, or adaptive devices\n• **Stress management**: Relaxation techniques and avoiding caffeine\n• **Deep brain stimulation**: For severe cases that don't respond to medication\n\nAlways consult your neurologist before making changes to your treatment plan.";
    }

    if (lowerMessage.includes('exercise') || lowerMessage.includes('physical activity')) {
      return "Exercise is crucial for managing Parkinson's disease:\n\n• **Aerobic exercise**: Walking, swimming, cycling (30 minutes, 5 days/week)\n• **Strength training**: Light weights or resistance bands\n• **Balance exercises**: Tai Chi, yoga, dance\n• **Stretching**: Daily flexibility exercises\n• **Speech therapy exercises**: For voice and swallowing\n\nStart slowly and consult your doctor before beginning a new exercise program. Physical therapy can help design a personalized routine.";
    }

    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia')) {
      return "Sleep issues are common in Parkinson's disease:\n\n• **Establish a routine**: Go to bed and wake up at the same time\n• **Create a sleep-friendly environment**: Cool, dark, quiet room\n• **Limit caffeine and alcohol**: Especially in the evening\n• **Exercise regularly**: But not too close to bedtime\n• **Medications**: Your doctor may adjust Parkinson's medications or prescribe sleep aids\n• **Address other symptoms**: Treat pain, depression, or restless legs that may interfere with sleep\n\nIf sleep problems persist, discuss them with your healthcare provider.";
    }

    if (lowerMessage.includes('medication') || lowerMessage.includes('drugs')) {
      return "Common Parkinson's disease medications include:\n\n• **Levodopa**: Most effective for motor symptoms\n• **Dopamine agonists**: Mimic dopamine in the brain\n• **MAO-B inhibitors**: Help prevent dopamine breakdown\n• **COMT inhibitors**: Extend levodopa's effects\n• **Anticholinergics**: Help with tremors and stiffness\n• **Amantadine**: May help with dyskinesia\n\nMedication regimens are highly individualized. Work closely with your neurologist to find the best combination and timing for your symptoms.";
    }

    if (lowerMessage.includes('depression') || lowerMessage.includes('mental health')) {
      return "Mental health support for Parkinson's disease:\n\n• **Professional help**: Counseling or therapy\n• **Support groups**: Connect with others facing similar challenges\n• **Exercise**: Regular physical activity helps mood\n• **Social engagement**: Stay connected with friends and family\n• **Medications**: Antidepressants may be prescribed if needed\n• **Mindfulness**: Meditation, yoga, or relaxation techniques\n\nDepression is common in Parkinson's and treatable. Don't hesitate to seek help from mental health professionals.";
    }

    if (lowerMessage.includes('deep brain stimulation') || lowerMessage.includes('dbs')) {
      return "Deep Brain Stimulation (DBS) is a surgical treatment for Parkinson's disease:\n\n• **How it works**: Thin wires (electrodes) are implanted in the brain and connected to a device similar to a pacemaker\n• **Benefits**: Can reduce tremors, stiffness, and medication-induced dyskinesia\n• **Candidates**: Usually for advanced Parkinson's patients with good response to levodopa\n• **Procedure**: Done under local anesthesia with MRI guidance\n• **Maintenance**: Battery replacement every 3-5 years\n\nDBS is not a cure and requires careful patient selection. Discuss with a movement disorder specialist.";
    }

    if (lowerMessage.includes('diet') || lowerMessage.includes('nutrition')) {
      return "Nutrition tips for Parkinson's disease:\n\n• **Protein timing**: Take levodopa 30-60 minutes before meals or 1-2 hours after\n• **Balanced diet**: Include fruits, vegetables, whole grains, lean proteins\n• **Hydration**: Drink plenty of water throughout the day\n• **Vitamin D**: May help with bone health and possibly symptoms\n• **Fiber**: Helps with constipation, a common issue\n• **Calcium**: Important for bone health\n• **Mediterranean diet**: May have protective effects\n\nWork with a registered dietitian familiar with Parkinson's for personalized advice.";
    }

    // Default response
    return "Thank you for your question about Parkinson's disease. While I can provide general information about symptoms, treatments, and lifestyle tips, I'm not a substitute for professional medical advice. For personalized guidance, please consult with your healthcare provider or a movement disorder specialist.\n\nCould you please rephrase your question or ask about a specific aspect of Parkinson's disease?";
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 transition-opacity duration-1000"
        style={{ backgroundImage: `url(${heroBg})` }}
      />

      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 50, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            opacity: [0.05, 0.2, 0.05],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-400/10 rounded-full blur-[100px]"
        />

        <svg className="absolute inset-0 w-full h-full opacity-10">
          <motion.path
            d="M0 100 Q 250 50 500 100 T 1000 100"
            stroke="currentColor"
            strokeWidth="1"
            fill="transparent"
            className="text-primary"
            animate={{
              x: [-20, 20, -20],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 10, repeat: Infinity }}
          />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary rounded-xl text-black">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">AI Symptom Assistant</h1>
              <p className="text-white/70">Get answers to your Parkinson's disease questions</p>
            </div>
          </div>
        </motion.div>

          <div className="space-y-8">
            {/* Chat Interface */}
            <Card className="h-[600px] flex flex-col bg-slate-900/80 border border-white/10 text-white">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageCircle className="w-5 h-5" />
                  Chat with AI Assistant
                </CardTitle>
              </CardHeader>

              <CardContent className="min-h-0 flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="min-h-0 flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            message.sender === 'user'
                              ? 'bg-primary text-black'
                              : 'bg-white/10 text-white'
                          }`}>
                            {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </div>
                          <div className={`max-h-64 overflow-y-auto rounded-2xl px-4 py-2 ${
                            message.sender === 'user'
                              ? 'bg-primary text-white'
                              : 'bg-white/10 text-white border border-white/10'
                          }`}>
                            <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3 justify-start"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="bg-white/10 rounded-2xl px-4 py-2 border border-white/10">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="border-t border-white/10 p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask me anything about Parkinson's disease..."
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                      disabled={isTyping}
                      className="flex-1 bg-white/10 text-white placeholder:text-white/60 border-white/10 focus-visible:ring-cyan-300/50"
                    />
                    <Button
                      onClick={() => sendMessage(inputMessage)}
                      disabled={!inputMessage.trim() || isTyping}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Sections below chat */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="bg-slate-900/80 border border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Quick Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {quickQuestions.map((question, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      className="w-full text-left justify-start h-auto p-3 whitespace-normal text-white/90 hover:bg-white/10"
                      onClick={() => sendMessage(question)}
                      disabled={isTyping}
                    >
                      <span className="text-sm">{question}</span>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 border border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Important Note
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/70">
                    This AI assistant provides general information about Parkinson's disease.
                    It is not a substitute for professional medical advice, diagnosis, or treatment.
                  </p>
                  <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                    <p className="text-xs text-yellow-200">
                      Always consult with your healthcare provider for personalized medical advice.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-900/80 border border-white/10 text-white">
                <CardHeader>
                  <CardTitle className="text-lg text-white">Helpful Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 p-2 hover:bg-white/10 rounded cursor-pointer">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm">Parkinson's Foundation</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 hover:bg-white/10 rounded cursor-pointer">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Michael J. Fox Foundation</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 hover:bg-white/10 rounded cursor-pointer">
                    <Moon className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">Sleep Foundation</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 hover:bg-white/10 rounded cursor-pointer">
                    <Zap className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">Exercise Guidelines</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
      </div>
    </div>
  );
}
