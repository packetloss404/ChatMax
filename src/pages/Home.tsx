import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, Brain, MessageCircle, ArrowRight } from "lucide-react";
import Logo from "../components/logo";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-6">
              <Logo size={96} className="drop-shadow-lg" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
              ChatMax
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-2">
              Powered by MiniMax M2.7
            </p>
            <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
              Experience lightning-fast AI conversations with cutting-edge language intelligence
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="Fast"
              description="Lightning-quick responses powered by MiniMax M2.7 highspeed model"
            />
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="Smart"
              description="Advanced reasoning and context understanding for meaningful conversations"
            />
            <FeatureCard
              icon={<MessageCircle className="w-6 h-6" />}
              title="Easy"
              description="Intuitive interface designed for seamless chat experiences"
            />
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onClick={() => navigate("/chat")}
            className="btn-primary text-lg px-8 py-3 inline-flex items-center gap-2"
          >
            Start Chatting
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card text-card-foreground">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 mx-auto text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
