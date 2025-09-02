import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Leaf, ShoppingCart, Users, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-nutrition.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-organic">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Nutricart</h1>
          </div>
          <Link to="/auth">
            <Button variant="outline">Login</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl lg:text-6xl font-bold leading-tight">
              Your Smart
              <span className="text-primary block">Nutrition</span>
              Marketplace
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Connect with local sellers, create personalized grocery plans, and get AI-powered nutrition guidance for a healthier lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/auth?type=user">
                <Button variant="hero" size="lg" className="w-full sm:w-auto">
                  Join as User <ArrowRight className="ml-2" />
                </Button>
              </Link>
              <Link to="/auth?type=seller">
                <Button variant="organic" size="lg" className="w-full sm:w-auto">
                  Join as Seller <Users className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <img 
              src={heroImage} 
              alt="Fresh organic vegetables and healthy foods" 
              className="rounded-2xl shadow-glow w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Why Choose Nutricart?</h3>
          <p className="text-muted-foreground text-lg">Everything you need for a healthier lifestyle in one place</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-soft hover:shadow-glow transition-smooth">
            <CardHeader>
              <ShoppingCart className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Smart Grocery Planning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Create personalized grocery plans based on your dietary preferences and nutritional goals.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-glow transition-smooth">
            <CardHeader>
              <Sparkles className="h-12 w-12 text-primary mb-4" />
              <CardTitle>AI Nutrition Assistant</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Get personalized nutrition advice and meal suggestions powered by advanced AI.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-glow transition-smooth">
            <CardHeader>
              <Users className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Local Marketplace</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Connect with trusted local sellers offering fresh, organic, and specialty food items.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <p className="text-muted-foreground">© 2024 Nutricart. Nourishing communities, one meal at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;