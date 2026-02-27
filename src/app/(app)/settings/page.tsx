import { LogOut, Moon, Palette, Shield, User } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/shared/mode-toggle";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  return (
    <div className='mx-auto max-w-2xl space-y-8 p-6'>
      <div>
        <h1 className='text-2xl font-bold'>Configurações</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Gerencie sua conta e preferências.
        </p>
      </div>

      {/* Perfil */}
      <section className='space-y-3'>
        <div className='flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
          <User className='size-4' />
          Perfil
        </div>
        <div className='rounded-lg border bg-card divide-y'>
          <div className='flex items-center justify-between px-4 py-3'>
            <span className='text-sm text-muted-foreground'>Nome</span>
            <span className='text-sm font-medium'>{user?.name ?? "—"}</span>
          </div>
          <div className='flex items-center justify-between px-4 py-3'>
            <span className='text-sm text-muted-foreground'>Email</span>
            <span className='text-sm font-medium'>{user?.email ?? "—"}</span>
          </div>
          <div className='flex items-center justify-between px-4 py-3'>
            <span className='text-sm text-muted-foreground'>Membro desde</span>
            <span className='text-sm font-medium'>
              {user?.createdAt
                ? new Intl.DateTimeFormat("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(user.createdAt))
                : "—"}
            </span>
          </div>
        </div>
      </section>

      {/* Aparência */}
      <section className='space-y-3'>
        <div className='flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
          <Palette className='size-4' />
          Aparência
        </div>
        <div className='rounded-lg border bg-card'>
          <div className='flex items-center justify-between px-4 py-3'>
            <div>
              <p className='text-sm font-medium'>Tema</p>
              <p className='text-xs text-muted-foreground'>
                Alterne entre tema claro e escuro
              </p>
            </div>
            <ModeToggle />
          </div>
        </div>
      </section>

      {/* Segurança */}
      <section className='space-y-3'>
        <div className='flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
          <Shield className='size-4' />
          Segurança
        </div>
        <div className='rounded-lg border bg-card divide-y'>
          <div className='flex items-center justify-between px-4 py-3'>
            <div>
              <p className='text-sm font-medium'>Sessão ativa</p>
              <p className='text-xs text-muted-foreground'>
                Token válido por 7 dias após o login
              </p>
            </div>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400'>
              <span className='size-1.5 rounded-full bg-green-500' />
              Ativa
            </span>
          </div>
        </div>
      </section>

      {/* Sair */}
      <section className='space-y-3'>
        <div className='flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider'>
          <LogOut className='size-4' />
          Sessão
        </div>
        <div className='rounded-lg border bg-card'>
          <div className='flex items-center justify-between px-4 py-3'>
            <div>
              <p className='text-sm font-medium'>Encerrar sessão</p>
              <p className='text-xs text-muted-foreground'>
                Você será redirecionado para a tela de login
              </p>
            </div>
            <form action={signOut}>
              <Button type='submit' variant='outline' size='sm'>
                <LogOut className='mr-2 size-4' />
                Sair
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
