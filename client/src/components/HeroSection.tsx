import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Briefcase, Star, MapPin, Clock } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Hero Content */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                <Star className="w-3 h-3 mr-1" />
                Trusted by 500+ companies
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Connect with 
                <span className="bg-gradient-hero bg-clip-text text-transparent"> Technical Crew</span> for Events
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                The premier platform connecting freelance technical professionals with event companies. 
                Find your next gig or hire skilled crew for conferences, exhibitions, and corporate events.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-gradient-primary hover:bg-primary-hover text-lg px-8">
                Find Jobs
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button variant="outline" size="lg" className="text-lg px-8">
                Hire Crew
                <Users className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">2,500+</div>
                <div className="text-sm text-muted-foreground">Active Freelancers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1,200+</div>
                <div className="text-sm text-muted-foreground">Jobs Posted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </div>
            </div>
          </div>

          {/* Right Column - Image & Cards */}
          <div className="relative animate-scale-in">
            <div className="relative rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={heroImage} 
                alt="Technical crew setting up AV equipment at corporate event"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Floating Job Cards */}
            <Card className="absolute -top-4 -left-4 p-4 shadow-lg bg-card/95 backdrop-blur-sm animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-success-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Audio Engineer</div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    London • £350/day
                  </div>
                </div>
              </div>
            </Card>

            <Card className="absolute -bottom-4 -right-4 p-4 shadow-lg bg-card/95 backdrop-blur-sm animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Lighting Tech</div>
                  <div className="text-xs text-muted-foreground flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    Manchester • 2 days
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-accent opacity-5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-primary opacity-5 rounded-full blur-3xl" />
      </div>
    </section>
  );
};