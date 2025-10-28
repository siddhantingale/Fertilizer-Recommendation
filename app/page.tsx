"use client"

import Link from "next/link"
import { LandingHeader } from "@/components/landing-header"
import { LandingFooter } from "@/components/landing-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sprout, Droplets, Calculator, Cloud, CheckCircle2, ArrowRight } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export default function HomePage() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 py-16 sm:py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sprout className="w-4 h-4" />
              {t("landing.smartAg")}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-balance">
              {t("landing.heroTitle")}
            </h1>

            <p className="text-lg sm:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              {t("landing.heroDesc")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/auth/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full text-base h-12 px-8">
                  {t("landing.getStarted")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/about" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full text-base h-12 px-8 bg-transparent">
                  {t("landing.learnMore")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-20 h-20 bg-green-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl" />
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{t("landing.featuresTitle")}</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">{t("landing.featuresDesc")}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Droplets,
                title: t("landing.feature1Title"),
                description: t("landing.feature1Desc"),
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Cloud,
                title: t("landing.feature2Title"),
                description: t("landing.feature2Desc"),
                gradient: "from-cyan-500 to-teal-500",
              },
              {
                icon: Calculator,
                title: t("landing.feature3Title"),
                description: t("landing.feature3Desc"),
                gradient: "from-green-500 to-emerald-500",
              },
              {
                icon: Sprout,
                title: t("landing.feature4Title"),
                description: t("landing.feature4Desc"),
                gradient: "from-emerald-500 to-green-600",
              },
            ].map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-xl group">
                <CardContent className="p-6 text-center space-y-4">
                  <div
                    className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">{t("landing.whyTitle")}</h2>
              <p className="text-lg sm:text-xl text-muted-foreground">{t("landing.whyDesc")}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-12">
              {[
                { value: "30%", label: t("landing.stat1") },
                { value: "25%", label: t("landing.stat2") },
                { value: "10K+", label: t("landing.stat3") },
                { value: "50K+", label: t("landing.stat4") },
              ].map((stat, index) => (
                <Card key={index} className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                  <CardContent className="p-6 sm:p-8 text-center">
                    <div className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-2">{stat.value}</div>
                    <div className="text-base sm:text-lg text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-2">
              <CardContent className="p-6 sm:p-8">
                <ul className="grid sm:grid-cols-2 gap-4">
                  {[
                    t("landing.benefit1"),
                    t("landing.benefit2"),
                    t("landing.benefit3"),
                    t("landing.benefit4"),
                    t("landing.benefit5"),
                    t("landing.benefit6"),
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-base">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-primary/10 via-background to-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">{t("landing.ctaTitle")}</h2>
            <p className="text-lg sm:text-xl text-muted-foreground">{t("landing.ctaDesc")}</p>
            <Link href="/auth/signup" className="inline-block">
              <Button size="lg" className="text-base h-12 px-8">
                {t("landing.ctaButton")}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}
