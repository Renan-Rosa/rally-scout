import Link from "next/link";
import { SignInForm } from "@/components/featured/auth/sign-in-form";

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

export default function SignInPage() {
  return (
    <div className='grid min-h-svh grid-cols-1 bg-black text-white lg:grid-cols-2'>
      {/* Left — editorial panel */}
      <aside className='relative hidden flex-col justify-between overflow-hidden border-r border-white/10 px-10 py-10 lg:flex'>
        <div className='flex items-center justify-between'>
          <Link href='/' className='text-sm font-black tracking-tighter'>
            R<span className='text-[#ff751f]'>.</span>
          </Link>
          <Slashes className='text-white/70' />
        </div>

        <div>
          <span className='text-[11px] tracking-widest text-white/40'>
            [#SIGN_IN]
          </span>
          <h1
            className='mt-6 select-none font-black uppercase leading-[0.85] tracking-[-0.04em]'
            style={{ fontSize: "clamp(3.5rem, 9vw, 8rem)" }}
          >
            ENTRE
            <br />
            <span className='text-[#ff751f]'>NA QUADRA.</span>
          </h1>
          <p className='mt-8 max-w-sm text-xs leading-relaxed text-white/55'>
            Acesse sua conta para registrar partidas, acompanhar atletas e
            transformar cada rally em decisão.
          </p>
        </div>

        <div className='flex items-end justify-between text-[11px] tracking-widest text-white/40'>
          <div>
            <div>[BUILT_BY]</div>
            <div className='mt-1 text-sm font-black tracking-tight text-white'>
              KEIOS
            </div>
          </div>
          <span>BR / 2026</span>
        </div>
      </aside>

      {/* Right — form panel */}
      <main className='relative flex flex-col px-6 py-8 md:px-14 md:py-10'>
        <div className='flex items-center justify-between lg:hidden'>
          <Link href='/' className='text-sm font-black tracking-tighter'>
            RALLY<span className='text-[#ff751f]'>.</span>
          </Link>
          <span className='text-[11px] tracking-widest text-white/55'>
            [#SIGN_IN]
          </span>
        </div>

        <div className='hidden justify-end lg:flex'>
          <Link
            href='/sign-up'
            className='inline-flex h-10 items-center rounded-full border border-white/25 px-5 text-[11px] font-bold tracking-[0.2em] text-white transition-colors hover:bg-white hover:text-black'
          >
            CRIAR CONTA
          </Link>
        </div>

        <div className='flex flex-1 items-center justify-center'>
          <div className='w-full max-w-sm'>
            <div className='mb-8'>
              <Slashes className='text-white/60' />
              <div className='mt-3 text-[11px] tracking-widest text-[#ff751f]'>
                [01] / ACESSO
              </div>
              <h2 className='mt-3 text-3xl font-black uppercase leading-none tracking-tight text-white md:text-4xl'>
                Bem-vindo
                <br />
                de volta.
              </h2>
            </div>

            <SignInForm />
          </div>
        </div>

        <div className='mt-8 flex items-center justify-between text-[11px] tracking-widest text-white/40'>
          <span>© {new Date().getFullYear()} RALLY SCOUT</span>
          <span>BY KEIOS</span>
        </div>
      </main>
    </div>
  );
}
