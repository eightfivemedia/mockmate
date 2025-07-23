'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Header } from '@/components/landing/header';
import {
  Star,
  Users,
  Target,
  Clock,
  Check,
  ArrowRight,
  Play,
  MessageSquare,
  BarChart3,
  Brain,
  Mic,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export function LandingPage() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <Header isDark={isDark} toggleTheme={toggleTheme} />

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-4 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container max-w-6xl mx-auto text-center">
          <Badge className="mb-8 bg-white/80 backdrop-blur-sm text-purple-700 border-purple-200 shadow-sm">
            AI-Powered Interview Preparation
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-8">
            <span className="text-gray-900 dark:text-white">Ace your next interview with</span>
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent block mt-2">AI-powered practice</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Practice realistic interviews, get instant AI feedback, and build confidence with personalized coaching tailored to your role and experience level.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link href="/auth/signup">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-700 hover:bg-white hover:border-gray-300 text-lg px-10 py-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400 mb-16">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              Cancel anytime
            </div>
          </div>

          {/* Product Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 md:p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 rounded-3xl"></div>
              <div className="relative">
                {/* Mock browser window */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden shadow-inner">
                  <div className="flex items-center gap-2 px-4 py-3 bg-gray-200 dark:bg-gray-700">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    <div className="ml-4 text-xs text-gray-500 dark:text-gray-400 cursor-default">mockmate.com/interview</div>
                  </div>
                  <div className="p-8 bg-white dark:bg-gray-900">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white cursor-default">Interview Question</h3>
                        <Badge className="bg-blue-100 hover:bg-blue-100 text-blue-700 cursor-default">Technical</Badge>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                        <p className="text-gray-700 dark:text-gray-300 cursor-default">Tell me about a challenging project you worked on and how you approached solving the technical problems.</p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Mic className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 cursor-default">Recording your response...</span>
                        </div>
                        <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 cursor-default">AI is analyzing your response for feedback...</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to
              <span className="gradient-text block">Succeed</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive interview preparation tools designed to help you land your dream job
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">AI-Powered Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Get personalized interview questions based on your role, experience level, and industry standards.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-green-500" />
                </div>
                <CardTitle className="text-xl">Real-time Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Receive instant, detailed feedback on your answers with suggestions for improvement.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-500" />
                </div>
                <CardTitle className="text-xl">Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Monitor your improvement over time with detailed analytics and performance metrics.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by
              <span className="gradient-text"> Thousands</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how InterviewAce has helped professionals land their dream jobs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Software Engineer at Google",
                content: "InterviewAce helped me prepare for my Google interview. The AI feedback was incredibly detailed and helped me improve my technical communication skills.",
                rating: 5
              },
              {
                name: "Michael Rodriguez",
                role: "Product Manager at Meta",
                content: "The platform's behavioral questions were spot-on. I felt completely prepared for my Meta interview and got the offer!",
                rating: 5
              },
              {
                name: "Emily Johnson",
                role: "Data Scientist at Netflix",
                content: "Amazing platform! The personalized questions based on my experience level made all the difference in my interview performance.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card key={index} className="card-hover border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription className="text-sm text-primary font-medium">
                    {testimonial.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    &quot;{testimonial.content}&quot;
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-muted/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Simple,
              <span className="gradient-text"> Transparent</span> Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your needs. Start free, upgrade when you&apos;re ready.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <Card className="card-hover border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Starter</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
                <div className="text-4xl font-bold mt-4">Free</div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">5 mock interviews/month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Basic AI feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Common interview questions</span>
                  </div>
                </div>
                <Button className="w-full btn-secondary">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-md border-primary/20 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-xl">Professional</CardTitle>
                <CardDescription>Best for job seekers</CardDescription>
                <div className="text-4xl font-bold mt-4">$29<span className="text-lg font-normal">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Unlimited mock interviews</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Advanced AI feedback</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Role-specific questions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Progress tracking</span>
                  </div>
                </div>
                <Button className="w-full btn-primary">Start Free Trial</Button>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">Enterprise</CardTitle>
                <CardDescription>For teams and organizations</CardDescription>
                <div className="text-4xl font-bold mt-4">$99<span className="text-lg font-normal">/month</span></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Everything in Professional</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Team management</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Custom question sets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Priority support</span>
                  </div>
                </div>
                <Button className="w-full btn-secondary">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Frequently Asked
              <span className="gradient-text"> Questions</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about InterviewAce
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border rounded-xl px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                How does the AI feedback work?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Our AI analyzes your responses based on industry standards, communication clarity, technical accuracy, and presentation skills. It provides detailed feedback with specific suggestions for improvement.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border rounded-xl px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                Can I practice for specific roles?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! InterviewAce offers role-specific question sets for software engineering, product management, data science, marketing, sales, and many other positions across various industries.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border rounded-xl px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                Is there a mobile app?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Currently, InterviewAce is available as a web application that works perfectly on mobile browsers. A dedicated mobile app is in development and will be available soon.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border rounded-xl px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                How accurate is the AI feedback?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Our AI is trained on thousands of successful interview responses and is constantly improving. While it provides valuable insights, we recommend combining it with human feedback for the best results.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Ace Your
            <span className="gradient-text block">Next Interview?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have landed their dream jobs with InterviewAce
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="btn-primary text-lg px-8 py-4">
              Start Your Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t">
        <div className="container max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4 ml-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold gradient-text">MockMate</span>
              </div>
              <p className="text-muted-foreground">
                AI-powered mock interview platform helping professionals land their dream jobs.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <div className="space-y-2">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Features</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Pricing</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">API</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">About</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Blog</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Careers</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2">
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Help Center</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Contact</a>
                <a href="#" className="block text-muted-foreground hover:text-primary transition-colors">Privacy</a>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © 2024 MockMate. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}