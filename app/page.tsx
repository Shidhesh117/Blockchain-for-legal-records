'use client'

import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Shield,
  Lock,
  FileCheck,
  Clock,
  Database,
  CheckCircle,
  ArrowRight,
  Fingerprint,
  Globe,
  Scale,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Lock,
    title: 'Immutable Records',
    description: 'Once registered, documents cannot be altered or tampered with.',
  },
  {
    icon: FileCheck,
    title: 'Instant Verification',
    description: 'Verify any document in seconds, not days or weeks.',
  },
  {
    icon: Database,
    title: 'Secure Storage',
    description: 'Cryptographic hashes stored on blockchain, files in encrypted vault.',
  },
  {
    icon: Fingerprint,
    title: 'Unique Fingerprint',
    description: 'Every document gets a unique SHA-256 hash for identification.',
  },
  {
    icon: Clock,
    title: 'Version History',
    description: 'Complete audit trail with full version history.',
  },
  {
    icon: Scale,
    title: 'Legal Compliance',
    description: 'Aligned with SDG-16 for justice and strong institutions.',
  },
]

const STATS = [
  { value: '100%', label: 'Tamper Proof' },
  { value: '<3s', label: 'Verification Time' },
  { value: '256-bit', label: 'Encryption' },
  { value: '24/7', label: 'Availability' },
]

const STEPS = [
  {
    step: '01',
    title: 'Upload Document',
    description: 'Upload your legal document to our secure platform.',
  },
  {
    step: '02',
    title: 'Generate Hash',
    description: 'We create a unique cryptographic fingerprint of your document.',
  },
  {
    step: '03',
    title: 'Store on Blockchain',
    description: 'The hash is permanently recorded on the blockchain.',
  },
  {
    step: '04',
    title: 'Verify Anytime',
    description: 'Anyone can verify document authenticity instantly.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="container relative mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm">
              <Globe className="h-4 w-4 text-primary" />
              <span>Aligned with UN SDG-16: Peace, Justice & Strong Institutions</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-balance">Secure Your Legal Documents on </span>
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Blockchain
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
              A tamper-proof digital vault for legal records. Upload, store, and verify documents
              with blockchain-backed security. Say goodbye to fraud and delays.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/verify">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Shield className="mr-2 h-4 w-4" />
                  Verify a Document
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            The Problem with Traditional Systems
          </h2>
          <p className="mt-4 text-muted-foreground">
            Legal documents stored in centralized databases or physical files face serious challenges.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-3">
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
                <span className="text-xl font-bold text-destructive">X</span>
              </div>
              <h3 className="font-semibold">Tampering Risk</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Documents can be altered, forged, or manipulated without detection.
              </p>
            </CardContent>
          </Card>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
                <span className="text-xl font-bold text-destructive">X</span>
              </div>
              <h3 className="font-semibold">Loss & Damage</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Physical files can be lost, damaged, or destroyed permanently.
              </p>
            </CardContent>
          </Card>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20">
                <span className="text-xl font-bold text-destructive">X</span>
              </div>
              <h3 className="font-semibold">Slow Verification</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Manual verification takes days or weeks across institutions.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Solution Section */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Our Blockchain Solution
            </h2>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              We store the cryptographic hash of your document on the blockchain, ensuring security,
              scalability, and privacy. The actual file is stored in our encrypted vault.
            </p>
          </div>

          {/* How it Works */}
          <div className="mx-auto mt-16 max-w-4xl">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, index) => (
                <div key={step.step} className="relative">
                  {index < STEPS.length - 1 && (
                    <div className="absolute left-1/2 top-8 hidden h-0.5 w-full bg-border lg:block" />
                  )}
                  <div className="relative text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-primary-foreground">
                      {step.step}
                    </div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Why Choose eVault?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built with security, transparency, and efficiency at its core.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="border-border bg-card">
              <CardContent className="py-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section className="border-y border-border bg-card">
        <div className="container mx-auto px-4 py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for Real-World Impact
            </h2>
            <p className="mt-4 text-muted-foreground">
              Secure verification for critical legal documents across sectors.
            </p>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '🏠', label: 'Property Deeds', desc: 'Land & real estate records' },
              { icon: '⚖️', label: 'Court Orders', desc: 'Judgments & legal rulings' },
              { icon: '📝', label: 'Affidavits', desc: 'Sworn statements & declarations' },
              { icon: '🪪', label: 'Identity Docs', desc: 'Certificates & ID proofs' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border bg-background p-6 text-center"
              >
                <span className="text-4xl">{item.icon}</span>
                <h3 className="mt-4 font-semibold">{item.label}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <Card className="mx-auto max-w-4xl border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Secure Your Documents?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Join thousands of users who trust eVault for their legal document security.
              Get started for free today.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/signup">
                <Button size="lg">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/verify">
                <Button size="lg" variant="outline">
                  Try Verification
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Shield className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold">eVault</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Blockchain-based Legal Document Verification System
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>SDG-16 Aligned</span>
              <span>|</span>
              <span>Hackathon Project 2024</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
