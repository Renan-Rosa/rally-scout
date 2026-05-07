import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LandingMobileMenu } from "./_landing-mobile-menu";

const Slashes = ({ className = "" }: { className?: string }) => (
  <span
    aria-hidden
    className={`inline-block h-3 w-6 bg-[length:4px_4px] ${className}`}
    style={{
      backgroundImage:
        "repeating-linear-gradient(135deg, currentColor 0 2px, transparent 2px 5px)",
    }}
  />
);

const services = [
  {
    label: "[01]",
    title: "TIMES",
    desc: "Cadastre elencos com posição, número e função tática de cada atleta.",
  },
  {
    label: "[02]",
    title: "PARTIDAS",
    desc: "Registre adversário, data, local e placar set a set com histórico completo.",
  },
  {
    label: "[03]",
    title: "SCOUT LIVE",
    desc: "Saque, recepção, ataque, bloqueio e defesa anotados em tempo real.",
  },
  {
    label: "[04]",
    title: "ESTATÍSTICAS",
    desc: "Desempenho individual e coletivo agregado em painéis claros e objetivos.",
  },
];

export default function Home() {
  return (
    <div className='min-h-screen bg-[#ededed] text-black'>
      {/* Top meta bar */}
      <div className='mx-auto flex w-full max-w-[1400px] items-start justify-between px-6 pt-10 md:px-14 md:pt-16'>
        <div className='max-w-md'>
          <h2 className='text-sm font-bold tracking-tight md:text-base'>
            #RALLY_SCOUT
          </h2>
          <p className='mt-2 text-[11px] leading-relaxed text-black/45 md:text-xs'>
            Plataforma de scout para vôlei construída sobre clareza, estrutura e
            propósito. Transforma ações em decisões com hierarquia visual
            objetiva.
          </p>
        </div>
        <Slashes className='mt-2 text-black/70' />
      </div>

      {/* Hero card */}
      <section className='mx-auto mt-10 w-full max-w-[1400px] px-6 md:px-14'>
        <div className='relative overflow-hidden rounded-sm bg-black text-white'>
          {/* Inner nav */}
          <div className='flex items-center justify-between px-6 pt-6 md:px-10'>
            <span className='text-sm font-black tracking-tighter'>
              R<span className='text-[#ff751f]'>.</span>
            </span>
            <nav className='hidden items-center gap-8 text-[11px] tracking-widest text-white/60 md:flex'>
              <Link href='#sobre' className='hover:text-white'>
                [SOBRE]
              </Link>
              <Link href='#recursos' className='hover:text-white'>
                [RECURSOS]
              </Link>
              <Link href='#contato' className='hover:text-white'>
                [CONTATO]
              </Link>
            </nav>
            <LandingMobileMenu />
            <div className='hidden md:flex flex-col items-end gap-1'>
              <span className='block h-[2px] w-6 bg-white' />
              <span className='block h-[2px] w-6 bg-white' />
              <span className='block h-[2px] w-4 bg-white' />
            </div>
          </div>

          {/* Massive title */}
          <div className='relative px-6 pt-8 md:px-10 md:pt-4'>
            <h1
              className='select-none font-black leading-[0.85] tracking-[-0.04em] text-[#ff751f]'
              style={{ fontSize: "clamp(4.5rem, 17vw, 15rem)" }}
            >
              RALLY.
            </h1>
          </div>

          {/* Hero body */}
          <div className='grid grid-cols-1 gap-8 px-6 pb-10 pt-8 md:grid-cols-12 md:px-10 md:pb-14'>
            <div className='md:col-span-4 md:col-start-5'>
              <p className='max-w-xs text-xs leading-relaxed text-white/70'>
                Sistema de scout que transforma ações de quadra em estrutura,
                direção e impacto duradouro para o seu time.
              </p>
            </div>

            <div className='md:col-span-3 md:col-start-1 md:row-start-1'>
              <Slashes className='text-white' />
              <div
                className='mt-3 font-black leading-none tracking-tight text-[#ff751f]'
                style={{ fontSize: "clamp(2.5rem, 5vw, 3.75rem)" }}
              >
                12+
              </div>
              <p className='mt-2 text-xs text-white/60'>
                Tipos de ação registrados por rally
              </p>
            </div>

            <div className='md:col-span-4 md:col-start-1'>
              <Button
                asChild
                className='h-12 w-full rounded-none bg-white px-8 text-[11px] font-bold tracking-[0.2em] text-black hover:bg-white/90 md:w-auto'
              >
                <Link href='/sign-up'>COMEÇAR PROJETO</Link>
              </Button>
            </div>

            <div className='self-end md:col-span-4 md:col-start-9 md:row-start-1 md:text-right'>
              <p className='text-xl font-black leading-tight tracking-tight md:text-2xl'>
                <span className='text-[#ff751f]'>SCOUT</span> NÃO É
                <br />
                ANOTAÇÃO.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tags row */}
      <section className='mx-auto mt-10 flex w-full max-w-[1400px] items-center justify-between px-6 md:px-14'>
        <div className='flex flex-wrap gap-6 text-[11px] tracking-widest text-black/55'>
          <span>[ESTRATÉGIA]</span>
          <span>[PERFORMANCE]</span>
          <span>[ANÁLISE]</span>
        </div>
        <Button
          asChild
          variant='outline'
          className='h-10 rounded-full border-black/30 bg-transparent px-5 text-[11px] font-bold tracking-[0.2em] text-black hover:bg-black hover:text-white'
        >
          <Link href='/sign-in'>JÁ TENHO CONTA</Link>
        </Button>
      </section>

      {/* About statement */}
      <section
        id='sobre'
        className='mx-auto mt-24 w-full max-w-[1400px] px-6 md:mt-40 md:px-14'
      >
        <div className='grid grid-cols-1 gap-8 md:grid-cols-12'>
          <div className='md:col-span-2'>
            <span className='text-[11px] tracking-widest text-[#ff751f]'>
              [SOBRE]
            </span>
          </div>

          <div className='md:col-span-10'>
            <h2
              className='font-black uppercase leading-[0.95] tracking-[-0.03em]'
              style={{ fontSize: "clamp(2rem, 6vw, 5rem)" }}
            >
              <span className='block'>#SCOUT_DE</span>
              <span className='block pl-[10%] text-[#ff751f]'>VÔLEI,</span>
              <span className='block'>FEITO COM</span>
              <span className='block pl-[20%]'>CLAREZA &amp;</span>
              <span className='block'>PROPÓSITO</span>
            </h2>
          </div>
        </div>

        <div className='mt-12'>
          <Slashes className='text-black/60' />
        </div>
      </section>

      {/* Big stat block */}
      <section
        id='recursos'
        className='mx-auto mt-24 w-full max-w-[1400px] border-y border-black/10 px-6 py-16 md:mt-32 md:px-14 md:py-24'
      >
        <div className='mb-10 flex items-center justify-between'>
          <p className='max-w-xs text-xs leading-relaxed text-black/55 md:ml-[40%]'>
            Estruturamos cada partida com ritmo e significado para que sua
            comissão técnica decida com confiança.
          </p>
          <Slashes className='text-black/60' />
        </div>

        <div
          className='select-none text-center font-black leading-none tracking-[-0.05em] text-[#ff751f]'
          style={{ fontSize: "clamp(7rem, 28vw, 24rem)" }}
        >
          100%
        </div>

        <div className='mt-10 flex flex-wrap items-end justify-between gap-6'>
          <p className='max-w-xs text-xs leading-relaxed text-black/55'>
            Menos ruído, mais clareza.
            <br />
            Dados que sustentam a decisão dentro de quadra.
          </p>
          <div className='flex flex-wrap gap-6 text-[11px] tracking-widest text-black/55'>
            <span>[QUADRA]</span>
            <span>[BANCO]</span>
            <span>[COMISSÃO]</span>
          </div>
        </div>
      </section>

      {/* Dark services */}
      <section
        id='contato'
        className='mt-24 bg-black px-6 py-20 text-white md:mt-32 md:px-14 md:py-32'
      >
        <div className='mx-auto w-full max-w-[1400px]'>
          <div className='mb-16 flex items-center justify-between'>
            <Link
              href='/sign-up'
              className='group inline-flex h-10 items-center rounded-full border border-white/30 bg-transparent px-5 text-[11px] font-bold tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black'
            >
              COMEÇAR PROJETO
            </Link>
            <span className='text-sm font-black tracking-tighter text-white'>
              R<span className='text-[#ff751f]'>.</span>
            </span>
            <Link
              href='/sign-in'
              className='group inline-flex h-10 items-center rounded-full border border-white/30 bg-transparent px-5 text-[11px] font-bold tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black'
            >
              ENTRAR
            </Link>
          </div>

          <div className='grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8'>
            {services.map((s) => (
              <div key={s.title}>
                <Slashes className='text-white' />
                <div className='mt-4 text-[11px] tracking-widest text-white/40'>
                  {s.label}
                </div>
                <h3 className='mt-3 text-3xl font-black uppercase leading-none tracking-tight md:text-4xl'>
                  {s.title}
                </h3>
                <p className='mt-5 max-w-[26ch] text-xs leading-relaxed text-white/50'>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <div className='mt-24 flex flex-col items-start justify-between gap-6 border-t border-white/10 pt-8 text-[11px] tracking-widest text-white/40 md:flex-row md:items-center'>
            <span>© {new Date().getFullYear()} RALLY SCOUT</span>
            <span>[TODOS_OS_DIREITOS_RESERVADOS]</span>
            <span>BR / 2026</span>
          </div>
        </div>
      </section>
    </div>
  );
}
