import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Users, Briefcase } from "lucide-react";
import e8Logo from "@assets/E8 LOGO_1756038316799.png";

const Index = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <img 
              src={e8Logo} 
              alt="E8 Logo" 
              className="w-24 h-24 drop-shadow-lg"
            />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
            Welcome to <span className="text-primary">E8</span>
          </h1>
          
          {/* Description */}
          <p className="text-xl text-muted-foreground leading-relaxed">
            The premier platform connecting event industry professionals with companies worldwide.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg px-8" asChild>
              <Link to="/auth">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
            
            <Button variant="outline" size="lg" className="text-lg px-8" asChild>
              <Link to="/jobs">
                Browse Jobs
                <Briefcase className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Simple Footer Links */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16 border-t">
            <div>
              <h3 className="font-semibold mb-3">For Freelancers</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Browse Jobs</li>
                <li>Create Profile</li>
                <li>Sign Up</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">For Companies</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Find Crew</li>
                <li>Post a Job</li>
                <li>Get Started</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
