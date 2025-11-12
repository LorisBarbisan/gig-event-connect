import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Home, Search } from "lucide-react";
import { Layout } from "@/components/Layout";

const NotFound = () => {
  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="space-y-4">
            <div className="text-8xl font-bold text-primary">404</div>
            <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-gradient-primary hover:bg-primary-hover">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/jobs">
                <Search className="w-4 h-4 mr-2" />
                Browse Jobs
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
