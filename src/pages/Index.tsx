import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { BookOpen, Sparkles, CheckCircle, Layers, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl hero-gradient">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-serif font-bold">Hobbyiist</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button variant="hero">Get Started</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight">
            Your Personal
            <span className="text-gradient"> Learning </span>
            Curriculum
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Organize all your learning materials in one place. Track progress across 
            languages, instruments, programming, and anything else you want to master.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/signup">
              <Button variant="hero" size="lg" className="text-lg px-8">
                Start Learning Free
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
              <Layers className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-3">Organize by Level</h3>
            <p className="text-muted-foreground">
              Structure your curriculum with beginner, intermediate, and advanced tabs 
              for each subject you're learning.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-3">Track Progress</h3>
            <p className="text-muted-foreground">
              Mark lessons complete, see your progress at a glance, and celebrate 
              your achievements as you learn.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-serif font-semibold mb-3">AI Assistant</h3>
            <p className="text-muted-foreground">
              Get help from your personal AI tutor. Ask questions, get explanations, 
              and accelerate your learning journey.
            </p>
          </div>
        </div>

        {/* Example Use Cases */}
        <div className="mt-24 text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h2 className="text-3xl font-serif font-bold mb-4">Learn Anything</h2>
          <p className="text-muted-foreground mb-8">
            From languages to music to coding - organize all your learning in one place
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {['🇯🇵 Japanese', '🎸 Guitar', '💻 Python', '🎹 Piano', '📷 Photography', '🌍 Spanish', '✍️ Writing', '🧪 Chemistry'].map((item) => (
              <span 
                key={item}
                className="px-4 py-2 rounded-full bg-muted text-sm font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-16 border-t">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Hobbyiist</span>
          </div>
          <p>Your personal learning companion</p>
        </div>
      </footer>
    </div>
  );
}
