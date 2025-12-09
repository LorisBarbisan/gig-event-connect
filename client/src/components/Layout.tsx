import { FeedbackForm } from "@/components/FeedbackForm";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onFeedbackClick={() => setShowFeedback(true)} />

      <main className="flex-1">{children}</main>

      <Footer />

      {/* Feedback Modal */}
      <FeedbackForm open={showFeedback} onOpenChange={setShowFeedback} />
    </div>
  );
};
