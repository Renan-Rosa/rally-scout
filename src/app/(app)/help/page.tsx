import {
  Activity,
  ChevronRight,
  PlusCircle,
  Shield,
  User2,
  Volleyball,
} from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: Shield,
    title: "1. Crie um time",
    description:
      'Vá em "Times" > "Novo time" e cadastre o nome do seu time.',
    href: "/teams/new",
    linkLabel: "Criar time",
  },
  {
    icon: User2,
    title: "2. Adicione atletas",
    description:
      "Dentro do time, adicione os jogadores com nome, posição e número de camisa.",
    href: "/players/new",
    linkLabel: "Adicionar atleta",
  },
  {
    icon: Volleyball,
    title: "3. Crie uma partida",
    description:
      'Em "Partidas" > "Nova partida", defina adversário, data, local e os times participantes.',
    href: "/matches/new",
    linkLabel: "Criar partida",
  },
  {
    icon: Activity,
    title: "4. Inicie o Scout LIVE",
    description:
      "Na página da partida, clique em \"Iniciar Scout\" para registrar ações em tempo real.",
    href: "/matches",
    linkLabel: "Ver partidas",
  },
];

const faq = [
  {
    question: "Como funciona o Scout LIVE?",
    answer:
      "Durante uma partida ativa, você seleciona o atleta, o tipo de ação (saque, recepção, ataque, bloqueio, defesa) e a qualidade da execução. Cada ação é salva instantaneamente.",
  },
  {
    question: "Posso ter múltiplos times?",
    answer:
      "Sim. Você pode cadastrar quantos times quiser. Cada time tem seu próprio elenco e histórico de partidas.",
  },
  {
    question: "Os dados ficam salvos?",
    answer:
      "Sim. Todas as ações do scout, partidas, times e atletas ficam armazenados na sua conta.",
  },
  {
    question: "Como vejo as estatísticas?",
    answer:
      'Acesse "Estatísticas" no menu para ver um resumo geral, ou acesse os detalhes de cada partida ou atleta.',
  },
  {
    question: "Como encerrar uma partida?",
    answer:
      "Na tela de scout, registre o resultado final dos sets e marque a partida como concluída.",
  },
];

const actions = [
  { label: "Saque", description: "Saque realizado pelo atleta", key: "SAC" },
  {
    label: "Recepção",
    description: "Recepção do saque adversário",
    key: "REC",
  },
  {
    label: "Ataque",
    description: "Ataque (cortada, pipe, etc.)",
    key: "ATK",
  },
  { label: "Bloqueio", description: "Tentativa ou ponto de bloqueio", key: "BLK" },
  { label: "Defesa", description: "Defesa no fundo de quadra", key: "DEF" },
  { label: "Levantamento", description: "Passe do levantador", key: "SET" },
];

export default function HelpPage() {
  return (
    <div className='mx-auto max-w-3xl space-y-10 p-6'>
      <div>
        <h1 className='text-2xl font-bold'>Ajuda</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Aprenda a usar o Rally Scout do zero.
        </p>
      </div>

      {/* Primeiros passos */}
      <section className='space-y-3'>
        <h2 className='text-lg font-semibold'>Primeiros passos</h2>
        <div className='grid gap-3 sm:grid-cols-2'>
          {steps.map((step) => (
            <div
              key={step.title}
              className='flex flex-col gap-3 rounded-lg border bg-card p-4'
            >
              <div className='flex items-center gap-2'>
                <step.icon className='size-5 text-[#ff751f]' />
                <span className='font-medium text-sm'>{step.title}</span>
              </div>
              <p className='text-xs text-muted-foreground'>{step.description}</p>
              <Link
                href={step.href}
                className='mt-auto inline-flex items-center gap-1 text-xs font-medium text-[#ff751f] hover:underline'
              >
                <PlusCircle className='size-3.5' />
                {step.linkLabel}
                <ChevronRight className='size-3' />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Tipos de ação */}
      <section className='space-y-3'>
        <h2 className='text-lg font-semibold'>Tipos de ação no Scout</h2>
        <div className='rounded-lg border bg-card divide-y'>
          {actions.map((action) => (
            <div
              key={action.key}
              className='flex items-center justify-between px-4 py-3'
            >
              <div>
                <p className='text-sm font-medium'>{action.label}</p>
                <p className='text-xs text-muted-foreground'>
                  {action.description}
                </p>
              </div>
              <span className='rounded bg-muted px-2 py-0.5 font-mono text-xs'>
                {action.key}
              </span>
            </div>
          ))}
        </div>
        <p className='text-xs text-muted-foreground'>
          Cada ação pode ser classificada como <strong>Ponto</strong>,{" "}
          <strong>Erro</strong> ou <strong>Continuação</strong>.
        </p>
      </section>

      {/* FAQ */}
      <section className='space-y-3'>
        <h2 className='text-lg font-semibold'>Perguntas frequentes</h2>
        <div className='rounded-lg border bg-card divide-y'>
          {faq.map((item) => (
            <div key={item.question} className='px-4 py-4'>
              <p className='text-sm font-medium'>{item.question}</p>
              <p className='mt-1 text-sm text-muted-foreground'>{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
