import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Leaf, 
  ShoppingCart, 
  Users, 
  Sparkles, 
  Package, 
  BarChart3,
  LogOut,
  Settings,
  Plus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// 🔹 Imports for chatbot modal
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Profile {
  id: string;
  name: string;
  email: string;
  user_type: "buyer" | "seller";
  avatar_url?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Chatbot states
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [userInput, setUserInput] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate("/auth");
          return;
        }

        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile");
          return;
        }

        setProfile(profileData);
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred");
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success("Signed out successfully");
      setMessages([]); // clear chat when logging out
      navigate("/");
    }
  };

  // 🔹 Send message to Hugging Face API
  async function sendMessage() {
  if (!userInput.trim()) return;

  const newMessage = { sender: "You", text: userInput };
  setMessages(prev => [...prev, newMessage]);
  setUserInput("");

  try {
    const res = await fetch(
  "https://api-inference.huggingface.co/models/google/flan-t5-large",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: userInput }),
  }
);

    const data = await res.json();

    if (data.error) {
      setMessages(prev => [...prev, { sender: "Bot", text: `Error: ${data.error}` }]);
      return;
    }

    const botReply =
      data?.[0]?.generated_text?.slice(userInput.length).trim() ||
      "Sorry, I didn’t get that.";

    setMessages(prev => [...prev, { sender: "Bot", text: botReply }]);
  } catch (err) {
    setMessages(prev => [...prev, { sender: "Bot", text: "Error connecting to AI." }]);
  }
}

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-organic flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-organic flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>Unable to load your profile information.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/auth")} variant="hero" className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isseller = profile.user_type === "seller";

  return (
    <div className="min-h-screen bg-gradient-organic">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">Nutricart</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={profile.avatar_url} />
                <AvatarFallback>{profile.name?.charAt(0)?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="font-medium">{profile.name}</p>
                <Badge variant={isseller ? "default" : "secondary"}>
                  {isseller ? "Seller" : "User"}
                </Badge>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {profile.name}!
          </h2>
          <p className="text-muted-foreground">
            {isseller ? "Manage your products and track your sales" : "Discover fresh products and plan your nutrition"}
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isseller ? (
            <>
              {/* Seller cards unchanged */}
              <Card className="shadow-soft hover:shadow-glow transition-smooth cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" />
                      My Products
                    </CardTitle>
                    <Button size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <CardDescription>Products listed</CardDescription>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-glow transition-smooth cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Sales Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$0</div>
                  <CardDescription>Total revenue this month</CardDescription>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-glow transition-smooth cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <CardDescription>Pending orders</CardDescription>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              {/* Buyer cards */}
              <Card className="shadow-soft hover:shadow-glow transition-smooth cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                      Grocery Plans
                    </CardTitle>
                    <Button size="sm" variant="outline" onClick={() => navigate("/create-plan")}>
                      <Plus className="h-4 w-4 mr-1" />
                      Create
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <CardDescription>Active meal plans</CardDescription>
                </CardContent>
              </Card>

              <Card className="shadow-soft hover:shadow-glow transition-smooth cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Marketplace
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Browse</div>
                  <CardDescription>Discover fresh products</CardDescription>
                </CardContent>
              </Card>

              {/* 🔹 AI Assistant Card (click opens chatbot) */}
              <Card 
                className="shadow-soft hover:shadow-glow transition-smooth cursor-pointer"
                onClick={() => setChatOpen(true)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Assistant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Chat</div>
                  <CardDescription>Get nutrition advice</CardDescription>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              {isseller ? "Manage your business efficiently" : "Start your nutrition journey"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {isseller ? (
                <>
                  <Button variant="hero">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                  <Button variant="organic">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button variant="outline">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="hero">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Create Grocery Plan
                  </Button>
                  <Button variant="organic">
                    <Package className="mr-2 h-4 w-4" />
                    Browse Marketplace
                  </Button>
                  <Button variant="outline" onClick={() => setChatOpen(true)}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Ask AI Assistant
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 🔹 Chatbot Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>AI Assistant</DialogTitle>
          </DialogHeader>

          <div className="h-64 overflow-y-auto border p-2 rounded-md space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg ${
                  msg.sender === "You"
                    ? "bg-blue-100 text-right"
                    : "bg-gray-100 text-left"
                }`}
              >
                <b>{msg.sender}: </b>
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex gap-2 mt-2">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Type your message..."
            />
            <Button onClick={sendMessage}>Send</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
