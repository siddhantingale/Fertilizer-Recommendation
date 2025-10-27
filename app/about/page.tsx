import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Target, Lightbulb, TrendingUp, Users } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="mb-8 space-y-4">
          <h1 className="text-4xl font-bold text-balance">About FertilizerPro</h1>
          <p className="text-xl text-muted-foreground text-pretty leading-relaxed">
            Empowering sugarcane farmers with data-driven fertilizer recommendations for optimal crop yield and
            sustainable farming practices.
          </p>
        </div>

        {/* Mission */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-foreground/90 leading-relaxed">
            <p>
              FertilizerPro is designed to help sugarcane farmers make informed decisions about fertilizer application
              based on scientific soil analysis and environmental factors. By providing personalized recommendations, we
              aim to optimize crop yields while promoting sustainable agricultural practices.
            </p>
            <p>
              Our rule-based recommendation system analyzes key soil parameters including Nitrogen (N), Phosphorus (P),
              Potassium (K) levels, and pH balance to suggest the most appropriate fertilizers for your specific
              conditions.
            </p>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-secondary" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Input Your Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter soil test results including N-P-K values, pH level, soil type, and environmental conditions
                    like temperature and rainfall.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-secondary text-secondary-foreground w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Analysis & Processing</h3>
                  <p className="text-sm text-muted-foreground">
                    Our system applies rule-based logic to identify nutrient deficiencies and environmental factors
                    affecting your sugarcane crop.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-accent text-accent-foreground w-8 h-8 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Get Recommendations</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive top 3-4 fertilizer recommendations with detailed explanations and NPK composition
                    comparisons.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Future Scope */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-accent" />
              Future Scope
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-foreground/90">
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Integration with machine learning models for more accurate predictions</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Real-time weather data integration for dynamic recommendations</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Historical data tracking to monitor soil health over time</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Mobile app for on-field soil testing and instant recommendations</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Community features for farmers to share insights and best practices</span>
              </li>
              <li className="flex gap-2">
                <span className="text-primary">•</span>
                <span>Integration with local fertilizer suppliers for easy procurement</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Who We Serve */}
        <Card className="mb-8 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Who We Serve
            </CardTitle>
          </CardHeader>
          <CardContent className="text-foreground/90 leading-relaxed">
            <p>
              FertilizerPro is built for sugarcane farmers, agricultural consultants, and farming cooperatives who want
              to optimize their fertilizer usage based on scientific data. Whether you're managing a small family farm
              or overseeing large-scale commercial operations, our tool provides actionable insights to improve crop
              health and maximize yields.
            </p>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <Link href="/input">
            <Button size="lg" className="shadow-lg">
              Try FertilizerPro Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
