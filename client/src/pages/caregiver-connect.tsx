import { motion } from "framer-motion";
import { 
  ArrowLeft, Users, Heart, Phone, Mail, 
  BarChart2, Bell, ShieldAlert, Share2, 
  Clock, Download, Calendar
} from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from "recharts";
import heroBg from "@assets/generated_images/hopeful_medical_background_with_brain_waves_and_pulses.png";

const data = [
  { day: 'Mon', score: 85 },
  { day: 'Tue', score: 82 },
  { day: 'Wed', score: 88 },
  { day: 'Thu', score: 84 },
  { day: 'Fri', score: 90 },
  { day: 'Sat', score: 87 },
  { day: 'Sun', score: 92 },
];

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function CaregiverConnect() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen relative overflow-hidden font-sans">
      {/* Dynamic Medical AI Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        <Button variant="ghost" onClick={() => setLocation("/")} className="mb-6 text-white hover:bg-white/10">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary rounded-xl text-black">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-white">Caregiver & Doctor Connect</h1>
            <p className="text-white/80">Managing the patient's support ecosystem</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-gray-900">Health Progress Overview</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-gray-300"><Calendar className="w-4 h-4 mr-2" /> Schedule View</Button>
                </div>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(150, 70%, 45%)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(150, 70%, 45%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} />
                    <YAxis hide domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="score" stroke="hsl(150, 70%, 45%)" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-primary text-black">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" />
                    Emergency Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm opacity-90">Instant alerts will be sent to primary caregivers and doctors.</p>
                  <Button variant="secondary" className="w-full bg-black text-white hover:bg-black/90 font-bold py-6">
                    TRIGGER EMERGENCY ALERT
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 text-gray-900">
                    <Share2 className="w-5 h-5 text-primary" />
                    Medical Report Sharing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded text-blue-600 font-bold text-xs">PDF</div>
                      <span className="text-sm font-medium text-gray-700">Monthly_Report_Dec.pdf</span>
                    </div>
                    <Download className="w-4 h-4 text-gray-400 cursor-pointer hover:text-primary" />
                  </div>
                  <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5">
                    <Mail className="w-4 h-4 mr-2" /> Send to Doctor
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">Recent Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { time: "10:30 AM", msg: "Medication taken", icon: ShieldCheck, color: "text-green-500" },
                  { time: "Yesterday", msg: "High tremor level alert", icon: Bell, color: "text-orange-500" },
                  { time: "2 days ago", msg: "Exercise session missed", icon: Clock, color: "text-blue-500" }
                ].map((alert, i) => (
                  <div key={i} className="flex gap-4 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <alert.icon className={`w-5 h-5 ${alert.color}`} />
                    <div>
                      <p className="text-sm font-bold text-gray-700">{alert.msg}</p>
                      <p className="text-xs text-gray-400">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-800 text-white border-none">
              <CardHeader>
                <CardTitle className="text-lg">Care Team</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black font-bold">DR</div>
                  <div>
                    <p className="text-sm font-bold">Dr. Sarah Thompson</p>
                    <p className="text-xs text-gray-400">Primary Neurologist</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">JD</div>
                  <div>
                    <p className="text-sm font-bold">John Doe</p>
                    <p className="text-xs text-gray-400">Primary Caregiver</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
