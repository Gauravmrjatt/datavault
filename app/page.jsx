'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import {
  CloudUpload,
  FolderGit2,
  ShieldCheck,
  Workflow,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  FileCode,
  CheckCircle2,
  Lock,
  Zap,
  Share2
} from 'lucide-react';
import { GaiaCard, GaiaButton } from '@/components/gaia/primitives';
import DomeGallery from '@/components/DomeGallery';
export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div ref={containerRef} className="relative min-h-screen bg-[hsl(var(--gaia-bg))] overflow-x-hidden selection:bg-[hsl(var(--gaia-accent)/0.3)]">
      {/* Dynamic Background */}
    
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[hsl(var(--gaia-accent)/0.05)] blur-[120px]" />
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-blue-500/0.05 blur-[100px]" />
      </div>

      <Navbar />

      <main className="relative z-10">
        <Hero scrollYProgress={scrollYProgress} />
          <DomeGallery
        fit={0.8}
        minRadius={600}
        maxVerticalRotationDeg={0}
        segments={34}
        dragDampening={2}
        grayscale
      />
        <Features />
        <UploadPreview />
        <SecuritySection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
    >
      <div className="w-full max-w-5xl flex items-center justify-between rounded-2xl border border-[hsl(var(--gaia-border))] bg-[hsl(var(--gaia-panel)/0.8)] backdrop-blur-md px-6 py-3 shadow-sm pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--gaia-accent))] flex items-center justify-center">
            <Lock className="text-white w-5 h-5" />
          </div>
          <p className="font-[var(--font-space)] text-lg font-bold tracking-tight">Data Vault</p>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[hsl(var(--gaia-muted))]">
          <Link href="#features" className="hover:text-[hsl(var(--gaia-text))] transition-colors">Features</Link>
          <Link href="#security" className="hover:text-[hsl(var(--gaia-text))] transition-colors">Security</Link>
          <Link href="#pricing" className="hover:text-[hsl(var(--gaia-text))] transition-colors">Pricing</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="text-sm font-medium hover:text-[hsl(var(--gaia-accent))] transition-colors">
            Sign in
          </Link>
          <Link href="/auth/register">
            <GaiaButton className="h-9 px-4">Get Started</GaiaButton>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}

function Hero({ scrollYProgress }) {
  const y = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  // Parallax for the dashboard image
  const dashboardY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);
  const dashboardRotateX = useTransform(scrollYProgress, [0, 0.5], [0, 5]);

  return (
    <section className="relative pt-44 pb-24 px-4 flex flex-col items-center justify-center text-center overflow-hidden">
      <motion.div style={{ y, opacity, scale }} className="max-w-4xl mx-auto relative z-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--gaia-soft))] border border-[hsl(var(--gaia-border))] text-xs font-semibold text-[hsl(var(--gaia-accent))] mb-8"
        >
          <Zap className="w-3 h-3 fill-current" />
          <span>Next-gen Storage Infrastructure</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="font-[var(--font-space)] text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8"
        >
          Google Drive grade UX. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--gaia-accent))] to-blue-500">
            Telegram grade storage.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-lg md:text-xl text-[hsl(var(--gaia-muted))] max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Datavault leverages Telegram's massive infrastructure to provide unlimited, encrypted, and resilient storage with a premium interface.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/dashboard">
            <GaiaButton className="h-12 px-8 text-base rounded-2xl group">
              Launch App
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </GaiaButton>
          </Link>
          <GaiaButton variant="ghost" className="h-12 px-8 text-base rounded-2xl">
            View Source
          </GaiaButton>
        </motion.div>
      </motion.div>

      {/* Hero Visual */}
      <div className="mt-20 w-full max-w-5xl relative perspective-1000">
        <motion.div
          style={{
            y: dashboardY,
            rotateX: dashboardRotateX,
          }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
          className="rounded-[2.5rem] border border-[hsl(var(--gaia-border))] bg-[hsl(var(--gaia-panel))] p-4 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden"
        >
          <div className="relative aspect-[16/10] bg-[hsl(var(--gaia-surface))] rounded-[1.5rem] overflow-hidden border border-[hsl(var(--gaia-border))]">
            <MockDashboard />
          </div>
        </motion.div>

        {/* Floating Elements for Parallax */}
        <FloatingElement delay={0} className="top-10 -left-16">
          <FileCard icon={FileText} name="Resume.pdf" size="1.2 MB" color="text-blue-500" />
        </FloatingElement>
        <FloatingElement delay={0.2} className="bottom-20 -right-12">
          <FileCard icon={ImageIcon} name="Vacation.jpg" size="4.5 MB" color="text-purple-500" />
        </FloatingElement>
        <FloatingElement delay={0.4} className="top-40 -right-20">
          <FileCard icon={FileCode} name="api.ts" size="12 KB" color="text-orange-500" />
        </FloatingElement>
      </div>
    </section>
  );
}

function FloatingElement({ children, className, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.8 }}
      className={`absolute hidden lg:block z-20 ${className}`}
    >
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotate: [0, 2, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function FileCard({ icon: Icon, name, size, color }) {
  return (
    <div className="bg-[hsl(var(--gaia-panel))] border border-[hsl(var(--gaia-border))] p-4 rounded-2xl shadow-xl flex items-center gap-3 min-w-[200px] backdrop-blur-sm">
      <div className={`p-2 rounded-xl bg-[hsl(var(--gaia-soft))] ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-bold truncate">{name}</p>
        <p className="text-[10px] text-[hsl(var(--gaia-muted))] uppercase font-bold tracking-wider">{size}</p>
      </div>
    </div>
  );
}

function MockDashboard() {
  return (
    <div className="p-6 h-full flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-[hsl(var(--gaia-border))] pb-6">
        <div className="flex gap-4">
          {[1, 2, 3].map(i => <div key={i} className="w-12 h-3 rounded-full bg-[hsl(var(--gaia-soft))]" />)}
        </div>
        <div className="w-8 h-8 rounded-full bg-[hsl(var(--gaia-soft))]" />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl border border-[hsl(var(--gaia-border))] bg-[hsl(var(--gaia-panel)/0.5)] animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }} />
        ))}
      </div>
      <div className="mt-auto flex items-center gap-4">
        <div className="flex-1 h-2 bg-[hsl(var(--gaia-soft))] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "65%" }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            className="h-full bg-[hsl(var(--gaia-accent))]"
          />
        </div>
        <div className="w-20 h-3 rounded-full bg-[hsl(var(--gaia-soft))]" />
      </div>
    </div>
  );
}

function Features() {
  const features = [
    {
      icon: CloudUpload,
      title: "Chunked Uploads",
      description: "Files are split into chunks for maximum reliability. Pause and resume anytime without data loss.",
      color: "blue"
    },
    {
      icon: FolderGit2,
      title: "Infinite Nesting",
      description: "Organize your data exactly how you want with powerful folder management and fast traversal.",
      color: "purple"
    },
    {
      icon: Workflow,
      title: "Auto-Reconstruction",
      description: "Lost your database? Reconstruction engine can rebuild your file structure from Telegram data.",
      color: "orange"
    },
    {
      icon: ShieldCheck,
      title: "Secure Sharing",
      description: "Generate signed URLs with expiry dates. Share your files securely with anyone in the world.",
      color: "emerald"
    }
  ];

  return (
    <section id="features" className="py-24 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-bold font-[var(--font-space)] mb-4">Everything you need</h2>
        <p className="text-[hsl(var(--gaia-muted))] max-w-2xl mx-auto">Built for reliability, speed, and massive scale.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <GaiaCard className="h-full group hover:border-[hsl(var(--gaia-accent))] transition-colors p-8">
              <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--gaia-soft))] flex items-center justify-center mb-6 text-[hsl(var(--gaia-accent))] group-hover:scale-110 transition-transform">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-[var(--font-space)] mb-3">{f.title}</h3>
              <p className="text-sm text-[hsl(var(--gaia-muted))] leading-relaxed">{f.description}</p>
            </GaiaCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function UploadPreview() {
  const [progress, setProgress] = React.useState(0);
  const [status, setStatus] = React.useState('uploading');

  React.useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setStatus('complete');
          setTimeout(() => {
            setProgress(0);
            setStatus('uploading');
          }, 2000);
          return 100;
        }
        return prev + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-24 bg-[hsl(var(--gaia-panel)/0.3)] border-y border-[hsl(var(--gaia-border))]">
      <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl font-bold font-[var(--font-space)] mb-6">Designed for massive files</h2>
          <p className="text-lg text-[hsl(var(--gaia-muted))] mb-8 leading-relaxed">
            Our chunked upload manager handles Telegram's 429 windows automatically.
            Upload files of any size with retry logic and API backoff built-in.
          </p>
          <ul className="space-y-4">
            {[
              "Resume failed uploads automatically",
              "Multi-part parallel processing",
              "Client-side encryption before transfer",
              "Real-time progress indicators"
            ].map((text, i) => (
              <li key={i} className="flex items-center gap-3 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative">
          <GaiaCard className="p-8 bg-[hsl(var(--gaia-panel))] relative z-10 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <CloudUpload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold">4K_Production_Render.mp4</p>
                  <p className="text-[10px] text-[hsl(var(--gaia-muted))] font-bold uppercase">2.4 GB • Chunked Upload</p>
                </div>
              </div>
              <div className="text-sm font-bold text-[hsl(var(--gaia-accent))]">{progress}%</div>
            </div>

            <div className="space-y-6">
              <div className="h-3 w-full bg-[hsl(var(--gaia-soft))] rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-[hsl(var(--gaia-accent))]"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="grid grid-cols-6 gap-2">
                {[...Array(12)].map((_, i) => {
                  const isActive = (i / 12) * 100 < progress;
                  const isCurrent = Math.floor((progress / 100) * 12) === i;
                  return (
                    <motion.div
                      key={i}
                      animate={isCurrent ? { scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                      className={`h-1.5 rounded-full transition-colors duration-300 ${isActive ? 'bg-[hsl(var(--gaia-accent))]' : 'bg-[hsl(var(--gaia-soft))]'}`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-[hsl(var(--gaia-muted))] uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${status === 'uploading' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  {status === 'uploading' ? 'Uploading Chunks...' : 'Upload Complete'}
                </div>
                <div>{status === 'uploading' ? '12.4 MB/s' : 'Verified'}</div>
              </div>
            </div>
          </GaiaCard>

          {/* Decorative circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-[hsl(var(--gaia-border))] rounded-full opacity-20 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] border border-[hsl(var(--gaia-border))] rounded-full opacity-10 pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

function SecuritySection() {
  return (
    <section id="security" className="py-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          <div className="lg:w-1/2 relative">
            <motion.div
              initial={{ rotate: -5, scale: 0.9 }}
              whileInView={{ rotate: 0, scale: 1 }}
              viewport={{ once: true }}
              className="relative z-10"
            >
              <GaiaCard className="p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl">
                <Lock className="w-12 h-12 text-blue-400 mb-8" />
                <h3 className="text-2xl font-bold mb-4 font-[var(--font-space)]">Enterprise-Grade Security</h3>
                <p className="text-slate-400 mb-8 leading-relaxed">
                  Your files are encrypted before they even leave your browser. Telegram acts as a storage layer, but only you hold the keys to your data.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: ShieldCheck, text: "End-to-end encryption" },
                    { icon: Share2, text: "Signed, temporary share links" },
                    { icon: CheckCircle2, text: "Automatic chunk integrity checks" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-blue-400" />
                      <span className="text-sm font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
              </GaiaCard>
            </motion.div>

            {/* Glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
          </div>

          <div className="lg:w-1/2">
            <h2 className="text-4xl font-bold font-[var(--font-space)] mb-6">Unstoppable Infrastructure</h2>
            <p className="text-lg text-[hsl(var(--gaia-muted))] leading-relaxed mb-8">
              By distributing data across Telegram's global network, Datavault provides levels of durability and availability that traditional storage providers can't match.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-2xl bg-[hsl(var(--gaia-soft))] border border-[hsl(var(--gaia-border))]">
                <p className="text-3xl font-bold text-[hsl(var(--gaia-accent))] mb-1">99.9%</p>
                <p className="text-xs font-bold text-[hsl(var(--gaia-muted))] uppercase tracking-widest">Uptime</p>
              </div>
              <div className="p-6 rounded-2xl bg-[hsl(var(--gaia-soft))] border border-[hsl(var(--gaia-border))]">
                <p className="text-3xl font-bold text-[hsl(var(--gaia-accent))] mb-1">AES-256</p>
                <p className="text-xs font-bold text-[hsl(var(--gaia-muted))] uppercase tracking-widest">Encryption</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 px-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto rounded-[3rem] bg-[hsl(var(--gaia-accent))] p-12 md:p-20 text-[hsl(var(--gaia-accent-foreground))] relative overflow-hidden"
      >
        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold font-[var(--font-space)] mb-8">Ready to reclaim <br />your data?</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/register">
              <button className="h-14 px-10 rounded-2xl bg-white text-[hsl(var(--gaia-accent))] font-bold text-lg hover:bg-opacity-90 transition-all active:scale-95">
                Create Free Account
              </button>
            </Link>
            <Link href="/dashboard">
              <button className="h-14 px-10 rounded-2xl border-2 border-white/20 font-bold text-lg hover:bg-white/10 transition-all active:scale-95">
                Explore Demo
              </button>
            </Link>
          </div>
        </div>

        {/* Decorative pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-[hsl(var(--gaia-border))] bg-[hsl(var(--gaia-panel)/0.5)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[hsl(var(--gaia-accent))] flex items-center justify-center">
            <Lock className="text-white w-3 h-3" />
          </div>
          <p className="font-[var(--font-space)] font-bold">Data Vault</p>
        </div>

        <p className="text-sm text-[hsl(var(--gaia-muted))]">
          © {new Date().getFullYear()} Datavault. All rights reserved. Built with precision.
        </p>

        <div className="flex items-center gap-6">
          <Link href="#" className="text-sm text-[hsl(var(--gaia-muted))] hover:text-[hsl(var(--gaia-text))]">Terms</Link>
          <Link href="#" className="text-sm text-[hsl(var(--gaia-muted))] hover:text-[hsl(var(--gaia-text))]">Privacy</Link>
          <Link href="#" className="text-sm text-[hsl(var(--gaia-muted))] hover:text-[hsl(var(--gaia-text))]">Twitter</Link>
        </div>
      </div>
    </footer>
  );
}