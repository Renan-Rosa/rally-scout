import { Activity, BarChart3, Shield, Volleyball } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Shield,
    title: "Times",
    desc: "Cadastre times e gerencie elencos com posição e número de camisa de cada atleta.",
  },
  {
    icon: Volleyball,
    title: "Partidas",
    desc: "Registre jogos com adversário, data e local. Controle placar por set.",
  },
  {
    icon: Activity,
    title: "Scout LIVE",
    desc: "Registre ações em tempo real: saque, recepção, ataque, bloqueio e defesa.",
  },
  {
    icon: BarChart3,
    title: "Estatísticas",
    desc: "Visualize desempenho individual e coletivo com dados de todas as partidas.",
  },
];

export default function Home() {
  return (
    <div className='relative flex min-h-screen flex-col overflow-hidden bg-[#080808]'>
      {/* Dot grid background */}
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Orange glow orb — center */}
      <div
        className='pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full'
        style={{
          width: 700,
          height: 700,
          background:
            "radial-gradient(circle, rgba(255,117,31,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Top-left subtle accent */}
      <div
        className='pointer-events-none absolute -left-32 -top-32 rounded-full opacity-30'
        style={{
          width: 400,
          height: 400,
          background:
            "radial-gradient(circle, rgba(255,117,31,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Nav */}
      <nav className='relative z-10 flex items-center justify-between px-6 py-5 md:px-14'>
        <span className='text-base font-black tracking-tighter text-white'>
          RALLY<span className='text-[#ff751f]'>.</span>
        </span>
        <div className='flex items-center gap-2'>
          <Button
            asChild
            variant='ghost'
            size='sm'
            className='text-white/60 hover:bg-white/5 hover:text-white'
          >
            <Link href='/sign-in'>Entrar</Link>
          </Button>
          <Button
            asChild
            size='sm'
            className='bg-orange-500 text-white hover:bg-orange-500/85'
          >
            <Link href='/sign-up'>Criar conta</Link>
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <main className='relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-8 text-center'>
        {/* Badge */}
        <div className='mb-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-white/50 backdrop-blur-sm'>
          <span className='size-1.5 animate-pulse rounded-full bg-[#ff751f]' />
          Scout profissional para vôlei
        </div>

        {/* RALLY. — main statement */}
        <h1
          className='select-none font-black leading-none tracking-tighter text-white'
          style={{
            fontSize: "clamp(5.5rem, 20vw, 16rem)",
            textShadow: "0 0 140px rgba(255,117,31,0.18)",
          }}
        >
          RALLY
          <span
            className='text-orange-500'
            style={{
              textShadow:
                "0 0 40px rgba(255,117,31,0.9), 0 0 80px rgba(255,117,31,0.4)",
            }}
          >
            .
          </span>
        </h1>

        {/* Tagline */}
        <p className='mt-6 max-w-sm text-sm text-white/40 md:max-w-md md:text-base'>
          Gerencie times, registre ações e analise o desempenho dos seus atletas
          em tempo real.
        </p>

        {/* CTAs */}
        <div className='mt-10 flex flex-col gap-3 sm:flex-row'>
          <Button
            asChild
            size='lg'
            className='min-w-40 bg-orange-500 text-white hover:bg-[#ff751f]/85'
          >
            <Link href='/sign-up'>Começar</Link>
          </Button>
          <Button
            asChild
            size='lg'
            variant='outline'
            className='min-w-40 border-white/10 bg-white/[0.04] text-white backdrop-blur-sm hover:bg-white/[0.08]'
          >
            <Link href='/sign-in'>Já tenho conta</Link>
          </Button>
        </div>

        {/* Feature cards */}
        <div className='mt-24 grid w-full max-w-4xl grid-cols-1 gap-3 text-left sm:grid-cols-2 lg:grid-cols-4'>
          {features.map((f) => (
            <div
              key={f.title}
              className='group rounded-xl border border-white/[0.07] bg-white/[0.03] p-5 backdrop-blur-sm transition-all duration-300 hover:border-[#ff751f]/30 hover:bg-white/[0.06]'
            >
              <f.icon className='mb-3 size-6 text-[#ff751f] transition-transform duration-300 group-hover:scale-110' />
              <h3 className='mb-1.5 font-semibold text-white'>{f.title}</h3>
              <p className='text-xs leading-relaxed text-white/40'>{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className='relative z-10 border-t border-white/[0.06] py-5 text-center text-xs text-white/20'>
        © {new Date().getFullYear()} Rally Scout. Todos os direitos reservados.
      </footer>
    </div>
  );
}
